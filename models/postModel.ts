// models/postModel.ts
import { prisma } from "@/lib/prisma";

export class PostModel {
  /**
   * Lấy 1 bài viết theo slug
   */
  static async getPostBySlug(slug: string) {
    const post = await prisma.post.findUnique({
      where: { slug },
      include: {
        category: true,
      },
    });

    if (!post) return null;

    return post;
  }

  /**
   * Lấy một vài bài liên quan cùng category (trừ chính nó)
   */
  static async getRelatedPosts(categoryId: string, excludeSlug: string, limit = 3) {
    const posts = await prisma.post.findMany({
      where: {
        categoryId,
        slug: { not: excludeSlug },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return posts;
  }
}
