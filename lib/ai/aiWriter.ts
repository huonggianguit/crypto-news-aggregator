// lib/ai/aiWriter.ts
/**
 * AI Writer với Groq API và Retry Logic
 * Hỗ trợ multiple providers: Groq (Llama-3), OpenAI (GPT-4), Gemini
 */

export interface AIRewriteInput {
  title: string;
  content: string;
  description?: string;
  source: string;
}

export interface AIRewriteOutput {
  title: string;            // SEO-optimized title (< 60 chars)
  content_html: string;     // HTML content
  summary: string;          // Short summary/description (150-200 chars)
  keywords?: string[];      // Suggested keywords
  categorySuggestion?: string;
}

/**
 * Build System Prompt for AI
 */
function buildSystemPrompt(): string {
  return `Bạn là một biên tập viên tin tức tiền mã hóa chuyên nghiệp tại Việt Nam. 
Nhiệm vụ của bạn là đọc bài báo tiếng Anh hoặc tiếng Việt đầu vào, sau đó viết lại một bài mới hoàn toàn bằng tiếng Việt.

YÊU CẦU:
- **Tone giọng**: Khách quan, phân tích sâu, chuyên nghiệp nhưng dễ hiểu cho người mới
- **Cấu trúc**: 
  * Sapo (đoạn mở đầu): Tóm tắt ý chính, giật gân
  * Các thẻ H2 rõ ràng chia phần
  * Kết luận: Tổng kết và triển vọng
- **Phong cách**: 
  * Tuyệt đối KHÔNG dịch word-by-word
  * Tóm ý và viết lại theo phong cách báo chí Việt Nam
  * Thêm bối cảnh, phân tích cho người Việt
- **Tiêu đề**: Giật gân (clickbait) nhưng KHÔNG sai sự thật, dưới 60 ký tự
- **Độ dài**: Tối thiểu 600 từ, tối đa 1000 từ
- **Định dạng**: HTML với <h2>, <p>, <ul>, <li>, <strong>, <em>

XUẤT RA JSON với format:
{
  "title": "Tiêu đề SEO < 60 ký tự",
  "content_html": "<p>Sapo...</p><h2>Phần 1</h2><p>...</p>...",
  "summary": "Tóm tắt 150-200 ký tự"
}`;
}

/**
 * Build User Prompt
 */
function buildUserPrompt(input: AIRewriteInput): string {
  return `
BÀI GỐC CẦN VIẾT LẠI:

Nguồn: ${input.source}
Tiêu đề: ${input.title}
${input.description ? `Mô tả: ${input.description}` : ''}

Nội dung:
${input.content.substring(0, 4000)}

---

Hãy viết lại bài này thành một bài báo mới hoàn toàn bằng tiếng Việt. Trả về JSON hợp lệ theo format đã chỉ định.
CHÚ Ý: CHỈ trả về JSON, KHÔNG thêm text khác.
`.trim();
}

/**
 * Retry helper với exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      console.log(`[AI Writer] Attempt ${i + 1}/${maxRetries} failed: ${lastError.message}`);
      
      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i);
        console.log(`[AI Writer] Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('All AI retries failed');
}

/**
 * Call Groq API (Llama-3.3-70b)
 */
async function callGroqAPI(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    throw new Error('GROQ_API_KEY not found in environment variables');
  }
  
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 4096,
      top_p: 0.95,
    }),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error: ${response.status} - ${errorText}`);
  }
  
  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  
  if (!content) {
    throw new Error('No content returned from Groq API');
  }
  
  return content;
}

/**
 * Call OpenAI API (GPT-4o-mini) - Alternative
 */
async function callOpenAI(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not found in environment variables');
  }
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 4096,
    }),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
  }
  
  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  
  if (!content) {
    throw new Error('No content returned from OpenAI API');
  }
  
  return content;
}

/**
 * Parse JSON response from AI (handle markdown code blocks)
 */
function parseAIResponse(content: string): AIRewriteOutput {
  let jsonContent = content.trim();
  
  // Remove markdown code blocks
  if (jsonContent.startsWith('```json')) {
    jsonContent = jsonContent.replace(/^```json\s*\n/, '').replace(/\n```\s*$/, '');
  } else if (jsonContent.startsWith('```')) {
    jsonContent = jsonContent.replace(/^```\s*\n/, '').replace(/\n```\s*$/, '');
  }
  
  // Parse JSON
  const parsed = JSON.parse(jsonContent);
  
  // Validate required fields
  if (!parsed.title || !parsed.content_html || !parsed.summary) {
    throw new Error('Invalid AI response: missing required fields (title, content_html, summary)');
  }
  
  return {
    title: parsed.title,
    content_html: parsed.content_html,
    summary: parsed.summary,
    keywords: parsed.keywords,
    categorySuggestion: parsed.categorySuggestion,
  };
}

/**
 * Main function: Rewrite article với retry
 */
export async function rewriteArticle(
  input: AIRewriteInput,
  provider: 'groq' | 'openai' = 'groq'
): Promise<AIRewriteOutput> {
  console.log(`[AI Writer] Rewriting article: ${input.title.substring(0, 50)}...`);
  console.log(`[AI Writer] Using provider: ${provider}`);
  
  return retryWithBackoff(async () => {
    const systemPrompt = buildSystemPrompt();
    const userPrompt = buildUserPrompt(input);
    
    let rawResponse: string;
    
    if (provider === 'groq') {
      rawResponse = await callGroqAPI(systemPrompt, userPrompt);
    } else if (provider === 'openai') {
      rawResponse = await callOpenAI(systemPrompt, userPrompt);
    } else {
      throw new Error(`Unknown AI provider: ${provider}`);
    }
    
    // Parse and validate
    const output = parseAIResponse(rawResponse);
    
    console.log(`[AI Writer] ✓ Successfully rewrote: ${output.title}`);
    return output;
  }, 3, 2000);
}

/**
 * Batch rewrite multiple articles
 */
export async function batchRewriteArticles(
  inputs: AIRewriteInput[],
  provider: 'groq' | 'openai' = 'groq',
  delayMs: number = 1000
): Promise<(AIRewriteOutput | null)[]> {
  const results: (AIRewriteOutput | null)[] = [];
  
  for (const input of inputs) {
    try {
      const output = await rewriteArticle(input, provider);
      results.push(output);
      
      // Delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, delayMs));
    } catch (error) {
      console.error(`[AI Writer] Failed to rewrite article: ${input.title}`, error);
      results.push(null);
    }
  }
  
  return results;
}

/**
 * Get available AI provider
 */
export function getAvailableProvider(): 'groq' | 'openai' | null {
  if (process.env.GROQ_API_KEY) {
    return 'groq';
  }
  
  if (process.env.OPENAI_API_KEY) {
    return 'openai';
  }
  
  return null;
}
