import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ThemeLink } from '@/components/ui/theme-link';
import { ButtonLink } from '@/components/ui/button-link';
import { User } from '../../types';
import { contributorApi, ContributorReferralCode, ContributorUser } from '../../src/api/contributor';
import { analyticsApi } from '../../src/api/analytics';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { ReportActions } from '../../components/ui/ReportActions';
import { cn } from '@/lib/utils';
import WelcomeBanner from '@/components/dashboard/WelcomeBanner';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title } from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { UserPlus, Users, X, RefreshCw, Filter, ArrowRight } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title);

interface ContributorDashboardProps {
  user: User | null;
}

const ContributorDashboard: React.FC<ContributorDashboardProps> = ({ user }) => {
  const firstName = user?.name?.split(' ')[0] || 'Partner';
  const [metrics, setMetrics] = useState([
    { label: 'Referral Code', value: '...', detail: 'Loading your code' },
    { label: 'Users Created', value: '...', detail: 'Loading user count' },
    { label: 'Active Users', value: '...', detail: 'Loading active users' },
  ]);

  const [referralCode, setReferralCode] = useState<ContributorReferralCode | null>(null);
  const [createdUsers, setCreatedUsers] = useState<ContributorUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userFilter, setUserFilter] = useState<'all' | 'recent'>('all');

  const [dashboardSummary, setDashboardSummary] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [userActivity, setUserActivity] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const [referralCodeData, usersData, summaryData, analyticsDataResult, activityData] = await Promise.allSettled([
          contributorApi.getReferralCode(),
          contributorApi.getCreatedUsers(),
          analyticsApi.getContributorDashboardSummary(),
          analyticsApi.getContributorAnalytics(),
          analyticsApi.getContributorUserActivity(),
        ]);

        const referralData = referralCodeData.status === 'fulfilled' ? referralCodeData.value : null;
        setReferralCode(referralData);

        const users = usersData.status === 'fulfilled' ? usersData.value : { total_count: 0, created_users: [] };
        setCreatedUsers(users.created_users || []);

        if (summaryData.status === 'fulfilled') {
          const summary = summaryData.value;
          setDashboardSummary(summary);
          setMetrics([
            { label: 'Users Created', value: summary.total_created?.toString() || '0', detail: 'Total users created via your code' },
            { label: 'Active Users', value: summary.active_users?.toString() || '0', detail: 'Active users created by you' },
            { label: 'This Month', value: summary.this_month?.toString() || '0', detail: 'New users this month' },
          ]);
        } else {
          const totalUsers = users.total_count || 0;
          const activeUsers = users.created_users?.filter((u: ContributorUser) => new Date(u.date_joined) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length || 0;
          setMetrics([
            { label: 'Referral Code', value: referralData?.referral_code || 'N/A', detail: 'Your unique code' },
            { label: 'Users Created', value: totalUsers.toString(), detail: 'Total users created' },
            { label: 'Active Users', value: activeUsers.toString(), detail: 'Recent active users' },
          ]);
        }

        if (analyticsDataResult.status === 'fulfilled') setAnalyticsData(analyticsDataResult.value);
        if (activityData.status === 'fulfilled') setUserActivity(activityData.value);
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filteredUsers = createdUsers.filter((createdUser) => {
    const matchesSearch =
      !searchQuery ||
      createdUser.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      createdUser.email.toLowerCase().includes(searchQuery.toLowerCase());
    const recentThreshold = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const matchesFilter = userFilter === 'all' || new Date(createdUser.date_joined).getTime() > recentThreshold;
    return matchesSearch && matchesFilter;
  });

  const roleDistributionData = useMemo(() => {
    const data = analyticsData?.by_role || dashboardSummary?.by_role || {};
    return {
      labels: Object.keys(data).map(role => role.charAt(0) + role.slice(1).toLowerCase()),
      datasets: [{ data: Object.values(data), backgroundColor: ['#9333ea', '#22c55e', '#3b82f6'], borderWidth: 0 }],
    };
  }, [analyticsData, dashboardSummary]);

  const monthlyGrowthData = useMemo(() => {
    const rawData = analyticsData?.monthly_growth || [];
    const dataMap = new Map(rawData.map((item: any) => [item.month, item.count]));
    
    const points = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthKey = d.toISOString().slice(0, 7);
      points.push({
        label: d.toLocaleString('default', { month: 'short', year: '2-digit' }),
        value: dataMap.get(monthKey) || 0
      });
    }

    return {
      labels: points.map(p => p.label),
      datasets: [{
        label: 'Users Created',
        data: points.map(p => p.value),
        borderColor: '#9333ea',
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#9333ea',
      }],
    };
  }, [analyticsData]);

  const activityDataChart = useMemo(() => {
    if (!userActivity) return null;
    return {
      labels: ['Active', 'Inactive'],
      datasets: [{ data: [userActivity.active || 0, userActivity.inactive || 0], backgroundColor: ['#22c55e', '#ef4444'], borderWidth: 0 }],
    };
  }, [userActivity]);

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="min-h-screen bg-bg text-text text-sm"
    >
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <WelcomeBanner 
          name={user?.name?.split(' ')[0] || 'Partner'} 
          message="Review your network growth and track performance metrics. You've successfully added 3 new members this week!"
          actionText="View My Users"
          actionLink="/contributor/my-users"
        />
        {/* Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                  Contributor Workspace
                </p>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text">
                  Welcome back, {firstName}
                </h1>
                <p className="mt-1 text-sm text-text-muted">
                  Manage your network and track performance.
                </p>
              </div>
              <div className="flex gap-2">
                <ReportActions disableCsv disableJson />
                <ButtonLink to="/contributor/create-users" variant="default" size="sm">
                  <UserPlus className="w-4 h-4 mr-1.5" /> Create Users
                </ButtonLink>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metrics */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {metrics.map((m) => (
            <Card key={m.label}>
              <CardContent className="p-4">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{m.label}</p>
                {loading ? (
                  <Skeleton className="mt-1 h-8 w-24" />
                ) : (
                  <p className="text-xl font-black mt-1">{m.value}</p>
                )}
                <p className="text-[10px] text-text-muted mt-0.5">{m.detail}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-5">
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-4">User Growth Trend</p>
              {loading ? (
                <Skeleton className="h-48 w-full rounded-2xl" />
              ) : (
                <div className="h-48">
                  <Line data={monthlyGrowthData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} />
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-4">Role Distribution</p>
              {loading ? (
                <Skeleton className="h-48 w-48 rounded-full mx-auto" />
              ) : (
                <div className="h-48 flex justify-center">
                  <Doughnut data={roleDistributionData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* User List */}
        <Card className="mt-6">
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-text-muted">Network</p>
                <CardTitle className="mt-1 text-lg sm:text-xl">Created Users</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:min-w-[200px]">
                  <Input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search by name or email..."
                    className="pl-4"
                  />
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)}>
                  <Filter className="w-4 h-4 mr-1" /> Filter
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {showFilters && (
              <div className="mb-4 flex flex-wrap gap-2">
                {[
                  { key: 'all', label: 'All Users' },
                  { key: 'recent', label: 'Last 30 Days' },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setUserFilter(item.key as 'all' | 'recent')}
                    className={cn(
                      'rounded-2xl border px-3 py-1.5 text-[10px] font-black uppercase transition-all',
                      userFilter === item.key ? 'border-primary bg-primary/10 text-primary' : 'border-border text-text-muted'
                    )}
                  >
                    {item.label}
                  </button>
                ))}
                {(searchQuery || userFilter !== 'all') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-[10px]"
                    onClick={() => {
                      setSearchQuery('');
                      setUserFilter('all');
                    }}
                  >
                    <X className="mr-1 h-3 w-3" />
                    Reset
                  </Button>
                )}
              </div>
            )}

            {filteredUsers.length > 0 ? (
              <div className="divide-y divide-border">
                {filteredUsers.slice(0, 8).map((u) => (
                  <div key={u.id} className="flex flex-col gap-1 px-1 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback>
                          {u.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-text">{u.full_name}</p>
                        <p className="truncate text-xs text-text-muted">{u.email}</p>
                      </div>
                    </div>
                    <p className="text-xs font-medium text-text-secondary">
                      {formatDate(u.date_joined)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <Users className="h-10 w-10 text-text-muted/40" />
                <div>
                  <p className="text-sm font-medium text-text-muted">
                    {loading ? 'Loading users...' : 'No users yet'}
                  </p>
                  {!loading && (
                    <p className="text-xs text-text-muted/60 mt-1">
                      Start creating users to build your network.
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default ContributorDashboard;
