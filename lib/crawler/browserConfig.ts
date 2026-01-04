// lib/crawler/browserConfig.ts
/**
 * Browser Anti-Detection Configuration
 * Chống website phát hiện bot crawling
 */

import { chromium, Browser, BrowserContext, Page } from 'playwright';

// User-Agent pool (real browsers)
const USER_AGENTS = [
  // Chrome Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  // Chrome Mac
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  // Edge
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
  // Firefox
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0',
];

// Viewport sizes (common resolutions)
const VIEWPORTS = [
  { width: 1920, height: 1080 },
  { width: 1366, height: 768 },
  { width: 1536, height: 864 },
  { width: 1440, height: 900 },
  { width: 2560, height: 1440 },
];

/**
 * Get random User-Agent
 */
export function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

/**
 * Get random viewport
 */
export function getRandomViewport() {
  return VIEWPORTS[Math.floor(Math.random() * VIEWPORTS.length)];
}

/**
 * Create stealth browser instance with anti-detection
 */
export async function createStealthBrowser(): Promise<Browser> {
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--disable-blink-features=AutomationControlled', // Remove automation flags
      '--disable-dev-shm-usage',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      '--flag-switches-begin --disable-site-isolation-trials --flag-switches-end',
    ],
  });

  return browser;
}

/**
 * Create stealth context with randomized fingerprint
 */
export async function createStealthContext(browser: Browser): Promise<BrowserContext> {
  const userAgent = getRandomUserAgent();
  const viewport = getRandomViewport();

  const context = await browser.newContext({
    userAgent,
    viewport,
    locale: 'vi-VN',
    timezoneId: 'Asia/Ho_Chi_Minh',
    permissions: ['geolocation'],
    geolocation: { latitude: 10.8231, longitude: 106.6297 }, // Ho Chi Minh City
    colorScheme: 'light',
    deviceScaleFactor: 1,
    hasTouch: false,
    isMobile: false,
    javaScriptEnabled: true,
  });

  return context;
}

/**
 * Apply anti-detection scripts to page
 */
export async function applyStealthScripts(page: Page): Promise<void> {
  // Override navigator.webdriver
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', {
      get: () => undefined,
    });
  });

  // Override plugins
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'plugins', {
      get: () => [
        {
          description: 'Portable Document Format',
          filename: 'internal-pdf-viewer',
          name: 'Chrome PDF Plugin',
        },
        {
          description: 'Native Client Executable',
          filename: 'internal-nacl-plugin',
          name: 'Native Client',
        },
      ],
    });
  });

  // Override languages
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'languages', {
      get: () => ['vi-VN', 'vi', 'en-US', 'en'],
    });
  });

  // Override permissions
  await page.addInitScript(() => {
    const originalQuery = window.navigator.permissions.query;
    window.navigator.permissions.query = (parameters: any) => {
      return parameters.name === 'notifications'
        ? Promise.resolve({ state: 'denied' } as PermissionStatus)
        : originalQuery(parameters);
    };
  });

  // Override chrome runtime
  await page.addInitScript(() => {
    (window as any).chrome = {
      runtime: {},
    };
  });
}

/**
 * Create fully configured stealth page
 */
export async function createStealthPage(browser: Browser): Promise<Page> {
  const context = await createStealthContext(browser);
  const page = await context.newPage();
  
  await applyStealthScripts(page);
  
  // Random delays to mimic human behavior
  page.setDefaultTimeout(30000);
  page.setDefaultNavigationTimeout(30000);
  
  return page;
}

/**
 * Navigate with human-like behavior
 */
export async function navigateHumanLike(page: Page, url: string): Promise<void> {
  // Random delay before navigation (100-500ms)
  await page.waitForTimeout(100 + Math.random() * 400);
  
  await page.goto(url, {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });
  
  // Wait for network to be idle
  await page.waitForLoadState('networkidle').catch(() => {
    console.log('[Browser] Network not idle, continuing...');
  });
  
  // Random scroll to trigger lazy loading
  await page.evaluate(() => {
    window.scrollTo(0, Math.random() * 500);
  });
  
  // Small delay after scroll
  await page.waitForTimeout(500 + Math.random() * 1000);
}

/**
 * Close browser safely
 */
export async function closeBrowserSafely(browser: Browser): Promise<void> {
  try {
    await browser.close();
  } catch (error) {
    console.error('[Browser] Error closing browser:', error);
  }
}

/**
 * Retry helper with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      console.log(`[Retry] Attempt ${i + 1}/${maxRetries} failed: ${lastError.message}`);
      
      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i); // Exponential backoff
        console.log(`[Retry] Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('All retries failed');
}
