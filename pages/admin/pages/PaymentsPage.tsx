import React, { useState, useEffect } from 'react';
import { DataTable } from '../components/DataTable';
import { Badge, StatusPill } from '../components/Badge';
import { StatCard } from '../components/Badge';
import adminPaymentsApi, { Transaction } from '../../../src/api/admin-payments';
import { useToast } from '../../../src/hooks/useToast';
import { Button } from '../../../components/ui/button';
import { ReportActions } from '../../../components/ui/ReportActions';
import { DollarSign, CreditCard, TrendingUp } from 'lucide-react';

interface Payment {
  id: number;
  transactionId: number;
  userId: number;
  user: string;
  userEmail: string;
  type: 'course' | 'event' | 'consulting' | 'subscription';
  item: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  reference: string;
  date: string;
}

const mapBackendTransactionToPayment = (tx: Transaction): Payment => {
  const typeMap: Record<string, Payment['type']> = {
    'ENROLL': 'course',
    'EVENT': 'event',
    'CONSULTING': 'consulting',
    'SUBSCRIPTION': 'subscription',
  };
  
  return {
    id: tx.id,
    transactionId: tx.id,
    userId: tx.user,
    user: tx.user_info?.full_name || 'Unknown User',
    userEmail: tx.user_info?.email || '',
    type: (typeMap[tx.transaction_type || ''] || 'course') as Payment['type'],
    item: tx.description || tx.paystack_reference || 'Payment',
    amount: tx.amount,
    status: tx.status === 'SUCCESS' ? 'completed' : tx.status === 'PENDING' ? 'pending' : 'failed',
    reference: tx.paystack_reference || '',
    date: tx.created_at,
  };
};

const PaymentsPage: React.FC = () => {
  const toast = useToast();
  const [filter, setFilter] = useState('all');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [allPayments, setAllPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState({
    revenue: '$0',
    transactions: '0',
    avgOrder: '$0',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const statusParam = filter === 'all' ? undefined : filter;
      
      const transactionsData = await adminPaymentsApi.getAllTransactions(1, 100, statusParam);
      
      const mappedPayments: Payment[] = transactionsData.results.map(mapBackendTransactionToPayment);
      
      setAllPayments(mappedPayments);
      setPayments(mappedPayments.filter(p => filter === 'all' || p.status === filter));
      
      const successful = transactionsData.results.filter(tx => tx.status === 'SUCCESS');
      const totalAmount = successful.reduce((sum, tx) => sum + tx.amount, 0);
      
      setStats({
        revenue: `$${totalAmount.toLocaleString()}`,
        transactions: successful.length.toString(),
        avgOrder: successful.length > 0 ? `$${Math.round(totalAmount / successful.length)}` : '$0',
      });
    } catch (error) {
      console.error('Failed to load payments:', error);
      setPayments([]);
      setAllPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'id', header: 'Reference', render: (item: Payment) => (
      <div className="flex flex-col">
        <span className="font-mono text-sm text-primary">{item.reference.substring(0, 15)}...</span>
        <span className="text-xs text-text-muted">#{item.id}</span>
      </div>
    )},
    { key: 'user', header: 'User', render: (item: Payment) => (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-xs font-bold text-primary">{item.user.charAt(0)}</span>
        </div>
        <div>
          <p className="text-sm font-medium">{item.user}</p>
          <p className="text-xs text-text-muted">{item.userEmail}</p>
        </div>
      </div>
    )},
    { key: 'type', header: 'Type', render: (item: Payment) => (
      <Badge variant={item.type === 'course' ? 'primary' : item.type === 'event' ? 'info' : 'warning'}>
        {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
      </Badge>
    )},
    { key: 'item', header: 'Description', render: (item: Payment) => (
      <span className="text-sm text-text-secondary truncate max-w-[150px] block">{item.item}</span>
    )},
    { key: 'amount', header: 'Amount', render: (item: Payment) => (
      <span className="font-semibold text-text">${item.amount.toLocaleString()}</span>
    )},
    { key: 'status', header: 'Status', render: (item: Payment) => <StatusPill status={item.status} /> },
    { key: 'date', header: 'Date', render: (item: Payment) => (
      <span className="text-sm text-text-muted">{new Date(item.date).toLocaleDateString()}</span>
    )},
  ];

  const paymentsCsvData = allPayments.map(p => ({
    ID: p.id,
    Reference: p.reference,
    User: p.user,
    Email: p.userEmail,
    Type: p.type,
    Amount: p.amount,
    Status: p.status,
    Date: new Date(p.date).toLocaleDateString()
  }));

  const statsData = [
    { title: 'Revenue (Total)', value: stats.revenue, change: { value: 18.7, trend: 'up' }, icon: 'fa-dollar-sign', color: 'purple' },
    { title: 'Transactions', value: stats.transactions, change: { value: 12.3, trend: 'up' }, icon: 'fa-credit-card', color: 'blue' },
    { title: 'Avg. Order', value: stats.avgOrder, change: { value: 8.1, trend: 'up' }, icon: 'fa-chart-line', color: 'purple' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <i className="fas fa-circle-notch fa-spin text-4xl text-purple-600"></i>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Payments & Revenue</h1>
          <p className="text-text-muted">Track transactions and revenue</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-4 py-2 rounded-xl border border-border focus:ring-2 focus:ring-purple-500">
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
          </select>
          <ReportActions csvData={paymentsCsvData} />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statsData.map((stat, idx) => <StatCard key={idx} {...stat} />)}
      </div>

      <DataTable data={payments} columns={columns} rowKey="id" />
    </div>
  );
};

export default PaymentsPage;
