import { prisma } from '../prisma';
import type { NewsArticleData } from './newsFetcher';

export interface CompanyMatch {
  companyId: string;
  companyName: string;
  relevanceScore: number;
  matchReason: string;
  mentionCount: number;
}

/**
 * Match a news article with companies in the database
 * Returns list of companies mentioned in the article
 */
export async function matchArticleWithCompanies(
  article: NewsArticleData
): Promise<CompanyMatch[]> {
  // Get all companies from database
  const companies = await prisma.company.findMany({
    select: {
      id: true,
      name: true,
      website: true,
      ceo: true,
    },
  });

  const matches: CompanyMatch[] = [];

  // Combine title and content for searching
  const searchText = `${article.title} ${article.content}`.toLowerCase();

  for (const company of companies) {
    const match = findCompanyMention(searchText, company);

    if (match) {
      matches.push({
        companyId: company.id,
        companyName: company.name,
        relevanceScore: calculateRelevanceScore(match.mentionCount, searchText),
        matchReason: generateMatchReason(match),
        mentionCount: match.mentionCount,
      });
    }
  }

  // Sort by relevance score (highest first)
  matches.sort((a, b) => b.relevanceScore - a.relevanceScore);

  return matches;
}

/**
 * Find mentions of a company in text
 */
function findCompanyMention(
  text: string,
  company: { name: string; website?: string | null; ceo?: string | null }
): { mentionCount: number; mentionedNames: string[] } | null {
  let mentionCount = 0;
  const mentionedNames: string[] = [];

  // Prepare company name variations
  const nameVariations = generateNameVariations(company.name);

  // Check for exact and variation matches
  for (const variation of nameVariations) {
    const regex = new RegExp(`\\b${escapeRegExp(variation)}\\b`, 'gi');
    const matches = text.match(regex);

    if (matches) {
      mentionCount += matches.length;
      mentionedNames.push(variation);
    }
  }

  // Check for CEO mention (adds half a mention)
  if (company.ceo) {
    const ceoNames = company.ceo.split(' ');
    const ceoLastName = ceoNames[ceoNames.length - 1];

    if (ceoLastName && text.includes(ceoLastName.toLowerCase())) {
      mentionCount += 0.5;
      mentionedNames.push(`CEO ${company.ceo}`);
    }
  }

  // Check for website domain mention
  if (company.website) {
    const domain = extractDomain(company.website);
    if (domain && text.includes(domain)) {
      mentionCount += 0.5;
      mentionedNames.push(domain);
    }
  }

  if (mentionCount > 0) {
    return { mentionCount, mentionedNames };
  }

  return null;
}

/**
 * Generate name variations for a company
 * Examples:
 * - "Apple Inc." -> ["Apple Inc.", "Apple", "Apple Computer"]
 * - "International Business Machines" -> ["International Business Machines", "IBM"]
 */
function generateNameVariations(companyName: string): string[] {
  const variations = new Set<string>();

  // Add original name
  variations.add(companyName.toLowerCase());

  // Remove common suffixes
  const suffixes = [
    'inc',
    'inc.',
    'incorporated',
    'corp',
    'corp.',
    'corporation',
    'ltd',
    'ltd.',
    'limited',
    'llc',
    'l.l.c.',
    'plc',
    'co',
    'co.',
    'company',
    'group',
    'technologies',
    'technology',
  ];

  let baseName = companyName.toLowerCase();

  suffixes.forEach((suffix) => {
    const pattern = new RegExp(`\\s+${suffix}\\s*$`, 'i');
    if (pattern.test(baseName)) {
      baseName = baseName.replace(pattern, '').trim();
      variations.add(baseName);
    }
  });

  // Add acronym if company name has multiple words
  const words = companyName.split(/\s+/).filter((w) => w.length > 0);
  if (words.length >= 2) {
    const acronym = words
      .map((word) => word[0])
      .join('')
      .toLowerCase();

    // Only add acronym if it's 2+ characters and looks like a real acronym
    if (acronym.length >= 2 && acronym.length <= 6) {
      variations.add(acronym);
    }
  }

  return Array.from(variations);
}

/**
 * Calculate relevance score (0-1)
 * Based on mention count and position in text
 */
function calculateRelevanceScore(mentionCount: number, searchText: string): number {
  // Base score from mention count
  let score = Math.min(mentionCount / 5, 1.0); // Max out at 5 mentions

  // Normalize to 0-1 range
  return parseFloat(score.toFixed(3));
}

