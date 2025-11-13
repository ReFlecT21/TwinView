import Parser from 'rss-parser';
import { NewsSourceType } from '@prisma/client';

export interface NewsArticleData {
  title: string;
  content: string;
  summary?: string;
  url: string;
  sourceType: NewsSourceType;
  sourceName: string;
  author?: string;
  imageUrl?: string;
  publishedAt: Date;
  keywords: string[];
}

const rssParser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail'],
    ],
  },
});

// Digital Twin related keywords for searching
const DIGITAL_TWIN_KEYWORDS = [
  'digital twin',
  'digital twins',
  'virtual twin',
  'digital transformation',
  'Industry 4.0',
  'IoT simulation',
  'predictive maintenance',
  'smart manufacturing',
];

/**
 * Fetch news from NewsAPI.org
 * Requires NEWSAPI_KEY environment variable
 */
export async function fetchFromNewsAPI(
  query: string = 'digital twin',
  daysBack: number = 1
): Promise<NewsArticleData[]> {
  const apiKey = process.env.NEWSAPI_KEY;

  if (!apiKey) {
    console.log('⚠️  [NewsAPI] API key not set, skipping NewsAPI fetch');
    console.log('   💡 Get a free key at https://newsapi.org/register');
    return [];
  }

  try {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - daysBack);
    const fromDateStr = fromDate.toISOString().split('T')[0];

    console.log(`🔍 [NewsAPI] Fetching news with query: "${query}" from ${fromDateStr}`);

    const url = new URL('https://newsapi.org/v2/everything');
    url.searchParams.set('q', query);
    url.searchParams.set('from', fromDateStr);
    url.searchParams.set('sortBy', 'publishedAt');
    url.searchParams.set('language', 'en');
    url.searchParams.set('pageSize', '100');
    url.searchParams.set('apiKey', apiKey);

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`NewsAPI error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.status !== 'ok') {
      throw new Error(`NewsAPI returned error: ${data.message || 'Unknown error'}`);
    }

    console.log(`✅ [NewsAPI] Fetched ${data.articles.length} articles for query "${query}"`);

    return data.articles.map((article: any) => ({
      title: article.title || 'Untitled',
      content: article.content || article.description || '',
      summary: article.description,
      url: article.url,
      sourceType: 'NEWS_ARTICLE' as NewsSourceType,
      sourceName: article.source?.name || 'NewsAPI',
      author: article.author,
      imageUrl: article.urlToImage,
      publishedAt: new Date(article.publishedAt),
      keywords: extractKeywords(article.title + ' ' + article.description),
    }));
  } catch (error) {
    console.error('❌ [NewsAPI] Error:', error);
    return [];
  }
}

/**
 * Fetch news from Google News RSS feed
 */
export async function fetchFromGoogleNews(
  query: string = 'digital twin',
  daysBack: number = 1
): Promise<NewsArticleData[]> {
  try {
    console.log(`🔍 [Google News] Fetching RSS for query: "${query}"`);

    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en&gl=US&ceid=US:en`;

    const feed = await rssParser.parseURL(url);

    // Filter by date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);

    const filtered = feed.items
      .filter((item) => {
        const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();
        return pubDate >= cutoffDate;
      })
      .map((item) => ({
        title: item.title || 'Untitled',
        content: item.contentSnippet || item.content || item.summary || '',
        summary: item.contentSnippet || item.summary,
        url: item.link || item.guid || '',
        sourceType: 'NEWS_ARTICLE' as NewsSourceType,
        sourceName: 'Google News',
        author: item.creator,
        imageUrl: extractImageFromItem(item),
        publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
        keywords: extractKeywords(item.title || ''),
      }));

    console.log(`✅ [Google News] Fetched ${filtered.length} articles (${feed.items.length} total, ${filtered.length} within ${daysBack} day(s))`);

    return filtered;
  } catch (error) {
    console.error('❌ [Google News] Error:', error);
    return [];
  }
}

/**
 * Fetch from custom RSS feeds (industry blogs, PR wires)
 */
export async function fetchFromRSSFeeds(
  feeds: string[],
  sourceType: NewsSourceType = 'BLOG',
  daysBack: number = 1
): Promise<NewsArticleData[]> {
  console.log(`🔍 [RSS Feeds] Fetching from ${feeds.length} ${sourceType} feed(s)`);

  const allArticles: NewsArticleData[] = [];

  for (const feedUrl of feeds) {
    try {
      const feed = await rssParser.parseURL(feedUrl);

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysBack);

      const articles = feed.items
        .filter((item) => {
          const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();
          return pubDate >= cutoffDate;
        })
        .map((item) => ({
          title: item.title || 'Untitled',
          content: item.content || item.contentSnippet || item.summary || '',
          summary: item.contentSnippet || item.summary,
          url: item.link || item.guid || '',
          sourceType,
          sourceName: feed.title || new URL(feedUrl).hostname,
          author: item.creator,
          imageUrl: extractImageFromItem(item),
          publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
          keywords: extractKeywords((item.title || '') + ' ' + (item.contentSnippet || '')),
        }));

      console.log(`  ✅ ${feed.title || new URL(feedUrl).hostname}: ${articles.length} articles`);
      allArticles.push(...articles);
    } catch (error) {
      console.error(`  ❌ Error fetching ${feedUrl}:`, error);
    }
  }

  console.log(`✅ [RSS Feeds] Total: ${allArticles.length} articles from ${sourceType} sources`);

  return allArticles;
}

