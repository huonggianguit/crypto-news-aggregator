import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    // Check categories
    const categories = await prisma.category.findMany({
      include: {
        _count: { select: { posts: true } }
      },
      orderBy: { name: "asc" }
    });

    // Check total posts
    const totalPosts = await prisma.post.count();

    // Test keyword searches
    const testKeywords = ["bitcoin", "ethereum", "crypto"];
    const searchResults: Record<string, any> = {};

    for (const keyword of testKeywords) {
      const results = await prisma.post.findMany({
        where: {
          OR: [
            { title: { contains: keyword } },
            { description: { contains: keyword } }
          ]
        },
        take: 2,
        select: { id: true, title: true, slug: true }
      });
      searchResults[keyword] = results.length;
    }

    return NextResponse.json({
      totalPosts,
      categories: categories.map(c => ({
        slug: c.slug,
        name: c.name,
        posts: c._count.posts
      })),
      searchResults
    });
  } catch (error) {
    console.error("Diagnosis error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
