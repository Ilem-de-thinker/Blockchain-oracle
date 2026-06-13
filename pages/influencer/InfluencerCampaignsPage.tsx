import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { influencerApi, ReferralCodeResponse, CodeAnalyticsResponse, RefereeSummary, ConversionFunnelResponse, RefereeActivityResponse, CodeTrendsResponse, CodePurchase } from '../../src/api/influencer';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { 
  Copy, 
  Check, 
  RefreshCw, 
  Share2, 
  Users, 
  Link as LinkIcon, 
  TrendingUp, 
  ExternalLink,
  Mail,
  MessageCircle,
  X,
  Calendar,
  ShieldCheck,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import { ReportActions } from '../../components/ui/ReportActions';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title, LineElement, PointElement } from 'chart.js';
import { Doughnut, Line, Bar } from 'react-chartjs-2';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title, LineElement, PointElement);

const formatCurrency = (amount: number) => 
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);

const InfluencerWorkspacePage: React.FC = () => {
  const [codeData, setCodeData] = useState<ReferralCodeResponse | null>(null);
  const [analytics, setAnalytics] = useState<CodeAnalyticsResponse | null>(null);
  const [refereeSummary, setRefereeSummary] = useState<RefereeSummary | null>(null);
  const [conversionFunnel, setConversionFunnel] = useState<ConversionFunnelResponse | null>(null);
  const [refereeActivity, setRefereeActivity] = useState<RefereeActivityResponse | null>(null);
  const [codeTrends, setCodeTrends] = useState<CodeTrendsResponse | null>(null);
  const [codePurchases, setCodePurchases] = useState<CodePurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useLocalStorage<'overview' | 'links' | 'history' | 'charts'>('influencer_campaigns_tab', 'overview');

  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://blockchainoracle.learn';

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [code, analyticsData, summary, funnel, activity, trends, codePurchasesData] = await Promise.allSettled([
          influencerApi.getReferralCode(),
          influencerApi.getCodeAnalytics(),
          influencerApi.getRefereeSummary(),
          influencerApi.getConversionFunnel(),
          influencerApi.getRefereeActivity(),
          influencerApi.getCodeTrends(),
          influencerApi.getCodePurchases(),
        ]);

        if (code.status === 'fulfilled') setCodeData(code.value);
        if (analyticsData.status === 'fulfilled') setAnalytics(analyticsData.value);
        if (summary.status === 'fulfilled') setRefereeSummary(summary.value);
        if (funnel.status === 'fulfilled') setConversionFunnel(funnel.value);
        if (activity.status === 'fulfilled') setRefereeActivity(activity.value);
        if (trends.status === 'fulfilled') setCodeTrends(trends.value);
        if (codePurchasesData.status === 'fulfilled' && codePurchasesData.value) {
          setCodePurchases(codePurchasesData.value.results || []);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load workspace data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleRefreshCode = async () => {
    if (!confirm('Generate a new referral code? This will expire your current code immediately.')) return;
    
    setRefreshing(true);
    try {
      await influencerApi.refreshReferralCode();
      const [updatedCode, updatedAnalytics] = await Promise.all([
        influencerApi.getReferralCode(),
        influencerApi.getCodeAnalytics()
      ]);
      setCodeData(updatedCode);
      setAnalytics(updatedAnalytics);
    } catch (err: any) {
      setError(err.message || 'Failed to refresh code');
    } finally {
      setRefreshing(false);
    }
  };

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy');
    }
  };

  const activeCode = codeData?.active_code?.code;
  const referralLink = activeCode ? `${siteUrl}/register?ref=${activeCode}` : '';
  const totalReferees = refereeSummary?.total_referees || 0;
  const activeCodesCount = analytics?.analytics?.filter(a => !a.is_expired).length || 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[60vh]">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <LinkIcon className="w-5 h-5 text-primary" />
          </div>
        </div>
        <p className="mt-4 text-text-muted font-medium animate-pulse">Setting up your workspace...</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: 'easeOut' }} className="max-w-6xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
       <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
         <div>
           <div className="flex items-center gap-2 mb-2">
             <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
               Influencer
             </span>
             <span className="h-1 w-1 rounded-full bg-text-muted"></span>
             <span className="text-[10px] font-medium text-text-muted uppercase tracking-widest">Workspace</span>
           </div>
           <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-text">Campaigns & Links</h1>
           <p className="mt-2 text-sm text-text-secondary max-w-xl">
             Centralized hub for managing your partner campaigns, referral links, and growth metrics.
           </p>
         </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleRefreshCode}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-border text-text hover:bg-surface-hover transition-colors text-sm font-medium disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh Code
            </button>
            <ReportActions />
          </div>
        </div>

       {/* Tabs */}
       <div className="flex gap-2 border-b border-border/50 pb-1 overflow-x-auto whitespace-nowrap scrollbar-hide">
         {[
           { id: 'overview', label: 'Overview', icon: BarChart3 },
           { id: 'links', label: 'Links & Codes', icon: LinkIcon },
           { id: 'history', label: 'History', icon: Calendar },
           { id: 'charts', label: 'Charts', icon: BarChart3 },
         ].map((tab) => (
           <button
             key={tab.id}
             onClick={() => setActiveTab(tab.id as any)}
             className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-colors flex-shrink-0 ${
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

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Compact Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-surface border border-border hover:border-primary/30 transition-all">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Referees</span>
          </div>
          <p className="text-2xl font-black text-text">{totalReferees}</p>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-border hover:border-blue-500/30 transition-all">
          <div className="flex items-center gap-2 mb-2">
            <LinkIcon className="w-4 h-4 text-blue-500" />
            <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Active</span>
          </div>
          <p className="text-2xl font-black text-text">{activeCodesCount}</p>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-border hover:border-emerald-500/30 transition-all">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Code</span>
          </div>
          <p className="text-sm font-mono font-bold text-text truncate">{activeCode || 'NONE'}</p>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 gap-6">
          {/* Main Content Column */}
          <section className="bg-surface rounded-3xl border border-border overflow-hidden">
            <div className="p-6 border-b border-border bg-surface-alt/50">
              <h2 className="text-lg font-bold text-text flex items-center gap-2">
                <Share2 className="w-5 h-5 text-primary" />
                Active Referral Asset
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-bold text-text-muted uppercase tracking-widest ml-1">Your Referral Link</label>
                <div className="flex flex-col sm:flex-row items-stretch gap-2">
                  <div className="relative flex-1 group">
                    <input
                      type="text"
                      readOnly
                      value={referralLink}
                      className="w-full bg-surface-alt border border-border rounded-2xl px-4 py-3 text-sm font-mono text-text focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                  <button
                    onClick={() => handleCopy(referralLink, 'link')}
                    className="flex items-center justify-center gap-2 bg-primary text-white font-bold px-6 py-3 rounded-2xl hover:brightness-110 transition-all"
                  >
                    {copied === 'link' ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    {copied === 'link' ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-border bg-surface-alt/30 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Referral Code</p>
                    <p className="font-mono text-lg font-bold text-primary">{activeCode || 'N/A'}</p>
                  </div>
                  <button
                    onClick={() => handleCopy(activeCode || '', 'code')}
                    className="p-2 rounded-xl hover:bg-surface transition-colors text-text-muted hover:text-primary"
                  >
                    {copied === 'code' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <div className="p-4 rounded-2xl border border-border bg-surface-alt/30 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Validity</p>
                    <p className="text-lg font-bold text-text">
                      {codeData?.active_code?.days_remaining} <span className="text-xs font-medium text-text-muted">days left</span>
                    </p>
                  </div>
                  <Calendar className="w-5 h-5 text-text-muted" />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold text-text-muted uppercase tracking-widest ml-1">Quick Share</label>
                <div className="grid grid-cols-3 gap-2">
                  <a href={`https://wa.me/?text=...`} className="flex flex-col items-center gap-2 py-3 rounded-2xl bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20 font-bold text-xs hover:bg-[#25D366]/20 transition-all">
                    <MessageCircle className="w-5 h-5" /> WhatsApp
                  </a>
                  <a href={`#`} className="flex flex-col items-center gap-2 py-3 rounded-2xl bg-black/10 text-text border border-border font-bold text-xs hover:bg-black/20 transition-all">
                    <X className="w-5 h-5" /> X
                  </a>
                  <a href={`#`} className="flex flex-col items-center gap-2 py-3 rounded-2xl bg-primary/10 text-primary border border-primary/20 font-bold text-xs hover:bg-primary/20 transition-all">
                    <Mail className="w-5 h-5" /> Email
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {activeTab === 'links' && (
        <section className="bg-surface rounded-3xl border border-border overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-bold text-text flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              Link Performance
            </h2>
          </div>
          <div className="space-y-3">
            {!analytics?.analytics || analytics.analytics.length === 0 ? (
              <div className="flex flex-col items-center gap-3 p-12 text-center text-text-muted">
                <LinkIcon className="h-10 w-10 text-text-muted/40" />
                <div>
                  <p className="text-sm font-medium">No code history found</p>
                  <p className="text-xs text-text-muted/60 mt-1">Generate your first code above!</p>
                </div>
              </div>
            ) : (
              analytics.analytics.map((item, i) => (
                <div key={i} className="bg-surface border border-border p-4 rounded-2xl flex items-center justify-between gap-4 hover:border-primary/30 transition-all">
                  <div className="flex flex-col gap-1">
                    <span className="font-mono font-bold text-primary text-sm">{item.code}</span>
                    <span className="text-[10px] uppercase text-text-muted">
                      {new Date(item.expires_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                      item.is_expired
                        ? 'bg-red-500/10 text-red-500'
                        : 'bg-emerald-500/10 text-emerald-500'
                    }`}>
                      {item.is_expired ? 'Expired' : 'Active'}
                    </span>
                    <span className="text-sm font-bold text-text">
                      {item.referee_count} Refs
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}

       {activeTab === 'charts' && (
        <div className="space-y-6">
          <section className="bg-surface rounded-3xl border border-border overflow-hidden">
            <div className="p-6 border-b border-border">
              <h2 className="text-lg font-bold text-text flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Campaign Performance Comparison
              </h2>
            </div>
            <div className="p-6">
              {codeTrends && codeTrends.codes && codeTrends.codes.length > 0 ? (
                <div className="h-64 min-w-0">
                  <Bar
                    data={{
                      labels: codeTrends.codes.map((c: any) => c.code),
                      datasets: [
                        { label: 'Referees', data: codeTrends.codes.map((c: any) => (c.monthly || []).reduce((sum: number, m: any) => sum + (m.referees || 0), 0)), backgroundColor: '#3b82f6', borderRadius: 4 },
                        { label: 'Purchases', data: codeTrends.codes.map((c: any) => (c.monthly || []).reduce((sum: number, m: any) => sum + (m.purchases || 0), 0)), backgroundColor: '#10b981', borderRadius: 4 },
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { labels: { font: { size: 10 } } } },
                      scales: {
                        y: { beginAtZero: true, ticks: { font: { size: 9 } } },
                        x: { ticks: { font: { size: 9 } } }
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 py-10 text-center text-text-muted">
                  <BarChart3 className="h-8 w-8 text-text-muted/40" />
                  <p className="text-sm font-medium">No trend data yet</p>
                </div>
              )}
            </div>
          </section>

          {/* Conversion Funnel */}
          <section className="bg-surface rounded-3xl border border-border overflow-hidden">
            <div className="p-6 border-b border-border">
              <h2 className="text-lg font-bold text-text">Conversion Funnel</h2>
            </div>
            <div className="p-6">
              {conversionFunnel && conversionFunnel.funnel ? (
                <div className="h-64 min-w-0">
                  <Bar
                    data={{
                      labels: conversionFunnel.funnel.map((f: any) => f.stage),
                      datasets: [{
                        label: 'Count',
                        data: conversionFunnel.funnel.map((f: any) => f.count),
                        backgroundColor: ['#3b82f6', '#10b981', '#8b5cf6'],
                        borderRadius: 4,
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: {
                        y: { beginAtZero: true, ticks: { font: { size: 9 } } },
                        x: { ticks: { font: { size: 9 } } }
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 py-10 text-center text-text-muted">
                  <BarChart3 className="h-8 w-8 text-text-muted/40" />
                  <p className="text-sm font-medium">No funnel data yet</p>
                </div>
              )}
            </div>
          </section>

           {/* Code Trends Over Time */}
           {codeTrends && codeTrends.codes && codeTrends.codes.length > 0 && (() => {
              const allMonths = [...new Set(codeTrends.codes.flatMap((c: any) => (c.monthly || []).map((m: any) => m.month)))].sort();
              const displayMonths = allMonths.slice(-12); // Last 12 months for better mobile viewing
              const chartData = {
                labels: displayMonths,
                datasets: codeTrends.codes.map((code: any, idx: number) => {
                  const monthMap: Record<string, number> = {};
                  (code.monthly || []).forEach((m: any) => { monthMap[m.month] = m.referees; });
                  return {
                    label: code.code,
                    data: displayMonths.map((m: string) => monthMap[m] || 0),
                    borderColor: ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'][idx % 4],
                    backgroundColor: 'transparent',
                    tension: 0.3,
                  };
                })
              };
              return (
                <section className="bg-surface rounded-3xl border border-border overflow-hidden">
                  <div className="p-6 border-b border-border">
                    <h2 className="text-lg font-bold text-text">Monthly Referee Trends</h2>
                  </div>
                  <div className="p-6">
                    <div className="h-64 min-w-0">
                      <Line
                        data={chartData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: { legend: { labels: { font: { size: 9 } } } },
                          scales: {
                            y: { beginAtZero: true, ticks: { font: { size: 9 } } },
                            x: { ticks: { font: { size: 9 } } }
                          }
                        }}
                      />
                    </div>
                  </div>
                </section>
              );
            })()}
        </div>
      )}

      {/* History Tab - Code History List */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          {analytics?.analytics && analytics.analytics.length > 0 ? (
            analytics.analytics.map((item, i) => {
              const codePurchasesCount = codePurchases.filter(p => p.code === item.code && p.status === 'completed').length;
              const codeEarnings = codePurchases
                .filter(p => p.code === item.code && p.status === 'completed')
                .reduce((sum, p) => sum + p.commission, 0);
              return (
                <div key={i} className="bg-surface border border-border p-4 rounded-2xl flex items-center justify-between gap-4 hover:border-primary/30 transition-all">
                  <div className="flex flex-col gap-1">
                    <span className="font-mono font-bold text-primary text-sm">{item.code}</span>
                    <span className="text-[10px] uppercase text-text-muted">
                      Created: {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-sm font-bold text-text">
                      {item.referee_count} Refs • {codePurchasesCount} Purch
                    </span>
                    <span className="text-xs font-bold text-emerald-500">
                      {formatCurrency(codeEarnings)}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center gap-3 p-12 text-center text-text-muted">
              <Calendar className="h-10 w-10 text-text-muted/40" />
              <div>
                <p className="text-sm font-medium">No code history found</p>
                <p className="text-xs text-text-muted/60 mt-1">Generated codes will appear here.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default InfluencerWorkspacePage;
