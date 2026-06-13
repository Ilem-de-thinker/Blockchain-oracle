import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { User } from '../../../types';
import eventsApi, { EventApplication } from '../../../src/api/events';
import { useToast } from '../../../src/hooks/useToast';
import { 
  Calendar, 
  MapPin, 
  Video, 
  User as UserIcon, 
  Clock, 
  ArrowLeft, 
  ChevronRight, 
  Info, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  History,
  ExternalLink,
  List
} from 'lucide-react';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { cn } from '@/lib/utils';

const RegistrationDetailPage: React.FC<{ user: User | null }> = ({ user }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [registration, setRegistration] = useState<EventApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    if (!id || id === 'undefined') {
      setError('Invalid registration ID.');
      setLoading(false);
      return;
    }
    const regId = parseInt(id);
    if (isNaN(regId)) {
      setError('Invalid registration ID.');
      setLoading(false);
      return;
    }
    loadRegistration(regId);
  }, [id]);

  const loadRegistration = async (regId: number) => {
    try {
      setLoading(true);
      const data = await eventsApi.getRegistrationDetail(regId);
      setRegistration(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load registration details.');
    } finally {
      setLoading(false);
    }
  };


  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'accepted':
      case 'approved':
        return <Badge variant="success" className="text-xs font-bold uppercase"><CheckCircle className="h-3 w-3 mr-1" />Accepted</Badge>;
      case 'pending':
      case 'under_review':
        return <Badge variant="warning" className="text-xs font-bold uppercase"><AlertCircle className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="text-xs font-bold uppercase"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline" className="text-xs font-bold uppercase">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'TBD';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'TBD';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-text-secondary">Loading registration details...</p>
        </div>
      </div>
    );
  }

  if (error || !registration) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-900 mb-2">Registration Error</h2>
          <p className="text-red-700 mb-6">{error || 'Registration not found'}</p>
          <Button onClick={() => navigate('/dashboard/registrations')} variant="outline" className="border-red-200 text-red-700 hover:bg-red-100">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to My Events
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-text-muted">
        <Link to="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/dashboard/registrations" className="hover:text-primary transition-colors">My Events</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-text font-bold">Registration Detail</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 bg-surface p-4 sm:p-6 rounded-3xl border border-border shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary/10 flex items-center justify-center overflow-hidden shrink-0 border border-primary/20">
            {registration.event?.image_url ? (
              <img src={registration.event.image_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <Calendar className="h-8 w-8 text-primary" />
            )}
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-black text-text tracking-tight pr-8">{registration.event?.title || 'Event Registration'}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs font-mono text-text-secondary bg-surface-alt px-2 py-0.5 rounded-lg border border-border">#{registration.id}</span>
              {getStatusBadge(registration.status)}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {/* {registration.status === 'pending' && (
            <Button
              onClick={handleCancelNotSupported}
              variant="outline"
              size="sm"
              className="h-9 px-4 text-xs font-bold border-red-200 text-red-600 hover:bg-red-50 rounded-xl"
            >
              <XCircle className="h-3.5 w-3.5 mr-2" />
              Cancel
            </Button>
          )} */}
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/registrations')} className="h-9 px-4 text-xs font-bold rounded-xl">
            <ArrowLeft className="h-3.5 w-3.5 mr-2" />
            Back
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Info Card */}
          <Card className="rounded-3xl border-border shadow-sm overflow-hidden">
            <CardHeader className="bg-surface-alt/50 border-b border-border/50 py-4">
              <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                Event Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary mb-0.5">Scheduled Date</p>
                      <p className="text-sm font-bold text-text">{formatDate(registration.event?.date || '')}</p>
                      <p className="text-xs text-text-secondary mt-0.5 flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        {new Date(registration.event?.date || '').toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                      {registration.event?.is_online ? <Video className="h-4 w-4 text-emerald-600" /> : <MapPin className="h-4 w-4 text-emerald-600" />}
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary mb-0.5">Location</p>
                      <p className="text-sm font-bold text-text">
                        {registration.event?.is_online ? 'Virtual Session' : (registration.event?.location || 'Venue TBD')}
                      </p>
                      {registration.event?.is_online && registration.event?.event_url && (
                        <a href={registration.event.event_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 mt-1 font-medium">
                          Join Link <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary mb-1">About the Event</p>
                    <p className="text-xs text-text-secondary leading-relaxed line-clamp-4">
                      {registration.event?.description || 'No description available for this event.'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Application Data */}
          <Card className="rounded-3xl border-border shadow-sm overflow-hidden">
            <CardHeader className="bg-surface-alt/50 border-b border-border/50 py-4">
              <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-primary" />
                Applicant Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full border-2 border-primary/20 p-0.5">
                    <img 
                      src={registration.user?.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(registration.user?.full_name || 'U')}&background=7c3aed&color=fff`} 
                      alt="" 
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-black text-text">{registration.user?.full_name}</p>
                    <p className="text-xs text-text-secondary font-medium">{registration.user?.email}</p>
                  </div>
                </div>
                <div className="h-px sm:h-8 w-full sm:w-px bg-border" />
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Registration Date</p>
                  <p className="text-xs font-bold text-text">{formatDateTime(registration.applied_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column / Sidebar */}
        <div className="space-y-6">
          {/* Status Timeline Card */}
          <Card className="rounded-3xl border-border shadow-sm">
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <History className="h-4 w-4 text-primary" />
                Status Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="relative pl-6 pb-6 border-l-2 border-emerald-500">
                  <div className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.1)]" />
                  <p className="text-xs font-black uppercase tracking-wider text-emerald-600">Application Submitted</p>
                  <p className="text-[11px] text-text-secondary mt-0.5">{formatDateTime(registration.applied_at)}</p>
                </div>
                
                <div className={cn(
                  "relative pl-6",
                  registration.status !== 'pending' ? "border-l-2 border-primary" : "border-l-2 border-border"
                )}>
                  <div className={cn(
                    "absolute -left-[7px] top-0 w-3 h-3 rounded-full",
                    registration.status === 'pending' ? "bg-amber-500 shadow-[0_0_0_4px_rgba(245,158,11,0.1)]" : 
                    registration.status === 'rejected' ? "bg-red-500 shadow-[0_0_0_4px_rgba(239,68,68,0.1)]" :
                    "bg-primary shadow-[0_0_0_4px_rgba(124,58,237,0.1)]"
                  )} />
                  <p className={cn(
                    "text-xs font-black uppercase tracking-wider",
                    registration.status === 'pending' ? "text-amber-600" :
                    registration.status === 'rejected' ? "text-red-600" : "text-primary"
                  )}>
                    {registration.status === 'pending' ? 'Decision Pending' : `Decision: ${registration.status}`}
                  </p>
                  <p className="text-[11px] text-text-secondary mt-0.5">
                    {registration.status === 'pending' ? 'Awaiting administrative review' : `Updated on ${formatDateTime(registration.updated_at || registration.applied_at)}`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links Card */}
          <Card className="rounded-3xl border-border shadow-sm bg-surface-alt/30">
            <CardContent className="p-6 space-y-3">
              {/* <Link to={`/dashboard/events/${registration.event?.id}`} className="block">
                <Button variant="outline" className="w-full h-11 rounded-xl text-xs font-bold gap-2">
                  <ExternalLink className="h-3.5 w-3.5" />
                  View Original Event
                </Button>
              </Link> */}
              <Button onClick={() => navigate('/dashboard/registrations')} variant="default" className="w-full h-11 rounded-xl text-xs font-bold gap-2 text-white">
                <List className="h-3.5 w-3.5" />
                All Registrations
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RegistrationDetailPage;
