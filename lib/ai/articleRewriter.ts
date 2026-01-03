// lib/ai/articleRewriter.ts
/**
 * AI Article Rewriter - Viết lại bài báo crawl thành bài viết chuẩn SEO
 */

export interface RewriteInput {
  title: string;
  content: string;
  description?: string;
  source: string;
  imageUrls?: string[]; // URLs ảnh từ bài gốc
}

export interface RewriteOutput {
  title: string;              // Title mới (SEO optimize, dưới 60 ký tự)
  description: string;        // Meta description (150-200 ký tự)
  content: string;            // HTML content đã viết lại
  toc: string[];             // Table of contents (h2, h3 headings)
  categorySuggestion: string; // Gợi ý category slug
}

/**
 * Build AI prompt for article rewriting
 */
function buildRewritePrompt(input: RewriteInput): string {
  return `
Bạn là một biên tập viên chuyên nghiệp về tiền mã hóa (crypto). Nhiệm vụ: viết lại bài báo sau thành bài viết chất lượng cao.

YÊU CẦU:
1. **Tiêu đề mới (title)**:
   - **BẮT BUỘC: Phải giữ nguyên chủ đề và từ khóa chính của tiêu đề gốc**
   - Viết lại để SEO-friendly, hấp dẫn hơn
   - Dưới 60 ký tự
   - Ví dụ: 
     * Gốc: "Hướng dẫn cài đặt Mini App cho Tapchibitcoin.io"
     * Mới: "Cách cài Mini App Tapchibitcoin.io - Hướng dẫn chi tiết"

2. **Mô tả (description)**:
   - 150-200 ký tự
   - Tóm tắt nội dung chính của bài gốc
   - Không trùng với title

3. **Nội dung (content)**:
   - **BẮT BUỘC: Phải viết về đúng chủ đề của bài gốc, KHÔNG tự ý thay đổi chủ đề**
   - Viết lại bằng văn phong chuyên nghiệp, KHÔNG copy nguyên văn
   - BẮT BUỘC: Độ dài từ 600-700 từ (tối thiểu 600 từ)
   - Cấu trúc chi tiết:
     * Giới thiệu: 2-3 đoạn văn (100-150 từ)
     * Nội dung chính: 4-6 phần với heading h2, mỗi phần 150-250 từ
     * Kết luận: 2-3 đoạn văn (100-150 từ)
   - Mỗi đoạn văn <p> phải có 3-5 câu
   - Phân tích chi tiết, đưa ra ví dụ cụ thể
   - Giữ lại số liệu, nguồn trích dẫn, mở rộng thêm thông tin
   - **QUAN TRỌNG: PHẢI giữ lại TẤT CẢ các thẻ <img> từ bài gốc, đặt ở vị trí phù hợp trong nội dung**
   - Format: HTML (sử dụng <h2>, <h3>, <p>, <ul>, <li>, <strong>, <img>)
   - QUAN TRỌNG: Nếu nội dung ngắn, hãy mở rộng bằng cách:
     * Thêm bối cảnh, lịch sử
     * Phân tích tác động, hệ quả
     * So sánh với tình hình trước đây
     * Đưa ra dự báo, khuyến nghị

4. **Table of Contents (toc)**:
   - Danh sách các heading chính (h2)
   - Ví dụ: ["Tổng quan thị trường", "Phân tích kỹ thuật", "Dự báo giá"]

5. **Category Suggestion (categorySuggestion)**:
   - Gợi ý 1 slug phù hợp nhất:
     * "tin-tuc" (tin tức crypto chung)
     * "phan-tich" (phân tích kỹ thuật, on-chain)
     * "kien-thuc" (kiến thức blockchain, DeFi, Web3)
     * "phap-ly" (pháp lý, quy định crypto)
     * "huong-dan" (hướng dẫn trading, sử dụng ví)

BÀI GỐC:
---
Tiêu đề: ${input.title}
Nguồn: ${input.source}
${input.description ? `Mô tả: ${input.description}` : ''}
${input.imageUrls && input.imageUrls.length > 0 ? `Ảnh gốc (${input.imageUrls.length} ảnh):\n${input.imageUrls.map((url, i) => `  ${i + 1}. ${url}`).join('\n')}` : ''}

Nội dung:
${input.content.substring(0, 3000)}...
---

XUẤT RA JSON:
{
  "title": "...",
  "description": "...",
  "content": "<h2>...</h2><p>...</p><img src='URL_ảnh' alt='...'/>...",
  "toc": ["...", "..."],
  "categorySuggestion": "..."
}

CHÚ Ý: 
- **QUAN TRỌNG NHẤT: PHẢI giữ nguyên chủ đề, từ khóa chính của bài gốc. KHÔNG tự ý đổi sang chủ đề khác**
- CHỈ trả về JSON, KHÔNG thêm giải thích
- Đảm bảo JSON hợp lệ (escape " thành \\", escape < thành \\< nếu cần)
- Content phải là HTML format TRÊN 1 DÒNG (không xuống dòng trong content string)
- **PHẢI giữ nguyên TẤT CẢ thẻ <img> từ bài gốc trong content**
- PHẢI ĐẢM BẢO: Nội dung content từ 600-700 từ, không được ngắn hơn 600 từ
- Viết chi tiết, đầy đủ, phân tích sâu các khía cạnh của vấn đề
- **NẾU bài gốc là hướng dẫn → viết lại thành hướng dẫn; nếu là tin tức → viết lại thành tin tức**
${input.imageUrls && input.imageUrls.length > 0 ? `
- QUAN TRỌNG: Nhúng các ảnh gốc vào content HTML (mỗi ảnh 1-2 phần):
  * Sử dụng <img src='URL' alt='Mô tả ảnh' style='max-width:100%;'/>
  * Đặt ảnh sau các phần nội dung liên quan
  * Thêm mô tả dưới ảnh nếu cần
` : ''}
`.trim();
}

