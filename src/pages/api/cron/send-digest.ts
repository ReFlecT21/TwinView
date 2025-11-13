import type { NextApiRequest, NextApiResponse } from 'next';
import { sendDigestsToAllUsers } from '../../../server/services/emailDigest';

/**
 * Cron job endpoint to send email digests to all users
 *
 * This endpoint should be called once per day by a cron service
 * Recommended time: 7-8 AM user's local time
 *
 * To protect this endpoint:
 * 1. Set CRON_SECRET in your environment variables
 * 2. Pass it as Authorization header: `Bearer {CRON_SECRET}`
 *
 * Example Vercel Cron configuration (vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/send-digest",
 *     "schedule": "0 7 * * *"  // Every day at 7 AM UTC
 *   }]
 * }
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify authorization
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret) {
    if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
      console.error('Unauthorized digest cron request');
      return res.status(401).json({ error: 'Unauthorized' });
    }
  } else {
    console.warn('CRON_SECRET not set - endpoint is unprotected!');
  }

  try {
    console.log('Starting email digest cron job...');
    const startTime = Date.now();

    // Send digests to all users
    const result = await sendDigestsToAllUsers();

    const duration = Date.now() - startTime;

    const summary = {
      success: true,
      duration: `${duration}ms`,
      sentCount: result.sentCount,
      skippedCount: result.skippedCount,
      errorCount: result.errorCount,
      timestamp: new Date().toISOString(),
    };

    console.log('Email digest cron job completed:', summary);

    return res.status(200).json(summary);
  } catch (error) {
    console.error('Error in email digest cron job:', error);

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
}
