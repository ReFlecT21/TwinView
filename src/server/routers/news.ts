import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { prisma } from '../prisma';
import { NewsSourceType } from '@prisma/client';

export const newsRouter = router({
  /**
   * Get all news articles with pagination and filters
   */
  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        sourceType: z.nativeEnum(NewsSourceType).optional(),
        companyId: z.string().optional(),
        isRead: z.boolean().optional(),
        search: z.string().optional(),
        sortBy: z.enum(['publishedAt', 'relevance', 'createdAt']).default('publishedAt'),
        sortOrder: z.enum(['asc', 'desc']).default('desc'),
      })
    )
    .query(async ({ input }) => {
      const { limit, offset, sourceType, companyId, isRead, search, sortBy, sortOrder } = input;

      // Build where clause
      const where: any = {};

      if (sourceType) {
        where.sourceType = sourceType;
      }

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
          { sourceName: { contains: search, mode: 'insensitive' } },
        ];
      }

      // If filtering by company, use nested query
      if (companyId) {
        where.companyMatches = {
          some: {
            companyId,
            ...(isRead !== undefined && { isRead }),
          },
        };
      } else if (isRead !== undefined) {
        // If filtering by read status but not company, filter matches
        where.companyMatches = {
          some: {
            isRead,
          },
        };
      }

      // Get total count
      const total = await prisma.newsArticle.count({ where });

      // Determine sort field
      let orderBy: any = {};
      if (sortBy === 'publishedAt') {
        orderBy = { publishedAt: sortOrder };
      } else if (sortBy === 'createdAt' || sortBy === 'relevance') {
        orderBy = { fetchedAt: sortOrder };
      }

      // Get articles
      const articles = await prisma.newsArticle.findMany({
        where,
        orderBy,
        take: limit,
        skip: offset,
        include: {
          companyMatches: {
            include: {
              company: {
                select: {
                  id: true,
                  name: true,
                  industry: true,
                },
              },
            },
            orderBy: {
              relevanceScore: 'desc',
            },
          },
        },
      });

      return {
        articles,
        total,
        hasMore: offset + limit < total,
      };
    }),

  /**
   * Get news for a specific company
   */
  getByCompany: publicProcedure
    .input(
      z.object({
        companyId: z.string(),
        limit: z.number().min(1).max(100).default(10),
        isRead: z.boolean().optional(),
      })
    )
    .query(async ({ input }) => {
      const { companyId, limit, isRead } = input;

      const matches = await prisma.newsCompanyMatch.findMany({
        where: {
          companyId,
          ...(isRead !== undefined && { isRead }),
        },
        include: {
          newsArticle: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
      });

      return matches.map((match) => ({
        ...match.newsArticle,
        relevanceScore: match.relevanceScore,
        matchReason: match.matchReason,
        isRead: match.isRead,
        matchId: match.id,
      }));
    }),

  /**
   * Get unread news count (total and per company)
   */
  getUnreadCount: publicProcedure
    .input(
      z.object({
        companyId: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const { companyId } = input;

      if (companyId) {
        // Get count for specific company
        const count = await prisma.newsCompanyMatch.count({
          where: {
            companyId,
            isRead: false,
          },
        });

        return { count };
      } else {
        // Get total unread count across all companies
        const count = await prisma.newsCompanyMatch.count({
          where: {
            isRead: false,
          },
        });

        return { count };
      }
    }),

  /**
   * Get recent news matches for dashboard widget
   */
  getRecentMatches: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(20).default(5),
      })
    )
    .query(async ({ input }) => {
      const matches = await prisma.newsCompanyMatch.findMany({
        take: input.limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          newsArticle: true,
          company: {
            select: {
              id: true,
              name: true,
              industry: true,
            },
          },
        },
      });

      return matches;
    }),

  /**
   * Get a single news article by ID
   */
  getById: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    const article = await prisma.newsArticle.findUnique({
      where: { id: input.id },
      include: {
        companyMatches: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                industry: true,
              },
            },
          },
          orderBy: {
            relevanceScore: 'desc',
          },
        },
      },
    });

    return article;
  }),

  /**
   * Mark a news article as read for a specific company
   */
  markAsRead: publicProcedure
    .input(
      z.object({
        matchId: z.string().optional(),
        newsArticleId: z.string().optional(),
        companyId: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { matchId, newsArticleId, companyId } = input;

      if (matchId) {
        // Mark specific match as read
        await prisma.newsCompanyMatch.update({
          where: { id: matchId },
          data: { isRead: true },
        });
      } else if (newsArticleId && companyId) {
        // Find and mark match as read
        const match = await prisma.newsCompanyMatch.findFirst({
          where: {
            newsArticleId,
            companyId,
          },
        });

        if (match) {
          await prisma.newsCompanyMatch.update({
            where: { id: match.id },
            data: { isRead: true },
          });
        }
      } else if (newsArticleId) {
        // Mark all matches for this article as read
        await prisma.newsCompanyMatch.updateMany({
          where: {
            newsArticleId,
          },
          data: { isRead: true },
        });
      }

      return { success: true };
    }),

  /**
   * Mark all news as read
   */
  markAllAsRead: publicProcedure
    .input(
      z.object({
        companyId: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { companyId } = input;

      await prisma.newsCompanyMatch.updateMany({
        where: {
          isRead: false,
          ...(companyId && { companyId }),
        },
        data: { isRead: true },
      });

      return { success: true };
    }),

  /**
   * Get user notification preferences
   */
  getNotificationPreferences: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      let preferences = await prisma.userNotificationPreferences.findUnique({
        where: { id: input.userId },
      });

      // Create default preferences if not exists
      if (!preferences) {
        preferences = await prisma.userNotificationPreferences.create({
          data: {
            id: input.userId,
            digestFrequency: 'DAILY',
            emailEnabled: true,
          },
        });
      }

      return preferences;
    }),

  /**
   * Update user notification preferences
   */
  updateNotificationPreferences: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        digestFrequency: z.enum(['DAILY', 'WEEKLY', 'DISABLED']).optional(),
        emailEnabled: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { userId, ...updateData } = input;

      const preferences = await prisma.userNotificationPreferences.upsert({
        where: { id: userId },
        update: updateData,
        create: {
          id: userId,
          digestFrequency: updateData.digestFrequency || 'DAILY',
          emailEnabled: updateData.emailEnabled ?? true,
        },
      });

      return preferences;
    }),

  /**
   * Get statistics about news
   */
  getStats: publicProcedure.query(async () => {
    const [totalArticles, totalMatches, unreadCount, recentCount] = await Promise.all([
      prisma.newsArticle.count(),
      prisma.newsCompanyMatch.count(),
      prisma.newsCompanyMatch.count({ where: { isRead: false } }),
      prisma.newsArticle.count({
        where: {
          publishedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      }),
    ]);

    // Get breakdown by source type
    const bySourceType = await prisma.newsArticle.groupBy({
      by: ['sourceType'],
      _count: true,
    });

    return {
      totalArticles,
      totalMatches,
      unreadCount,
      recentCount,
      bySourceType: bySourceType.reduce(
        (acc, item) => {
          acc[item.sourceType] = item._count;
          return acc;
        },
        {} as Record<string, number>
      ),
    };
  }),
});
