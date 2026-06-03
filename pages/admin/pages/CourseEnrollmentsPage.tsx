import React, { useEffect, useState } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { coursesApi, Course } from '../../../src/api/courses';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { useToast } from '../../../src/hooks/useToast';
import { 
  ArrowLeft, 
  Users, 
  Calendar, 
  Mail, 
  Phone, 
  MapPin,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';
import { ReportActions } from '../../../components/ui/ReportActions';

interface CourseStudent {
  id: number;
  user: {
    id: number;
    username: string;
    email: string;
    full_name: string;
    phone_number?: string;
    address?: string;
    lga?: string;
    state?: string;
    country?: string;
    role: string;
    bio?: string;
    profile_picture?: string;
  };
  enrolled_at: string;
}

interface CourseEnrollmentsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: CourseStudent[];
}

const CourseEnrollmentsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const toast = useToast();
  
  const basePath = location.pathname.startsWith('/tutor')
    ? '/tutor'
    : location.pathname.startsWith('/super-admin')
      ? '/super-admin'
      : '/admin';

  const [course, setCourse] = useState<Course | null>(null);
  const [enrollments, setEnrollments] = useState<CourseStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'recent' | 'old'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 20;

  const fetchData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const courseData = await coursesApi.getCourse(Number(id));
      const enrollmentsData = await coursesApi.getCourseEnrollments(Number(id), currentPage, pageSize);
      
      console.log('Enrollments Data:', enrollmentsData);
      
      setCourse(courseData);
      setEnrollments(enrollmentsData.results || enrollmentsData.items || []);
      setTotalItems(enrollmentsData.count || 0);
      setTotalPages(Math.ceil((enrollmentsData.count || 0) / pageSize) || 1);
    } catch (error) {
      console.error('Failed to fetch course enrollments:', error);
      toast.error('Failed to load enrollments');
    } finally {
      setLoading(false);
    }
  };

   useEffect(() => {
     fetchData();
   }, [id, currentPage]);

   const filteredEnrollments = (enrollments || []).filter(student => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      student.user.full_name.toLowerCase().includes(query) ||
      student.user.email.toLowerCase().includes(query) ||
      student.user.username.toLowerCase().includes(query)
    );
  });

  const sortedEnrollments = [...filteredEnrollments].sort((a, b) => {
    if (statusFilter === 'recent') {
      return new Date(b.enrolled_at).getTime() - new Date(a.enrolled_at).getTime();
    } else if (statusFilter === 'old') {
      return new Date(a.enrolled_at).getTime() - new Date(b.enrolled_at).getTime();
    }
    return 0;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading && !course) {
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
          <div className="flex items-center gap-2 text-sm text-text-muted mb-2">
            <Link to={`${basePath}/courses`} className="hover:text-primary">
              Courses
            </Link>
            <span>/</span>
            <span className="text-text">{course?.title || 'Course'}</span>
            <span>/</span>
            <span className="text-primary">Enrollments</span>
          </div>
          <h1 className="text-2xl font-bold text-text">Course Enrollments</h1>
          <p className="text-sm text-text-muted">
            View and manage students enrolled in "{course?.title}"
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ReportActions />
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Link to={`${basePath}/courses/${id}/edit`}>
            <Button variant="outline" size="sm">
              Edit Course
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface rounded-2xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Total Enrolled</p>
              <p className="text-2xl font-black text-text">{totalItems}</p>
            </div>
          </div>
        </div>
        <div className="bg-surface rounded-2xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <i className="fas fa-graduation-cap text-emerald-600"></i>
            </div>
            <div>
              <p className="text-xs text-text-muted">Active Students</p>
              <p className="text-2xl font-black text-emerald-600">{totalItems}</p>
            </div>
          </div>
        </div>
        <div className="bg-surface rounded-2xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <i className="fas fa-book text-blue-600"></i>
            </div>
            <div>
              <p className="text-xs text-text-muted">Modules</p>
              <p className="text-2xl font-black text-blue-600">{course?.modules.length || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-surface rounded-2xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <i className="fas fa-dollar-sign text-amber-600"></i>
            </div>
            <div>
              <p className="text-xs text-text-muted">Course Price</p>
              <p className="text-2xl font-black text-amber-600">
                {course?.total_amount ? `$${course.total_amount}` : 'Free'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[280px] relative">
            <input
              type="text"
              placeholder="Search by name, email, or username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'recent' | 'old')}
              className="h-11 rounded-xl border border-border bg-surface px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="all">All Enrollments</option>
              <option value="recent">Recently Enrolled</option>
              <option value="old">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Enrollments Table */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden">
        <Table variant="striped">
          <TableHeader>
            <TableRow className="bg-surface-alt/50">
              <TableHead>Student</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Enrolled Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center">
                  <i className="fas fa-circle-notch fa-spin text-2xl text-primary"></i>
                </TableCell>
              </TableRow>
            ) : sortedEnrollments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <Users className="h-10 w-10 text-text-muted opacity-20 mb-2" />
                    <p className="text-text-muted font-medium">No students enrolled yet</p>
                    <p className="text-xs text-text-muted mt-1">Students will appear here once they enroll in this course.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sortedEnrollments.map((enrollment) => (
                <TableRow key={enrollment.id} className="group">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                        {enrollment.user.profile_picture ? (
                          <img 
                            src={enrollment.user.profile_picture} 
                            alt={enrollment.user.full_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-bold text-primary">
                            {enrollment.user.full_name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-text">{enrollment.user.full_name}</p>
                        <p className="text-xs text-text-muted">@{enrollment.user.username}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <Mail className="h-3 w-3 text-text-muted" />
                        <span className="text-text-secondary">{enrollment.user.email}</span>
                      </div>
                      {enrollment.user.phone_number && (
                        <div className="flex items-center gap-2 text-xs">
                          <Phone className="h-3 w-3 text-text-muted" />
                          <span className="text-text-secondary">{enrollment.user.phone_number}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-text-secondary">
                        <MapPin className="h-3 w-3 text-text-muted" />
                        <span>{enrollment.user.lga || enrollment.user.state || 'N/A'}</span>
                      </div>
                      {enrollment.user.country && (
                        <span className="text-xs text-text-muted">{enrollment.user.country}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-xs text-text-secondary">
                      <Calendar className="h-3 w-3" />
                      {formatDate(enrollment.enrolled_at)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link to={`${basePath}/users/${enrollment.user.id}`}>
                        <Button variant="ghost" size="xs" title="View Student Profile">
                          <i className="fas fa-user text-xs"></i>
                        </Button>
                      </Link>
                      <Button variant="ghost" size="xs" title="Send Message">
                        <i className="fas fa-envelope text-xs"></i>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-text-muted">
            Showing page {currentPage} of {totalPages} ({totalItems} total enrollments)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-text-muted px-4">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseEnrollmentsPage;