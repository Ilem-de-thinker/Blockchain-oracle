import React, { useState, useEffect } from 'react';
import adminPaymentsApi, { Transaction } from '../../../src/api/admin-payments';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { useToast } from '../../../src/hooks/useToast';
import { cn } from '@/lib/utils';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { 
  Search, 
  Filter, 
  FileDown, 
  RefreshCcw, 
  CreditCard,
  User as UserIcon,
  Calendar,
  Eye,
  X,
  MoreHorizontal,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { ReportActions } from '../../../components/ui/ReportActions';

const AdminTransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useLocalStorage('admin_transactions_search', '');
  const [currentPage, setCurrentPage] = useLocalStorage('admin_transactions_page', 1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [verifying, setVerifying] = useState(false);
  const pageSize = 20;
  const toast = useToast();

  useEffect(() => {
    loadTransactions();
  }, [currentPage]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await adminPaymentsApi.getAllTransactions(currentPage, pageSize);
      setTransactions(data.results);
      setTotalItems(data.count);
      setTotalPages(Math.ceil(data.count / pageSize) || 1);
    } catch {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (ref: string) => {
    try {
      setVerifying(true);
      const result = await adminPaymentsApi.verifyPayment(ref);
      toast.success(result.message || 'Payment verified successfully');
    } catch (error: any) {
      toast.error('Verification failed: ' + (error?.response?.data?.message || 'Unknown error'));
    } finally {
      setVerifying(false);
    }
  };

  const getStatusVariant = (status: string): any => {
    switch (status?.toLowerCase()) {
      case 'success':
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const filteredTransactions = transactions.filter(tx => 
    !searchQuery ||
    tx.paystack_reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx.user_info?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <i className="fas fa-circle-notch fa-spin text-4xl text-primary"></i>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Financial Transactions</h1>
          <p className="text-sm text-text-muted">Monitor and verify all platform payments</p>
        </div>
        <div className="flex items-center gap-3">
          <ReportActions />
          <Button variant="outline" size="sm">
            <FileDown className="mr-2 h-4 w-4" /> Export Report
          </Button>
          <Button variant="ghost" size="sm" onClick={() => loadTransactions()}>
            <RefreshCcw className={loading ? "animate-spin mr-2 h-4 w-4" : "mr-2 h-4 w-4"} /> 
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface rounded-2xl border border-border p-4">
          <p className="text-xs text-text-muted uppercase font-bold tracking-wider">Total Transactions</p>
          <p className="text-2xl font-black text-text mt-1">{totalItems}</p>
        </div>
        <div className="bg-surface rounded-2xl border border-border p-4">
          <p className="text-xs text-text-muted uppercase font-bold tracking-wider">Successful</p>
          <p className="text-2xl font-black text-emerald-500 mt-1">{transactions.filter(t => t.status === 'SUCCESS').length}</p>
        </div>
        <div className="bg-surface rounded-2xl border border-border p-4">
          <p className="text-xs text-text-muted uppercase font-bold tracking-wider">Pending</p>
          <p className="text-2xl font-black text-amber-500 mt-1">{transactions.filter(t => t.status === 'PENDING').length}</p>
        </div>
        <div className="bg-surface rounded-2xl border border-border p-4">
          <p className="text-xs text-text-muted uppercase font-bold tracking-wider">Failed/Refunded</p>
          <p className="text-2xl font-black text-red-500 mt-1">{transactions.filter(t => t.status === 'FAILED' || t.status === 'REFUNDED').length}</p>
        </div>
      </div>

      <div className="bg-surface rounded-2xl border border-border p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[300px] relative">
            <Input
              placeholder="Search reference, user, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="secondary">
            <Filter className="mr-2 h-4 w-4" /> More Filters
          </Button>
        </div>
      </div>

      <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm">
        <Table variant="striped">
          <TableHeader>
            <TableRow className="bg-surface-alt/50">
              <TableHead>Reference</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-40 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <CreditCard className="h-10 w-10 text-text-muted opacity-20 mb-2" />
                    <p className="text-text-muted">No transactions found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((tx) => (
                <TableRow key={tx.id} className="group">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-xs font-mono font-bold text-primary">{tx.paystack_reference}</span>
                      <span className="text-[10px] text-text-muted uppercase tracking-tight">PAYSTACK</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {tx.user_info ? (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <UserIcon size={14} className="text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-text truncate">{tx.user_info.full_name}</p>
                          <p className="text-[10px] text-text-muted truncate">{tx.user_info.email}</p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-text-muted">User ID: {tx.user}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <p className="text-xs text-text-secondary max-w-[200px] truncate">{tx.description || tx.transaction_type || 'System Payment'}</p>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-black text-text">
                      ₦ {Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(tx.status)} className="text-[10px] uppercase font-black tracking-tight">
                      {tx.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs text-text-muted">
                      <Calendar size={12} />
                      {new Date(tx.created_at).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="xs" 
                        onClick={() => handleVerify(tx.paystack_reference)}
                        disabled={verifying}
                        title="Verify Status"
                      >
                        <ShieldCheck className={cn("h-4 w-4 text-emerald-600", verifying && "animate-pulse")} />
                      </Button>
                      <Button variant="ghost" size="xs" onClick={() => setSelectedTx(tx)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-2">
        <p className="text-sm text-text-muted">
          Showing <span className="font-bold text-text">{filteredTransactions.length}</span> of <span className="font-bold text-text">{totalItems}</span> transactions
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-text-muted">Page {currentPage} of {totalPages}</span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      <Dialog open={!!selectedTx} onOpenChange={(open) => !open && setSelectedTx(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Transaction Details
            </DialogTitle>
          </DialogHeader>
          {selectedTx && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-wider">Reference</p>
                  <p className="text-sm font-mono font-bold text-text">{selectedTx.reference}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-wider">Status</p>
                  <Badge variant={getStatusVariant(selectedTx.status)} className="mt-1">
                    {selectedTx.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-wider">Amount</p>
                  <p className="text-lg font-black text-text">{selectedTx.currency} {Number(selectedTx.amount).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-wider">Provider</p>
                  <p className="text-sm font-bold text-text uppercase">{selectedTx.provider}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-wider">Payment Method</p>
                  <p className="text-sm font-bold text-text capitalize">{selectedTx.payment_method}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-wider">Date</p>
                  <p className="text-sm text-text">{new Date(selectedTx.created_at).toLocaleString()}</p>
                </div>
              </div>
              {selectedTx.user && (
                <div className="border-t border-border pt-4">
                  <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Customer</p>
                  <div className="flex items-center gap-3 bg-surface-alt p-3 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <UserIcon size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-text">{selectedTx.user.full_name}</p>
                      <p className="text-xs text-text-muted">{selectedTx.user.email}</p>
                    </div>
                  </div>
                </div>
              )}
              <div className="border-t border-border pt-4">
                <p className="text-xs text-text-muted uppercase tracking-wider">Description</p>
                <p className="text-sm text-text">{selectedTx.description || 'No description'}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTransactionsPage;