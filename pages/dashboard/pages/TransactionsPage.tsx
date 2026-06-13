import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { User } from '../../../types';
import ordersApi, { Transaction } from '../../../src/api/orders';
import analyticsApi, { StudentSpendingHistory } from '../../../src/api/analytics';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { useToast } from '../../../src/hooks/useToast';
import { Chart } from '../../../components/ui/chart';
import { 
  CreditCard, 
  Search, 
  RefreshCcw, 
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  TrendingUp,
  History
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Pagination from '../../../components/ui/Pagination';
import { useLocalStorage } from '../../../hooks/useLocalStorage';

const TransactionsPage: React.FC<{ user: User | null }> = ({ user }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [spendingHistory, setSpendingHistory] = useState<StudentSpendingHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useLocalStorage('transactions_page', 1);
  const [totalItems, setTotalItems] = useState(0);
  const [statusFilter, setStatusFilter] = useLocalStorage('transactions_status_filter', '');
  const [typeFilter, setTypeFilter] = useLocalStorage('transactions_type_filter', '');
  const [searchQuery, setSearchQuery] = useLocalStorage('transactions_search', '');
  const [showFilters, setShowFilters] = useLocalStorage('transactions_show_filters', false);
  const pageSize = 12;
  const { error: toastError } = useToast();

  const loadData = useCallback(async (pageToLoad = currentPage) => {
    try {
      setLoading(true);
      const [txData, historyData] = await Promise.all([
        ordersApi.getMyTransactions(pageToLoad, pageSize, statusFilter || undefined, typeFilter || undefined),
        analyticsApi.getStudentSpendingHistory('month')
      ]);

      let filtered = txData.results;
      if (searchQuery) {
        filtered = filtered.filter(t => 
          t.paystack_reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      setTransactions(filtered);
      setTotalItems(txData.count);
      setSpendingHistory(historyData);
    } catch (err) {
      toastError('Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, searchQuery, pageSize, toastError]);

  useEffect(() => {
    loadData(currentPage);
  }, [currentPage, loadData]);

  const spendingChartData = useMemo(() => {
    if (!spendingHistory?.monthly_spending) return [];
    
    // Get last 12 months
    const months: { [key: string]: number } = {};
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months[key] = 0;
    }
    
    // Fill in actual data
    spendingHistory.monthly_spending.forEach(s => {
      if (months.hasOwnProperty(s.month)) {
        months[s.month] = s.total;
      }
    });
    
    return Object.entries(months).map(([month, total]) => ({
      label: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      value: total,
      monthKey: month
    }));
  }, [spendingHistory]);

  const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setter(value);
    setCurrentPage(1);
  };

  const getStatusVariant = (status: string): any => {
    switch (status?.toLowerCase()) {
      case 'success': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const formatAmount = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(num);
  };

  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <div className="space-y-6 max-w-full overflow-hidden px-1 sm:px-2 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-text tracking-tight">Financial Overview</h1>
          <p className="text-[10px] sm:text-xs text-text-muted">Payment history & spending trends</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => loadData(currentPage)} className="h-8 px-2 text-[10px] sm:text-xs">
            <RefreshCcw className={cn("h-3 w-3 sm:mr-1.5", loading && "animate-spin")} />
            <span className="hidden xs:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Spending Trend Chart */}
      <div className="bg-surface p-4 rounded-xl border border-border shadow-md hover:shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold text-text">Monthly Spending</h2>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-surface-alt rounded-lg">
             <span className="text-[10px] font-bold text-text-muted uppercase">Total:</span>
             <span className="text-[11px] font-black text-primary">
                {formatAmount(spendingHistory?.monthly_spending?.reduce((acc, curr) => acc + curr.total, 0) || 0)}
             </span>
          </div>
        </div>
        {spendingChartData.length > 0 ? (
          <Chart type="line" data={spendingChartData} height={180} />
        ) : (
          <div className="h-[180px] flex items-center justify-center border border-dashed border-border rounded-lg bg-surface-alt/20">
            <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest">No spending history</p>
          </div>
        )}
        <p className="text-[10px] text-text-muted mt-4 text-center italic">Financial summary over the current year</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <History className="h-4 w-4 text-text-muted" />
          <h2 className="text-sm font-bold text-text">Detailed Transactions</h2>
        </div>

        {/* Search & Filter Toggle Row */}
        <div className="bg-surface rounded-xl border border-border p-2 sm:p-3 shadow-md hover:shadow-xl">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                placeholder="Search reference..."
                value={searchQuery}
                onChange={(e) => handleFilterChange(setSearchQuery, e.target.value)}
                className="w-full pl-8 h-9 text-[11px] sm:text-xs bg-surface-alt/50 border-border focus:ring-1"
              />
            </div>
            <Button 
              variant={showFilters ? "default" : "outline"} 
              size="sm" 
              onClick={() => setShowFilters(!showFilters)}
              className="h-9 px-3 shrink-0 text-xs gap-1.5"
            >
              <Filter className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Filters</span>
              {(statusFilter || typeFilter) && !showFilters && (
                <span className="flex h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              )}
            </Button>
          </div>

          {/* Collapsible Filters */}
          <div className={cn(
            "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 transition-all duration-300 ease-in-out overflow-hidden",
            showFilters ? "max-h-40 mt-3 opacity-100" : "max-h-0 opacity-0"
          )}>
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-text-muted px-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => handleFilterChange(setStatusFilter, e.target.value)}
                className="w-full px-2 py-1.5 text-[11px] rounded-lg border border-border bg-surface-alt text-text outline-none focus:ring-1 focus:ring-primary/30"
              >
                <option value="">All Status</option>
                <option value="SUCCESS">Success</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-text-muted px-1">Type</label>
              <select
                value={typeFilter}
                onChange={(e) => handleFilterChange(setTypeFilter, e.target.value)}
                className="w-full px-2 py-1.5 text-[11px] rounded-lg border border-border bg-surface-alt text-text outline-none focus:ring-1 focus:ring-primary/30"
              >
                <option value="">All Types</option>
                <option value="ENROLLMENT">Enrollment</option>
                <option value="EVENT">Event</option>
              </select>
            </div>
            <div className="sm:col-span-2 lg:col-span-1 flex items-end">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 text-[10px] text-text-muted w-full sm:w-auto"
                onClick={() => {
                  setStatusFilter('');
                  setTypeFilter('');
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
              >
                <X className="h-3 w-3 mr-1" /> Clear All
              </Button>
            </div>
          </div>
        </div>

        {/* Desktop Table - Reduced font and more compact */}
        <div className="hidden md:block bg-surface rounded-xl border border-border overflow-hidden shadow-md hover:shadow-xl">
          <Table>
            <TableHeader>
              <TableRow className="bg-surface-alt/30">
                <TableHead className="text-[11px] py-2 h-auto font-bold uppercase tracking-wider">Reference</TableHead>
                <TableHead className="text-[11px] py-2 h-auto font-bold uppercase tracking-wider">Details</TableHead>
                <TableHead className="text-[11px] py-2 h-auto font-bold uppercase tracking-wider">Date</TableHead>
                <TableHead className="text-[11px] py-2 h-auto font-bold uppercase tracking-wider">Amount</TableHead>
                <TableHead className="text-[11px] py-2 h-auto font-bold uppercase tracking-wider">Status</TableHead>
              </TableRow>
            </TableHeader>
             <TableBody>
                {transactions && transactions.length > 0 ? (
                  transactions.map((tx, index) => {
                    const txId = tx.id || index + 1;
                    const reference = tx.paystack_reference || `TXN-${txId}`;
                    return (
                    <TableRow key={txId} className="hover:bg-surface-hover/50">
                      <TableCell className="text-[11px] py-2.5 font-mono text-primary font-medium">
                        <Link to={`/dashboard/transactions/${reference}`} className="hover:underline">
                          {String(reference)}
                        </Link>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <div className="text-[11px] font-bold truncate max-w-[200px]">{tx.item_name || tx.description || tx.transaction_type || 'Payment'}</div>
                        <div className="text-[10px] text-text-muted truncate max-w-[200px] capitalize">{tx.item_type || tx.transaction_type || 'Transaction'}</div>
                      </TableCell>
                      <TableCell className="text-[11px] py-2.5 whitespace-nowrap">
                        {formatDate(tx.created_at)}
                      </TableCell>
                      <TableCell className="text-[11px] py-2.5 font-black text-text">
                        {formatAmount(tx.amount)}
                      </TableCell>
                      <TableCell className="py-2.5">
                        <Badge variant={getStatusVariant(tx.status)} className="text-[9px] uppercase px-1.5 py-0 font-black">
                          {tx.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )})
               ) : (
                 <TableRow key="empty">
                   <TableCell colSpan={5} className="text-center py-12">
                     <div className="flex flex-col items-center opacity-40">
                       <CreditCard className="h-8 w-8 mb-2" />
                       <p className="text-xs">No transactions found</p>
                     </div>
                   </TableCell>
                 </TableRow>
               )}
             </TableBody>
          </Table>
        </div>

        {/* Mobile Card List */}
        <div className="md:hidden space-y-2.5">
          {loading && transactions.length === 0 ? (
            <div className="flex justify-center py-12"><RefreshCcw className="h-6 w-6 animate-spin text-primary/40" /></div>
          ) : transactions.length > 0 ? (
            transactions.map((tx, index) => {
              const txId = tx.id || index + 1;
              const reference = tx.paystack_reference || `TXN-${txId}`;
              return (
              <Link key={txId} to={`/dashboard/transactions/${reference}`} className="block bg-surface p-3 rounded-xl border border-border shadow-md hover:shadow-xl hover:border-primary/30 active:scale-[0.98] transition-all">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant={getStatusVariant(tx.status)} className="text-[9px] font-black uppercase px-1.5 py-0">
                    {tx.status}
                  </Badge>
                  <span className="text-[10px] font-mono text-text-muted">
                    {reference.slice(-8)}
                  </span>
                </div>
                <div className="flex justify-between items-end">
                  <div className="space-y-0.5">
                    <h3 className="text-xs font-bold text-text truncate max-w-[180px]">
                      {tx.item_name || tx.enrollment?.course_title || tx.description || 'System Payment'}
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] text-text-muted">
                      <Calendar className="h-3 w-3" />
                      {formatDate(tx.created_at)}
                      <span className="opacity-20">|</span>
                      <Clock className="h-3 w-3" />
                      {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-text">{formatAmount(tx.amount)}</div>
                    <div className="text-[9px] text-text-muted font-bold uppercase">{tx.transaction_type || tx.item_type || 'Payment'}</div>
                  </div>
                </div>
              </Link>
            )})
          ) : (
            <div className="text-center py-12 bg-surface/50 rounded-xl border border-dashed border-border">
              <CreditCard className="h-8 w-8 mx-auto text-text-muted opacity-20 mb-2" />
              <p className="text-[11px] text-text-muted">No transactions found</p>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionsPage;

