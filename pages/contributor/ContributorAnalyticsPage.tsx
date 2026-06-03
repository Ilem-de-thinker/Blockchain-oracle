import React, { useEffect, useState, useMemo } from 'react';
import { User } from '../../types';
import { analyticsApi } from '../../src/api/analytics';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title } from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { ReportActions } from '../../components/ui/ReportActions';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title);

interface ContributorAnalyticsPageProps {
  user: User | null;
}

const ContributorAnalyticsPage: React.FC<ContributorAnalyticsPageProps> = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [dashboardSummary, setDashboardSummary] = useState<any>(null);
  const [userActivity, setUserActivity] = useState<any>(null);
  const [geographyData, setGeographyData] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [analytics, summary, activity, geography] = await Promise.allSettled([
          analyticsApi.getContributorAnalytics(),
          analyticsApi.getContributorDashboardSummary(),
          analyticsApi.getContributorUserActivity(),
          analyticsApi.getContributorGeography(),
        ]);

        if (analytics.status === 'fulfilled') setAnalyticsData(analytics.value);
        if (summary.status === 'fulfilled') setDashboardSummary(summary.value);
        if (activity.status === 'fulfilled') setUserActivity(activity.value);
        if (geography.status === 'fulfilled') setGeographyData(geography.value);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Monthly Growth Line Chart Data (multiple months)
  const monthlyGrowthData = useMemo(() => {
    const rawData = analyticsData?.monthly_growth || [];
    const dataMap = new Map(rawData.map((item: any) => [item.month, item.count]));
    
    const points = [];
    for (let i = 11; i >= 0; i--) {
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
      datasets: [
        {
          label: 'Users Created',
          data: points.map(p => p.value),
          borderColor: '#9333ea',
          backgroundColor: 'rgba(147, 51, 234, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#9333ea',
        },
      ],
    };
  }, [analyticsData]);

  // Role Distribution Doughnut Chart
  const roleDistributionData = useMemo(() => {
    const data = analyticsData?.by_role || dashboardSummary?.by_role || {};
    return {
      labels: Object.keys(data).map((role: string) => role.charAt(0) + role.slice(1).toLowerCase()),
      datasets: [{ data: Object.values(data), backgroundColor: ['#9333ea', '#22c55e', '#3b82f6'], borderWidth: 0 }],
    };
  }, [analyticsData, dashboardSummary]);

  // Active vs Inactive Doughnut
  const activityChartData = useMemo(() => {
    if (!userActivity) return null;
    return {
      labels: ['Active', 'Inactive'],
      datasets: [{ data: [userActivity.active || 0, userActivity.inactive || 0], backgroundColor: ['#22c55e', '#ef4444'], borderWidth: 0 }],
    };
  }, [userActivity]);

  // Per-Code Bar Chart
  const perCodeChartData = useMemo(() => {
    const byCode = analyticsData?.by_code || [];
    return {
      labels: byCode.map((item: any) => item.code),
      datasets: [{ label: 'Users', data: byCode.map((item: any) => item.user_count), backgroundColor: '#9333ea', borderRadius: 4 }],
    };
  }, [analyticsData]);

  // Geography State Bar Chart
  const stateGeoData = useMemo(() => {
    const byState = geographyData?.by_state || [];
    return {
      labels: byState.map((item: any) => item.state),
      datasets: [{ label: 'Users', data: byState.map((item: any) => item.count), backgroundColor: '#3b82f6', borderRadius: 4 }],
    };
  }, [geographyData]);

  // Geography Country Bar Chart
  const countryGeoData = useMemo(() => {
    const byCountry = geographyData?.by_country || [];
    return {
      labels: byCountry.map((item: any) => item.country),
      datasets: [{ label: 'Users', data: byCountry.map((item: any) => item.count), backgroundColor: '#22c55e', borderRadius: 4 }],
    };
  }, [geographyData]);

  // Active by Role Stacked Data
  const activeByRoleData = useMemo(() => {
    if (!userActivity?.by_role) return null;
    const roles = Object.keys(userActivity.by_role);
    return {
      labels: roles.map((role: string) => role.charAt(0) + role.slice(1).toLowerCase()),
      datasets: [
        { label: 'Active', data: roles.map((role: string) => userActivity.by_role[role]?.active || 0), backgroundColor: '#22c55e', borderRadius: 4 },
        { label: 'Inactive', data: roles.map((role: string) => userActivity.by_role[role]?.inactive || 0), backgroundColor: '#ef4444', borderRadius: 4 },
      ],
    };
  }, [userActivity]);

  const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, position: 'bottom' as const } }, scales: { y: { beginAtZero: true } } };
  const lineOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } };
  const stackedOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, position: 'bottom' as const } }, scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } } };

  const renderLoading = () => (
    <div className="flex items-center justify-center py-16">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg text-text">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="app-surface mb-6 rounded-[28px] border border-white/10 bg-surface/5 p-6 sm:p-8 flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-blue-400">Contributor Workspace</p>
            <h1 className="mt-2 text-xl sm:text-2xl lg:text-3xl font-black tracking-tight">Analytics</h1>
            <p className="mt-2 sm:mt-3 max-w-2xl text-xs sm:text-sm text-text-secondary">Detailed analytics for your user creation performance.</p>
          </div>
          <ReportActions />
        </div>

        {/* KPI Cards */}
        <div className="grid gap-3 sm:gap-4 md:grid-cols-4">
          <div className="app-surface rounded-[24px] border border-white/10 bg-surface/5 p-4 sm:p-5">
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-text-muted">Total Created</p>
            <p className="mt-2 text-2xl sm:text-3xl font-black text-blue-400">
              {loading ? '...' : dashboardSummary?.total_created || analyticsData?.total_created_users || 0}
            </p>
          </div>
          <div className="app-surface rounded-[24px] border border-white/10 bg-surface/5 p-4 sm:p-5">
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-text-muted">Active Users</p>
            <p className="mt-2 text-2xl sm:text-3xl font-black text-emerald-400">
              {loading ? '...' : dashboardSummary?.active_users || userActivity?.active || 0}
            </p>
          </div>
          <div className="app-surface rounded-[24px] border border-white/10 bg-surface/5 p-4 sm:p-5">
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-text-muted">This Month</p>
            <p className="mt-2 text-2xl sm:text-3xl font-black text-blue-400">
              {loading ? '...' : dashboardSummary?.this_month || 0}
            </p>
          </div>
          <div className="app-surface rounded-[24px] border border-white/10 bg-surface/5 p-4 sm:p-5">
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-text-muted">Conversion Rate</p>
            <p className="mt-2 text-2xl sm:text-3xl font-black text-amber-400">
              {loading ? '...' : `${dashboardSummary?.conversion_to_paid || 0}%`}
            </p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {/* Monthly Growth Line Chart */}
          <div className="border border-border rounded-lg bg-surface p-5">
            <p className="mb-4 text-[10px] font-bold text-text-muted uppercase tracking-wider">User Growth Trend</p>
            {loading ? renderLoading() : monthlyGrowthData.labels.length > 0 ? (
              <div className="h-64"><Line data={monthlyGrowthData} options={{ ...lineOptions, maintainAspectRatio: false }} /></div>
            ) : <div className="py-16 text-center text-text-muted">No growth data yet.</div>}
          </div>

          {/* Role Distribution */}
          <div className="border border-border rounded-lg bg-surface p-5">
            <p className="mb-4 text-[10px] font-bold text-text-muted uppercase tracking-wider">Role Distribution</p>
            {loading ? renderLoading() : roleDistributionData.labels.length > 0 ? (
              <div className="h-64"><Doughnut data={roleDistributionData} options={{ ...chartOptions, maintainAspectRatio: false }} /></div>
            ) : <div className="py-16 text-center text-text-muted">No role data yet.</div>}
          </div>

          {/* Active vs Inactive */}
          <div className="border border-border rounded-lg bg-surface p-5">
            <p className="mb-4 text-[10px] font-bold text-text-muted uppercase tracking-wider">User Activity</p>
            {loading ? renderLoading() : activityChartData ? (
              <div className="h-64"><Doughnut data={activityChartData} options={{ ...chartOptions, maintainAspectRatio: false }} /></div>
            ) : <div className="py-16 text-center text-text-muted">No activity data yet.</div>}
          </div>

          {/* Per-Code Bar Chart */}
          <div className="border border-border rounded-lg bg-surface p-5">
            <p className="mb-4 text-[10px] font-bold text-text-muted uppercase tracking-wider">Users per Code</p>
            {loading ? renderLoading() : perCodeChartData.labels.length > 0 ? (
              <div className="h-64"><Bar data={perCodeChartData} options={{ ...chartOptions, maintainAspectRatio: false }} /></div>
            ) : <div className="py-16 text-center text-text-muted">No code data yet.</div>}
          </div>

          {/* Active by Role Stacked Bar */}
          {activeByRoleData && (
            <div className="border border-border rounded-lg bg-surface p-5 lg:col-span-2">
              <p className="mb-4 text-[10px] font-bold text-text-muted uppercase tracking-wider">Active vs Inactive by Role</p>
              {loading ? renderLoading() : (
                <div className="h-64"><Bar data={activeByRoleData} options={{ ...stackedOptions, maintainAspectRatio: false }} /></div>
              )}
            </div>
          )}

          {/* Geography - State */}
          {stateGeoData.labels.length > 0 && (
            <div className="app-surface rounded-[28px] border border-white/10 bg-surface/5 p-5">
              <div className="mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                <p className="text-xs font-semibold tracking-widest text-text-muted uppercase">Users by State</p>
              </div>
              {loading ? renderLoading() : (
                <div className="h-64"><Bar data={stateGeoData} options={chartOptions} /></div>
              )}
            </div>
          )}

          {/* Geography - Country */}
          {countryGeoData.labels.length > 0 && (
            <div className="app-surface rounded-[28px] border border-white/10 bg-surface/5 p-5">
              <div className="mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 10-9 9m9-9a9 9 0 00-9-9" /></svg>
                <p className="text-xs font-semibold tracking-widest text-text-muted uppercase">Users by Country</p>
              </div>
              {loading ? renderLoading() : (
                <div className="h-64"><Bar data={countryGeoData} options={chartOptions} /></div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContributorAnalyticsPage;
