#!/usr/bin/env node
/**
 * Cron worker to POST to the send-due-followups API endpoint daily.
 * - Uses `node-cron` (already in deps) and `axios` (already in deps).
 * - Configure with env: CRON_SEND_FOLLOWUPS_URL, CRON_SCHEDULE (cron expression).
 */
const cron = require('node-cron')
const axios = require('axios')
require('dotenv').config()

const target = process.env.CRON_SEND_FOLLOWUPS_URL || 'http://localhost:3000/api/send-due-followups'
// Default to every minute for quicker delivery during testing/development.
const schedule = process.env.CRON_SCHEDULE || '* * * * *' // every minute

async function runOnce() {
  try {
    console.log(new Date().toISOString(), 'pinging', target)

    // Prepare headers if we have a CRON_SECRET
    const headers = {};
    if (process.env.CRON_SECRET) {
      headers['Authorization'] = `Bearer ${process.env.CRON_SECRET}`;
    }

    const res = await axios.get(target, {
      timeout: 120000,
      headers: headers
    })
    console.log('Response status:', res.status, 'data:', res.data)
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      console.warn(`[Cron] Next.js server not ready at ${target} yet. Will try again on next schedule.`);
    } else {
      console.error('[Cron] Error pinging send-due-followups:', err && err.message ? err.message : err);
    }
  }
}

console.log('Cron worker starting — schedule:', schedule)

// Wait 10 seconds before the first run so Next.js has time to boot up and bind to port 3000
setTimeout(() => {
  console.log('[Cron] Initial run...');
  runOnce();
}, 10000);

// Schedule the periodic job
cron.schedule(schedule, () => {
  console.log(new Date().toISOString(), 'Cron triggered')
  runOnce()
})

// graceful shutdown
process.on('SIGINT', () => {
  console.log('Cron worker stopping (SIGINT)')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('Cron worker stopping (SIGTERM)')
  process.exit(0)
})