/**
 * Call AI API to rewrite article (using Groq/Mistral)
 */
export async function rewriteArticle(input: RewriteInput): Promise<RewriteOutput> {
  const prompt = buildRewritePrompt(input);
  
  // TODO: Replace with your AI provider
  // Option 1: Groq (fast, free tier available)
  // Option 2: Mistral
  // Option 3: Google Gemini
  
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY not found in .env');
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',  // Active model (back to 3.3 with rate limit handling)
      messages: [
        {
          role: 'system',
          content: 'Bạn là biên tập viên chuyên nghiệp về tiền mã hóa (crypto). Trả về JSON hợp lệ.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[AI] Groq API error response:', errorText);
    throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  
  if (!content) {
    throw new Error('No content returned from AI');
  }

  try {
    // Strip markdown code blocks if present
    let jsonContent = content.trim();
    if (jsonContent.startsWith('```json')) {
      jsonContent = jsonContent.replace(/^```json\s*\n/, '').replace(/\n```\s*$/, '');
    } else if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.replace(/^```\s*\n/, '').replace(/\n```\s*$/, '');
    }
    
    // Remove control characters (newlines, tabs) inside JSON strings
    // This preserves actual JSON structure but removes problematic chars in values
    jsonContent = jsonContent.replace(/\\n/g, ' ').replace(/\\t/g, ' ').replace(/\\r/g, '');
    
    const output: RewriteOutput = JSON.parse(jsonContent);
    
    // Validate output
    if (!output.title || !output.content || !output.description) {
      throw new Error('Invalid AI output: missing required fields');
    }

    return output;
  } catch (error) {
    console.error('[AI] Failed to parse JSON:', content);
    throw new Error(`Failed to parse AI response: ${error}`);
  }
}

/**
 * Extract TOC from HTML content (fallback if AI doesn't provide)
 */
export function extractTocFromHtml(html: string): string[] {
  const toc: string[] = [];
  const h2Regex = /<h2[^>]*>(.*?)<\/h2>/gi;
  let match;
  
  while ((match = h2Regex.exec(html)) !== null) {
    const text = match[1].replace(/<[^>]*>/g, '').trim();
    if (text) {
      toc.push(text);
    }
  }
  
  return toc;
}
