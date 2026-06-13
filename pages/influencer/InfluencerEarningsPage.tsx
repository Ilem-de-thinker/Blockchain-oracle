import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { ReportActions } from '../../components/ui/ReportActions';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { influencerApi, PayoutSummary, RefereeSummary, Referee, RefereePurchase, CodePurchase, MonthlyEarningsTrendResponse, CodeEarningsResponse } from '../../src/api/influencer';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title, LineElement, PointElement } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { Wallet } from 'lucide-react';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title, LineElement, PointElement);

const formatCurrency = (amount: number) => 
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);

const InfluencerEarningsPage: React.FC = () => {
  const [payoutData, setPayoutData] = useState<PayoutSummary | null>(null);
  const [refereeSummary, setRefereeSummary] = useState<RefereeSummary | null>(null);
  const [referees, setReferees] = useState<Referee[]>([]);
  const [purchases, setPurchases] = useState<RefereePurchase[]>([]);
  const [codePurchases, setCodePurchases] = useState<CodePurchase[]>([]);
  const [earningsTrend, setEarningsTrend] = useState<MonthlyEarningsTrendResponse | null>(null);
  const [codeEarnings, setCodeEarnings] = useState<CodeEarningsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPayouts = async () => {
      try {
        setLoading(true);
        setError(null);
        const [payout, summary, refereeData, purchasesData, codePurchasesData, earningsTrendData, codeEarningsData] = await Promise.allSettled([
          influencerApi.getPayoutSummary(),
          influencerApi.getRefereeSummary(),
          influencerApi.getRefereeList(),
          influencerApi.getRefereePurchases(),
          influencerApi.getCodePurchases(),
          influencerApi.getEarningsTrend(),
          influencerApi.getCodeEarnings(),
        ]);

        if (payout.status === 'fulfilled') setPayoutData(payout.value);
        if (summary.status === 'fulfilled') setRefereeSummary(summary.value);
        if (refereeData.status === 'fulfilled') setReferees(refereeData.value.referees || []);
        if (purchasesData.status === 'fulfilled' && purchasesData.value) {
          setPurchases(purchasesData.value.results || []);
        }
        if (codePurchasesData.status === 'fulfilled' && codePurchasesData.value) {
          setCodePurchases(codePurchasesData.value.results || []);
        }
        if (earningsTrendData.status === 'fulfilled') {
          setEarningsTrend(earningsTrendData.value);
        }
        if (codeEarningsData.status === 'fulfilled') {
          setCodeEarnings(codeEarningsData.value);
        }
      } catch (err: any) {
        console.error('Failed to load payout data:', err);
        setError(err.message || 'Failed to load payout data');
      } finally {
        setLoading(false);
      }
    };

    loadPayouts();
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: 'easeOut' }}>
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">Earnings</p>
          <h1 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-text">Commissions and payouts.</h1>
          <p className="mt-2 sm:mt-3 max-w-2xl text-xs sm:text-sm text-text-secondary">
            Track your commission earnings from course referrals. You earn 20% of each course enrollment.
          </p>
        </div>
        <ReportActions />
      </div>

      {error && (
        <div className="rounded-[24px] border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          <i className="fas fa-exclamation-triangle mr-2"></i>
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center rounded-[24px] border border-border bg-surface p-12">
          <i className="fas fa-circle-notch fa-spin text-4xl text-primary"></i>
        </div>
      ) : payoutData ? (
        <div className="space-y-6">
          <div className="rounded-[24px] border border-primary/30 bg-primary/10 p-4 sm:p-6">
            <p className="text-xs sm:text-sm text-primary-light">Total Accumulated Earnings</p>
            <p className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-black text-primary">
              {formatCurrency(payoutData.total_accumulated)}
            </p>
            <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-text-secondary">
              Your lifetime earnings from referral commissions.
            </p>
          </div>

          <div className="grid gap-3 grid-cols-3">
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3">
              <p className="text-[10px] uppercase tracking-widest text-emerald-200/70">Referees</p>
              <p className="mt-1 text-xl sm:text-2xl font-black text-emerald-300">
                {refereeSummary?.total_referees || 0}
              </p>
            </div>
            <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-3">
              <p className="text-[10px] uppercase tracking-widest text-amber-200/70">Pending</p>
              <p className="mt-1 text-lg sm:text-xl font-black text-amber-300">
                {formatCurrency(payoutData.pending)}
              </p>
            </div>

            <div className="rounded-2xl border border-blue-400/20 bg-blue-400/10 p-3">
              <p className="text-[10px] uppercase tracking-widest text-blue-200/70">Received</p>
              <p className="mt-1 text-lg sm:text-xl font-black text-blue-300">
                {formatCurrency(payoutData.received)}
              </p>
            </div>
          </div>

          {/* Monthly Earnings Trend Chart */}
          {earningsTrend && earningsTrend.monthly_earnings && earningsTrend.monthly_earnings.length > 0 && (
            <div className="rounded-[24px] border border-border bg-surface p-6">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-text flex items-center gap-2">
                  <span className="w-5 h-5 text-primary">📈</span>
                  Monthly Earnings Trend
                </h3>
                <p className="text-sm text-text-secondary">Track your earnings growth over time</p>
              </div>
              <div className="h-64">
                <Line
                  data={{
                    labels: earningsTrend.monthly_earnings.map((m: any) => m.month),
                    datasets: [
                      {
                        label: 'Earnings (₦)',
                        data: earningsTrend.monthly_earnings.map((m: any) => m.amount),
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.3,
                        fill: true,
                      },
                      {
                        label: 'Referees',
                        data: earningsTrend.monthly_earnings.map((m: any) => m.referees),
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
            </div>
          )}

          {/* Earnings by Referral Code Chart */}
          {codeEarnings && codeEarnings.by_code && codeEarnings.by_code.length > 0 && (
            <div className="rounded-[24px] border border-border bg-surface p-6">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-text flex items-center gap-2">
                  <span className="w-5 h-5 text-primary">💰</span>
                  Earnings by Referral Code
                </h3>
                <p className="text-sm text-text-secondary">Compare which codes generate the most revenue</p>
              </div>
              <div className="h-64">
                <Bar
                  data={{
                    labels: codeEarnings.by_code.map((c: any) => c.code),
                    datasets: [
                      {
                        label: 'Earnings (₦)',
                        data: codeEarnings.by_code.map((c: any) => c.earnings),
                        backgroundColor: '#10b981',
                        borderRadius: 6,
                      },
                      {
                        label: 'Referees',
                        data: codeEarnings.by_code.map((c: any) => c.referee_count),
                        backgroundColor: '#3b82f6',
                        borderRadius: 6,
                      },
                      {
                        label: 'Purchases',
                        data: codeEarnings.by_code.map((c: any) => c.purchases),
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
            </div>
          )}

          {purchases.length > 0 && (
            <div className="rounded-[24px] border border-border bg-surface p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-text">Referee Purchases</h3>
                  <p className="text-sm text-text-secondary">Courses your referees have purchased</p>
                </div>
                <div className="text-right">
                  <p className="text-xl sm:text-2xl font-black text-emerald-400">
                    ${formatCurrency(purchases.reduce((sum, p) => sum + p.amount_paid, 0))}
                  </p>
                  <p className="text-xs text-text-muted">Total Purchases</p>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchases.map((purchase, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{purchase.full_name}</TableCell>
                      <TableCell className="text-text-secondary">{purchase.email}</TableCell>
                      <TableCell>{purchase.course_name}</TableCell>
                      <TableCell className="text-right font-semibold text-emerald-400">
                        {formatCurrency(purchase.amount_paid)}
                      </TableCell>
                      <TableCell className="text-text-secondary">
                        {new Date(purchase.payment_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          purchase.status === 'completed'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : purchase.status === 'pending'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {codePurchases.length > 0 && (
            <div className="rounded-[24px] border border-border bg-surface p-6 mt-6">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-text">Purchases by Referral Code</h3>
                <p className="text-sm text-text-secondary">Track which codes are generating the most commissions</p>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Referee</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead className="text-right">Commission</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {codePurchases.map((cp, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-mono font-bold text-primary">{cp.code}</TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">{cp.referee.full_name}</div>
                        <div className="text-xs text-text-muted">{cp.referee.email}</div>
                      </TableCell>
                      <TableCell className="text-sm">{cp.course.name}</TableCell>
                      <TableCell className="text-right font-black text-emerald-400">
                        {formatCurrency(cp.commission)}
                      </TableCell>
                      <TableCell className="text-text-secondary text-sm">
                        {new Date(cp.payment_date).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {referees.length > 0 && (
            <div className="rounded-[24px] border border-border bg-surface p-6">
              <h3 className="mb-4 text-lg font-bold text-text">Users Using Your Code</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Code Used</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referees.map((referee) => (
                    <TableRow key={referee.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {referee.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{referee.full_name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-text-secondary">{referee.email}</TableCell>
                      <TableCell>
                        <span className="font-mono text-emerald-400">{referee.referred_by}</span>
                      </TableCell>
                      <TableCell className="text-text-secondary">
                        {new Date(referee.date_joined).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="rounded-[24px] border border-border bg-surface p-6">
            <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-text">
              <i className="fas fa-info-circle text-primary"></i>
              How Payouts Work
            </h3>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li className="flex items-start gap-2">
                <i className="fas fa-check text-primary mt-1"></i>
                <span>You earn 20% commission when someone enrolls in a paid course using your referral code.</span>
              </li>
              <li className="flex items-start gap-2">
                <i className="fas fa-check text-primary mt-1"></i>
                <span>Pending payouts are automatically processed and paid out on a regular schedule.</span>
              </li>
              <li className="flex items-start gap-2">
                <i className="fas fa-check text-primary mt-1"></i>
                <span>All earnings are tracked in real-time and visible in your dashboard.</span>
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-[24px] border border-border bg-surface p-12 text-center">
          <Wallet className="h-12 w-12 text-text-muted/40" />
          <div>
            <p className="text-base font-semibold text-text-secondary">No payout data yet</p>
            <p className="text-sm text-text-muted mt-1">
              Start sharing your referral code to earn commissions from course enrollments.
            </p>
          </div>
        </div>
      )}
    </div>
    </motion.div>
  );
};

export default InfluencerEarningsPage;
