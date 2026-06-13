import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import usersApi, { User as ApiUser } from '../../../src/api/users';
import { 
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell 
} from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { useToast } from '../../../src/hooks/useToast';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import {
  Search, 
  UserPlus, 
  Download, 
  MoreHorizontal, 
  Trash2, 
  Ban, 
  CheckCircle,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Eye,
  Edit,
  User as UserIcon,
  Mail,
  Calendar,
  BookOpen,
  Award,
  TrendingUp,
  RefreshCcw,
  Star,
  ExternalLink,
  LayoutGrid,
  List,
} from 'lucide-react';
import { ReportActions } from '../../../components/ui/ReportActions';
import { analyticsApi } from '../../../src/api/analytics';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'suspended';
  isVerified: boolean;
  verificationStatus: string;
  createdAt: string;
  lastLogin: string;
  coursesEnrolled: number;
  coursesCreated: number;
  completedCourses: number;
  totalSpent: number;
  avatar?: string;
  state?: string;
  country?: string;
  rating?: number | null;
}

const mapBackendUserToFrontend = (user: ApiUser): User => {
  const formatDate = (dateStr: string | undefined): string => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return {
    id: user.id.toString(),
    name: user.full_name,
    email: user.email,
    role: user.role,
    status: user.is_active ? 'active' : 'suspended',
    isVerified: user.is_verified || false,
    verificationStatus: user.verification_status || 'unverified',
    avatar: user.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=random`,
    createdAt: formatDate(user.date_joined),
    lastLogin: formatDate(user.last_login),
    coursesEnrolled: user.courses_enrolled || 0,
    coursesCreated: user.courses_created || 0,
    completedCourses: 0,
    totalSpent: 0,
    state: user.state,
    country: user.country,
    rating: user.role === 'TUTOR' ? user.tutor_rating : user.student_rating,
  };
};

interface UsersPageProps {
  initialRole?: string;
  title?: string;
  subtitle?: string;
}

const UsersPage: React.FC<UsersPageProps> = ({ 
  initialRole = '', 
  title = 'User Management',
  subtitle = 'View and manage all platform users'
}) => {
  const toast = useToast();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/super-admin') ? '/super-admin' : '/admin';
  const [searchQuery, setSearchQuery] = useLocalStorage('admin_users_search', '');
  const [selectedRole, setSelectedRole] = useLocalStorage('admin_users_role', initialRole);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useLocalStorage('admin_users_page', 1);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [enriching, setEnriching] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setCurrentUserRole(user.role);
      }
    } catch {
      setCurrentUserRole(null);
    }
  }, []);

  const canCreateUsers = currentUserRole === 'SUPER_ADMIN';
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUserDetails, setSelectedUserDetails] = useState<Record<string, any> | null>(null);
  const [selectedUserAnalytics, setSelectedUserAnalytics] = useState<Record<string, any> | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [selectedVerification, setSelectedVerification] = useState<string>('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  useEffect(() => {
    loadUsers();
  }, [selectedRole, selectedVerification, currentPage]);

  const loadUsers = async (pageNum?: number, searchTerm?: string) => {
    try {
      setLoading(true);
      const roleParam = selectedRole === '' ? undefined : selectedRole;
      const data = await usersApi.getUsers(pageNum ?? currentPage, roleParam, searchTerm !== undefined ? searchTerm : (searchQuery || undefined));
      const mappedUsers = data.results.map(mapBackendUserToFrontend);
      setUsers(mappedUsers);
      setTotalUsers(data.count);
      
      // After loading basic user info, enrich with analytics data
      enrichUserData(mappedUsers);
    } catch (error: any) {
      console.error('Failed to load users:', error);
      if (error?.response?.status === 404) {
        setUsers([]);
        setTotalUsers(0);
      } else {
        toast.error('Failed to load users');
      }
    } finally {
      setLoading(false);
    }
  };

  const enrichUserData = async (baseUsers: User[]) => {
    if (baseUsers.length === 0) return;
    
    setEnriching(true);
    try {
      const enrichedResults = await Promise.all(
        baseUsers.map(async (u) => {
          try {
            const uid = parseInt(u.id);
            if (u.role === 'TUTOR') {
              const summary = await analyticsApi.getTutorDashboardSummary(uid);
              return {
                id: u.id,
                coursesCreated: summary.total_courses,
                coursesEnrolled: summary.total_students, // For tutors, "enrollments" might mean students
                totalSpent: summary.total_revenue,
              };
            } else {
              const summary = await analyticsApi.getStudentDashboardSummary(uid);
              return {
                id: u.id,
                coursesEnrolled: summary.total_courses,
                completedCourses: summary.completed_courses,
                totalSpent: summary.total_spent,
              };
            }
          } catch {
            return { id: u.id };
          }
        })
      );

      setUsers(prev => prev.map(u => {
        const enrichment = enrichedResults.find(e => e.id === u.id);
        if (enrichment) {
          return { ...u, ...enrichment };
        }
        return u;
      }));
    } catch (error) {
      console.error('Failed to enrich user data:', error);
    } finally {
      setEnriching(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadUsers(1, searchQuery);
  };

  const handleSelectUser = (id: string) => {
    setSelectedUsers(prev => 
      prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
    );
  };

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    try {
      setActionLoading(userId);
      const newStatus = currentStatus !== 'active';
      await usersApi.toggleUserStatus(Number(userId), newStatus);
      setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus ? 'active' : 'suspended' } : u));
      toast.success(`User ${newStatus ? 'activated' : 'suspended'} successfully`);
    } catch (error) {
      toast.error('Failed to update user status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    
    try {
      setActionLoading(userId);
      await usersApi.deleteUser(Number(userId));
      setUsers(users.filter(u => u.id !== userId));
      setTotalUsers(prev => prev - 1);
      toast.success('User deleted successfully');
    } catch (error) {
      toast.error('Failed to delete user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const openUserDetails = async (user: User) => {
    setSelectedUser(user);
    setDetailsLoading(true);
    setSelectedUserDetails(null);
    setSelectedUserAnalytics(null);

    try {
      const userId = parseInt(user.id);
      const detailsPromise = usersApi.getUser(userId);
      const analyticsPromise = user.role === 'TUTOR'
        ? analyticsApi.getTutorDashboard(userId)
        : analyticsApi.getStudentCourseProgress(userId);

      const [details, analytics] = await Promise.allSettled([detailsPromise, analyticsPromise]);

      if (details.status === 'fulfilled') {
        setSelectedUserDetails((details.value as Record<string, any>) || null);
      }

      if (analytics.status === 'fulfilled') {
        setSelectedUserAnalytics(analytics.value as Record<string, any>);
      }
    } catch (error) {
      console.error('Failed to load user details modal:', error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeUserDetails = () => {
    setSelectedUser(null);
    setSelectedUserDetails(null);
    setSelectedUserAnalytics(null);
    setDetailsLoading(false);
  };

  const pageSize = 10;
  const filteredUsers = users.filter(user => {
    if (selectedVerification === 'verified') return user.isVerified;
    if (selectedVerification === 'unverified') return !user.isVerified;
    if (selectedVerification === 'pending') return user.verificationStatus === 'pending';
    return true;
  }).sort((a, b) => {
    const aValue = a[sortField as keyof User] || '';
    const bValue = b[sortField as keyof User] || '';
    const comparison = aValue < bValue ? -1 : 1;
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const paginatedUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const totalFilteredUsers = filteredUsers.length;
  const totalPages = Math.ceil(totalFilteredUsers / pageSize);

  const handleExportCsv = () => {
    const rows = selectedUsers.length > 0
      ? filteredUsers.filter((user) => selectedUsers.includes(user.id))
      : filteredUsers;

    if (rows.length === 0) {
      toast.info('No users available to export');
      return;
    }

    const csvContent = [
      ['Name', 'Email', 'Role', 'Status', 'Joined', 'Last Login', 'Enrollments', 'Courses Created'],
      ...rows.map((user) => [
        user.name,
        user.email,
        user.role,
        user.status,
        user.createdAt,
        user.lastLogin,
        String(user.coursesEnrolled || 0),
        String(user.coursesCreated || 0),
      ]),
    ]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `users-page-${currentPage}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <i className="fas fa-circle-notch fa-spin text-4xl text-primary"></i>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text">{title}</h1>
          <p className="text-sm text-text-muted">{subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <ReportActions />
          <Button variant="outline" onClick={handleExportCsv}>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          {canCreateUsers && (
            <Link to={`${basePath}/users/create`}>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" /> Add User
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-surface rounded-xl border border-border p-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <UserIcon className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Total Users</p>
              <p className="text-lg font-bold text-text">{totalUsers}</p>
            </div>
          </div>
        </div>
        <div className="bg-surface rounded-xl border border-border p-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Active</p>
              <p className="text-lg font-bold text-text">{users.filter(u => u.status === 'active').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-surface rounded-xl border border-border p-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Tutors</p>
              <p className="text-lg font-bold text-text">{users.filter(u => u.role === 'TUTOR').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-surface rounded-xl border border-border p-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Award className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Verified</p>
              <p className="text-lg font-bold text-text">{users.filter(u => u.isVerified).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Collapsible Filter Bar */}
      <div className="backdrop-blur-md bg-surface/80 border border-border/50 rounded-xl shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center gap-2 text-left"
          >
            <Filter className="h-4 w-4 text-text-muted" />
            <span className="text-sm font-medium text-text">Filters</span>
            {(searchQuery || selectedRole || selectedVerification) && (
              <span className="w-2 h-2 rounded-full bg-purple-500" />
            )}
            <ChevronDown
              className={`h-4 w-4 text-text-muted transition-transform ${filterOpen ? 'rotate-180' : ''}`}
            />
          </button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="border-border/50"
            >
              {viewMode === 'grid' ? <List className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {filterOpen && (
          <div className="px-4 pb-4 border-t border-border/50 pt-3">
            <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[280px] relative">
                <Input
                  placeholder="Search by name, email, or username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="h-11 rounded-xl border border-border/50 bg-surface px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">All Roles</option>
                  <option value="ADMIN">Admin</option>
                  <option value="TUTOR">Tutor</option>
                  <option value="USER">User</option>
                  <option value="INFLUENCER">Influencer</option>
                  <option value="CONTRIBUTOR">Contributor</option>
                </select>
                <select
                  value={selectedVerification}
                  onChange={(e) => setSelectedVerification(e.target.value)}
                  className="h-11 rounded-xl border border-border/50 bg-surface px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">All Verification</option>
                  <option value="verified">Verified</option>
                  <option value="unverified">Unverified</option>
                  <option value="pending">Pending KYC</option>
                </select>
                {(searchQuery || selectedRole || selectedVerification) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedRole('');
                      setSelectedVerification('');
                      setCurrentPage(1);
                      loadUsers(1, '');
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
                <Button type="submit" variant="secondary">
                  <Filter className="mr-2 h-4 w-4" /> Filter
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Bulk Actions & Count */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
          <p className="text-sm text-text-muted">
            Showing <span className="font-bold text-text">{paginatedUsers.length}</span> of <span className="font-bold text-text">{totalFilteredUsers}</span> users
          </p>
          {enriching && (
            <div className="flex items-center gap-2 text-xs text-primary animate-pulse">
              <RefreshCcw className="h-3 w-3 animate-spin" />
              <span>Enriching activity data...</span>
            </div>
          )}
        </div>
        {selectedUsers.length > 0 && (
          <div className="flex items-center gap-3 animate-slide-in">
            <span className="text-sm font-medium text-primary">{selectedUsers.length} selected</span>
            <Button variant="ghost" size="sm" onClick={() => setSelectedUsers([])}>
              Clear
            </Button>
          </div>
        )}
      </div>

      {viewMode === 'list' ? (
        /* Users Table */
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <Table variant="striped">
            <TableHeader>
              <TableRow className="bg-surface-alt/50">
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(filteredUsers.map(u => u.id));
                      } else {
                        setSelectedUsers([]);
                      }
                    }}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                  />
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                  User {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('role')}>
                  Role {sortField === 'role' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead>Verification & KYC</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Activity & Ratings</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-40 text-center">
                    <p className="text-text-muted">No users found matching your criteria</p>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map((user) => (
                  <TableRow key={user.id} className="group">
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img 
                          src={user.avatar} 
                          alt={user.name} 
                          className="w-10 h-10 rounded-xl object-cover border border-border group-hover:border-primary/50 transition-colors" 
                        />
                        <div className="min-w-0">
                          {user.role === 'TUTOR' ? (
                            <Link to={`${basePath}/tutor/${user.id}`} className="font-bold text-text truncate hover:text-emerald-600 transition-colors">
                              {user.name}
                            </Link>
                          ) : (
                            <p className="font-bold text-text truncate">{user.name}</p>
                          )}
                          <p className="text-xs text-text-muted truncate">{user.email}</p>
                          <p className="text-[10px] text-text-muted mt-0.5">Joined: {user.createdAt}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize text-[10px]">{user.role.toLowerCase()}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                          {user.isVerified ? (
                            <CheckCircle className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <X className="h-3 w-3 text-red-500" />
                          )}
                          <span className="text-[10px] font-medium">{user.isVerified ? 'Verified' : 'Unverified'}</span>
                        </div>
                        <Badge 
                          variant={user.isVerified ? 'success' : 'outline'} 
                          className="text-[9px] uppercase w-fit"
                        >
                          {user.verificationStatus || 'unverified'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-[10px] text-text-secondary">
                        {user.country ? (
                          <p className="font-medium">{user.country}</p>
                        ) : (
                          <p className="text-text-muted italic">Unknown Country</p>
                        )}
                        {user.state && <p className="text-text-muted">{user.state}</p>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'active' ? 'success' : 'destructive'} className="capitalize text-[10px]">
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-[10px] text-text-muted space-y-1">
                        {user.role === 'TUTOR' ? (
                          <>
                            <p><span className="font-bold text-text">{user.coursesCreated}</span> Courses</p>
                            <p><span className="font-bold text-text">{user.coursesEnrolled}</span> Students</p>
                            <p>Earned: <span className="font-bold text-emerald-600">₦{user.totalSpent.toLocaleString()}</span></p>
                          </>
                        ) : (
                          <>
                            <p><span className="font-bold text-text">{user.coursesEnrolled}</span> Enrolled</p>
                            <p><span className="font-bold text-text">{user.completedCourses}</span> Completed</p>
                            <p>Spent: <span className="font-bold text-text">₦{user.totalSpent.toLocaleString()}</span></p>
                          </>
                        )}
                        {user.rating && (
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                            <span className="font-bold text-amber-600">{user.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="xs">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link to={`${basePath}/users/${user.id}/progress`}>
                              <TrendingUp className="mr-2 h-4 w-4" />
                              <span>View Progress</span>
                            </Link>
                          </DropdownMenuItem>
                          {user.role === 'TUTOR' ? (
                            <DropdownMenuItem asChild>
                              <Link to={`${basePath}/tutor/${user.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                <span>View Details</span>
                              </Link>
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => openUserDetails(user)}>
                              <Eye className="mr-2 h-4 w-4" />
                              <span>View Details</span>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem asChild>
                            <Link to={`${basePath}/users/${user.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Edit User</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleToggleStatus(user.id, user.status)}
                            className={user.status === 'active' ? 'text-amber-600 focus:text-amber-600' : 'text-emerald-600 focus:text-emerald-600'}
                          >
                            {user.status === 'active' ? (
                              <>
                                <Ban className="mr-2 h-4 w-4" />
                                <span>Suspend User</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                <span>Activate User</span>
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete User</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        </div>
      ) : (
        /* Users Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 p-3">
          {paginatedUsers.length === 0 ? (
            <div className="col-span-full flex items-center justify-center py-16 text-center">
              <p className="text-text-muted">No users found matching your criteria</p>
            </div>
          ) : (
            paginatedUsers.map((user) => (
              <div key={user.id} className="backdrop-blur-md bg-surface/60 border border-border/50 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow relative group">
                <div className="flex items-start gap-3 mb-2">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-xl object-cover border border-border/50"
                  />
                  <div className="flex-1 min-w-0">
                    {user.role === 'TUTOR' ? (
                      <Link to={`${basePath}/tutor/${user.id}`} className="font-bold text-sm text-text truncate hover:text-emerald-600 transition-colors block">
                        {user.name}
                      </Link>
                    ) : (
                      <Link to={`${basePath}/users/${user.id}`} className="font-bold text-sm text-text truncate hover:text-emerald-600 transition-colors block">
                        {user.name}
                      </Link>
                    )}
                    <p className="text-xs text-text-muted truncate">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Badge variant={user.status === 'active' ? 'success' : 'destructive'} className="text-[9px] capitalize">
                      {user.status}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="xs" className="h-7 w-7 p-0">
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link to={`${basePath}/users/${user.id}/progress`}>
                            <TrendingUp className="mr-2 h-4 w-4" />
                            <span>View Progress</span>
                          </Link>
                        </DropdownMenuItem>
                        {user.role === 'TUTOR' ? (
                          <DropdownMenuItem asChild>
                            <Link to={`${basePath}/tutor/${user.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              <span>View Details</span>
                            </Link>
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => openUserDetails(user)}>
                            <Eye className="mr-2 h-4 w-4" />
                            <span>View Details</span>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem asChild>
                          <Link to={`${basePath}/users/${user.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit User</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleToggleStatus(user.id, user.status)}
                          className={user.status === 'active' ? 'text-amber-600 focus:text-amber-600' : 'text-emerald-600 focus:text-emerald-600'}
                        >
                          {user.status === 'active' ? (
                            <>
                              <Ban className="mr-2 h-4 w-4" />
                              <span>Suspend User</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              <span>Activate User</span>
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete User</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="capitalize text-[9px]">{user.role.toLowerCase()}</Badge>
                  <Badge variant={user.isVerified ? 'success' : 'outline'} className="text-[9px] uppercase">
                    {user.verificationStatus || 'unverified'}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-text-muted">
                  {user.role === 'TUTOR' ? (
                    <>
                      <span>{user.coursesCreated} courses</span>
                      <span>{user.coursesEnrolled} students</span>
                    </>
                  ) : (
                    <>
                      <span>{user.coursesEnrolled} enrolled</span>
                      <span>{user.completedCourses} completed</span>
                    </>
                  )}
                  {user.rating && (
                    <div className="flex items-center gap-1 ml-auto">
                      <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-amber-600">{user.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
      
{/* Pagination */}
      {totalFilteredUsers > 0 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-text-muted">
            Showing <span className="font-bold text-text">{paginatedUsers.length}</span> of <span className="font-bold text-text">{totalFilteredUsers}</span> users
          </p>
          <div className="flex items-center gap-2">
<Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium px-4">Page {currentPage} of {totalPages}</span>
              </div>
              <Button
               variant="outline"
               size="sm"
               disabled={currentPage >= totalPages}
               onClick={() => setCurrentPage(prev => prev + 1)}
             >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={closeUserDetails}>
          <div className="bg-surface rounded-t-2xl sm:rounded-xl border border-border p-4 sm:p-6 w-full sm:max-w-3xl max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-text">User Details</h2>
              <Button variant="ghost" size="xs" onClick={closeUserDetails}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-surface-hover flex items-center justify-center">
                  {selectedUser.avatar ? (
                    <img src={selectedUser.avatar} alt={selectedUser.name} className="w-16 h-16 rounded-full object-cover" />
                  ) : (
                    <UserIcon className="h-8 w-8 text-text-muted" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text">{selectedUser.name}</h3>
                  <p className="text-sm text-text-muted">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant={selectedUser.status === 'active' ? 'default' : 'secondary'}>
                    {selectedUser.status === 'active' ? 'Active' : 'Suspended'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-text-secondary">
                  <Award className="h-4 w-4" />
                  <span className="capitalize">{selectedUser.role}</span>
                </div>
                <div className="flex items-center gap-2 text-text-secondary">
                  <Calendar className="h-4 w-4" />
                  <span>Joined: {selectedUser.createdAt}</span>
                </div>
                <div className="flex items-center gap-2 text-text-secondary">
                  <Calendar className="h-4 w-4" />
                  <span>Last Login: {selectedUser.lastLogin}</span>
                </div>
                {selectedUser.coursesEnrolled !== undefined && (
                  <div className="flex items-center gap-2 text-text-secondary">
                    <BookOpen className="h-4 w-4" />
                    <span>{selectedUser.coursesEnrolled} Enrollments</span>
                  </div>
                )}
              </div>

              {detailsLoading ? (
                <div className="py-8 text-center text-sm text-text-muted">Loading full profile and analytics...</div>
              ) : (
                <>
                  {selectedUserAnalytics && (
                    <div className="border border-border rounded-lg p-3 space-y-3">
                      <h3 className="text-sm font-bold text-text">Analytics</h3>
                      {'overall_completion' in selectedUserAnalytics && (
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-text-muted">Overall Completion</span>
                            <span className="font-bold">{Math.round(Number(selectedUserAnalytics.overall_completion || 0))}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-surface-hover overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${Math.max(0, Math.min(100, Number(selectedUserAnalytics.overall_completion || 0)))}%` }}
                            />
                          </div>
                        </div>
                      )}
                      {Array.isArray(selectedUserAnalytics.courses) && selectedUserAnalytics.courses.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-text-muted">Course Progress</p>
                          {selectedUserAnalytics.courses.slice(0, 6).map((course: any) => (
                            <div key={course.course_id || course.title}>
                              <div className="flex items-center justify-between text-xs">
                                <span className="truncate mr-2">{course.title}</span>
                                <span className="font-medium">{Math.round(Number(course.completion || 0))}%</span>
                              </div>
                              <div className="h-1.5 rounded-full bg-surface-hover overflow-hidden mt-1">
                                <div
                                  className="h-full bg-blue-500"
                                  style={{ width: `${Math.max(0, Math.min(100, Number(course.completion || 0)))}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {Array.isArray(selectedUserAnalytics.monthly_enrollments) && selectedUserAnalytics.monthly_enrollments.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-text-muted">Monthly Enrollments</p>
                          {selectedUserAnalytics.monthly_enrollments.slice(-6).map((item: any, index: number) => (
                            <div key={`${item.month}-${index}`} className="flex items-center gap-2">
                              <span className="text-[11px] w-16 text-text-muted">{item.month}</span>
                              <div className="flex-1 h-2 rounded-full bg-surface-hover overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500"
                                  style={{ width: `${Math.min(100, Number(item.count || 0) * 10)}%` }}
                                />
                              </div>
                              <span className="text-[11px] font-medium w-6 text-right">{item.count ?? 0}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {selectedUserDetails && (
                    <div className="border border-border rounded-lg p-3 space-y-2">
                      <h3 className="text-sm font-bold text-text">All API Fields</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {Object.entries(selectedUserDetails).map(([key, value]) => (
                          <div key={key} className="bg-surface-alt/50 rounded-md p-2">
                            <p className="font-semibold text-text-muted mb-1 break-all">{key}</p>
                            <p className="text-text break-all">
                              {value === null || value === undefined
                                ? 'N/A'
                                : typeof value === 'object'
                                  ? JSON.stringify(value)
                                  : String(value)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex items-center gap-2 mt-6">
              <Link to={`${basePath}/users/${selectedUser.id}`} className="flex-1">
                <Button variant="outline" className="w-full">
                  <Eye className="h-4 w-4 mr-2" /> Open Full Page
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  usersApi.toggleUserStatus(parseInt(selectedUser.id), selectedUser.status !== 'active');
                  setUsers(users.map(u => u.id === selectedUser.id ? { ...u, status: selectedUser.status === 'active' ? 'suspended' : 'active' } : u));
                  closeUserDetails();
                  toast.success(`User ${selectedUser.status === 'active' ? 'suspended' : 'activated'} successfully`);
                }}
              >
                {selectedUser.status === 'active' ? <><Ban className="h-4 w-4 mr-2" /> Suspend</> : <><CheckCircle className="h-4 w-4 mr-2" /> Activate</>}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