/**
 * Generate human-readable match reason
 */
function generateMatchReason(match: { mentionCount: number; mentionedNames: string[] }): string {
  const count = Math.floor(match.mentionCount);
  const names = match.mentionedNames.slice(0, 3).join(', '); // Show up to 3 variations

  if (count === 1) {
    return `Company mentioned once (${names})`;
  } else if (count > 1) {
    return `Company mentioned ${count} times (${names})`;
  } else {
    return `Related mention (${names})`;
  }
}

/**
 * Extract domain from URL
 */
function extractDomain(url: string): string | null {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    return urlObj.hostname.replace('www.', '').toLowerCase();
  } catch {
    return null;
  }
}

/**
 * Escape special regex characters
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Batch process multiple articles and store matches in database
 */
export async function processArticlesAndStoreMatches(
  articles: NewsArticleData[]
): Promise<{
  articlesStored: number;
  matchesCreated: number;
  errors: number;
}> {
  console.log('\n' + '='.repeat(60));
  console.log(`🔗 STARTING COMPANY MATCHING - ${articles.length} articles`);
  console.log('='.repeat(60) + '\n');

  let articlesStored = 0;
  let matchesCreated = 0;
  let errors = 0;
  let skippedDuplicates = 0;
  let skippedNoMatches = 0;

  const startTime = Date.now();

  for (const articleData of articles) {
    try {
      // Check if article already exists
      const existing = await prisma.newsArticle.findUnique({
        where: { url: articleData.url },
      });

      if (existing) {
        console.log(`⏭️  Skipping duplicate: "${articleData.title.substring(0, 60)}..."`);
        skippedDuplicates++;
        continue;
      }

      // Find company matches
      console.log(`\n🔍 Matching: "${articleData.title.substring(0, 60)}..."`);
      const companyMatches = await matchArticleWithCompanies(articleData);

      if (companyMatches.length === 0) {
        console.log(`   ℹ️  No company matches found - storing article anyway`);
      } else {
        console.log(`   ✅ Found ${companyMatches.length} company match(es):`);
        companyMatches.forEach(match => {
          console.log(`      • ${match.companyName} (score: ${match.relevanceScore.toFixed(2)}) - ${match.matchReason}`);
        });
      }

      // Create article (store ALL articles, not just matched ones)
      const article = await prisma.newsArticle.create({
        data: {
          title: articleData.title,
          content: articleData.content,
          summary: articleData.summary,
          url: articleData.url,
          sourceType: articleData.sourceType,
          sourceName: articleData.sourceName,
          author: articleData.author,
          imageUrl: articleData.imageUrl,
          publishedAt: articleData.publishedAt,
          keywords: articleData.keywords,
        },
      });

      articlesStored++;

      // Create matches (if any)
      if (companyMatches.length > 0) {
        for (const match of companyMatches) {
          await prisma.newsCompanyMatch.create({
            data: {
              newsArticleId: article.id,
              companyId: match.companyId,
              relevanceScore: match.relevanceScore,
              matchReason: match.matchReason,
              isRead: false,
            },
          });

          matchesCreated++;
        }
      }

      console.log(`   💾 Stored in database`);
    } catch (error) {
      console.error(`❌ Error processing "${articleData.title}":`, error);
      errors++;
    }
  }

  const duration = Date.now() - startTime;

  const articlesWithMatches = articlesStored - (articles.length - matchesCreated - skippedDuplicates);
  const articlesWithoutMatches = articlesStored - (matchesCreated > 0 ? Math.ceil(matchesCreated / 2) : 0);

  console.log('\n' + '='.repeat(60));
  console.log('📊 MATCHING SUMMARY:');
  console.log(`   Total articles processed:     ${articles.length}`);
  console.log(`   Articles stored:              ${articlesStored}`);
  console.log(`   - With company matches:       ${matchesCreated > 0 ? '~' + Math.min(articlesStored, matchesCreated) : 0}`);
  console.log(`   - Without company matches:    ${articlesStored - Math.min(articlesStored, matchesCreated)}`);
  console.log(`   Company matches created:      ${matchesCreated}`);
  console.log(`   Skipped (duplicates):         ${skippedDuplicates}`);
  console.log(`   Errors:                       ${errors}`);
  console.log(`   Time taken:                   ${(duration / 1000).toFixed(2)}s`);
  console.log('='.repeat(60) + '\n');

  return { articlesStored, matchesCreated, errors };
}
