import React, { useEffect, useMemo, useState } from 'react';
import usersApi, { UserRating } from '../../../src/api/users';
import { getErrorMessage } from '../../../src/api/errorHandler';
import { useToast } from '../../../src/hooks/useToast';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { Search, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { ReportActions } from '../../../components/ui/ReportActions';

interface UserRatingsPageProps {
  title?: string;
  subtitle?: string;
}

const UserRatingsPage: React.FC<UserRatingsPageProps> = ({
  title = 'User Ratings',
  subtitle = 'Browse tutor and student rating summaries.',
}) => {
  const toast = useToast();
  const [ratings, setRatings] = useState<UserRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [ordering, setOrdering] = useState('-tutor_rating');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    loadRatings();
  }, [currentPage, submittedQuery, ordering]);

  const loadRatings = async () => {
    try {
      setLoading(true);
      const response = await usersApi.getUserRatings(currentPage, submittedQuery || undefined, ordering || undefined);
      setRatings(response.results);
      setTotalItems(response.count);
    } catch (error) {
      toast.error(getErrorMessage(error) || 'Failed to load user ratings.');
      setRatings([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  const summary = useMemo(() => {
    const tutorValues = ratings.map((item) => Number(item.tutor_rating || 0)).filter((value) => value > 0);
    const studentValues = ratings.map((item) => Number(item.student_rating || 0)).filter((value) => value > 0);
    const avg = (values: number[]) => (values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0);

    return {
      rows: ratings.length,
      ratedTutors: tutorValues.length,
      ratedStudents: studentValues.length,
      avgTutor: avg(tutorValues),
      avgStudent: avg(studentValues),
    };
  }, [ratings]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setSubmittedQuery(searchQuery.trim());
  };

  if (loading && ratings.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <i className="fas fa-circle-notch fa-spin text-4xl text-primary"></i>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">{title}</h1>
          <p className="text-sm text-text-muted">{subtitle}</p>
        </div>
        <ReportActions />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Visible Rows</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-black text-text">{summary.rows}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Rated Tutors</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-black text-text">{summary.ratedTutors}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Avg Tutor Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-black text-text">{summary.avgTutor.toFixed(1)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Avg Student Score</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-black text-text">{summary.avgStudent.toFixed(1)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
            <div className="relative min-w-[280px] flex-1">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, username, or email"
                className="pl-10"
              />
            </div>
            <select
              value={ordering}
              onChange={(e) => {
                setCurrentPage(1);
                setOrdering(e.target.value);
              }}
              className="h-10 rounded-xl border border-border bg-surface px-4 text-sm"
            >
              <option value="-tutor_rating">Tutor rating high to low</option>
              <option value="tutor_rating">Tutor rating low to high</option>
              <option value="-student_rating">Student score high to low</option>
              <option value="student_rating">Student score low to high</option>
              <option value="-date_joined">Newest joined</option>
              <option value="date_joined">Oldest joined</option>
            </select>
            <Button type="submit">Apply</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Table variant="striped">
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Tutor Rating</TableHead>
                <TableHead>Student Rating</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ratings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-text-muted">
                    No ratings available yet.
                  </TableCell>
                </TableRow>
              ) : (
                ratings.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <div>
                        <p className="font-semibold text-text">{entry.full_name}</p>
                        <p className="text-xs text-text-muted">@{entry.username}</p>
                        {entry.email && <p className="text-xs text-text-muted">{entry.email}</p>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{entry.role || 'Unknown'}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-amber-400" />
                        <span className="font-semibold text-text">{Number(entry.tutor_rating || 0).toFixed(1)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-cyan-400" />
                        <span className="font-semibold text-text">{Number(entry.student_rating || 0).toFixed(1)}</span>
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
                Showing page <span className="font-semibold text-text">{currentPage}</span> of ratings
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage((page) => page - 1)}>
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={ratings.length === 0 || currentPage * ratings.length >= totalItems}
                  onClick={() => setCurrentPage((page) => page + 1)}
                >
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserRatingsPage;
