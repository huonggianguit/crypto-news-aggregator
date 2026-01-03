// app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.trim() === '') {
      return NextResponse.json({ results: [] });
    }

    // Tạo regex để tìm kiếm không phân biệt hoa thường (MongoDB compatible)
    const searchRegex = new RegExp(query, 'i');

    // Tìm kiếm theo title trước (ưu tiên cao hơn)
    const titleResults = await prisma.post.findMany({
      where: {
        title: {
          contains: query,
        },
      },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        main_img: true,
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
        createdAt: true,
      },
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Nếu kết quả từ title chưa đủ, tìm thêm trong description và content
    let contentResults: Array<{
      id: string;
      slug: string;
      title: string;
      description: string | null;
      main_img: string;
      category: {
        name: string;
        slug: string;
      };
      createdAt: Date;
    }> = [];
    
    if (titleResults.length < 5) {
      const titleIds = titleResults.map((post) => post.id);
      
      contentResults = await prisma.post.findMany({
        where: {
          AND: [
            {
              id: {
                notIn: titleIds, // Loại bỏ các bài đã có trong titleResults
              },
            },
            {
              OR: [
                {
                  description: {
                    contains: query,
                  },
                },
                {
                  content: {
                    contains: query,
                  },
                },
              ],
            },
          ],
        },
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          main_img: true,
          category: {
            select: {
              name: true,
              slug: true,
            },
          },
          createdAt: true,
        },
        take: 5 - titleResults.length,
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    // Kết hợp kết quả: title trước, content sau
    const results = [...titleResults, ...contentResults];

    return NextResponse.json({
      results,
      total: results.length,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
