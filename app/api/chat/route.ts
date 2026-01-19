import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/index";
import { Prisma } from "@prisma/client";

interface ChatResponse {
  success: boolean;
  message: string;
  aiResponse: string;
  posts: any[];
  intent: string;
  suggestions?: string[];
}

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";

console.log("Groq API Key loaded:", GROQ_API_KEY ? `${GROQ_API_KEY.substring(0, 10)}...` : "NOT SET");

// Helper function: Normalize Vietnamese text (remove diacritics and convert to lowercase)
function normalizeVietnameseText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .toLowerCase()
    .replace(/\s+/g, "-"); // Replace spaces with dashes for slugs
}

// Helper function: Retry với exponential backoff
async function callGroqWithRetry(prompt: string, maxRetries = 2): Promise<string> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log("Calling Groq API...");
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1024
        })
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Groq API error response:", error);
        throw new Error(JSON.stringify(error));
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error("No content in response");
      return content;
    } catch (error: any) {
      // Nếu là lỗi rate limit và còn retry
      if ((error?.status === 429 || error?.message?.includes("429")) && i < maxRetries - 1) {
        const delay = Math.pow(2, i + 1) * 1000; // 2s, 4s
        console.log(`Rate limit hit (attempt ${i + 1}/${maxRetries}), retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error("Max retries exceeded");
}

// Simple in-memory cache to reduce duplicate requests
const responseCache = new Map<string, { data: string; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCachedResponse(key: string): string | null {
  const cached = responseCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`Cache hit for key: ${key.substring(0, 30)}...`);
    return cached.data;
  }
  responseCache.delete(key);
  return null;
}

function setCachedResponse(key: string, data: string): void {
  responseCache.set(key, { data, timestamp: Date.now() });
  // Limit cache size to 100 entries
  if (responseCache.size > 100) {
    const firstKey = responseCache.keys().next().value;
    if (firstKey) {
      responseCache.delete(firstKey);
    }
  }
}

export async function POST(req: NextRequest): Promise<NextResponse<ChatResponse>> {
  try {
    const { message } = await req.json();
    console.log("Chat request received:", message.substring(0, 50));

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { success: false, message: "Invalid message", aiResponse: "", posts: [], intent: "error" },
        { status: 400 }
      );
    }

    // Bước 1: Phân tích câu hỏi (detect + analyze in one call)
    console.log("Analyzing message intent...");
    const analysis = await analyzeMessageIntent(message);
    console.log("Analysis result:", analysis.isCryptoRelated, analysis.searchType);
    
    let aiResponse = "";
    let posts: any[] = [];
    let intent = "";

    if (!analysis.isCryptoRelated) {
      // Câu hỏi chung chung - trả lời trực tiếp
      console.log("General question detected, generating response...");
      aiResponse = await generateGeneralResponse(message);
      intent = "general";
    } else {
      // Câu hỏi về crypto - tìm bài viết
      const aiAnalysis = analysis;
      intent = aiAnalysis.searchType;
      console.log("Crypto question detected, search type:", intent);
      
      // Bước 2: Tìm kiếm bài viết dựa trên kết quả phân tích
      if (aiAnalysis.searchType === "category") {
        posts = await searchByCategory(aiAnalysis.searchValue);
      } else if (aiAnalysis.searchType === "keyword") {
        posts = await searchByKeyword(aiAnalysis.searchValue);
      } else if (aiAnalysis.searchType === "latest") {
        posts = await getLatestPosts(5);
      } else if (aiAnalysis.searchType === "comparison") {
        posts = await searchComparisonPosts(aiAnalysis.searchValue);
      } else if (aiAnalysis.searchType === "pricing") {
        posts = await searchPricingPosts(aiAnalysis.searchValue);
      } else if (aiAnalysis.searchType === "procedure") {
        posts = await searchProcedurePosts(aiAnalysis.searchValue);
      } else if (aiAnalysis.searchType === "recommendation") {
        posts = await searchRecommendationPosts(aiAnalysis.searchValue);
      } else if (aiAnalysis.searchType === "general") {
        // Fallback: If crypto question but classified as general, do keyword search
        console.log("Crypto question classified as general, performing keyword search...");
        posts = await searchByKeyword(aiAnalysis.searchValue);
      }

      console.log("Found posts:", posts.length);

      // Bước 3: Tạo response từ AI
      console.log("Generating AI response...");
      aiResponse = await generateAIResponse(message, analysis, posts);
    }

    console.log("Response generated successfully");
    return NextResponse.json({
      success: true,
      message: "Chat processed successfully",
      aiResponse,
      posts: posts.length > 0 ? posts : [],
      intent,
      suggestions: analysis.followUpQuestions || []
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error processing chat",
        aiResponse: "Xin lỗi, tôi gặp lỗi khi xử lý câu hỏi của bạn. Vui lòng thử lại sau!",
        posts: [],
        intent: "error"
      },
      { status: 500 }
    );
  }
}

// Kiểm tra xem câu hỏi có liên quan đến crypto không + Phân tích intent
async function analyzeMessageIntent(message: string): Promise<{
  isCryptoRelated: boolean;
  searchType: "category" | "keyword" | "latest" | "comparison" | "pricing" | "procedure" | "recommendation" | "general";
  searchValue: string;
  understanding: string;
  followUpQuestions?: string[];
}> {
  const cacheKey = `intent_${message.substring(0, 100)}`;
  const cached = getCachedResponse(cacheKey);
  if (cached) {
    console.log("Using cached analysis");
    return JSON.parse(cached);
  }

  try {
    const prompt = `Phân tích câu hỏi này về tiền mã hóa/crypto. Trả lời JSON (chỉ JSON):
{
  "isCryptoRelated": true/false,
  "searchType": "category|keyword|latest|comparison|pricing|procedure|recommendation|general",
  "searchValue": "ngắn gọn",
  "understanding": "1-2 câu"
}
Hướng dẫn:
- isCryptoRelated = true nếu câu hỏi về: Bitcoin, Ethereum, crypto, blockchain, DeFi, NFT, altcoin, trading, ví điện tử, sàn giao dịch
- Nếu về crypto: searchType là category/keyword/pricing/procedure/recommendation, KHÔNG phải general
- Chỉ dùng "general" khi KHÔNG phải về crypto
- searchValue: từ khóa chính (bitcoin, ethereum, defi, nft, trading...)
Câu hỏi: "${message}"`;

    console.log("Calling Groq for intent analysis...");
    const responseText = await callGroqWithRetry(prompt);
    console.log("Intent analysis response:", responseText.substring(0, 100));
    
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      console.warn("No JSON found in response");
      return { isCryptoRelated: false, searchType: "general", searchValue: "", understanding: "" };
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const result = {
      isCryptoRelated: parsed.isCryptoRelated ?? false,
      searchType: parsed.searchType || "general",
      searchValue: parsed.searchValue || "",
      understanding: parsed.understanding || "",
      followUpQuestions: []
    };
    
    console.log("Analysis parsed successfully:", result);
    setCachedResponse(cacheKey, JSON.stringify(result));
    return result;
  } catch (error: any) {
    console.error("Message analysis error:", {
      message: error?.message,
      status: error?.status,
      code: error?.code,
      fullError: error
    });
    return { isCryptoRelated: false, searchType: "general", searchValue: "", understanding: "" };
  }
}

// Trả lời câu hỏi chung chung (không về crypto)
async function generateGeneralResponse(message: string): Promise<string> {
  try {
    const cacheKey = `general_${message.substring(0, 100)}`;
    const cached = getCachedResponse(cacheKey);
    if (cached) return cached;

    // Get current date/time for context
    const now = new Date();
    const dayOfWeek = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"][now.getDay()];
    const dateStr = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
    const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;

    let prompt = `Bạn là chatbot chuyên về tiền mã hóa (crypto).

Thông tin hiện tại: Hôm nay là ${dayOfWeek}, ngày ${dateStr}, lúc ${timeStr}.

`;

    // Check if question is about date/time/calendar
    const dateTimeKeywords = ["thứ", "ngày", "giờ", "lịch", "năm", "tháng", "hôm nay", "hôm qua", "ngày mai"];
    const isDateTimeQuestion = dateTimeKeywords.some(keyword => message.toLowerCase().includes(keyword));

    if (isDateTimeQuestion) {
      // Có thông tin thời gian, hãy trả lời ngắn gọn
      prompt += `Hãy trả lời câu hỏi dưới đây một cách ngắn gọn, chỉ 1 câu (không cần giải thích chi tiết).

Câu hỏi: "${message}"`;
    } else {
      // Câu hỏi chung chung khác - trả lời ngắn + hướng về crypto
      prompt += `Người dùng hỏi câu hỏi không liên quan đến tiền mã hóa.

Hãy:
1. Trả lời ngắn gọn (1-2 câu)
2. Sau đó, liệt kê những gì bạn CÓ THỂ hỗ trợ:
   - Giải thích về Bitcoin, Ethereum và các loại tiền mã hóa
   - Tin tức và phân tích thị trường crypto
   - Kiến thức về blockchain, DeFi, NFT
   - Hướng dẫn mua bán, trading crypto
   - Thông tin về ví điện tử và bảo mật
3. Lời mời cuối: "Hãy hỏi tôi về crypto - đó là chuyên môn của tôi!"

Câu hỏi: "${message}"`;
    }
    
    console.log("Calling Groq for general response...");
    const responseText = await callGroqWithRetry(prompt);
    console.log("General response received:", responseText.substring(0, 50));
    setCachedResponse(cacheKey, responseText);
    return responseText;
  } catch (error: any) {
    console.error("General response generation error:", {
      message: error?.message,
      status: error?.status,
      code: error?.code,
      fullError: error
    });
    return "Xin lỗi, tôi gặp lỗi khi xử lý câu hỏi của bạn. Vui lòng thử lại sau!";
  }
}



// Tạo AI response dựa trên phân tích
async function generateAIResponse(
  userMessage: string,
  analysis: { searchType: string; searchValue: string; understanding: string },
  posts: any[]
): Promise<string> {
  try {
    let prompt = `Bạn là chatbot tư vấn về tiền mã hóa (crypto). Trả lời câu hỏi của người dùng (2-3 câu), ngắn gọn và tự nhiên.`;

    if (posts.length > 0) {
      // Có bài viết liên quan - tóm tắt thông tin từ bài viết
      const postsInfo = posts.slice(0, 3).map(p => 
        `- ${p.title}${p.description ? ': ' + p.description.substring(0, 100) : ''}`
      ).join('\n');

      prompt += `

Dựa trên thông tin từ các bài viết sau:
${postsInfo}

Hãy trả lời câu hỏi: "${userMessage}"
- Tóm tắt thông tin liên quan từ bài viết
- Đề cập đến tên bài viết nếu liên quan
- Khuyến khích người dùng đọc bài viết để tìm hiểu thêm`;
    } else {
      // Không có bài viết - trả lời dựa vào kiến thức chung
      prompt += `

Trả lời câu hỏi: "${userMessage}"
- Cung cấp thông tin hữu ích về crypto/blockchain
- Đề xuất người dùng tìm kiếm trên website hoặc theo dõi tin tức`;
    }

    const responseText = await callGroqWithRetry(prompt);
    return responseText;
  } catch (error) {
    console.error("AI response generation error:", error);
    return "Cảm ơn bạn đã hỏi! Hãy xem các bài viết dưới đây để tìm hiểu thêm.";
  }
}

// Tìm bài viết theo danh mục
async function searchByCategory(categoryKeyword: string) {
  try {
    // Map từ khóa AI sang slug category
    const categoryMap: Record<string, string> = {
      "bitcoin": "bitcoin",
      "btc": "bitcoin",
      "ethereum": "ethereum",
      "eth": "ethereum",
      "altcoin": "altcoin",
      "defi": "defi",
      "nft": "nft",
      "tin tức": "tin-tuc",
      "phân tích": "phan-tich",
      "kiến thức": "kien-thuc",
      "pháp lý": "phap-ly",
      "hướng dẫn": "huong-dan",
    };

    let slug = categoryMap[categoryKeyword.toLowerCase()];
    if (!slug) {
      // Fallback: normalize the keyword to match slug format
      slug = normalizeVietnameseText(categoryKeyword);
    }

    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        articles: {
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            slug: true,
            title: true,
            excerpt: true,
            thumbnail: true,
            createdAt: true,
          },
        },
      },
    });

    // Map to expected format
    return (category?.articles || []).map(a => ({
      id: a.id,
      slug: a.slug,
      title: a.title,
      description: a.excerpt,
      main_img: a.thumbnail,
      createdAt: a.createdAt,
    }));
  } catch (error) {
    console.error("Search by category error:", error);
    return [];
  }
}

// Tìm kiếm theo keyword (title/excerpt)
async function searchByKeyword(keyword: string) {
  try {
    const articles = await prisma.article.findMany({
      where: {
        OR: [
          { title: { contains: keyword, mode: "insensitive" } },
          { excerpt: { contains: keyword, mode: "insensitive" } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        thumbnail: true,
        createdAt: true,
      },
    });

    return articles.map(a => ({
      id: a.id,
      slug: a.slug,
      title: a.title,
      description: a.excerpt,
      main_img: a.thumbnail,
      createdAt: a.createdAt,
    }));
  } catch (error) {
    console.error("Search by keyword error:", error);
    return [];
  }
}

// Lấy bài viết mới nhất
async function getLatestPosts(limit: number = 10) {
  try {
    const articles = await prisma.article.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        thumbnail: true,
        createdAt: true,
      },
    });

    return articles.map(a => ({
      id: a.id,
      slug: a.slug,
      title: a.title,
      description: a.excerpt,
      main_img: a.thumbnail,
      createdAt: a.createdAt,
    }));
  } catch (error) {
    console.error("Get latest posts error:", error);
    return [];
  }
}

// Tìm bài viết so sánh
async function searchComparisonPosts(searchValue: string) {
  try {
    const comparisonKeywords = ["so sánh", "vs", "hay", "khác nhau", "nên chọn"];
    const articles = await prisma.article.findMany({
      where: {
        OR: [
          { title: { contains: searchValue, mode: Prisma.QueryMode.insensitive } },
          { excerpt: { contains: searchValue, mode: Prisma.QueryMode.insensitive } },
          ...comparisonKeywords.map(keyword => ({
            title: { contains: keyword, mode: Prisma.QueryMode.insensitive }
          })),
          ...comparisonKeywords.map(keyword => ({
            excerpt: { contains: keyword, mode: Prisma.QueryMode.insensitive }
          }))
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        thumbnail: true,
        createdAt: true,
      },
    });

    return articles.map(a => ({
      id: a.id,
      slug: a.slug,
      title: a.title,
      description: a.excerpt,
      main_img: a.thumbnail,
      createdAt: a.createdAt,
    }));
  } catch (error) {
    console.error("Search comparison posts error:", error);
    return [];
  }
}

// Tìm bài viết về giá
async function searchPricingPosts(searchValue: string) {
  try {
    const pricingKeywords = ["giá", "phí", "chi phí", "bao nhiêu", "tiền"];
    const articles = await prisma.article.findMany({
      where: {
        OR: [
          { title: { contains: searchValue, mode: Prisma.QueryMode.insensitive } },
          { excerpt: { contains: searchValue, mode: Prisma.QueryMode.insensitive } },
          ...pricingKeywords.map(keyword => ({
            title: { contains: keyword, mode: Prisma.QueryMode.insensitive }
          })),
          ...pricingKeywords.map(keyword => ({
            excerpt: { contains: keyword, mode: Prisma.QueryMode.insensitive }
          }))
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        thumbnail: true,
        createdAt: true,
      },
    });

    return articles.map(a => ({
      id: a.id,
      slug: a.slug,
      title: a.title,
      description: a.excerpt,
      main_img: a.thumbnail,
      createdAt: a.createdAt,
    }));
  } catch (error) {
    console.error("Search pricing posts error:", error);
    return [];
  }
}

// Tìm bài viết về thủ tục
async function searchProcedurePosts(searchValue: string) {
  try {
    const procedureKeywords = ["thủ tục", "cách", "đăng ký", "mua", "làm sao", "quy trình"];
    const articles = await prisma.article.findMany({
      where: {
        OR: [
          { title: { contains: searchValue, mode: Prisma.QueryMode.insensitive } },
          { excerpt: { contains: searchValue, mode: Prisma.QueryMode.insensitive } },
          ...procedureKeywords.map(keyword => ({
            title: { contains: keyword, mode: Prisma.QueryMode.insensitive }
          })),
          ...procedureKeywords.map(keyword => ({
            excerpt: { contains: keyword, mode: Prisma.QueryMode.insensitive }
          }))
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        thumbnail: true,
        createdAt: true,
      },
    });

    return articles.map(a => ({
      id: a.id,
      slug: a.slug,
      title: a.title,
      description: a.excerpt,
      main_img: a.thumbnail,
      createdAt: a.createdAt,
    }));
  } catch (error) {
    console.error("Search procedure posts error:", error);
    return [];
  }
}

// Tìm bài viết tư vấn
async function searchRecommendationPosts(searchValue: string) {
  try {
    const recommendationKeywords = ["tư vấn", "khuyên", "nên", "đề xuất", "lựa chọn"];
    const articles = await prisma.article.findMany({
      where: {
        OR: [
          { title: { contains: searchValue, mode: Prisma.QueryMode.insensitive } },
          { excerpt: { contains: searchValue, mode: Prisma.QueryMode.insensitive } },
          ...recommendationKeywords.map(keyword => ({
            title: { contains: keyword, mode: Prisma.QueryMode.insensitive }
          })),
          ...recommendationKeywords.map(keyword => ({
            excerpt: { contains: keyword, mode: Prisma.QueryMode.insensitive }
          }))
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        thumbnail: true,
        createdAt: true,
      },
    });

    return articles.map(a => ({
      id: a.id,
      slug: a.slug,
      title: a.title,
      description: a.excerpt,
      main_img: a.thumbnail,
      createdAt: a.createdAt,
    }));
  } catch (error) {
    console.error("Search recommendation posts error:", error);
    return [];
  }
}
