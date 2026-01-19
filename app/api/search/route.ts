// app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/index';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    console.log('[API Search] Query:', query);

    if (!query || query.trim() === '') {
      return NextResponse.json({ results: [] });
    }

    // Simple search with Prisma ORM
    const articles = await prisma.article.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { excerpt: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        thumbnail: true,
        createdAt: true,
        categories: {
          select: {
            name: true,
            slug: true,
          },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    console.log('[API Search] Found articles:', articles.length);

    // Format results
    const results = articles.map((article) => ({
      id: article.id,
      slug: article.slug,
      title: article.title,
      excerpt: article.excerpt,
      thumbnail: article.thumbnail,
      category: article.categories?.[0] || undefined,
      createdAt: article.createdAt.toISOString(),
    }));

    console.log('[API Search] Returning:', results.length);

    return NextResponse.json({ results, total: results.length });
  } catch (error) {
    console.error('[API Search] Error:', error);
    return NextResponse.json(
      { error: 'Search failed', message: String(error) },
      { status: 500 }
    );
  }
}
