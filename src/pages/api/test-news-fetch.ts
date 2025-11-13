import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchAllNews } from '../../server/services/newsFetcher';
import { processArticlesAndStoreMatches } from '../../server/services/newsMatching';
import { prisma } from '../../server/prisma';

/**
 * Test endpoint to manually trigger news fetch
 *
 * DEVELOPMENT ONLY - Remove in production or add proper authentication
 *
 * Usage:
 * - Visit: http://localhost:3001/api/test-news-fetch
 * - Or: curl http://localhost:3001/api/test-news-fetch
 *
 * Optional query parameters:
 * - days: Number of days back to fetch (default: 1)
 *   Example: /api/test-news-fetch?days=7
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      error: 'This endpoint is only available in development mode',
      hint: 'Use /api/cron/fetch-news with proper authorization instead'
    });
  }

  try {
    const daysBack = parseInt(req.query.days as string) || 1;

    console.log('\n\n');
    console.log('🧪 TEST NEWS FETCH TRIGGERED VIA API');
    console.log(`   URL: ${req.url}`);
    console.log(`   Days back: ${daysBack}`);
    console.log('\n');

    // Check database connectivity
    console.log('🔌 Checking database connection...');
    try {
      const companyCount = await prisma.company.count();
      console.log(`✅ Database connected! Found ${companyCount} companies in database`);
      if (companyCount === 0) {
        console.log('⚠️  WARNING: No companies in database - all articles will show "No company match"\n');
      } else {
        const companies = await prisma.company.findMany({ take: 5, select: { name: true } });
        console.log(`📋 Sample companies: ${companies.map(c => c.name).join(', ')}\n`);
      }
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw new Error('Database connection failed');
    }

    const startTime = Date.now();

    // Step 1: Fetch news
    console.log('📥 Step 1: Fetching news...');
    const articles = await fetchAllNews(daysBack);
    console.log(`✅ Step 1 complete: Fetched ${articles.length} articles\n`);

    // Step 2: Process and store
    console.log('💾 Step 2: Processing and storing articles...');
    let result;
    try {
      result = await processArticlesAndStoreMatches(articles);
      console.log(`✅ Step 2 complete: Stored ${result.articlesStored} articles\n`);
    } catch (error) {
      console.error('❌ Step 2 FAILED:', error);
      throw error;
    }

    const duration = Date.now() - startTime;

    const response = {
      success: true,
      totalDuration: `${(duration / 1000).toFixed(2)}s`,
      daysBack,
      articlesFetched: articles.length,
      articlesStored: result.articlesStored,
      matchesCreated: result.matchesCreated,
      errors: result.errors,
      timestamp: new Date().toISOString(),

      // Sample articles
      sampleArticles: articles.slice(0, 3).map(a => ({
        title: a.title,
        source: a.sourceName,
        sourceType: a.sourceType,
        publishedAt: a.publishedAt,
        url: a.url,
      })),

      nextSteps: [
        'Check the server console for detailed logs',
        'Visit /news to see the articles in the UI',
        'Check /dashboard for the Recent News widget',
      ],
    };

    console.log('\n✅ TEST COMPLETED SUCCESSFULLY');
    console.log('📊 Results:', JSON.stringify(response, null, 2));
    console.log('\n\n');

    // Return HTML response for browser
    if (req.headers.accept?.includes('text/html')) {
      return res.status(200).send(`
<!DOCTYPE html>
<html>
<head>
  <title>News Fetch Test Results</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 800px;
      margin: 50px auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      background: white;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    h1 { color: #2563eb; margin-top: 0; }
    .success { color: #16a34a; font-size: 24px; margin: 20px 0; }
    .stats {
      background: #f0f9ff;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #2563eb;
      margin: 20px 0;
    }
    .stat-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e0e0e0;
    }
    .stat-item:last-child { border-bottom: none; }
    .stat-label { font-weight: 500; }
    .stat-value { color: #2563eb; font-weight: 600; }
    .articles {
      margin: 20px 0;
    }
    .article {
      background: #fafafa;
      padding: 15px;
      margin: 10px 0;
      border-radius: 6px;
      border-left: 3px solid #94a3b8;
    }
    .article-title { font-weight: 600; margin-bottom: 8px; }
    .article-meta { font-size: 14px; color: #64748b; }
    .next-steps {
      background: #fef3c7;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .next-steps ul { margin: 10px 0; padding-left: 20px; }
    .next-steps li { margin: 8px 0; }
    a { color: #2563eb; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .btn {
      display: inline-block;
      background: #2563eb;
      color: white;
      padding: 10px 20px;
      border-radius: 6px;
      margin: 10px 10px 10px 0;
      text-decoration: none;
    }
    .btn:hover { background: #1d4ed8; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🧪 News Fetch Test Results</h1>

    <div class="success">✅ Test completed successfully!</div>

    <div class="stats">
      <h3>📊 Statistics</h3>
      <div class="stat-item">
        <span class="stat-label">Articles Fetched</span>
        <span class="stat-value">${response.articlesFetched}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Articles Stored</span>
        <span class="stat-value">${response.articlesStored}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Company Matches Created</span>
        <span class="stat-value">${response.matchesCreated}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Errors</span>
        <span class="stat-value">${response.errors}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Total Duration</span>
        <span class="stat-value">${response.totalDuration}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Days Back</span>
        <span class="stat-value">${response.daysBack}</span>
      </div>
    </div>

    ${response.sampleArticles.length > 0 ? `
      <div class="articles">
        <h3>📰 Sample Articles (First 3)</h3>
        ${response.sampleArticles.map(article => `
          <div class="article">
            <div class="article-title">${article.title}</div>
            <div class="article-meta">
              ${article.source} • ${article.sourceType} • ${new Date(article.publishedAt).toLocaleDateString()}
            </div>
          </div>
        `).join('')}
      </div>
    ` : ''}

    <div class="next-steps">
      <h3>👉 Next Steps</h3>
      <ul>
        ${response.nextSteps.map(step => `<li>${step}</li>`).join('')}
      </ul>
    </div>

    <div>
      <a href="/news" class="btn">View News Page</a>
      <a href="/dashboard" class="btn">View Dashboard</a>
      <a href="/api/test-news-fetch" class="btn">Run Again</a>
    </div>

    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #64748b; font-size: 14px;">
      <p><strong>💡 Tip:</strong> Check your server console for detailed logs showing exactly what happened during the fetch and matching process.</p>
      <p><strong>🔧 Development Only:</strong> This endpoint is disabled in production. Use <code>/api/cron/fetch-news</code> with proper authentication instead.</p>
    </div>
  </div>
</body>
</html>
      `);
    }

    // JSON response for API calls
    return res.status(200).json(response);
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error);
    console.error('\n\n');

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined,
      timestamp: new Date().toISOString(),
    });
  }
}
