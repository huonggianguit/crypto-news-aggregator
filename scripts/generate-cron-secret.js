// scripts/generate-cron-secret.js
/**
 * Generate CRON_SECRET for .env file
 * 
 * Usage:
 *   node scripts/generate-cron-secret.js
 */

const crypto = require('crypto');

function generateSecret(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

console.log('\n╔═══════════════════════════════════════════════╗');
console.log('║   CRON SECRET GENERATOR                      ║');
console.log('╚═══════════════════════════════════════════════╝\n');

const secret = generateSecret(32);

console.log('Your CRON_SECRET (64 characters):');
console.log('\x1b[32m%s\x1b[0m', secret);
console.log('\nAdd to .env file:');
console.log(`CRON_SECRET="${secret}"`);
console.log('\n✓ Keep this secret safe!');
console.log('✓ Never commit to Git');
console.log('✓ Use different secrets for dev/production\n');
