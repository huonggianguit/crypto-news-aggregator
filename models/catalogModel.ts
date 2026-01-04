// models/catalogModel.ts
import { prisma } from "@/lib/prisma";

export class CatalogModel {
  /**
   * Lấy thông tin 1 Category + list Post theo slug của Category
   */
  static async getCatalogData(categorySlug: string) {
    if (!categorySlug) {
      throw new Error("categorySlug is required when calling getCatalogData");
    }

    const category = await prisma.category.findUnique({
      where: { slug: categorySlug },
      include: {
        posts: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!category) return null;

    return {
      id: category.id,
      group: category.groupName ?? "",
      title: category.name,
      slug: category.slug,
      totalPosts: category.posts.length,
      posts: category.posts,
    };
  }
}
