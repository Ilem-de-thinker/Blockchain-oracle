import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import eventsApi, { EventApplication, Event } from '../../../src/api/events';
import { useToast } from '../../../src/hooks/useToast';
import { 
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell 
} from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';

const EventApplicationsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const basePath = location.pathname.startsWith('/super-admin') ? '/super-admin' : '/admin';

  const [event, setEvent] = useState<Event | null>(null);
  const [applications, setApplications] = useState<EventApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;
    loadData(parseInt(id));
  }, [id]);

  const loadData = async (eventId: number) => {
    try {
      setLoading(true);
      const [eventData, appsData] = await Promise.all([
        eventsApi.getEvent(eventId),
        eventsApi.getEventApplications(eventId),
      ]);
      setEvent(eventData);
      setApplications(appsData.results || []);
      setError(null);
    } catch (err: any) {
      if (err?.response?.status === 403) {
        setError('You do not have permission to view applications for this event.');
      } else {
        setError('Failed to load event applications.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (applicationId: number, status: 'accepted' | 'rejected') => {
    setUpdatingId(applicationId);
    try {
      await eventsApi.updateApplicationStatus(applicationId, status);
      toast.success(`Application ${status} successfully.`);
      if (id) loadData(parseInt(id));
    } catch (err: any) {
      if (err?.response?.status === 403) {
        toast.error('Only an organizer or staff member can update applications.');
      } else {
        toast.error(`Failed to ${status} application.`);
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredApplications = filter === 'all'
    ? applications
    : applications.filter((app) => app.status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-emerald-100 text-emerald-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      default: return 'bg-surface-hover text-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === 'pending').length,
    accepted: applications.filter((a) => a.status === 'accepted').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <i className="fas fa-circle-notch fa-spin text-3xl text-emerald-600"></i>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-text-muted mb-6">
        <Link to={basePath} className="hover:text-emerald-600">Dashboard</Link>
        <i className="fas fa-chevron-right text-xs"></i>
        <Link to={`${basePath}/events`} className="hover:text-emerald-600">Events</Link>
        <i className="fas fa-chevron-right text-xs"></i>
        <span className="text-text font-medium">Applications</span>
      </div>

      {/* Event Header */}
      {event && (
        <div className="bg-surface rounded-xl border border-border p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-text">{event.title}</h1>
              <p className="text-sm text-text-muted mt-1">
                {new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                {' · '}{event.is_online ? (event.event_url || 'Online event') : (event.location || 'Venue TBD')}
              </p>
            </div>
            <button
              onClick={() => navigate(`${basePath}/events/${event.id}`)}
              className="px-4 py-2 rounded-lg border border-border text-gray-700 text-sm font-medium hover:bg-bg transition-colors"
            >
              <i className="fas fa-arrow-left mr-2"></i>Back to Event
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: stats.total, icon: 'fa-users', color: 'text-gray-700' },
          { label: 'Pending', value: stats.pending, icon: 'fa-clock', color: 'text-amber-600' },
          { label: 'Accepted', value: stats.accepted, icon: 'fa-check-circle', color: 'text-emerald-600' },
          { label: 'Rejected', value: stats.rejected, icon: 'fa-times-circle', color: 'text-red-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-surface rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-bg flex items-center justify-center">
                <i className={`fas ${stat.icon} ${stat.color}`}></i>
              </div>
              <div>
                <p className="text-2xl font-bold text-text">{stat.value}</p>
                <p className="text-xs text-text-muted">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 mb-6">{error}</div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4">
        {['all', 'pending', 'accepted', 'rejected'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === f
                ? 'bg-emerald-600 text-white'
                : 'bg-surface border border-border text-gray-700 hover:bg-bg'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Applications Table */}
      <Table variant="striped" className="bg-surface rounded-xl border border-border overflow-hidden">
        <TableHeader>
          <TableRow>
            <TableHead>Applicant</TableHead>
            <TableHead>Applied</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredApplications.map((app) => (
            <TableRow key={app.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-emerald-700">
                      {(app.user?.full_name?.charAt(0) || '?').toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text">{app.user?.full_name || 'Unknown'}</p>
                    <p className="text-xs text-text-muted">{app.user?.email || '—'}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-gray-700">{formatDate(app.applied_at)}</TableCell>
              <TableCell>
                <Badge variant={app.status === 'accepted' ? 'success' : app.status === 'rejected' ? 'destructive' : 'warning'} className="capitalize">
                  {app.status}
                </Badge>
              </TableCell>
              <TableCell>
                {app.status === 'pending' ? (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleUpdateStatus(app.id, 'accepted')}
                      disabled={updatingId === app.id}
                    >
                      <i className="fas fa-check mr-1"></i>Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleUpdateStatus(app.id, 'rejected')}
                      disabled={updatingId === app.id}
                    >
                      <i className="fas fa-times mr-1"></i>Reject
                    </Button>
                  </div>
                ) : (
                  <span className="text-xs text-gray-400">No actions</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {filteredApplications.length === 0 && !error && (
        <div className="text-center py-12">
          <div className="w-12 h-12 rounded-full bg-surface-hover flex items-center justify-center mx-auto mb-3">
            <i className="fas fa-inbox text-gray-400 text-lg"></i>
          </div>
          <p className="text-sm font-medium text-text">No applications found</p>
          <p className="text-xs text-text-muted mt-1">
            {filter !== 'all' ? 'Try changing the filter.' : 'No one has applied to this event yet.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default EventApplicationsPage;
