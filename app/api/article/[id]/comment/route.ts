// app/api/article/[id]/comment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/index';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: articleId } = await params;
    const { content, rating } = await req.json();

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        rating: rating || 5,
        articleId,
        userId: user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Update comment count in stats
    await prisma.articleStats.upsert({
      where: { articleId },
      update: { comments: { increment: 1 } },
      create: {
        articleId,
        views: 0,
        likes: 0,
        unlikes: 0,
        comments: 1,
      },
    });

    return NextResponse.json({
      id: comment.id,
      content: comment.content,
      rating: comment.rating,
      createdAt: comment.createdAt.toISOString(),
      user: comment.user,
    });
  } catch (error) {
    console.error('Comment error:', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: articleId } = await params;

    const comments = await prisma.comment.findMany({
      where: { articleId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(
      comments.map((c) => ({
        id: c.id,
        content: c.content,
        rating: c.rating,
        createdAt: c.createdAt.toISOString(),
        user: c.user,
      }))
    );
  } catch (error) {
    console.error('Get comments error:', error);
    return NextResponse.json({ error: 'Failed to get comments' }, { status: 500 });
  }
}
