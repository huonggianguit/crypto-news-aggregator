// lib/vectorSearch.ts
import { prisma } from '@/lib/db/index'

// Định nghĩa kiểu dữ liệu trả về cho kết quả tìm kiếm
export interface SearchResult {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  thumbnail: string | null;
  similarity: number;
}

// Hàm này nhận vào Vector (mảng số) và trả về các bài giống nó
export async function findSimilarPosts(vector: number[], threshold = 0.5, limit = 5): Promise<SearchResult[]> {
  
  // 1. Chuyển mảng số thành chuỗi format vector cho SQL: "[0.1,0.2,...]"
  const vectorString = `[${vector.join(',')}]`;

  // 2. Chạy Raw SQL để tìm bài viết tương đồng
  // Sử dụng toán tử <=> (cosine distance) của pgvector
  // 1 - distance = similarity (độ tương đồng)
  // Ép kiểu (prisma as any) để tránh lỗi TypeScript khi chưa generate client mới
  const results = await (prisma as any).$queryRaw`
    SELECT 
      id, 
      title, 
      slug,
      excerpt,
      thumbnail,
      1 - (embedding <=> ${vectorString}::vector) as similarity
    FROM "Article"
    WHERE 1 - (embedding <=> ${vectorString}::vector) > ${threshold}
    ORDER BY similarity DESC
    LIMIT ${limit};
  `;

  return results as SearchResult[];
}
