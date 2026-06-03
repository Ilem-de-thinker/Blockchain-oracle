import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { User } from '../../types';
import { coursesApi } from '../../src/api/courses';
import eventsApi from '../../src/api/events';
import { influencerApi, ActiveCode, DashboardSummary, Referee } from '../../src/api/influencer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ReportActions } from '../../components/ui/ReportActions';
import { GraduationCap, CalendarDays, Copy, ArrowRight, ChartLine, User2, Bell, Settings, Filter, Search, RefreshCcw, Users, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title } from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import WelcomeBanner from '@/components/dashboard/WelcomeBanner';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title);

interface InfluencerDashboardProps {
  user: User | null;
}

const InfluencerDashboard: React.FC<InfluencerDashboardProps> = ({ user }) => {
  const firstName = user?.name?.split(' ')[0] || 'Partner';
  const [metrics, setMetrics] = useState([
    { label: 'Courses Live', value: '...', detail: 'Loading catalog coverage' },
    { label: 'Events Open', value: '...', detail: 'Loading available events' },
    { label: 'Total Referees', value: '...', detail: 'Loading referral data' },
  ]);
  
  const [referralCode, setReferralCode] = useState<ActiveCode | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [referees, setReferees] = useState<Referee[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [refereeFilter, setRefereeFilter] = useState<'all' | 'recent'>('all');
  const [refreshingCode, setRefreshingCode] = useState(false);
  const [conversionFunnel, setConversionFunnel] = useState<Array<{stage: string, count: number}> | null>(null);
  const [refereeActivity, setRefereeActivity] = useState<{active: number, inactive: number} | null>(null);
  const [codeTrends, setCodeTrends] = useState<any[] | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [courses, events, dashboardResponse, refereeResponse, funnelResponse, activityResponse, trendsResponse] = await Promise.allSettled([
          coursesApi.getCourses(),
          eventsApi.getEvents(1, 100),
          influencerApi.getDashboardSummary(),
          influencerApi.getRefereeList(),
          influencerApi.getConversionFunnel(),
          influencerApi.getRefereeActivity(),
          influencerApi.getCodeTrends(),
        ]);

        // Process courses
        const coursesData = courses?.status === 'fulfilled' ? courses.value : { items: [] };
        const publishedCourses = coursesData.items?.filter((course: any) => course.is_published)?.length || 0;

        // Process events
        const eventsData = events?.status === 'fulfilled' ? events.value : { results: [] };
        const publishedEvents = eventsData.results?.filter((event: any) => event.status === 'published')?.length || 0;

        // Process V7 Dashboard Summary
        if (dashboardResponse.status === 'fulfilled') {
          const dash = dashboardResponse.value;
          setDashboardData(dash);
          setReferralCode({
            code: dash.active_code.code,
            created_at: '', // Keep for type safety, though not in summary
            expires_at: '',
            days_remaining: dash.active_code.days_remaining
          });

          setMetrics([
            { label: 'Total Referees', value: dash.summary.total_referees.toString(), detail: 'Users who joined via your referral code' },
            { label: 'Total Purchases', value: dash.summary.total_purchases.toString(), detail: 'Course enrollments from your referrals' },
            { label: 'Courses Live', value: publishedCourses.toString(), detail: 'Published catalog items you can promote' },
          ]);
        }

        if (refereeResponse.status === 'fulfilled') {
          setReferees(refereeResponse.value.referees || []);
        }

        if (funnelResponse.status === 'fulfilled') {
          setConversionFunnel(funnelResponse.value.funnel || []);
        }

        if (activityResponse.status === 'fulfilled') {
          setRefereeActivity({
            active: activityResponse.value.active || 0,
            inactive: activityResponse.value.inactive || 0
          });
        }

        if (trendsResponse.status === 'fulfilled') {
          setCodeTrends(trendsResponse.value.codes || []);
        }
      } catch (err: any) {
        console.error('Failed to load influencer dashboard metrics:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleRefreshCode = async () => {
    try {
      setRefreshingCode(true);
      const data = await influencerApi.refreshReferralCode();
      setReferralCode({
        code: data.referral_code,
        created_at: data.created_at,
        expires_at: data.expires_at,
        days_remaining: Math.ceil((new Date(data.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      });
    } catch (err: any) {
      setError(err.message || 'Failed to refresh code');
    } finally {
      setRefreshingCode(false);
    }
  };

  const filteredReferees = referees.filter((referee) => {
    const matchesSearch =
      !searchQuery ||
      referee.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      referee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      referee.username.toLowerCase().includes(searchQuery.toLowerCase());

    const joinedRecently =
      new Date(referee.date_joined).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000;
    const matchesFilter = refereeFilter === 'all' || joinedRecently;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-bg text-text">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <WelcomeBanner 
          name={firstName}
          message="Track your referral performance and earnings in real-time. We've updated your analytics with new conversion insights!"
          actionText="View Analytics"
          actionLink="/influencer/analytics"
        />
        {/* Header */}
        <div className="mb-6 backdrop-blur-md bg-surface/40 border border-border/50 rounded-xl p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                Influencer Workspace
              </p>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text">
                {firstName}, your partner dashboard is ready.
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-text-muted">
                Track your referrals, monitor payouts, and promote courses with your unique referral code.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <ReportActions disableCsv disableJson />
              <Button asChild size="sm" className="rounded-lg shadow-sm whitespace-nowrap px-3 text-xs sm:text-sm text-white!">
                <Link to="/courses/catalog">
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Browse Courses
                </Link>
              </Button>
              <Button variant="outline" asChild size="sm" className="rounded-lg bg-surface/50 whitespace-nowrap px-3 text-xs sm:text-sm">
                <Link to="/events">
                  <CalendarDays className="w-4 h-4 mr-2" />
                  Upcoming Events
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          {metrics.map((metric) => (
            <div key={metric.label} className="backdrop-blur-sm bg-surface/60 border border-border/50 rounded-lg p-3 shadow-sm transition-all hover:bg-surface/80">
              <p className="text-[9px] uppercase tracking-widest text-text-muted font-bold">{metric.label}</p>
              <p className="mt-1 text-xl font-bold text-text">
                {loading ? <i className="fas fa-circle-notch fa-spin text-lg text-primary"></i> : metric.value}
              </p>
              <p className="mt-0.5 text-[10px] text-text-muted font-medium truncate">{metric.detail}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
          {/* Referral Code & Payouts */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-text-muted">Your Referral Code</p>
                  <CardTitle className="mt-2 text-lg sm:text-xl">Share this code to earn commissions</CardTitle>
                </div>
             
              </div> <p> {referralCode && (
                  <Badge variant={referralCode?.is_expired ? 'destructive' : 'default'}>
                    {referralCode?.is_expired ? 'Expired' : `${referralCode?.days_remaining} days left`}
                  </Badge>
                )}</p> 
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <i className="fas fa-circle-notch fa-spin text-3xl text-primary"></i>
                </div>
              ) : referralCode ? (
                <div className="space-y-4">
                  <div className="rounded-lg border border-primary/30 bg-primary/10 p-4 sm:p-6 text-center">
                    <p className="text-xs sm:text-sm text-primary mb-2">Your Unique Referral Code</p>
                    <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-primary tracking-wider">{referralCode?.code}</p>
                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                      <Button 
                        onClick={() => {
                          navigator.clipboard.writeText(referralCode?.code || '');
                        }}
                        className="shadow-sm text-white!"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Code
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleRefreshCode}
                        isLoading={refreshingCode}
                        className="bg-white/50 border-primary/20 hover:bg-white text-primary"
                      >
                        <RefreshCcw className={cn("w-4 h-4 mr-2", refreshingCode && "animate-spin")} />
                        Refresh Code
                      </Button>
                    </div>
                  </div>
                    <div className="grid gap-3">
                      <div className="rounded-lg border border-border bg-surface p-4 flex flex-row items-center justify-between">
                        <div>
                          <p className="text-[10px] uppercase text-text-muted">Created</p>
                          <p className="text-sm font-semibold text-text">
                            {referralCode ? new Date(referralCode.created_at).toLocaleDateString() : '-'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] uppercase text-text-muted">Expires</p>
                          <p className="text-sm font-semibold text-text">
                            {referralCode ? new Date(referralCode.expires_at).toLocaleDateString() : '-'}
                          </p>
                        </div>
                      </div>
                      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 flex flex-row items-center justify-between">
                        <p className="text-sm font-medium text-text">Days Remaining</p>
                        <p className="text-lg font-black text-primary">{referralCode?.days_remaining ?? 0}</p>
                      </div>
                    </div>
                </div>
              ) : (
                <div className="rounded-lg border border-border bg-surface p-6 text-center">
                  <p className="text-sm text-text-secondary">No referral code found. Contact support if this is unexpected.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payout Summary */}
          <Card>
            <CardHeader>
              <p className="text-xs uppercase tracking-[0.25em] text-text-muted">Payout Summary</p>
              <CardTitle className="mt-2 text-lg sm:text-xl">Your earnings at a glance</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <i className="fas fa-circle-notch fa-spin text-3xl text-primary"></i>
                </div>
              ) : dashboardData ? (
                <div className="space-y-3">
                  <div className="rounded-lg border border-primary/20 bg-primary/10 p-3 sm:p-4">
                    <p className="text-[10px] sm:text-xs text-primary">Total Earnings</p>
                    <p className="mt-1 text-xl sm:text-2xl font-black text-primary">
                      {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(dashboardData.summary.total_earnings)}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-warning/20 bg-warning/10 p-3 sm:p-4">
                      <p className="text-[10px] sm:text-xs text-warning">Pending</p>
                      <p className="mt-1 text-lg sm:text-xl font-black text-warning">
                        {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(dashboardData.summary.pending_payout)}
                      </p>
                    </div>
                    <div className="rounded-lg border border-success/20 bg-success/10 p-3 sm:p-4">
                      <p className="text-[10px] sm:text-xs text-success">Received</p>
                      <p className="mt-1 text-lg sm:text-xl font-black text-success">
                        {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(dashboardData.summary.received_payout)}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-2" asChild>
                    <Link to="/influencer/earnings">
                      <span>View detailed earnings</span>
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="rounded-lg border border-border bg-surface p-6 text-center">
                  <p className="text-sm text-text-secondary">No payout data available yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-text-muted">Referral Network</p>
                <CardTitle className="mt-2 text-lg sm:text-xl">Track referred users and monthly performance</CardTitle>
              </div>
              <Button
                variant={showFilters ? 'default' : 'outline'}
                size="sm"
                className="h-9 w-full sm:w-auto"
                onClick={() => setShowFilters((value) => !value)}
              >
                <Filter className="mr-2 h-3.5 w-3.5" />
                Filters
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search referees by name, email, or username..."
                  className="pl-10"
                />
              </div>
              <Button variant="ghost" size="sm" className="h-9 sm:w-auto" onClick={() => window.location.reload()}>
                <RefreshCcw className="mr-2 h-3.5 w-3.5" />
                Refresh
              </Button>
            </div>

            <div
              className={cn(
                'overflow-hidden transition-all duration-300 ease-in-out',
                showFilters ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'
              )}
            >
              <div className="flex flex-wrap gap-2 border-t border-border pt-3">
                {[
                  { key: 'all', label: 'All Referees' },
                  { key: 'recent', label: 'Last 30 Days' },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setRefereeFilter(item.key as 'all' | 'recent')}
                    className={cn(
                      'rounded-lg border px-3 py-1.5 text-[10px] font-black uppercase transition-all',
                      refereeFilter === item.key ? 'border-primary bg-primary/10 text-primary' : 'border-border text-text-muted'
                    )}
                  >
                    {item.label}
                  </button>
                ))}
                {(searchQuery || refereeFilter !== 'all') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-[10px]"
                    onClick={() => {
                      setSearchQuery('');
                      setRefereeFilter('all');
                    }}
                  >
                    <X className="mr-1 h-3 w-3" />
                    Reset
                  </Button>
                )}
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-2xl border border-border">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <p className="text-sm font-semibold text-text">Referred users</p>
                  </div>
                  <Badge variant="outline">{filteredReferees.length}</Badge>
                </div>
                <div className="divide-y divide-border">
                  {filteredReferees.slice(0, 6).length > 0 ? (
                    filteredReferees.slice(0, 6).map((referee) => (
                      <div key={referee.id} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-text">{referee.full_name}</p>
                          <p className="truncate text-xs text-text-muted">{referee.email}</p>
                        </div>
                        <p className="text-xs font-medium text-text-secondary">
                          {new Date(referee.date_joined).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-sm text-text-muted">No referees match the current filters.</div>
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-border bg-surface-alt/20 p-4">
                <p className="text-xs font-bold text-text-muted/60 uppercase tracking-widest">Monthly performance</p>
                <div className="mt-4 space-y-2">
                  {dashboardData?.monthly_stats?.slice(-4).reverse().map((stat) => (
                    <div key={stat.month} className="rounded-lg border border-border/40 bg-surface/40 p-3 transition-colors hover:bg-surface/60">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">{stat.month}</p>
                        <Badge variant="secondary" className="text-[9px] font-bold px-1.5 h-4 bg-primary/10 text-primary border-none">{stat.new_referees} new</Badge>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-3 text-[11px] text-text-muted">
                        <div>
                          <p className="font-medium">Purchases</p>
                          <p className="text-sm font-bold text-text">{stat.purchases}</p>
                        </div>
                        <div>
                          <p className="font-medium">Earnings</p>
                          <p className="text-sm font-bold text-text">
                            {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(stat.earnings)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )) || <p className="text-sm text-text-muted">No monthly performance data available.</p>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analytics Charts */}
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {/* Conversion Funnel Chart */}
          <Card>
            <CardHeader>
              <p className="text-xs uppercase tracking-[0.25em] text-text-muted">Conversion Funnel</p>
              <CardTitle className="mt-2 text-lg">Referee to Purchase Flow</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <i className="fas fa-circle-notch fa-spin text-2xl text-primary"></i>
                </div>
              ) : conversionFunnel ? (
                <div className="h-48 sm:h-64 min-w-0">
                  <Bar
                    data={{
                      labels: conversionFunnel.map(item => item.stage),
                      datasets: [{
                        label: 'Count',
                        data: conversionFunnel.map(item => item.count),
                        backgroundColor: ['#3b82f6', '#10b981', '#8b5cf6'],
                        borderWidth: 0,
                        borderRadius: 6,
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: {
                        y: { beginAtZero: true, ticks: { font: { size: 10 } }, grid: { color: 'rgba(156,163,175,0.1)' } },
                        x: { ticks: { font: { size: 10 } }, grid: { display: false } }
                      }
                    }}
                  />
                </div>
              ) : (
                <p className="text-sm text-text-muted text-center py-8">No funnel data available</p>
              )}
            </CardContent>
          </Card>

          {/* Referee Activity Doughnut Chart */}
          <Card>
            <CardHeader>
              <p className="text-xs uppercase tracking-[0.25em] text-text-muted">Referee Activity</p>
              <CardTitle className="mt-2 text-lg">Active vs Inactive</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <i className="fas fa-circle-notch fa-spin text-2xl text-primary"></i>
                </div>
              ) : refereeActivity ? (
                <div className="h-48 sm:h-64 flex items-center justify-center min-w-0">
                  <div className="w-full max-w-[200px]">
                    <Doughnut
                      data={{
                        labels: ['Active', 'Inactive'],
                        datasets: [{
                          data: [refereeActivity.active, refereeActivity.inactive],
                          backgroundColor: ['#10b981', '#ef4444'],
                          borderWidth: 0,
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: { color: '#6b7280', font: { size: 10 } }
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              ) : (
                <p className="text-sm text-text-muted text-center py-8">No activity data available</p>
              )}
            </CardContent>
          </Card>

          {/* Code Performance Trends Line Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <p className="text-xs uppercase tracking-[0.25em] text-text-muted">Code Performance</p>
              <CardTitle className="mt-2 text-lg">Monthly Signup Trends</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <i className="fas fa-circle-notch fa-spin text-2xl text-primary"></i>
                </div>
              ) : codeTrends && codeTrends.length > 0 ? (
                <div className="h-48 sm:h-64 min-w-0">
                  <Line
                    data={{
                      labels: (() => {
                        const allMonths = [...new Set(codeTrends.flatMap(c => (c.monthly || []).map((m: any) => m.month)))].sort();
                        return allMonths;
                      })(),
                      datasets: codeTrends.map((code: any, idx: number) => {
                        const allMonths = [...new Set(codeTrends.flatMap(c => (c.monthly || []).map((m: any) => m.month)))].sort();
                        const monthMap: Record<string, number> = {};
                        (code.monthly || []).forEach((m: any) => { monthMap[m.month] = m.referees; });
                        return {
                          label: code.code,
                          data: allMonths.map(m => monthMap[m] || 0),
                          borderColor: ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'][idx % 4],
                          backgroundColor: 'transparent',
                          tension: 0.3,
                        };
                      })
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          labels: { color: '#6b7280', font: { size: 10 } }
                        }
                      },
                      scales: {
                        y: { beginAtZero: true, ticks: { font: { size: 10 } }, grid: { color: 'rgba(156,163,175,0.1)' } },
                        x: { ticks: { font: { size: 10 } }, grid: { display: false } }
                      }
                    }}
                  />
                </div>
              ) : (
                <p className="text-sm text-text-muted text-center py-8">No trend data available</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <div className="mt-6 backdrop-blur-md bg-surface/40 border border-border/50 rounded-xl p-6 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-4">Quick Access</p>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="justify-between h-auto py-3 bg-surface/50 border-border/40 hover:bg-surface/80 rounded-lg group" asChild>
              <Link to="/influencer/analytics">
                <span className="flex items-center gap-3">
                  <ChartLine className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold text-text/80">Analytics</span>
                </span>
                <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors" />
              </Link>
            </Button>
            <Button variant="outline" className="justify-between h-auto py-3 bg-surface/50 border-border/40 hover:bg-surface/80 rounded-lg group" asChild>
              <Link to="/influencer/profile">
                <span className="flex items-center gap-3">
                  <User2 className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold text-text/80">Profile</span>
                </span>
                <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors" />
              </Link>
            </Button>
            <Button variant="outline" className="justify-between h-auto py-3 bg-surface/50 border-border/40 hover:bg-surface/80 rounded-lg group" asChild>
              <Link to="/influencer/notifications">
                <span className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold text-text/80">Notifications</span>
                </span>
                <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors" />
              </Link>
            </Button>
            <Button variant="outline" className="justify-between h-auto py-3 bg-surface/50 border-border/40 hover:bg-surface/80 rounded-lg group" asChild>
              <Link to="/influencer/settings">
                <span className="flex items-center gap-3">
                  <Settings className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold text-text/80">Settings</span>
                </span>
                <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default InfluencerDashboard;
