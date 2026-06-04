import React, { useState, useEffect } from 'react';
import usersApi, { User as ApiUser, CreateUserData } from '../../../src/api/users';
import apiClient from '../../../src/api/client';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell
} from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { useToast } from '../../../src/hooks/useToast';
import {
  Search, UserCheck, X, ChevronLeft, ChevronRight,
  ShieldCheck, Users, RefreshCcw, CheckCircle, User as UserIcon,
  Plus, Mail, Lock, Phone
} from 'lucide-react';

interface EnrollableUser {
  id: string;
  name: string;
  email: string;
  role: string;
  dateJoined: string;
  country?: string;
}

interface EnrolledUser {
  id: string;
  name: string;
  email: string;
  role: string;
  dateJoined: string;
  userCategory: string;
}

const formatDate = (dateStr: string | undefined): string => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
};

const NYSCEnrollmentPage: React.FC = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'enroll' | 'enrolled'>('enroll');
  const [searchQuery, setSearchQuery] = useState('');
  const [enrollableUsers, setEnrollableUsers] = useState<EnrollableUser[]>([]);
  const [enrolledUsers, setEnrolledUsers] = useState<EnrolledUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [enrollPage, setEnrollPage] = useState(1);
  const [enrolledPage, setEnrolledPage] = useState(1);
  const [totalEnrollable, setTotalEnrollable] = useState(0);
  const [totalEnrolled, setTotalEnrolled] = useState(0);
  const [selectedUser, setSelectedUser] = useState<EnrollableUser | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ full_name: '', email: '', password: '', phone_number: '' });
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});
  const [creating, setCreating] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setIsSuperAdmin(user.role === 'SUPER_ADMIN');
      }
    } catch {
      setIsSuperAdmin(false);
    }
  }, []);

  const pageSize = 10;

  useEffect(() => {
    if (activeTab === 'enroll') {
      loadEnrollableUsers();
    } else {
      loadEnrolledUsers();
    }
  }, [activeTab, enrollPage, enrolledPage]);

  const loadEnrollableUsers = async () => {
    try {
      setLoading(true);
      const data = await usersApi.getUsers(enrollPage, 'USER', searchQuery || undefined);
      const mapped: EnrollableUser[] = data.results.map((u: ApiUser) => ({
        id: u.id.toString(),
        name: u.full_name,
        email: u.email,
        role: u.role,
        dateJoined: formatDate(u.date_joined),
        country: u.country,
      }));
      setEnrollableUsers(mapped);
      setTotalEnrollable(data.count);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadEnrolledUsers = async () => {
    try {
      setLoading(true);
      const data = await usersApi.getUsers(enrolledPage, undefined, undefined);
      const nyscUsers: EnrolledUser[] = data.results
        .filter((u: ApiUser) => u.user_category === 'nysc')
        .map((u: ApiUser) => ({
          id: u.id.toString(),
          name: u.full_name,
          email: u.email,
          role: u.role,
          dateJoined: formatDate(u.date_joined),
          userCategory: u.user_category || '',
        }));
      setEnrolledUsers(nyscUsers);
      setTotalEnrolled(nyscUsers.length);
    } catch (err) {
      toast.error('Failed to load enrolled users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setEnrollPage(1);
    loadEnrollableUsers();
  };

  const openConfirmModal = (user: EnrollableUser) => {
    setSelectedUser(user);
    setShowConfirmModal(true);
  };

  const handleEnroll = async () => {
    if (!selectedUser) return;
    try {
      setActionLoading(selectedUser.id);
      await usersApi.updateUser(Number(selectedUser.id), { user_category: 'nysc' });
      const updated = await usersApi.getUser(Number(selectedUser.id));
      if (updated?.user_category !== 'nysc') {
        toast.warning('Enrollment may not have been saved. The backend might not support this field yet.');
      }
      toast.success(`${selectedUser.name} enrolled as NYSC successfully`);
      setShowConfirmModal(false);
      setSelectedUser(null);
      setEnrollableUsers(prev => prev.filter(u => u.id !== selectedUser.id));
      setTotalEnrollable(prev => prev - 1);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to enroll user as NYSC');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRevoke = async (user: EnrolledUser) => {
    if (!window.confirm(`Revoke NYSC status for ${user.name}? This may affect their onboarding fee requirements.`)) return;
    try {
      setActionLoading(user.id);
      await usersApi.updateUser(Number(user.id), { user_category: 'user' });
      toast.success(`${user.name} NYSC status revoked`);
      setEnrolledUsers(prev => prev.filter(u => u.id !== user.id));
      setTotalEnrolled(prev => prev - 1);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to revoke NYSC status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateNyscUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateErrors({});

    if (!createForm.full_name.trim() || !createForm.email.trim() || !createForm.password.trim()) {
      setCreateErrors({ form: 'Full name, email, and password are required.' });
      return;
    }

    setCreating(true);
    try {
      const payload: any = {
        email: createForm.email,
        password: createForm.password,
        full_name: createForm.full_name,
        role: 'USER',
      };
      if (createForm.phone_number.trim()) payload.phone_number = createForm.phone_number.trim();

      const response = await apiClient.post('/api/auth/admin/create-user/', payload);

      const createdEmail = response.data?.email || createForm.email;

      let enrolled = false;
      const createdId = response.data?.id;
      if (createdId) {
        await usersApi.updateUser(Number(createdId), { user_category: 'nysc' });
        enrolled = true;
      } else {
        for (let page = 1; page <= 5; page++) {
          const found = await usersApi.getUsers(page, undefined, createdEmail);
          const match = found.results.find(
            (u: ApiUser) => u.email.toLowerCase() === createdEmail.toLowerCase()
          );
          if (match) {
            await usersApi.updateUser(match.id, { user_category: 'nysc' });
            enrolled = true;
            break;
          }
        }
      }

      toast.success(
        enrolled
          ? `NYSC user "${createForm.full_name}" created and enrolled successfully`
          : `User "${createForm.full_name}" created. Please enroll them from the list below.`
      );
      setShowCreateModal(false);
      setCreateForm({ full_name: '', email: '', password: '', phone_number: '' });
      setActiveTab('enrolled');
      setEnrolledPage(1);
      loadEnrolledUsers();
      loadEnrollableUsers();
    } catch (err: any) {
      const data = err.response?.data;
      if (data && typeof data === 'object') {
        const errors: Record<string, string> = {};
        for (const [key, value] of Object.entries(data)) {
          errors[key] = Array.isArray(value) ? value.join(', ') : String(value);
        }
        setCreateErrors(errors);
      } else {
        setCreateErrors({ form: 'Failed to create user. Please try again.' });
      }
    } finally {
      setCreating(false);
    }
  };

  const totalEnrollablePages = Math.ceil(totalEnrollable / pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text">NYSC Enrollment</h1>
          <p className="text-sm text-text-muted">Manage NYSC user designations — admin-only enrollment</p>
        </div>
        {isSuperAdmin && (
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create NYSC User
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-surface rounded-xl border border-border p-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Available Users</p>
              <p className="text-lg font-bold text-text">{totalEnrollable}</p>
            </div>
          </div>
        </div>
        <div className="bg-surface rounded-xl border border-border p-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Enrolled NYSC</p>
              <p className="text-lg font-bold text-text">{totalEnrolled}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface border border-border rounded-xl p-1 w-fit">
        <button
          onClick={() => { setActiveTab('enroll'); setSearchQuery(''); }}
          className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
            activeTab === 'enroll'
              ? 'bg-primary text-white shadow-sm'
              : 'text-text-muted hover:text-text hover:bg-surface-hover'
          }`}
        >
          Enroll Users
        </button>
        <button
          onClick={() => setActiveTab('enrolled')}
          className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
            activeTab === 'enrolled'
              ? 'bg-primary text-white shadow-sm'
              : 'text-text-muted hover:text-text hover:bg-surface-hover'
          }`}
        >
          Enrolled NYSC
        </button>
      </div>

      {activeTab === 'enroll' ? (
        <>
          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <Input
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" variant="secondary">
              <Search className="mr-2 h-4 w-4" /> Search
            </Button>
          </form>

          {/* Users Table */}
          <div className="bg-surface rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-40 text-center">
                        <RefreshCcw className="h-6 w-6 animate-spin mx-auto text-text-muted" />
                      </TableCell>
                    </TableRow>
                  ) : enrollableUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-40 text-center">
                        <p className="text-text-muted">No users available for NYSC enrollment</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    enrollableUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-surface-hover flex items-center justify-center">
                              <UserIcon className="h-4 w-4 text-text-muted" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-text text-sm truncate">{user.name}</p>
                              <p className="text-xs text-text-muted truncate">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-[10px] capitalize">{user.role.toLowerCase()}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-text-muted">{user.dateJoined}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-text-muted">{user.country || '—'}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            onClick={() => openConfirmModal(user)}
                            disabled={actionLoading === user.id}
                          >
                            <UserCheck className="mr-1.5 h-4 w-4" />
                            Enroll as NYSC
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pagination */}
          {totalEnrollable > 0 && (
            <div className="flex items-center justify-between px-2">
              <p className="text-sm text-text-muted">
                Showing {enrollableUsers.length} of {totalEnrollable} users
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={enrollPage <= 1}
                  onClick={() => setEnrollPage(p => Math.max(1, p - 1))}>
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
                <span className="text-sm font-medium px-3">Page {enrollPage} of {totalEnrollablePages}</span>
                <Button variant="outline" size="sm" disabled={enrollPage >= totalEnrollablePages}
                  onClick={() => setEnrollPage(p => p + 1)}>
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Enrolled NYSC Users */}
          <div className="bg-surface rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-40 text-center">
                        <RefreshCcw className="h-6 w-6 animate-spin mx-auto text-text-muted" />
                      </TableCell>
                    </TableRow>
                  ) : enrolledUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-40 text-center">
                        <p className="text-text-muted">No users enrolled as NYSC yet</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    enrolledUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
                              <ShieldCheck className="h-4 w-4 text-emerald-600" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-text text-sm truncate">{user.name}</p>
                              <p className="text-xs text-text-muted truncate">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-[10px] capitalize">{user.role.toLowerCase()}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-text-muted">{user.dateJoined}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="success" className="text-[10px]">
                            <CheckCircle className="h-3 w-3 mr-1" /> NYSC
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRevoke(user)}
                            disabled={actionLoading === user.id}
                            className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                          >
                            <X className="mr-1.5 h-4 w-4" />
                            Revoke
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      )}

      {/* Create NYSC User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCreateModal(false)}>
          <div className="bg-surface rounded-xl border border-border p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-text">Create NYSC User</h2>
                <p className="text-sm text-text-muted">Create a new user and enroll them as NYSC</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-2 rounded-lg hover:bg-surface-hover">
                <X className="h-5 w-5 text-text-muted" />
              </button>
            </div>

            <form onSubmit={handleCreateNyscUser} className="space-y-4">
              {createErrors.form && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {createErrors.form}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">Full Name <span className="text-red-500">*</span></label>
                <Input
                  placeholder="John Doe"
                  value={createForm.full_name}
                  onChange={(e) => setCreateForm(f => ({ ...f, full_name: e.target.value }))}
                />
                {createErrors.full_name && <p className="text-xs text-red-500 mt-1">{createErrors.full_name}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">Email <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    value={createForm.email}
                    onChange={(e) => setCreateForm(f => ({ ...f, email: e.target.value }))}
                    className="pl-10"
                  />
                </div>
                {createErrors.email && <p className="text-xs text-red-500 mt-1">{createErrors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <Input
                    type="password"
                    placeholder="Min. 8 characters"
                    value={createForm.password}
                    onChange={(e) => setCreateForm(f => ({ ...f, password: e.target.value }))}
                    className="pl-10"
                  />
                </div>
                {createErrors.password && <p className="text-xs text-red-500 mt-1">{createErrors.password}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <Input
                    placeholder="+234 800 000 0000"
                    value={createForm.phone_number}
                    onChange={(e) => setCreateForm(f => ({ ...f, phone_number: e.target.value }))}
                    className="pl-10"
                  />
                </div>
                {createErrors.phone_number && <p className="text-xs text-red-500 mt-1">{createErrors.phone_number}</p>}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
                <strong>Note:</strong> The user will be created with the <strong>USER</strong> role and
                automatically enrolled as NYSC. They will need to pay the onboarding fee to access platform features.
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={creating}>
                  {creating ? 'Creating...' : <><ShieldCheck className="mr-2 h-4 w-4" /> Create & Enroll</>}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {showConfirmModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowConfirmModal(false)}>
          <div className="bg-surface rounded-xl border border-border p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-text">Confirm NYSC Enrollment</h2>
                <p className="text-sm text-text-muted">This action designates the user as NYSC</p>
              </div>
            </div>

            <div className="bg-surface-alt/50 rounded-lg p-4 space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Name</span>
                <span className="font-bold text-text">{selectedUser.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Email</span>
                <span className="font-bold text-text">{selectedUser.email}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Role</span>
                <span className="font-bold text-text capitalize">{selectedUser.role.toLowerCase()}</span>
              </div>
            </div>

            <p className="text-xs text-text-muted mb-4">
              This will set their user category to "nysc" and require them to pay the onboarding fee
              before accessing restricted platform features.
            </p>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowConfirmModal(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleEnroll} disabled={actionLoading === selectedUser.id}>
                {actionLoading === selectedUser.id ? (
                  <>Processing...</>
                ) : (
                  <><UserCheck className="mr-2 h-4 w-4" /> Confirm Enrollment</>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NYSCEnrollmentPage;
