import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ThemeLink } from '@/components/ui/theme-link';
import { cn } from '@/lib/utils';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { ReportActions } from '../../components/ui/ReportActions';
import { influencerApi, RefereeSummary, Referee, CodeAnalyticsResponse, DashboardSummary, RefereePurchase, ConversionFunnelResponse, RefereeActivityResponse, CodeTrendsResponse, MonthlyEarningsTrendResponse, CodeEarningsResponse, PerformanceAnalyticsResponse, CampaignComparisonResponse } from '../../src/api/influencer';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { TrendingUp, TrendingDown, Users, ShoppingCart, DollarSign, Clock, BarChart3, Code, Wallet, FileText } from 'lucide-react';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title, LineElement, PointElement } from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title, LineElement, PointElement);

const InfluencerAnalyticsPage: React.FC = () => {
  const [refereeSummary, setRefereeSummary] = useState<RefereeSummary | null>(null);
  const [codeAnalytics, setCodeAnalytics] = useState<CodeAnalyticsResponse | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null);
  const [refereePurchases, setRefereePurchases] = useState<RefereePurchase[]>([]);
  const [recentReferees, setRecentReferees] = useState<Referee[]>([]);
  const [conversionFunnel, setConversionFunnel] = useState<ConversionFunnelResponse | null>(null);
  const [refereeActivity, setRefereeActivity] = useState<RefereeActivityResponse | null>(null);
  const [codeTrends, setCodeTrends] = useState<CodeTrendsResponse | null>(null);
  const [earningsTrend, setEarningsTrend] = useState<MonthlyEarningsTrendResponse | null>(null);
  const [codeEarnings, setCodeEarnings] = useState<CodeEarningsResponse | null>(null);
  const [campaignComparison, setCampaignComparison] = useState<CampaignComparisonResponse | null>(null);
  const [performanceAnalytics, setPerformanceAnalytics] = useState<PerformanceAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useLocalStorage<'overview' | 'monthly' | 'codes' | 'referees' | 'charts'>('influencer_analytics_tab', 'overview');

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try to use the combined performance analytics endpoint first (reduces API calls)
        try {
          const perfData = await influencerApi.getPerformanceAnalytics();
          setPerformanceAnalytics(perfData);
          // Map performance analytics data to existing state variables
          if (perfData.overview) {
            setDashboardData({
              summary: {
                total_referees: perfData.overview.total_referees,
                total_purchases: perfData.overview.total_purchases,
                total_earnings: perfData.overview.total_earnings,
                pending_payout: perfData.overview.pending_payout,
                received_payout: perfData.overview.received_payout,
              },
              active_code: { code: '', days_remaining: 0, referee_count: 0 },
              monthly_stats: perfData.monthly_earnings?.map(m => ({
                month: m.month,
                new_referees: m.referees,
                purchases: m.purchases,
                earnings: m.amount
              })) || []
            });
          }
          if (perfData.conversion_funnel) setConversionFunnel({ funnel: perfData.conversion_funnel });
          if (perfData.referee_activity) setRefereeActivity(perfData.referee_activity);
          if (perfData.code_trends) setCodeTrends({ codes: perfData.code_trends });
          if (perfData.monthly_earnings) {
            setEarningsTrend({ 
              monthly_earnings: perfData.monthly_earnings,
              total_earnings: perfData.overview?.total_earnings || 0,
              average_monthly: perfData.monthly_earnings.reduce((sum, m) => sum + m.amount, 0) / perfData.monthly_earnings.length
            });
          }
        } catch (perfError) {
          console.log('Performance analytics endpoint not available, falling back to multiple calls');
          // Fallback to multiple API calls
          const [summaryData, refereeListData, analyticsData, dashboardDataResult, purchasesData, funnelData, activityData, trendsData] = await Promise.allSettled([
            influencerApi.getRefereeSummary(),
            influencerApi.getRefereeList(),
            influencerApi.getCodeAnalytics(),
            influencerApi.getDashboardSummary(),
            influencerApi.getRefereePurchases(),
            influencerApi.getConversionFunnel(),
            influencerApi.getRefereeActivity(),
            influencerApi.getCodeTrends(),
          ]);

          if (summaryData.status === 'fulfilled') setRefereeSummary(summaryData.value);
          if (refereeListData.status === 'fulfilled') setRecentReferees(refereeListData.value.referees || []);
          if (analyticsData.status === 'fulfilled') setCodeAnalytics(analyticsData.value);
          if (dashboardDataResult.status === 'fulfilled') setDashboardData(dashboardDataResult.value);
          if (purchasesData.status === 'fulfilled') setRefereePurchases(purchasesData.value.results || []);
          if (funnelData.status === 'fulfilled') setConversionFunnel(funnelData.value);
          if (activityData.status === 'fulfilled') setRefereeActivity(activityData.value);
          if (trendsData.status === 'fulfilled') setCodeTrends(trendsData.value);
        }
        
        // Fetch additional documented chart endpoints
        const [enhancedSummary, earningsTrendData, codeEarningsData, campaignData] = await Promise.allSettled([
          influencerApi.getEnhancedDashboardSummary(),
          influencerApi.getEarningsTrend(),
          influencerApi.getCodeEarnings(),
          influencerApi.getCampaignComparison(),
        ]);
        if (enhancedSummary.status === 'fulfilled') setDashboardData(enhancedSummary.value as DashboardSummary);
        if (earningsTrendData.status === 'fulfilled') setEarningsTrend(earningsTrendData.value);
        if (codeEarningsData.status === 'fulfilled') setCodeEarnings(codeEarningsData.value);
        if (campaignData.status === 'fulfilled') setCampaignComparison(campaignData.value);
      } catch (err: any) {
        console.error('Failed to load analytics data:', err);
        setError(err.message || 'Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  const formatCurrency = (amount: number) => `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatPercent = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const effectiveEarningsTrend = (earningsTrend && earningsTrend.monthly_earnings?.length)
    ? earningsTrend
    : (performanceAnalytics?.monthly_earnings?.length
      ? {
          monthly_earnings: performanceAnalytics.monthly_earnings,
          total_earnings: performanceAnalytics.overview?.total_earnings || 0,
          average_monthly:
            performanceAnalytics.monthly_earnings.reduce((sum, m) => sum + m.amount, 0) /
            performanceAnalytics.monthly_earnings.length,
        }
      : null);

  const effectiveCodeEarnings = (codeEarnings && codeEarnings.by_code?.length)
    ? codeEarnings
    : (campaignComparison?.campaigns?.length
      ? {
          by_code: campaignComparison.campaigns.map((c: any) => ({
            code: c.code,
            earnings: c.metrics?.earnings || 0,
            referee_count: c.metrics?.referees || 0,
            purchases: c.metrics?.purchases || 0,
            conversion_rate: c.metrics?.conversion_rate || 0,
            created_at: c.created_at,
            expires_at: c.expires_at,
            is_expired: c.is_expired,
          })),
          total_earnings: campaignComparison.summary?.total_earnings || 0,
        }
      : null);

  const paddedEarningsTrend = (() => {
    const source = effectiveEarningsTrend?.monthly_earnings || [];
    if (source.length >= 3) return source;
    const now = new Date();
    const months: Array<{ month: string; amount: number; referees: number; purchases: number }> = [];
    for (let i = 2; i >= 0; i--) {
      const d = new Date(now);
      d.setMonth(d.getMonth() - i);
      const month = d.toISOString().slice(0, 7);
      const existing = source.find((x: any) => x.month === month);
      months.push(existing || { month, amount: 0, referees: 0, purchases: 0 });
    }
    return months;
  })();

  const fallbackCodeEarnings = (() => {
    if (effectiveCodeEarnings?.by_code?.length) return effectiveCodeEarnings.by_code;
    if (codeAnalytics?.analytics?.length) {
      return codeAnalytics.analytics.slice(0, 6).map((c: any) => ({
        code: c.code,
        earnings: 0,
        referee_count: c.referee_count || 0,
        purchases: 0,
      }));
    }
    return [{ code: 'NO-DATA', earnings: 0, referee_count: 0, purchases: 0 }];
  })();

  const StatCard = ({ title, value, subtitle, icon: Icon, colorClass }: {
    title: string;
    value: string | number;
    subtitle: string;
    icon: React.ElementType;
    colorClass: string;
  }) => (
    <div className="bg-surface/80 backdrop-blur-md border border-border/50 rounded-lg p-3 shadow-sm">
      <div className="flex items-center justify-between">
        <p className={cn("text-[10px] sm:text-xs font-semibold tracking-tight uppercase", colorClass)}>{title}</p>
        <Icon className={cn("w-4 h-4", colorClass)} />
      </div>
      <p className="mt-1 text-xl sm:text-2xl font-semibold tracking-tight text-text">{value}</p>
      <p className="mt-0.5 text-[10px] sm:text-xs text-text-secondary truncate">{subtitle}</p>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-4">
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Referees" value={refereeSummary?.total_referees || 0} subtitle="All time" icon={Users} colorClass="text-primary" />
        <StatCard title="Total Purchases" value={dashboardData?.summary.total_purchases || 0} subtitle="Course enrollments" icon={ShoppingCart} colorClass="text-emerald-500" />
        <StatCard title="Total Earnings" value={formatCurrency(dashboardData?.summary.total_earnings || 0)} subtitle="Lifetime revenue" icon={DollarSign} colorClass="text-amber-500" />
        <StatCard title="This Month" value={refereeSummary?.referees_by_month[0]?.count || 0} subtitle="New referees" icon={TrendingUp} colorClass="text-blue-600" />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="bg-surface/80 backdrop-blur-md border border-border/50 rounded-lg shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold tracking-tight">Payout Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            <div className="flex justify-between items-center py-1.5 border-b border-border/50">
              <span className="text-text-secondary text-[10px] sm:text-xs font-semibold tracking-tight">Total</span>
              <span className="font-semibold tracking-tight text-base sm:text-lg text-primary">{formatCurrency(dashboardData?.summary.total_earnings || 0)}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-border/50">
              <span className="text-amber-500 text-[10px] sm:text-xs font-semibold tracking-tight">Pending</span>
              <span className="font-semibold tracking-tight text-sm sm:text-base text-amber-500">{formatCurrency(dashboardData?.summary.pending_payout || 0)}</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-emerald-500 text-[10px] sm:text-xs font-semibold tracking-tight">Received</span>
              <span className="font-semibold tracking-tight text-sm sm:text-base text-emerald-500">{formatCurrency(dashboardData?.summary.received_payout || 0)}</span>
            </div>
          </CardContent>
        </div>

        <div className="bg-surface/80 backdrop-blur-md border border-border/50 rounded-lg shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold tracking-tight">Active Referral Code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            <div className="rounded-lg bg-primary/10 border border-primary/30 p-2 sm:p-3 text-center">
              <p className="text-[10px] sm:text-xs text-primary font-semibold tracking-tight mb-0.5">Current Code</p>
              <p className="text-lg sm:text-xl font-semibold tracking-tight text-primary tracking-wider">{dashboardData?.active_code.code || 'N/A'}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center p-1.5 sm:p-2 rounded-lg bg-surface/80 backdrop-blur-md">
                <p className="text-[10px] sm:text-xs text-text-muted font-semibold tracking-tight">Days</p>
                <p className="text-sm sm:text-base font-semibold tracking-tight text-text">{dashboardData?.active_code.days_remaining || 0}</p>
              </div>
              <div className="text-center p-1.5 sm:p-2 rounded-lg bg-surface/80 backdrop-blur-md">
                <p className="text-[10px] sm:text-xs text-text-muted font-semibold tracking-tight">Referees</p>
                <p className="text-sm sm:text-base font-semibold tracking-tight text-text">{dashboardData?.active_code.referee_count || 0}</p>
              </div>
            </div>
            <ThemeLink to="/influencer/campaigns" variant="accent" className="block text-center text-xs sm:text-sm font-semibold tracking-tight">
              Manage Codes →
            </ThemeLink>
          </CardContent>
        </div>
      </div>
    </div>
  );

  const renderMonthlyStats = () => {
    const monthlyData = dashboardData?.monthly_stats || [];

    return (
      <div className="space-y-6">
        <div className="bg-surface/80 backdrop-blur-md border border-border/50 rounded-xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold tracking-tight flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Monthly Performance Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyData.length > 0 ? (
              <div className="space-y-3">
                {monthlyData.slice(0, 12).map((monthData, index) => {
                  const prevMonth = monthlyData[index + 1];
                  const growth = prevMonth ? calculateGrowth(monthData.purchases, prevMonth.purchases) : 0;
                  const conversion = monthData.new_referees > 0 ? (monthData.purchases / monthData.new_referees * 100) : 0;
                  return (
                    <div key={monthData.month} className="bg-surface border border-border p-4 rounded-2xl flex items-center justify-between gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-text text-sm">{new Date(monthData.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                        <span className="text-[10px] uppercase text-text-muted">Conv: {conversion.toFixed(0)}% • Growth: {formatPercent(growth)}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-emerald-500">{formatCurrency(monthData.earnings)}</div>
                        <div className="text-[10px] text-text-muted">{monthData.new_referees} Refs | {monthData.purchases} Purch</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-text-muted">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No monthly data available</p>
                <p className="text-sm mt-1">Start referring users to see analytics</p>
              </div>
            )}
          </CardContent>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="bg-surface/80 backdrop-blur-md border border-border/50 rounded-xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-semibold tracking-tight text-text-muted">Best Month</CardTitle>
            </CardHeader>
            <CardContent>
              {monthlyData.length > 0 && (() => {
                const best = monthlyData.reduce((a, b) => a.earnings > b.earnings ? a : b);
                return (
                  <div>
                    <p className="text-2xl sm:text-3xl font-semibold tracking-tight text-emerald-500">{formatCurrency(best.earnings)}</p>
                    <p className="text-sm text-text-secondary mt-1 font-semibold tracking-tight">
                      {new Date(best.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                );
              })()}
            </CardContent>
          </div>
          <div className="bg-surface/80 backdrop-blur-md border border-border/50 rounded-xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-semibold tracking-tight text-text-muted">Avg. Monthly Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              {monthlyData.length > 0 && (() => {
                const avg = monthlyData.reduce((sum, m) => sum + m.earnings, 0) / monthlyData.length;
                return (
                  <div>
                    <p className="text-2xl sm:text-3xl font-semibold tracking-tight text-primary">{formatCurrency(avg)}</p>
                    <p className="text-sm text-text-secondary mt-1 font-semibold tracking-tight">Per month average</p>
                  </div>
                );
              })()}
            </CardContent>
          </div>
          <div className="bg-surface/80 backdrop-blur-md border border-border/50 rounded-xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-semibold tracking-tight text-text-muted">Avg. Purchases/Month</CardTitle>
            </CardHeader>
            <CardContent>
              {monthlyData.length > 0 && (() => {
                const avg = monthlyData.reduce((sum, m) => sum + m.purchases, 0) / monthlyData.length;
                return (
                  <div>
                    <p className="text-2xl sm:text-3xl font-semibold tracking-tight text-blue-600">{avg.toFixed(1)}</p>
                    <p className="text-sm text-text-secondary mt-1 font-semibold tracking-tight">Course enrollments</p>
                  </div>
                );
              })()}
            </CardContent>
          </div>
        </div>
      </div>
    );
  };

  const renderCodesTable = () => (
    <div className="space-y-6">
      <div className="bg-surface/80 backdrop-blur-md border border-border/50 rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold tracking-tight flex items-center gap-2">
            <Code className="w-5 h-5 text-primary" />
            Referral Code Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {codeAnalytics?.analytics && codeAnalytics.analytics.length > 0 ? (
            <div className="space-y-3">
              {codeAnalytics.analytics.map((item, i) => {
                const codePurchasesCount = refereePurchases.filter(p => p.status === 'completed').length;
                const codeEarnings = refereePurchases
                  .filter(p => p.status === 'completed')
                  .reduce((sum, p) => sum + (p.amount_paid * 0.2), 0);
                return (
                  <div key={i} className="bg-surface border border-border p-4 rounded-2xl flex items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="font-mono font-bold text-emerald-500 text-sm">{item.code}</span>
                      <span className="text-[10px] uppercase text-text-muted">
                        {new Date(item.created_at).toLocaleDateString()} - {new Date(item.expires_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-text">{item.referee_count} Refs • {codePurchasesCount} Purch</span>
                      <div className="text-xs font-bold text-emerald-500">{formatCurrency(codeEarnings)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-text-muted">
              <Code className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No referral codes found</p>
            </div>
          )}        </CardContent>
      </div>
    </div>
  );

  const renderRefereesTable = () => (
    <div className="space-y-6">
      <div className="bg-surface/80 backdrop-blur-md border border-border/50 rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            All Referrals ({recentReferees.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentReferees.length > 0 ? (
            <div className="space-y-3">
              {recentReferees.map((referee) => (
                <div key={referee.id} className="bg-surface border border-border p-4 rounded-2xl flex items-center justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-text text-sm">{referee.full_name}</span>
                    <span className="text-[10px] text-text-muted">{referee.email}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs bg-primary/10 px-2 py-1 rounded text-primary font-semibold">{referee.referred_by}</span>
                    <div className="text-[10px] text-text-muted mt-1">{new Date(referee.date_joined).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-text-muted">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No referrals yet</p>
              <p className="text-sm mt-1">Share your code to get started</p>
            </div>
          )}
        </CardContent>
      </div>
    </div>
  );

  const renderCharts = () => (
    <div className="space-y-6">
      {/* Monthly Earnings Trend */}
      <div className="bg-surface/80 backdrop-blur-md border border-border/50 rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Monthly Earnings Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            // Ensure at least 3 months for chart visibility
            const monthly = paddedEarningsTrend;
            let displayMonths = monthly.map((m: any) => m.month);
            let displayData = [...monthly];
            
            if (displayMonths.length < 3) {
              if (displayMonths.length === 0) {
                // Generate 3 months ending with current month
                const current = new Date();
                displayMonths = [];
                displayData = [];
                for (let i = 2; i >= 0; i--) {
                  const d = new Date(current);
                  d.setMonth(d.getMonth() - i);
                  const monthStr = d.toISOString().slice(0, 7);
                  displayMonths.push(monthStr);
                  displayData.push({ month: monthStr, amount: 0, referees: 0, purchases: 0 });
                }
              } else {
                // Pad with previous months
                const months = [...displayMonths];
                const dataMap: Record<string, any> = {};
                monthly.forEach((m: any) => { dataMap[m.month] = m; });
                
                while (months.length < 3) {
                  const firstMonth = months[0];
                  const date = new Date(firstMonth + '-01');
                  date.setMonth(date.getMonth() - 1);
                  const newMonth = date.toISOString().slice(0, 7);
                  months.unshift(newMonth);
                  dataMap[newMonth] = { month: newMonth, amount: 0, referees: 0, purchases: 0 };
                }
                displayMonths = months;
                displayData = months.map(m => dataMap[m]);
              }
            }
            
            return (
              <div className="h-64">
                <Line
                  data={{
                    labels: displayMonths,
                    datasets: [
                      {
                        label: 'Earnings (₦)',
                        data: displayData.map((m: any) => m.amount),
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.3,
                        fill: true,
                      },
                      {
                        label: 'Referees',
                        data: displayData.map((m: any) => m.referees),
                        borderColor: '#3b82f6',
                        backgroundColor: 'transparent',
                        tension: 0.3,
                        yAxisID: 'y1',
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { labels: { color: '#6b7280' } }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(156,163,175,0.1)' },
                        ticks: { color: '#6b7280' }
                      },
                      y1: {
                        beginAtZero: true,
                        position: 'right',
                        grid: { display: false },
                        ticks: { color: '#6b7280' }
                      },
                      x: { grid: { display: false }, ticks: { color: '#6b7280' } }
                    }
                  }}
                />
              </div>
            );
          })()}
        </CardContent>
      </div>

      {/* Code Earnings Comparison */}
      <div className="bg-surface/80 backdrop-blur-md border border-border/50 rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold tracking-tight flex items-center gap-2">
            <Code className="w-5 h-5 text-primary" />
            Earnings by Referral Code
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <Bar
              data={{
                labels: fallbackCodeEarnings.map((c: any) => c.code),
                datasets: [
                  {
                    label: 'Earnings (₦)',
                    data: fallbackCodeEarnings.map((c: any) => c.earnings || 0),
                    backgroundColor: '#10b981',
                    borderRadius: 6,
                  },
                  {
                    label: 'Referees',
                    data: fallbackCodeEarnings.map((c: any) => c.referee_count || 0),
                    backgroundColor: '#3b82f6',
                    borderRadius: 6,
                  },
                  {
                    label: 'Purchases',
                    data: fallbackCodeEarnings.map((c: any) => c.purchases || 0),
                    backgroundColor: '#8b5cf6',
                    borderRadius: 6,
                  }
                ]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { labels: { color: '#6b7280' } }
                },
                scales: {
                  y: { beginAtZero: true, grid: { color: 'rgba(156,163,175,0.1)' } },
                  x: { grid: { display: false } }
                }
              }}
            />
          </div>
        </CardContent>
      </div>

      {campaignComparison?.summary && (
        <div className="bg-surface/80 backdrop-blur-md border border-border/50 rounded-xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold tracking-tight flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Campaign Comparison Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 grid-cols-2 md:grid-cols-3">
              <div className="p-3 rounded-lg bg-surface-alt/50 border border-border/50">
                <p className="text-xs text-text-muted">Active Campaigns</p>
                <p className="text-lg font-bold text-text">{campaignComparison.summary.active_campaigns}</p>
              </div>
              <div className="p-3 rounded-lg bg-surface-alt/50 border border-border/50">
                <p className="text-xs text-text-muted">Total Referees</p>
                <p className="text-lg font-bold text-text">{campaignComparison.summary.total_referees}</p>
              </div>
              <div className="p-3 rounded-lg bg-surface-alt/50 border border-border/50">
                <p className="text-xs text-text-muted">Total Purchases</p>
                <p className="text-lg font-bold text-text">{campaignComparison.summary.total_purchases}</p>
              </div>
              <div className="p-3 rounded-lg bg-surface-alt/50 border border-border/50">
                <p className="text-xs text-text-muted">Total Earnings</p>
                <p className="text-lg font-bold text-emerald-500">{formatCurrency(campaignComparison.summary.total_earnings)}</p>
              </div>
              <div className="p-3 rounded-lg bg-surface-alt/50 border border-border/50">
                <p className="text-xs text-text-muted">Conversion Rate</p>
                <p className="text-lg font-bold text-primary">{Number(campaignComparison.summary.overall_conversion_rate || 0).toFixed(1)}%</p>
              </div>
              <div className="p-3 rounded-lg bg-surface-alt/50 border border-border/50">
                <p className="text-xs text-text-muted">Total Campaigns</p>
                <p className="text-lg font-bold text-text">{campaignComparison.summary.total_campaigns}</p>
              </div>
            </div>
          </CardContent>
        </div>
      )}

      {/* Performance Analytics Summary (Combined Endpoint) */}
      {performanceAnalytics && (
        <div className="bg-surface/80 backdrop-blur-md border border-border/50 rounded-xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold tracking-tight flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Performance Analytics (Combined Endpoint)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-xs text-text-muted">Conversion Rate</p>
                <p className="text-2xl font-bold text-primary">{performanceAnalytics.overview?.conversion_rate?.toFixed(1) || 0}%</p>
              </div>
              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-xs text-text-muted">Total Earnings</p>
                <p className="text-2xl font-bold text-emerald-500">₦{performanceAnalytics.overview?.total_earnings?.toLocaleString() || 0}</p>
              </div>
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-xs text-text-muted">Best Performing Code</p>
                <p className="text-lg font-mono font-bold text-blue-500">{performanceAnalytics.best_performing_code || 'N/A'}</p>
              </div>
              <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <p className="text-xs text-text-muted">Best Month</p>
                <p className="text-lg font-bold text-purple-500">{performanceAnalytics.best_month?.month || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.25em] text-primary uppercase">Analytics</p>
          <h1 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-text">Performance Analytics</h1>
          <p className="mt-2 sm:mt-3 max-w-2xl text-xs sm:text-sm text-text-secondary">
            Track your referral performance, earnings, and growth trends.
          </p>
        </div>
        <ReportActions />
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-sm text-red-200">
          <i className="fas fa-exclamation-triangle mr-2"></i>
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-surface/80 backdrop-blur-md border border-primary/20 rounded-xl p-5 shadow-sm">
              <div className="h-4 w-24 rounded bg-surface/10 animate-pulse"></div>
              <div className="mt-3 h-10 w-32 rounded bg-surface/10 animate-pulse"></div>
              <div className="mt-3 h-4 w-40 rounded bg-surface/10 animate-pulse"></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Mobile Select Navigation */}
          <div className="sm:hidden mb-4">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as any)}
              className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm font-bold text-text focus:outline-none focus:border-primary"
            >
              <option value="overview">Overview</option>
              <option value="monthly">Monthly Stats</option>
              <option value="codes">Code Performance</option>
              <option value="referees">All Referees</option>
              <option value="charts">Charts</option>
            </select>
          </div>

          {/* Desktop Tab Navigation */}
          <div className="hidden sm:flex gap-2 border-b border-border/50 pb-1">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'monthly', label: 'Monthly Stats', icon: TrendingUp },
              { id: 'codes', label: 'Code Performance', icon: Code },
              { id: 'referees', label: 'All Referees', icon: Users },
              { id: 'charts', label: 'Charts', icon: BarChart3 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-semibold tracking-tight transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary/10 text-primary border-b-2 border-primary'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'monthly' && renderMonthlyStats()}
          {activeTab === 'codes' && renderCodesTable()}
          {activeTab === 'referees' && renderRefereesTable()}
          {activeTab === 'charts' && renderCharts()}
        </>
      )}
    </div>
  );
};

export default InfluencerAnalyticsPage;
