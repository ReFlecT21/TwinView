import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/trpc';
import {
  Newspaper,
  Search,
  ExternalLink,
  Building2,
  Calendar,
  CheckCheck,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { NewsSourceType } from '@prisma/client';

const sourceTypeLabels: Record<NewsSourceType, string> = {
  NEWS_ARTICLE: 'News',
  PRESS_RELEASE: 'Press Release',
  BLOG: 'Blog',
  RESEARCH_PAPER: 'Research',
  SOCIAL_MEDIA: 'Social',
  OTHER: 'Other',
};

const sourceTypeColors: Record<NewsSourceType, string> = {
  NEWS_ARTICLE: 'bg-blue-100 text-blue-800',
  PRESS_RELEASE: 'bg-purple-100 text-purple-800',
  BLOG: 'bg-green-100 text-green-800',
  RESEARCH_PAPER: 'bg-orange-100 text-orange-800',
  SOCIAL_MEDIA: 'bg-pink-100 text-pink-800',
  OTHER: 'bg-gray-100 text-gray-800',
};

export default function NewsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceTypeFilter, setSourceTypeFilter] = useState<NewsSourceType | 'ALL'>('ALL');
  const [readFilter, setReadFilter] = useState<'ALL' | 'READ' | 'UNREAD'>('ALL');
  const [sortBy, setSortBy] = useState<'publishedAt' | 'relevance' | 'createdAt'>('publishedAt');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const utils = trpc.useUtils();

  // Calculate offset based on current page
  const offset = (currentPage - 1) * itemsPerPage;

  const { data, isLoading } = trpc.news.getAll.useQuery({
    limit: itemsPerPage,
    offset,
    sourceType: sourceTypeFilter !== 'ALL' ? sourceTypeFilter : undefined,
    isRead: readFilter === 'READ' ? true : readFilter === 'UNREAD' ? false : undefined,
    search: searchQuery || undefined,
    sortBy,
    sortOrder: 'desc',
  });

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sourceTypeFilter, readFilter, sortBy]);

  // Calculate total pages
  const totalPages = data ? Math.ceil(data.total / itemsPerPage) : 0;
  const hasNextPage = data?.hasMore ?? false;
  const hasPrevPage = currentPage > 1;

  const { data: stats } = trpc.news.getStats.useQuery();
  const { data: unreadData } = trpc.news.getUnreadCount.useQuery({});

  const markAsReadMutation = trpc.news.markAsRead.useMutation({
    onSuccess: () => {
      utils.news.getAll.invalidate();
      utils.news.getUnreadCount.invalidate();
      utils.news.getStats.invalidate();
    },
  });

  const markAllAsReadMutation = trpc.news.markAllAsRead.useMutation({
    onSuccess: () => {
      utils.news.getAll.invalidate();
      utils.news.getUnreadCount.invalidate();
      utils.news.getStats.invalidate();
    },
  });

  const handleArticleClick = (articleId: string) => {
    router.push(`/news/${articleId}`);
  };

  const handleCompanyClick = (e: React.MouseEvent, companyId: string) => {
    e.stopPropagation();
    router.push(`/company/${companyId}`);
  };

  const handleMarkAsRead = (e: React.MouseEvent, newsArticleId: string) => {
    e.stopPropagation();
    markAsReadMutation.mutate({ newsArticleId });
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate({});
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Fixed Header Section */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4">
        {/* Title and Actions */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Newspaper className="h-6 w-6 text-blue-600" />
              Digital Twin News
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Latest news and updates related to your tracked companies
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.reload()}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            {(unreadData?.count ?? 0) > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-2"
              >
                <CheckCheck className="h-4 w-4" />
                Mark All Read
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards - Compact Version */}
        {stats && (
          <div className="flex gap-4 mb-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-md">
              <span className="text-sm text-gray-600">Total:</span>
              <span className="text-sm font-bold">{stats.totalArticles}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-green-100 rounded-md">
              <span className="text-sm text-green-700">Matches:</span>
              <span className="text-sm font-bold text-green-700">{stats.totalMatches > 0 ? stats.totalMatches : 0}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-md">
              <span className="text-sm text-blue-700">Unread:</span>
              <span className="text-sm font-bold text-blue-700">{stats.unreadCount}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 rounded-md">
              <span className="text-sm text-purple-700">Recent (7d):</span>
              <span className="text-sm font-bold text-purple-700">{stats.recentCount}</span>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-3 items-center">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search news articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9"
              />
            </div>
          </div>

          <Select
            value={sourceTypeFilter}
            onValueChange={(value) => setSourceTypeFilter(value as NewsSourceType | 'ALL')}
          >
            <SelectTrigger className="w-[150px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Sources</SelectItem>
              {Object.entries(sourceTypeLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={readFilter} onValueChange={(value: any) => setReadFilter(value)}>
            <SelectTrigger className="w-[120px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              <SelectItem value="UNREAD">Unread</SelectItem>
              <SelectItem value="READ">Read</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-[150px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="publishedAt">Published Date</SelectItem>
              <SelectItem value="createdAt">Date Added</SelectItem>
              <SelectItem value="relevance">Relevance</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Scrollable Table Content */}
      <div className="flex-1 overflow-hidden px-6 py-4">
        <div className="h-full bg-white rounded-lg border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="p-8">
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12" />
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
            </div>
          ) : data && data.articles.length > 0 ? (
            <div className="h-full overflow-auto">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr className="border-b border-gray-200">
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                      Source
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                      Type
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                      Published
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                      Companies
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.articles.map((article) => {
                    const hasUnread = article.companyMatches.some((m) => !m.isRead);
                    const hasMatches = article.companyMatches.length > 0;

                    return (
                      <tr
                        key={article.id}
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handleArticleClick(article.id)}
                      >
                        {/* Status Indicator */}
                        <td className="px-4 py-3">
                          <div
                            className={`w-2 h-8 rounded-full ${
                              hasUnread
                                ? 'bg-blue-500'
                                : hasMatches
                                ? 'bg-green-500'
                                : 'bg-gray-200'
                            }`}
                          />
                        </td>

                        {/* Title and Summary */}
                        <td className="px-4 py-3">
                          <div className="max-w-2xl">
                            <p className="text-sm font-medium text-gray-900 line-clamp-1">
                              {article.title}
                            </p>
                            {article.summary && (
                              <p className="text-xs text-gray-500 line-clamp-1 mt-1">
                                {article.summary}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Source */}
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-900 truncate">{article.sourceName}</p>
                        </td>

                        {/* Type */}
                        <td className="px-4 py-3">
                          <Badge className={`${sourceTypeColors[article.sourceType]} text-xs`}>
                            {sourceTypeLabels[article.sourceType]}
                          </Badge>
                        </td>

                        {/* Published Date */}
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-500">
                            {formatDistanceToNow(new Date(article.publishedAt), {
                              addSuffix: true,
                            })}
                          </p>
                        </td>

                        {/* Company Matches */}
                        <td className="px-4 py-3">
                          {article.companyMatches.length > 0 ? (
                            <div className="flex items-center gap-1">
                              <Building2 className="h-3 w-3 text-gray-400 flex-shrink-0" />
                              <span className="text-sm text-gray-900">
                                {article.companyMatches.length} match
                                {article.companyMatches.length > 1 ? 'es' : ''}
                              </span>
                              {hasUnread && (
                                <span className="w-2 h-2 bg-blue-500 rounded-full" />
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {hasUnread && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => handleMarkAsRead(e, article.id)}
                                className="h-7 w-7 p-0"
                              >
                                <CheckCheck className="h-3 w-3" />
                              </Button>
                            )}
                            <a
                              href={article.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center justify-center h-7 w-7 rounded hover:bg-gray-100"
                            >
                              <ExternalLink className="h-3 w-3 text-gray-600" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Newspaper className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No news articles found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your filters or check back later for new updates.
                </p>
                <Button variant="outline" onClick={() => router.reload()}>
                  Refresh
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Pagination Footer */}
      {data && data.articles.length > 0 && totalPages > 1 && (
        <div className="flex-shrink-0 bg-white border-t border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{offset + 1}</span> to{' '}
              <span className="font-medium">{Math.min(offset + itemsPerPage, data.total)}</span> of{' '}
              <span className="font-medium">{data.total}</span> results
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={!hasPrevPage}
                className="h-8 w-8 p-0"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={!hasPrevPage}
                className="h-8 px-3"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>

              {/* Page numbers */}
              <div className="flex items-center gap-1 mx-2">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  if (pageNum < 1 || pageNum > totalPages) return null;

                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === currentPage ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="h-8 w-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={!hasNextPage}
                className="h-8 px-3"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={!hasNextPage}
                className="h-8 w-8 p-0"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="text-sm text-gray-700">
              Page <span className="font-medium">{currentPage}</span> of{' '}
              <span className="font-medium">{totalPages}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}