/**
 * Main function to fetch all news from multiple sources
 */
export async function fetchAllNews(daysBack: number = 1): Promise<NewsArticleData[]> {
  console.log('\n' + '='.repeat(60));
  console.log(`📰 STARTING NEWS FETCH - Last ${daysBack} day(s)`);
  console.log('='.repeat(60) + '\n');

  const startTime = Date.now();

  const [newsApiArticles, googleNewsArticles, blogArticles, prArticles] = await Promise.all([
    // NewsAPI with multiple queries
    Promise.all([
      fetchFromNewsAPI('digital twin OR "digital twins"', daysBack),
      fetchFromNewsAPI('Industry 4.0 OR IoT OR "smart manufacturing"', daysBack),
    ]).then((results) => {
      const total = results.flat();
      console.log(`📊 [NewsAPI Total] ${total.length} articles across all queries\n`);
      return total;
    }),

    // Google News
    fetchFromGoogleNews('digital twin OR "digital transformation"', daysBack).then(articles => {
      console.log('');
      return articles;
    }),

    // Industry blogs and thought leadership (RSS feeds)
    fetchFromRSSFeeds(
      [
        'https://www.iotworldtoday.com/rss',
        'https://www.automationworld.com/rss.xml',
        // Add more industry blog RSS feeds here
      ],
      'BLOG',
      daysBack
    ).then(articles => {
      console.log('');
      return articles;
    }),

    // Press releases (Business Wire, PR Newswire have RSS feeds)
    fetchFromRSSFeeds(
      [
        'https://www.businesswire.com/portal/site/home/news/',
        // Add PR Newswire RSS if available
      ],
      'PRESS_RELEASE',
      daysBack
    ).then(articles => {
      console.log('');
      return articles;
    }),
  ]);

  // Combine all articles
  const allArticles = [
    ...newsApiArticles,
    ...googleNewsArticles,
    ...blogArticles,
    ...prArticles,
  ];

  console.log('📊 SUMMARY:');
  console.log(`   NewsAPI:      ${newsApiArticles.length} articles`);
  console.log(`   Google News:  ${googleNewsArticles.length} articles`);
  console.log(`   Blogs:        ${blogArticles.length} articles`);
  console.log(`   Press:        ${prArticles.length} articles`);
  console.log(`   Total:        ${allArticles.length} articles`);

  // Deduplicate by URL
  const uniqueArticles = deduplicateArticles(allArticles);
  const duplicates = allArticles.length - uniqueArticles.length;

  console.log(`\n🔄 Deduplication: Removed ${duplicates} duplicate(s)`);
  console.log(`✅ Final count: ${uniqueArticles.length} unique articles`);

  const duration = Date.now() - startTime;
  console.log(`⏱️  Time taken: ${(duration / 1000).toFixed(2)}s`);
  console.log('\n' + '='.repeat(60) + '\n');

  return uniqueArticles;
}

/**
 * Extract keywords from text
 */
function extractKeywords(text: string): string[] {
  const keywords = new Set<string>();

  // Check for digital twin related keywords
  DIGITAL_TWIN_KEYWORDS.forEach((keyword) => {
    if (text.toLowerCase().includes(keyword.toLowerCase())) {
      keywords.add(keyword);
    }
  });

  return Array.from(keywords);
}

/**
 * Extract image URL from RSS item
 */
function extractImageFromItem(item: any): string | undefined {
  // Try different image fields
  if (item.enclosure?.url && item.enclosure.type?.startsWith('image/')) {
    return item.enclosure.url;
  }

  if (item.mediaContent?.$ ?.url) {
    return item.mediaContent.$.url;
  }

  if (item.mediaThumbnail?.$ ?.url) {
    return item.mediaThumbnail.$.url;
  }

  // Try to extract from content
  if (item.content) {
    const imgMatch = item.content.match(/<img[^>]+src="([^">]+)"/);
    if (imgMatch) {
      return imgMatch[1];
    }
  }

  return undefined;
}

/**
 * Deduplicate articles by URL
 */
function deduplicateArticles(articles: NewsArticleData[]): NewsArticleData[] {
  const seen = new Set<string>();
  const unique: NewsArticleData[] = [];

  for (const article of articles) {
    const normalizedUrl = article.url.toLowerCase().split('?')[0]; // Remove query params
    if (!seen.has(normalizedUrl)) {
      seen.add(normalizedUrl);
      unique.push(article);
    }
  }

  return unique;
}
