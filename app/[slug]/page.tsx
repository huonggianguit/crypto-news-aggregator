// app/[slug]/page.tsx
import { notFound } from "next/navigation";
import { CatalogModel } from "@/models/catalogModel";
import BlogPage, { BlogPost } from "@/components/page/Page";

// Next 16: params là Promise
type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

// SEO
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;                       // ✅ await params
  const data = await CatalogModel.getCatalogData(slug);

  if (!data) {
    return { title: "Không tìm thấy trang" };
  }

  return {
    title: `${data.title} - Website Bảo Hiểm`,
    description: `Tổng hợp tin tức về ${data.title}`,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;                       // ✅ await params
  const data = await CatalogModel.getCatalogData(slug);

  if (!data) {
    notFound();
  }

  const posts: BlogPost[] = data.posts.map((post: any) => ({
    id: post.id,
    image: post.main_img || "/placeholder.jpg",
    category: data.title,
    date: new Date(post.createdAt).toLocaleDateString("vi-VN"),
    title: post.title,
    shortContent:
      post.description || "Bấm để xem chi tiết nội dung bài viết...",
    slug: post.slug,
  }));

  const headerImage = posts[0]?.image;

  return (
    <BlogPage
      tab={data.group || "Danh mục"}
      subtab={data.title}
      title={data.title}
      posts={posts}
      headerImage={headerImage}
    />
  );
}
