// app/api/article/[id]/reaction/route.ts
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
    const { type } = await req.json();

    if (!['like', 'unlike'].includes(type)) {
      return NextResponse.json({ error: 'Invalid reaction type' }, { status: 400 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check existing reaction
    const existingReaction = await prisma.articleReaction.findUnique({
      where: {
        articleId_userId: {
          articleId,
          userId: user.id,
        },
      },
    });

    let updateData: { likes?: { increment: number }; unlikes?: { increment: number } } = {};

    if (!existingReaction) {
      // No existing reaction → create new one
      await prisma.articleReaction.create({
        data: {
          articleId,
          userId: user.id,
          type,
        },
      });
      updateData = type === 'like' ? { likes: { increment: 1 } } : { unlikes: { increment: 1 } };
    } else if (existingReaction.type === type) {
      // Same reaction → remove it (toggle off)
      await prisma.articleReaction.delete({
        where: { id: existingReaction.id },
      });
      updateData = type === 'like' ? { likes: { increment: -1 } } : { unlikes: { increment: -1 } };
    } else {
      // Different reaction → switch
      await prisma.articleReaction.update({
        where: { id: existingReaction.id },
        data: { type },
      });
      // Decrement old, increment new
      if (type === 'like') {
        updateData = { likes: { increment: 1 }, unlikes: { increment: -1 } };
      } else {
        updateData = { likes: { increment: -1 }, unlikes: { increment: 1 } };
      }
    }

    // Update stats
    const stats = await prisma.articleStats.upsert({
      where: { articleId },
      update: updateData,
      create: {
        articleId,
        views: 0,
        likes: type === 'like' ? 1 : 0,
        unlikes: type === 'unlike' ? 1 : 0,
        comments: 0,
      },
    });

    // Get current user reaction
    const currentReaction = await prisma.articleReaction.findUnique({
      where: {
        articleId_userId: {
          articleId,
          userId: user.id,
        },
      },
    });

    return NextResponse.json({
      likes: Math.max(0, stats.likes),
      unlikes: Math.max(0, stats.unlikes),
      userReaction: currentReaction?.type || null,
    });
  } catch (error) {
    console.error('Reaction error:', error);
    return NextResponse.json({ error: 'Failed to update reaction' }, { status: 500 });
  }
}

// GET user's current reaction
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id: articleId } = await params;

    if (!session?.user?.email) {
      return NextResponse.json({ userReaction: null });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ userReaction: null });
    }

    const reaction = await prisma.articleReaction.findUnique({
      where: {
        articleId_userId: {
          articleId,
          userId: user.id,
        },
      },
    });

    return NextResponse.json({
      userReaction: reaction?.type || null,
    });
  } catch (error) {
    console.error('Get reaction error:', error);
    return NextResponse.json({ userReaction: null });
  }
}
