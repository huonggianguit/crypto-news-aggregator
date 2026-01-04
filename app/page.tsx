// app/page.tsx
import BlogPage, { BlogPost } from "@/components/page/Page";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  // Lấy tất cả bài có category (15 chủ đề nào có bài thì tự dính vào)
  const allPosts = await prisma.post.findMany({
    include: {
      category: true,
    },
  });

  // Random đơn giản trên server
  const shuffled = [...allPosts].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 20); // lấy 20 bài

  const posts: BlogPost[] = selected.map((post) => ({
    id: post.id,
    image: post.main_img || "/placeholder.jpg",
    category: post.category?.name ?? "Danh mục",
    date: post.createdAt.toLocaleDateString("vi-VN"),
    title: post.title,
    shortContent:
      post.description ||
      "Bấm để xem chi tiết nội dung bài viết...",
    slug: post.slug,
  }));

  const headerImage = posts[0]?.image;

  return (
    <BlogPage
      tab="Blog"
      subtab="Tin tức nổi bật"
      title="Bài viết"
      posts={posts}
      headerImage={headerImage}
    />
  );
}
