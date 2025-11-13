import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchAllNews } from '../../../server/services/newsFetcher';
import { processArticlesAndStoreMatches } from '../../../server/services/newsMatching';

/**
 * Cron job endpoint to fetch and process news articles daily
 *
 * This endpoint should be called once per day by a cron service (e.g., Vercel Cron, Upstash QStash)
 *
 * To protect this endpoint, you should:
 * 1. Set CRON_SECRET in your environment variables
 * 2. Pass it as Authorization header: `Bearer {CRON_SECRET}`
 *
 * Example Vercel Cron configuration (vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/fetch-news",
 *     "schedule": "0 6 * * *"  // Every day at 6 AM UTC
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
      console.error('Unauthorized cron request');
      return res.status(401).json({ error: 'Unauthorized' });
    }
  } else {
    console.warn('CRON_SECRET not set - endpoint is unprotected!');
  }

  try {
    console.log('Starting news fetch cron job...');
    const startTime = Date.now();

    // Fetch news from the last day
    const articles = await fetchAllNews(1);

    console.log(`Fetched ${articles.length} articles, processing matches...`);

    // Process and store articles with company matches
    const result = await processArticlesAndStoreMatches(articles);

    const duration = Date.now() - startTime;

    const summary = {
      success: true,
      duration: `${duration}ms`,
      articlesFetched: articles.length,
      articlesStored: result.articlesStored,
      matchesCreated: result.matchesCreated,
      errors: result.errors,
      timestamp: new Date().toISOString(),
    };

    console.log('News fetch cron job completed:', summary);

    return res.status(200).json(summary);
  } catch (error) {
    console.error('Error in news fetch cron job:', error);

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
}
