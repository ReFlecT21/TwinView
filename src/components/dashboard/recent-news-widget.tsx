import { useRouter } from 'next/router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { trpc } from '@/lib/trpc';
import { Newspaper, ExternalLink, Building2, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { NewsSourceType } from '@prisma/client';

const sourceTypeColors: Record<NewsSourceType, string> = {
  NEWS_ARTICLE: 'bg-blue-100 text-blue-800',
  PRESS_RELEASE: 'bg-purple-100 text-purple-800',
  BLOG: 'bg-green-100 text-green-800',
  RESEARCH_PAPER: 'bg-orange-100 text-orange-800',
  SOCIAL_MEDIA: 'bg-pink-100 text-pink-800',
  OTHER: 'bg-gray-100 text-gray-800',
};

const sourceTypeLabels: Record<NewsSourceType, string> = {
  NEWS_ARTICLE: 'News',
  PRESS_RELEASE: 'Press',
  BLOG: 'Blog',
  RESEARCH_PAPER: 'Research',
  SOCIAL_MEDIA: 'Social',
  OTHER: 'Other',
};

export default function RecentNewsWidget() {
  const router = useRouter();

  const { data: matches = [], isLoading } = trpc.news.getRecentMatches.useQuery({
    limit: 5,
  });

  const handleViewAll = () => {
    router.push('/news');
  };

  const handleArticleClick = (articleId: string) => {
    router.push(`/news`);
  };

  const handleCompanyClick = (e: React.MouseEvent, companyId: string) => {
    e.stopPropagation();
    router.push(`/company/${companyId}`);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Newspaper className="h-5 w-5 text-blue-600" />
              Recent News Matches
            </CardTitle>
            <CardDescription>Latest digital twin news related to your companies</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={handleViewAll}>
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {matches.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Newspaper className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p>No recent news matches</p>
            <p className="text-sm mt-1">News will appear here once the daily fetch runs</p>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((match) => (
              <div
                key={match.id}
                className="border-l-2 border-blue-500 pl-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleArticleClick(match.newsArticle.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1">
                      {match.newsArticle.title}
                    </h4>
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <Badge
                        variant="outline"
                        className="cursor-pointer hover:bg-gray-100 text-xs"
                        onClick={(e) => handleCompanyClick(e, match.company.id)}
                      >
                        <Building2 className="h-3 w-3 mr-1" />
                        {match.company.name}
                      </Badge>
                      <Badge
                        className={`${sourceTypeColors[match.newsArticle.sourceType]} text-xs`}
                      >
                        {sourceTypeLabels[match.newsArticle.sourceType]}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{match.newsArticle.sourceName}</span>
                      <span>•</span>
                      <span>
                        {formatDistanceToNow(new Date(match.newsArticle.publishedAt), {
                          addSuffix: true,
                        })}
                      </span>
                      {!match.isRead && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-blue-600 font-medium">
                            <span className="w-2 h-2 bg-blue-500 rounded-full" />
                            New
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <a
                    href={match.newsArticle.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-blue-600 hover:text-blue-800 flex-shrink-0"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
