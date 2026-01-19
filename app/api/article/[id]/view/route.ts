// app/api/article/[id]/view/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/index';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Increment view count
    await prisma.articleStats.upsert({
      where: { articleId: id },
      update: { views: { increment: 1 } },
      create: {
        articleId: id,
        views: 1,
        likes: 0,
        unlikes: 0,
        comments: 0,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('View count error:', error);
    return NextResponse.json({ error: 'Failed to update view count' }, { status: 500 });
  }
}
