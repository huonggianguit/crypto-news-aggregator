#!/usr/bin/env node
/**
 * Standalone scheduler daemon
 * Run this alongside Next.js server: npm run scheduler
 * 
 * Usage:
 *   npm run scheduler
 */

import 'tsconfig-paths/register';
import { initializeCrawlScheduler } from '@/lib/scheduler/crawlScheduler';

console.log('\n╔════════════════════════════════════════════╗');
console.log('║  AUTO CRAWL SCHEDULER DAEMON               ║');
console.log('║  (Runs every 20 minutes)                   ║');
console.log('╚════════════════════════════════════════════╝\n');

// Initialize scheduler
const task = initializeCrawlScheduler();

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[Scheduler] Shutting down gracefully...');
  task.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n[Scheduler] Shutting down gracefully...');
  task.stop();
  process.exit(0);
});

console.log('[Scheduler] Daemon running. Press Ctrl+C to stop.\n');
