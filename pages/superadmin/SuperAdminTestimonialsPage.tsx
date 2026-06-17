import React, { useState, useEffect, useCallback } from 'react';
import testimonialsApi, { Testimonial } from '../../src/api/testimonials';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { useToast } from '../../src/hooks/useToast';
import {
  MessageSquare,
  Trash2,
  RefreshCcw,
  Eye,
  EyeOff,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  X,
  ChevronDown,
  ArrowUpDown,
  Maximize2,
} from 'lucide-react';

const SuperAdminTestimonialsPage: React.FC = () => {
  const { error: toastError, success: toastSuccess } = useToast();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const pageSize = 20;

  const loadTestimonials = useCallback(async () => {
    try {
      setLoading(true);
      const status = statusFilter === 'all' ? undefined : statusFilter;
      const response = await testimonialsApi.getAdminTestimonials(currentPage, pageSize, status);
      setTestimonials(response.results || []);
      setTotalItems(response.count || 0);
    } catch (err) {
      // API not ready yet - use empty state
      setTestimonials([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter]);

  useEffect(() => {
    loadTestimonials();
  }, [loadTestimonials]);

  const handleApprove = async (id: number) => {
    try {
      await testimonialsApi.updateTestimonialStatus(id, 'approved');
      toastSuccess('Testimonial approved.');
      loadTestimonials();
    } catch (err) {
      toastError('Failed to approve testimonial.');
    }
  };

  const handleReject = async (id: number) => {
    try {
      await testimonialsApi.updateTestimonialStatus(id, 'rejected');
      toastSuccess('Testimonial rejected.');
      loadTestimonials();
    } catch (err) {
      toastError('Failed to reject testimonial.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;

    try {
      await testimonialsApi.deleteTestimonial(id);
      toastSuccess('Testimonial deleted.');
      loadTestimonials();
    } catch (err) {
      toastError('Failed to delete testimonial.');
    }
  };

  const handleTogglePublic = async (id: number, currentStatus: boolean) => {
    try {
      await testimonialsApi.updateTestimonial(id, { is_public: !currentStatus });
      toastSuccess(`Testimonial ${!currentStatus ? 'set to public' : 'set to private'}.`);
      loadTestimonials();
    } catch (err) {
      toastError('Failed to update testimonial.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge className="bg-amber-100 text-amber-700 border-amber-200"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
    }
  };

  const filteredTestimonials = testimonials.filter((t) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const name = t.user?.full_name || t.name || '';
    const quote = t.quote || '';
    return name.toLowerCase().includes(query) || quote.toLowerCase().includes(query);
  });

  const stats = {
    total: totalItems,
    pending: testimonials.filter((t) => t.status === 'pending').length,
    approved: testimonials.filter((t) => t.status === 'approved').length,
    rejected: testimonials.filter((t) => t.status === 'rejected').length,
  };

  return (
    <div className="space-y-4 max-w-full overflow-hidden px-1 sm:px-2">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-text tracking-tight">Testimonials Management</h1>
          <p className="text-[10px] sm:text-xs text-text-muted">Review and manage user testimonials for the landing page</p>
        </div>
        <Button variant="ghost" size="sm" onClick={loadTestimonials} className="h-8 px-2 text-[10px] sm:text-xs">
          <RefreshCcw className={`h-3 w-3 sm:mr-1.5 ${loading && 'animate-spin'}`} />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <div className="bg-surface rounded-xl border border-border p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
            <MessageSquare className="h-4 w-4 text-blue-500" />
          </div>
          <div>
            <p className="text-[9px] sm:text-[10px] text-text-muted font-bold uppercase">Total</p>
            <p className="text-sm sm:text-lg font-black text-text">{stats.total}</p>
          </div>
        </div>
        <div className="bg-surface rounded-xl border border-border p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div>
            <p className="text-[9px] sm:text-[10px] text-text-muted font-bold uppercase">Pending</p>
            <p className="text-sm sm:text-lg font-black text-amber-600">{stats.pending}</p>
          </div>
        </div>
        <div className="bg-surface rounded-xl border border-border p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
            <CheckCircle className="h-4 w-4 text-green-500" />
          </div>
          <div>
            <p className="text-[9px] sm:text-[10px] text-text-muted font-bold uppercase">Approved</p>
            <p className="text-sm sm:text-lg font-black text-green-600">{stats.approved}</p>
          </div>
        </div>
        <div className="bg-surface rounded-xl border border-border p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
            <XCircle className="h-4 w-4 text-red-500" />
          </div>
          <div>
            <p className="text-[9px] sm:text-[10px] text-text-muted font-bold uppercase">Rejected</p>
            <p className="text-sm sm:text-lg font-black text-red-600">{stats.rejected}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface rounded-xl border border-border p-3 shadow-md">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search by name or quote..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-lg border border-border bg-surface-alt/50 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value as any); setCurrentPage(1); }}
              className="appearance-none pl-3 pr-8 py-2 rounded-lg border border-border bg-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-text-muted pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Testimonials List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <RefreshCcw className="animate-spin h-6 w-6 text-text-muted" />
        </div>
      ) : filteredTestimonials.length > 0 ? (
        <div className="space-y-3">
          {filteredTestimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-surface rounded-xl border border-border p-4 sm:p-5 shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {getStatusBadge(testimonial.status)}
                    {testimonial.is_public ? (
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200"><Eye className="w-3 h-3 mr-1" /> Public</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-500 border-gray-200"><EyeOff className="w-3 h-3 mr-1" /> Private</Badge>
                    )}
                  </div>

                  <p className="text-sm text-text leading-relaxed mb-3">"{testimonial.quote}"</p>

                  <div className="flex items-center gap-3 text-[10px] text-text-muted">
                    {testimonial.user && (
                      <div className="flex items-center gap-2">
                        <img
                          src={testimonial.user.profile_picture || `https://i.pravatar.cc/100?u=${testimonial.user.email}`}
                          alt={testimonial.user.full_name}
                          className="w-5 h-5 rounded-full"
                        />
                        <span className="font-medium">{testimonial.user.full_name}</span>
                        <span className="text-text-muted">({testimonial.user.role})</span>
                      </div>
                    )}
                    <span>•</span>
                    <span>{new Date(testimonial.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setSelectedTestimonial(testimonial); setViewModalOpen(true); }}
                    className="h-8 w-8 p-0"
                    title="View full testimonial"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTogglePublic(testimonial.id, testimonial.is_public)}
                    className="h-8 w-8 p-0"
                    title={testimonial.is_public ? 'Set to private' : 'Set to public'}
                  >
                    {testimonial.is_public ? (
                      <Eye className="h-4 w-4 text-blue-500" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-text-muted" />
                    )}
                  </Button>

                  {testimonial.status === 'pending' && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleApprove(testimonial.id)}
                        className="h-8 w-8 p-0 text-green-500 hover:text-green-600 hover:bg-green-50"
                        title="Approve"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReject(testimonial.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                        title="Reject"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(testimonial.id)}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-surface rounded-xl border border-dashed border-border">
          <MessageSquare className="h-10 w-10 mx-auto text-text-muted mb-2" />
          <p className="text-xs font-medium text-text-muted">No testimonials found</p>
          <p className="text-[10px] text-text-muted mt-1">
            {searchQuery ? 'Try adjusting your search' : 'Testimonials will appear here once users submit them'}
          </p>
        </div>
      )}

      {/* Pagination */}
      {!loading && totalItems > pageSize && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-[10px] text-text-muted">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-8 text-[10px]"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage * pageSize >= totalItems}
              className="h-8 text-[10px]"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* View Testimonial Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Testimonial Details</DialogTitle>
            <DialogDescription>Full testimonial submitted by the user</DialogDescription>
          </DialogHeader>
          {selectedTestimonial && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                {getStatusBadge(selectedTestimonial.status)}
                {selectedTestimonial.is_public ? (
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200"><Eye className="w-3 h-3 mr-1" /> Public</Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-500 border-gray-200"><EyeOff className="w-3 h-3 mr-1" /> Private</Badge>
                )}
              </div>

              <div className="bg-surface-alt/50 rounded-lg p-4 border border-border">
                <p className="text-sm text-text leading-relaxed italic">"{selectedTestimonial.quote}"</p>
              </div>

              <div className="flex items-center gap-3 text-xs text-text-muted">
                {selectedTestimonial.user ? (
                  <div className="flex items-center gap-2">
                    <img
                      src={selectedTestimonial.user.profile_picture || `https://i.pravatar.cc/100?u=${selectedTestimonial.user.email}`}
                      alt={selectedTestimonial.user.full_name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <p className="font-medium text-text">{selectedTestimonial.user.full_name}</p>
                      <p className="text-[10px]">{selectedTestimonial.user.role} &middot; {selectedTestimonial.user.email}</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="font-medium text-text">{selectedTestimonial.name || 'Anonymous'}</p>
                    {selectedTestimonial.role && <p className="text-[10px]">{selectedTestimonial.role}</p>}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 text-[10px] text-text-muted pt-2 border-t border-border">
                <span>Submitted: {new Date(selectedTestimonial.created_at).toLocaleString()}</span>
                <span>Updated: {new Date(selectedTestimonial.updated_at).toLocaleString()}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SuperAdminTestimonialsPage;
