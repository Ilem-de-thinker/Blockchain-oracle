import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ThemeLink } from '@/components/ui/theme-link';
import { ButtonLink } from '@/components/ui/button-link';
import { User } from '../../types';
import { contributorApi, ContributorReferralCode, ContributorUser } from '../../src/api/contributor';
import { analyticsApi } from '../../src/api/analytics';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { ReportActions } from '../../components/ui/ReportActions';
import { cn } from '@/lib/utils';
import WelcomeBanner from '@/components/dashboard/WelcomeBanner';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title } from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { UserPlus, Users, X, RefreshCw, Filter, Search, ArrowRight } from 'lucide-react';

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
    <div className="min-h-screen bg-bg text-text text-sm">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <WelcomeBanner 
          name={user?.name?.split(' ')[0] || 'Partner'} 
          message="Review your network growth and track performance metrics. You've successfully added 3 new members this week!"
          actionText="View My Users"
          actionLink="/contributor/my-users"
        />
        {/* Header */}
        <header className="mb-6 border-b border-border pb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Contributor Dashboard</h1>
            <p className="text-xs text-text-muted mt-1">Manage your network and track performance.</p>
          </div>
          <div className="flex gap-2">
            <ReportActions disableCsv disableJson />
            <ButtonLink to="/contributor/create-users" variant="default" size="sm" className="h-8 text-xs">
              <UserPlus className="w-3 h-3 mr-1.5" /> Create
            </ButtonLink>
          </div>
        </header>

        {/* Metrics */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {metrics.map((m) => (
            <div key={m.label} className="border border-border p-4 rounded-lg bg-surface">
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{m.label}</p>
              <p className="text-xl font-black mt-1">{loading ? '...' : m.value}</p>
              <p className="text-[10px] text-text-muted mt-0.5">{m.detail}</p>
            </div>
          ))}
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="border border-border p-4 rounded-lg bg-surface">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-4">User Growth Trend</p>
            <div className="h-48">
              <Line data={monthlyGrowthData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} />
            </div>
          </div>
          <div className="border border-border p-4 rounded-lg bg-surface">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-4">Role Distribution</p>
            <div className="h-48 flex justify-center">
              <Doughnut data={roleDistributionData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }} />
            </div>
          </div>
        </div>

        {/* User Table */}
        <div className="mt-6 border border-border rounded-lg overflow-hidden bg-surface">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Created Users</p>
            <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)} className="h-7 text-[10px]">
              <Filter className="w-3 h-3 mr-1" /> Filter
            </Button>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-bg text-text-muted border-b border-border">
              <tr>
                <th className="px-4 py-2 font-semibold uppercase">Full Name</th>
                <th className="px-4 py-2 font-semibold uppercase">Email</th>
                <th className="px-4 py-2 font-semibold uppercase">Date Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.slice(0, 8).map((u) => (
                <tr key={u.id} className="hover:bg-bg transition-colors">
                  <td className="px-4 py-2.5 font-medium">{u.full_name}</td>
                  <td className="px-4 py-2.5 text-text-muted">{u.email}</td>
                  <td className="px-4 py-2.5 text-text-muted">{formatDate(u.date_joined)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default ContributorDashboard;
