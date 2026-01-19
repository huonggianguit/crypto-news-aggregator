// lib/ai-gen.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

// ===== ZOD SCHEMA =====
const TocItemSchema = z.object({
  id: z.string(),
  text: z.string(),
  level: z.number(),
});

const AiOutputSchema = z.object({
  title_vi: z.string().min(1, 'Title is required'),
  content_vi: z.string().min(1, 'Content is required'),
  excerpt: z.string().min(100).max(400),
  category_slug: z.enum(['tin-bitcoin', 'tin-ethereum', 'tin-altcoin', 'tin-thi-truong']),
  tags: z.array(z.string()).min(5).max(10),
  toc_vi: z.array(TocItemSchema),
});

export type AiOutput = z.infer<typeof AiOutputSchema>;
export type TocItem = z.infer<typeof TocItemSchema>;

// ===== VALIDATION RESULT TYPE =====
type ValidationSuccess = { success: true; data: AiOutput };
type ValidationError = { success: false; error: string };
type ValidationResult = ValidationSuccess | ValidationError;

// ===== VALIDATE FUNCTION =====
export function validateAiOutput(data: unknown): ValidationResult {
  const result = AiOutputSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const messages = result.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
  return { success: false, error: messages };
}

// ===== GEMINI CLIENT =====
if (!process.env.GEMINI_API_KEY) {
  console.warn('⚠️ Warning: GEMINI_API_KEY is missing in .env');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const model = genAI.getGenerativeModel({
  // Sử dụng model ổn định và nhanh: gemini-1.5-flash
  model: 'gemini-2.5-pro', 
  generationConfig: {
    responseMimeType: 'application/json',
    temperature: 0.3,
  },
});

// ===== SYSTEM PROMPT =====
const SYSTEM_PROMPT = `Bạn là chuyên gia Crypto và Dịch thuật chuyên nghiệp. Nhiệm vụ của bạn:

1. **Dịch Title và Content sang tiếng Việt**:
   - Giữ nguyên tất cả thuật ngữ chuyên ngành: Blockchain, Layer-2, Consensus, Node, Staking, DeFi, NFT, Smart Contract, Gas Fee, Liquidity, Yield, APY, TVL, Market Cap, Whale, HODL, FUD, FOMO, Airdrop, Whitepaper, Tokenomics, etc.
   - Giữ nguyên tên riêng: Vitalik Buterin, CZ, SBF, Satoshi Nakamoto, etc.
   - Giữ nguyên tên token/coin: BTC, ETH, SOL, BNB, USDT, USDC, etc.
   - Văn phong trôi chảy, chuyên nghiệp, không dịch word-by-word.
   - Giữ nguyên format HTML trong content (các tag <p>, <h2>, <h3>, <ul>, <li>, <a>, <strong>, <em>, etc.)

2. **Tạo Excerpt**: Tóm tắt nội dung chính trong 150-300 ký tự tiếng Việt, hấp dẫn, đúng trọng tâm.

3. **Trích xuất Tags**: 5-10 từ khóa quan trọng nhất (entities) từ bài viết. Ví dụ: "Binance", "SEC", "Layer 2", "Vitalik Buterin", "Bitcoin ETF".

4. **Phân loại Category**: Chọn DUY NHẤT 1 slug phù hợp nhất:
   - 'tin-bitcoin': Bài viết chủ yếu về Bitcoin, BTC, halving, mining BTC, Bitcoin ETF.
   - 'tin-ethereum': Bài viết về Ethereum, ETH, EVM, Layer-2 trên ETH (Arbitrum, Optimism, Base), Vitalik.
   - 'tin-altcoin': Bài viết về các coin khác (SOL, BNB, XRP, ADA, DOGE, meme coin, etc.), các blockchain khác.
   - 'tin-thi-truong': Tin thị trường chung, phân tích kỹ thuật, quy định pháp lý, SEC, exchange news, macro.

5. **Dịch TOC**: Dịch các mục lục (text) sang tiếng Việt, giữ nguyên id và level.

**OUTPUT FORMAT (JSON thuần, không markdown):**
{
  "title_vi": "Tiêu đề tiếng Việt",
  "content_vi": "<p>Nội dung HTML tiếng Việt...</p>",
  "excerpt": "Tóm tắt 150-300 ký tự",
  "category_slug": "tin-bitcoin | tin-ethereum | tin-altcoin | tin-thi-truong",
  "tags": ["Tag1", "Tag2", "Tag3", "Tag4", "Tag5"],
  "toc_vi": [
    { "id": "heading-1", "text": "Tiêu đề mục 1", "level": 2 },
    { "id": "heading-2", "text": "Tiêu đề mục 2", "level": 3 }
  ]
}`;

// ===== MAIN FUNCTION =====
export interface TranslateInput {
  title: string;
  content: string; // HTML
  toc: TocItem[];
}

export async function translateAndClassify(input: TranslateInput): Promise<AiOutput> {
  const userPrompt = `
**TITLE (English):**
${input.title}

**CONTENT (English HTML):**
${input.content}

**TOC (English):**
${JSON.stringify(input.toc, null, 2)}

Hãy dịch và phân loại bài viết trên theo đúng format JSON đã yêu cầu.`;

  // Dùng startChat với history để có multi-turn conversation
  const chat = model.startChat({
    history: [
      { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
      { role: 'model', parts: [{ text: 'Tôi đã hiểu. Hãy gửi bài viết cần dịch.' }] },
    ],
  });

  const result = await chat.sendMessage(userPrompt);
  const text = result.response.text();

  // Parse JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(`AI response is not valid JSON: ${text.substring(0, 200)}...`);
  }

  // Validate with Zod
  const validation = validateAiOutput(parsed);
  
  // Dùng discriminated union check rõ ràng
  if (!validation.success) {
     // TypeScript sẽ narrow type về ValidationError tại đây
     const errorMsg = (validation as any).error || 'Unknown validation error';
     throw new Error(`AI output validation failed: ${errorMsg}`);
  }

  return validation.data;
}

// ===== RETRY WRAPPER =====
export async function translateWithRetry(
  input: TranslateInput,
  maxRetries: number = 3
): Promise<AiOutput> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`   🤖 AI Translation attempt ${attempt}/${maxRetries}...`);
      const result = await translateAndClassify(input);
      console.log(`   ✅ AI Translation successful`);
      return result;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.log(`   ⚠️ Attempt ${attempt} failed: ${lastError.message}`);

      if (attempt < maxRetries) {
        // Exponential backoff: 2s, 4s, 8s
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`   ⏳ Retrying in ${delay / 1000}s...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw new Error(`AI Translation failed after ${maxRetries} attempts: ${lastError?.message}`);
}
