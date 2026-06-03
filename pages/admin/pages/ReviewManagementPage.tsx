import React, { useEffect, useMemo, useState } from 'react';
import reviewsApi, { Review } from '../../../src/api/reviews';
import { coursesApi } from '../../../src/api/courses';
import { getErrorMessage } from '../../../src/api/errorHandler';
import { useToast } from '../../../src/hooks/useToast';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { Chart } from '../../../components/ui/chart';
import { ChevronLeft, ChevronRight, EyeOff, Flag, RefreshCcw, Search, Trash2, Loader2 } from 'lucide-react';
import { ReportActions } from '../../../components/ui/ReportActions';
import { useLocalStorage } from '../../../hooks/useLocalStorage';

interface ReviewManagementPageProps {
  title?: string;
  subtitle?: string;
}

const getCourseLabel = (review: Review) => {
  if (typeof review.course === 'object' && review.course !== null) {
    return review.course.title;
  }
  return `Course #${review.course}`;
};

const getReviewText = (review: Review) => review.comment || review.content || review.title || 'No written review.';

const ReviewManagementPage: React.FC<ReviewManagementPageProps> = ({
  title = 'Course Reviews',
  subtitle = 'Review course feedback from learners.',
}) => {
  const toast = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useLocalStorage<number | null>('review_mgmt_course', null);
  const [courses, setCourses] = useState<{ id: number; title: string }[]>([]);
  const [courseLoading, setCourseLoading] = useState(true);
  const [userFilter, setUserFilter] = useLocalStorage('review_mgmt_user', '');
  const [ratingFilter, setRatingFilter] = useLocalStorage('review_mgmt_rating', '');
  const [statusFilter, setStatusFilter] = useLocalStorage('review_mgmt_status', '');
  const [ordering, setOrdering] = useLocalStorage('review_mgmt_ordering', '-created_at');
  const [currentPage, setCurrentPage] = useLocalStorage('review_mgmt_page', 1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    loadReviews();
  }, [currentPage, selectedCourseId, userFilter, ratingFilter, ordering, statusFilter]);

  const fetchCourses = async () => {
    setCourseLoading(true);
    try {
      const response = await coursesApi.getCourses(1, 200);
      setCourses(response.items.map((c) => ({ id: c.id, title: c.title })));
    } catch {
      toast.error('Failed to load course list.');
      setCourses([]);
    } finally {
      setCourseLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewsApi.adminGetAllReviews({
        page: currentPage,
        course: selectedCourseId ?? undefined,
        user: userFilter ? Number(userFilter) : undefined,
        rating: ratingFilter ? Number(ratingFilter) : undefined,
        ordering,
      });
      const filtered = statusFilter
        ? response.results.filter((review) => (review.status || 'published') === statusFilter)
        : response.results;
      setReviews(filtered);
      setTotalItems(response.count);
    } catch (error) {
      toast.error(getErrorMessage(error) || 'Failed to load reviews.');
      setReviews([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  const courseStats = useMemo(() => {
    const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalRating = 0;
    reviews.forEach((r) => {
      const rt = Math.round(Number(r.rating));
      if (rt >= 1 && rt <= 5) dist[rt as keyof typeof dist]++;
      totalRating += Number(r.rating);
    });
    return {
      distribution: dist,
      average: reviews.length ? totalRating / reviews.length : 0,
      total: reviews.length,
      withComments: reviews.filter((r) => Boolean(r.comment || r.content || r.title)).length,
    };
  }, [reviews]);

  const ratingChartData = useMemo(
    () => [
      { label: '1 Star', value: courseStats.distribution[1], color: '#ef4444' },
      { label: '2 Stars', value: courseStats.distribution[2], color: '#f97316' },
      { label: '3 Stars', value: courseStats.distribution[3], color: '#eab308' },
      { label: '4 Stars', value: courseStats.distribution[4], color: '#22c55e' },
      { label: '5 Stars', value: courseStats.distribution[5], color: '#3b82f6' },
    ],
    [courseStats.distribution],
  );

  const handleDelete = async (review: Review) => {
    if (!window.confirm(`Delete review #${review.id}?`)) return;
    try {
      setDeletingId(review.id);
      await reviewsApi.deleteReview(review.id);
      setReviews((current) => current.filter((item) => item.id !== review.id));
      setTotalItems((count) => Math.max(0, count - 1));
      toast.success('Review deleted successfully.');
    } catch (error) {
      toast.error(getErrorMessage(error) || 'Failed to delete review.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleStatusUpdate = async (review: Review, status: 'published' | 'hidden' | 'flagged') => {
    try {
      setUpdatingStatusId(review.id);
      await reviewsApi.adminUpdateReviewStatus(review.id, status);
      setReviews((current) =>
        current.map((item) => (item.id === review.id ? { ...item, status } : item)),
      );
      toast.success(`Review marked as ${status}.`);
    } catch (error) {
      toast.error(getErrorMessage(error) || 'Failed to update review status.');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const selectedCourseTitle = courses.find((c) => c.id === selectedCourseId)?.title || 'All Courses';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">{title}</h1>
          <p className="text-sm text-text-muted">{subtitle}</p>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedCourseId ?? ''}
            onChange={(e) => {
              setCurrentPage(1);
              setSelectedCourseId(e.target.value ? Number(e.target.value) : null);
            }}
            className="h-10 min-w-[240px] rounded-xl border border-border bg-surface px-4 text-sm"
          >
            <option value="">{courseLoading ? 'Loading courses...' : 'All Courses'}</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
          <ReportActions />
          <Button variant="outline" onClick={loadReviews}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {selectedCourseId && (
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Rating Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <Chart type="bar" data={ratingChartData} height={200} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-muted">Average Rating</span>
                <span className="text-xl font-black text-text">{courseStats.average.toFixed(1)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-muted">Total Reviews</span>
                <span className="text-xl font-black text-text">{courseStats.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-muted">Written Comments</span>
                <span className="text-xl font-black text-text">{courseStats.withComments}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Status Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <Chart
                type="pie"
                height={200}
                data={(() => {
                  const statusCounts: Record<string, number> = {};
                  reviews.forEach((r) => {
                    const s = r.status || 'published';
                    statusCounts[s] = (statusCounts[s] || 0) + 1;
                  });
                  const statusColors: Record<string, string> = {
                    published: '#22c55e',
                    hidden: '#6b7280',
                    flagged: '#ef4444',
                  };
                  return Object.entries(statusCounts).map(([label, value]) => ({
                    label,
                    value,
                    color: statusColors[label] || '#3b82f6',
                  }));
                })()}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {!selectedCourseId && courseStats.total > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Rating Distribution (All Courses)</CardTitle>
            </CardHeader>
            <CardContent>
              <Chart type="bar" data={ratingChartData} height={200} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Status Breakdown (All Courses)</CardTitle>
            </CardHeader>
            <CardContent>
              <Chart
                type="pie"
                height={200}
                data={(() => {
                  const statusCounts: Record<string, number> = {};
                  reviews.forEach((r) => {
                    const s = r.status || 'published';
                    statusCounts[s] = (statusCounts[s] || 0) + 1;
                  });
                  const statusColors: Record<string, string> = {
                    published: '#22c55e',
                    hidden: '#6b7280',
                    flagged: '#ef4444',
                  };
                  return Object.entries(statusCounts).map(([label, value]) => ({
                    label,
                    value,
                    color: statusColors[label] || '#3b82f6',
                  }));
                })()}
              />
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Input
                value={userFilter}
                onChange={(e) => {
                  setCurrentPage(1);
                  setUserFilter(e.target.value.replace(/\D/g, ''));
                }}
                placeholder="Filter by user ID"
                className="pl-10"
              />
            </div>
            <select
              value={ratingFilter}
              onChange={(e) => {
                setCurrentPage(1);
                setRatingFilter(e.target.value);
              }}
              className="h-10 rounded-xl border border-border bg-surface px-4 text-sm"
            >
              <option value="">All ratings</option>
              <option value="5">5 stars</option>
              <option value="4">4 stars</option>
              <option value="3">3 stars</option>
              <option value="2">2 stars</option>
              <option value="1">1 star</option>
            </select>
            <select
              value={ordering}
              onChange={(e) => {
                setCurrentPage(1);
                setOrdering(e.target.value);
              }}
              className="h-10 rounded-xl border border-border bg-surface px-4 text-sm"
            >
              <option value="-created_at">Newest first</option>
              <option value="created_at">Oldest first</option>
              <option value="-rating">Highest rating first</option>
              <option value="rating">Lowest rating first</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => {
                setCurrentPage(1);
                setStatusFilter(e.target.value);
              }}
              className="h-10 rounded-xl border border-border bg-surface px-4 text-sm"
            >
              <option value="">All statuses</option>
              <option value="published">Published</option>
              <option value="hidden">Hidden</option>
              <option value="flagged">Flagged</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <Loader2 className="h-8 w-8 animate-spin text-text-muted" />
            </div>
          ) : (
            <>
              <Table variant="striped">
                <TableHeader>
                  <TableRow>
                    <TableHead>Reviewer</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Comment</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviews.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center text-text-muted">
                        {selectedCourseId
                          ? `No reviews for "${selectedCourseTitle}" yet.`
                          : 'No reviews available yet.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    reviews.map((review) => (
                      <TableRow key={review.id}>
                        <TableCell>
                          <div>
                            <p className="font-semibold text-text">{review.user.full_name}</p>
                            <p className="text-xs text-text-muted">@{review.user.username}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-text-secondary">{getCourseLabel(review)}</TableCell>
                        <TableCell>
                          <Badge variant={Number(review.rating) >= 4 ? 'success' : Number(review.rating) >= 3 ? 'warning' : 'destructive'}>
                            {review.rating}/5
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={review.status === 'hidden' ? 'secondary' : review.status === 'flagged' ? 'destructive' : 'success'}>
                            {review.status || 'published'}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[420px] text-sm text-text-secondary">
                          <p className="line-clamp-3">{getReviewText(review)}</p>
                        </TableCell>
                        <TableCell className="text-sm text-text-muted">{new Date(review.created_at).toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={updatingStatusId === review.id}
                              onClick={() => handleStatusUpdate(review, 'published')}
                            >
                              Publish
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={updatingStatusId === review.id}
                              onClick={() => handleStatusUpdate(review, 'hidden')}
                            >
                              <EyeOff className="mr-1 h-4 w-4" />
                              Hide
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={updatingStatusId === review.id}
                              onClick={() => handleStatusUpdate(review, 'flagged')}
                              className="text-amber-600 hover:text-amber-700"
                            >
                              <Flag className="mr-1 h-4 w-4" />
                              Flag
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={deletingId === review.id}
                              onClick={() => handleDelete(review)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="mr-1 h-4 w-4" />
                              {deletingId === review.id ? 'Deleting...' : 'Delete'}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {totalItems > 0 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-text-muted">
                    Total reviews: <span className="font-semibold text-text">{totalItems}</span>
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage((page) => page - 1)}>
                      <ChevronLeft className="mr-1 h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={reviews.length === 0 || currentPage * reviews.length >= totalItems}
                      onClick={() => setCurrentPage((page) => page + 1)}
                    >
                      Next
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewManagementPage;
