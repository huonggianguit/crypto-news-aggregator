// app/api/search/ai/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateEmbedding } from '@/lib/ai-embedding';
import { findSimilarPosts } from '@/lib/db/vectorSearch';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = body;

    // Validate query
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Step 1: Generate embedding vector from query using AI
    console.log('🤖 AI Search: Generating embedding for query:', query);
    const queryVector = await generateEmbedding(query);
    console.log('✅ AI Search: Generated vector with', queryVector.length, 'dimensions');

    // Step 2: Find similar posts using vector search
    // threshold = 0.5 (50% similarity minimum)
    // limit = 10 posts
    console.log('🔍 AI Search: Searching for similar posts...');
    const similarPosts = await findSimilarPosts(queryVector, 0.5, 10);
    console.log('✅ AI Search: Found', similarPosts.length, 'similar posts');

    // Step 3: Format results for frontend
    const results = similarPosts.map(post => ({
      id: post.id,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      thumbnail: post.thumbnail,
      createdAt: new Date().toISOString(), // Add current date as fallback
      similarity: post.similarity,
    }));

    return NextResponse.json({
      success: true,
      results,
      query,
      mode: 'ai',
      metadata: {
        vectorDimensions: queryVector.length,
        threshold: 0.5,
        totalResults: results.length,
      },
    });

  } catch (error) {
    console.error('❌ AI Search Error:', error);

    return NextResponse.json(
      {
        error: 'AI search failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        results: [],
      },
      { status: 500 }
    );
  }
}
