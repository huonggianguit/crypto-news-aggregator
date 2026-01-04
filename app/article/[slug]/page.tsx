// app/article/[slug]/page.tsx
import { notFound } from "next/navigation";
import { PostModel } from "@/models/postModel";
import { ArticleDetailRoot } from "@/components/page/ArticleDetailRoot";
import { buildContentHtml } from "@/lib/contentUtils";
import type { BlogPost } from "@/components/page/BlogDetail";
import { prisma } from "@/lib/prisma";
import { LegalDetailRoot } from "@/components/page/LegalDetailRoot";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

// SEO
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = await PostModel.getPostBySlug(slug);

  if (post) {
    return {
      title: `${post.title} - Website Bảo Hiểm`,
      description: post.description ?? "",
    };
  }

  // Try LegalDocument
  const legalDoc = await (prisma as any).legalDocument.findUnique({ where: { slug } });
  if (legalDoc) {
    return {
      title: `${legalDoc.title} - Văn bản pháp luật`,
      description: legalDoc.summary ?? "",
    };
  }

  return { title: "Không tìm thấy bài viết" };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  
  // 1. Try finding Post
  let post = await PostModel.getPostBySlug(slug);
  let isLegalDoc = false;

  // 2. If not found, try finding LegalDocument
  if (!post) {
    const legalDoc = await (prisma as any).legalDocument.findUnique({ where: { slug } });
    if (legalDoc) {
      isLegalDoc = true;
      // Adapt LegalDocument to Post structure
      post = {
        id: legalDoc.id,
        slug: legalDoc.slug,
        title: legalDoc.title,
        description: legalDoc.summary,
        content: legalDoc.content,
        main_img: "", 
        image: null,
        toc: null,
        categoryId: "legal",
        category: { name: "Văn bản pháp luật", slug: "van-ban" },
        createdAt: legalDoc.createdAt,
        updatedAt: legalDoc.updatedAt,
        attachmentUrl: legalDoc.attachmentUrl,
        lawNumber: legalDoc.lawNumber,
        issuingAgency: legalDoc.issuingAgency,
        promulgationDate: legalDoc.promulgationDate,
        effectiveDate: legalDoc.effectiveDate,
      } as any;
    }
  }

  if (!post) {
    notFound();
  }

  const toc: string[] = Array.isArray(post.toc)
    ? (post.toc as any[]).filter((t) => typeof t === "string")
    : [];

  const contentHtml = buildContentHtml(post.content ?? "", post.image, toc);

  const uiPost: BlogPost = {
    id: post.id,
    image: post.main_img && post.main_img.trim() ? post.main_img : (post.image as any)?.url || "/placeholder.jpg",
    category: post.category?.name ?? "Danh mục",
    date: post.createdAt.toLocaleDateString("vi-VN"),
    title: post.title,
    shortContent: post.description ?? "",
    contentHtml,
    toc,
    source: (post as any).source, // Add source field
    attachmentUrl: (post as any).attachmentUrl,
    // Pass legal fields if available
    lawNumber: isLegalDoc ? (post as any).lawNumber : undefined,
    issuingAgency: isLegalDoc ? (post as any).issuingAgency : undefined,
    promulgationDate: isLegalDoc && (post as any).promulgationDate ? new Date((post as any).promulgationDate).toLocaleDateString("vi-VN") : undefined,
    effectiveDate: isLegalDoc && (post as any).effectiveDate ? new Date((post as any).effectiveDate).toLocaleDateString("vi-VN") : undefined,
  };

  // Get related posts
  let uiRelated: BlogPost[] = [];
  if (!isLegalDoc) {
    const related = await PostModel.getRelatedPosts(post.categoryId, post.slug, 3);
    uiRelated = related.map((p) => ({
      id: p.id,
      image: p.main_img && p.main_img.trim() ? p.main_img : (p.image as any)?.url || "/placeholder.jpg",
      category: post.category?.name ?? "Danh mục",
      date: p.createdAt.toLocaleDateString("vi-VN"),
      title: p.title,
      shortContent: p.description ?? "",
      slug: p.slug,
    }));
  } else {
    // For legal docs, fetch other recent legal docs
    const relatedDocs = await (prisma as any).legalDocument.findMany({
      where: { slug: { not: slug } },
      take: 3,
      orderBy: { createdAt: 'desc' }
    });
    uiRelated = relatedDocs.map((d: any) => ({
      id: d.id,
      image: "/placeholder.jpg",
      category: "Văn bản pháp luật",
      date: d.createdAt.toLocaleDateString("vi-VN"),
      title: d.title,
      shortContent: d.summary ?? "",
      slug: d.slug
    }));
  }

  return isLegalDoc
    ? <LegalDetailRoot post={uiPost} relatedPosts={uiRelated} />
    : <ArticleDetailRoot post={uiPost} relatedPosts={uiRelated} />;
}
