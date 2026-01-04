import { initializeCrawlScheduler, getSchedulerStatus, triggerManualCrawl } from '@/lib/scheduler/crawlScheduler';
import { NextRequest, NextResponse } from 'next/server';

// Initialize scheduler on first request
let schedulerInitialized = false;

/**
 * GET /api/scheduler/status - Get scheduler status
 * POST /api/scheduler/trigger - Manually trigger crawl
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action');

  // Initialize scheduler if not done
  if (!schedulerInitialized) {
    try {
      initializeCrawlScheduler();
      schedulerInitialized = true;
      console.log('[API] Scheduler initialized');
    } catch (err) {
      console.error('[API] Error initializing scheduler:', err);
    }
  }

  if (action === 'status') {
    const status = await getSchedulerStatus();
    return NextResponse.json({
      ok: true,
      status: status,
    });
  }

  if (action === 'trigger') {
    try {
      await triggerManualCrawl();
      return NextResponse.json({
        ok: true,
        message: 'Manual crawl triggered',
      });
    } catch (err) {
      return NextResponse.json(
        {
          ok: false,
          error: (err as Error).message,
        },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({
    ok: true,
    actions: {
      status: '/api/scheduler/status?action=status',
      trigger: '/api/scheduler/status?action=trigger',
    },
  });
}

/**
 * POST /api/scheduler/status - Trigger crawl via POST
 */
export async function POST(request: NextRequest) {
  try {
    await triggerManualCrawl();
    return NextResponse.json({
      ok: true,
      message: 'Manual crawl triggered',
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: (err as Error).message,
      },
      { status: 500 }
    );
  }
}
