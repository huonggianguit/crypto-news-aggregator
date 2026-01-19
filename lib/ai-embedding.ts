// lib/ai-embedding.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

// ===== GEMINI CLIENT =====
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const embeddingModel = genAI.getGenerativeModel({
  model: 'text-embedding-004',
});

// ===== MAIN FUNCTION =====
/**
 * Generate embedding vector từ text
 * @param text - Text cần vectorize
 * @returns number[] - Mảng 768 dimensions
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!text || text.trim().length === 0) {
    throw new Error('Text is required for embedding generation');
  }

  // Truncate text nếu quá dài (text-embedding-004 có limit ~2048 tokens)
  // Ước tính ~4 chars/token, safe limit ~8000 chars
  const truncatedText = text.length > 8000 ? text.substring(0, 8000) : text;

  const result = await embeddingModel.embedContent(truncatedText);
  const embedding = result.embedding;

  if (!embedding || !embedding.values || embedding.values.length === 0) {
    throw new Error('Failed to generate embedding: empty response');
  }

  // text-embedding-004 trả về 768 dimensions
  if (embedding.values.length !== 768) {
    console.warn(`⚠️ Unexpected embedding dimensions: ${embedding.values.length} (expected 768)`);
  }

  return embedding.values;
}

// ===== BATCH EMBEDDING (nếu cần sau này) =====
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const results: number[][] = [];

  for (const text of texts) {
    const embedding = await generateEmbedding(text);
    results.push(embedding);
    // Rate limiting: 100ms delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return results;
}

// ===== UTILITY: Convert vector to Postgres format =====
/**
 * Convert number array to Postgres vector string format
 * @param vector - number[]
 * @returns string - "[0.1,0.2,0.3,...]"
 */
export function vectorToString(vector: number[]): string {
  return `[${vector.join(',')}]`;
}
