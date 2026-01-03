/**
 * Instrumentation file - runs on Next.js server startup
 * This initializes the crawl scheduler automatically
 */

export async function register() {
  // Only initialize on server side
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      const { initializeCrawlScheduler } = await import('@/lib/scheduler/crawlScheduler');
      
      console.log('\n╔════════════════════════════════════════════╗');
      console.log('║  INITIALIZING AUTO SCHEDULER ON STARTUP    ║');
      console.log('╚════════════════════════════════════════════╝\n');
      
      initializeCrawlScheduler();
      
      console.log('\n✓ Auto scheduler is now running!');
      console.log('  (Crawls every 20 minutes: at :00 and :20)\n');
    } catch (error) {
      console.error('[Instrumentation] Error initializing scheduler:', error);
      // Don't fail the whole app if scheduler fails
    }
  }
}
