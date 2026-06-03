import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User } from '@/types';
import ordersApi, { Order } from '@/src/api/orders';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/src/hooks/useToast';
import { 
  Receipt, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  RefreshCcw, 
  Calendar,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Pagination from '@/components/ui/Pagination';

const OrdersPage: React.FC<{ user: User | null }> = ({ user }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const pageSize = 12;
  const { error: toastError } = useToast();

  const loadOrders = useCallback(async (pageToLoad = currentPage) => {
    try {
      setLoading(true);
      const statusParam = filter === 'all' ? undefined : filter;
      const data = await ordersApi.getOrders(pageToLoad, pageSize, statusParam);
      setOrders(data.results);
      setTotalItems(data.count);
    } catch (err) {
      toastError('Failed to load your orders');
    } finally {
      setLoading(false);
    }
  }, [filter, pageSize, toastError]);

  useEffect(() => {
    loadOrders(currentPage);
  }, [currentPage, loadOrders]);

  const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setter(value);
    setCurrentPage(1);
  };

  const getStatusVariant = (status: string): any => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'destructive';
      case 'refunded': return 'outline';
      default: return 'outline';
    }
  };

  const filteredOrders = orders.filter(o => 
    o.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (o.items[0]?.course?.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <div className="space-y-4 max-w-full overflow-hidden px-1 sm:px-2">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-text tracking-tight">Order History</h1>
          <p className="text-[10px] sm:text-xs text-text-muted">Purchase history</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => loadOrders(currentPage)} className="h-8 px-2 text-[10px] sm:text-xs">
          <RefreshCcw className={cn("h-3 w-3 sm:mr-1.5", loading && "animate-spin")} />
          <span className="hidden xs:inline">Refresh</span>
        </Button>
      </div>

      {/* Stats Summary - Compact Grid */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="bg-surface rounded-xl border border-border p-2 sm:p-3">
          <div className="flex flex-col">
            <p className="text-[9px] sm:text-[10px] text-text-muted uppercase font-bold tracking-wider">Total</p>
            <p className="text-sm sm:text-lg font-black text-text">{totalItems}</p>
          </div>
        </div>
        <div className="bg-surface rounded-xl border border-border p-2 sm:p-3">
          <div className="flex flex-col">
            <p className="text-[9px] sm:text-[10px] text-text-muted uppercase font-bold tracking-wider text-emerald-500">Done</p>
            <p className="text-sm sm:text-lg font-black text-text">
              {orders.filter(o => o.status === 'completed').length}
            </p>
          </div>
        </div>
        <div className="bg-surface rounded-xl border border-border p-2 sm:p-3">
          <div className="flex flex-col">
            <p className="text-[9px] sm:text-[10px] text-text-muted uppercase font-bold tracking-wider text-amber-500">Wait</p>
            <p className="text-sm sm:text-lg font-black text-text">
              {orders.filter(o => o.status === 'pending').length}
            </p>
          </div>
        </div>
      </div>

      {/* Collapsible Search & Filter */}
      <div className="bg-surface rounded-xl border border-border p-2 sm:p-3 shadow-sm">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => handleFilterChange(setSearchQuery, e.target.value)}
              className="pl-8 h-9 text-[11px] sm:text-xs bg-surface-alt/50 border-border focus:ring-1"
            />
          </div>
          <Button 
            variant={showFilters ? "default" : "outline"} 
            size="sm" 
            onClick={() => setShowFilters(!showFilters)}
            className="h-9 px-3 shrink-0 text-xs gap-1.5"
          >
            <Filter className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Filter</span>
          </Button>
        </div>

        <div className={cn(
          "transition-all duration-300 ease-in-out overflow-hidden",
          showFilters ? "max-h-24 mt-3 opacity-100" : "max-h-0 opacity-0"
        )}>
          <div className="flex flex-wrap gap-1.5">
            {['all', 'completed', 'pending', 'cancelled'].map((f) => (
              <button
                key={f}
                onClick={() => handleFilterChange(setFilter, f)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all",
                  filter === f
                    ? "bg-primary text-white shadow-sm"
                    : "bg-surface-alt text-text-muted hover:bg-surface-active"
                )}
              >
                {f}
              </button>
            ))}
            {(filter !== 'all' || searchQuery) && (
               <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px]" onClick={() => {setFilter('all'); setSearchQuery(''); setCurrentPage(1);}}>
                 <X className="h-3 w-3 mr-1" /> Reset
               </Button>
            )}
          </div>
        </div>
      </div>

      {/* Orders Table - Desktop */}
      <div className="hidden md:block bg-surface rounded-xl border border-border overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-surface-alt/30">
              <TableHead className="text-[11px] py-2 h-auto font-bold uppercase tracking-wider">Order ID</TableHead>
              <TableHead className="text-[11px] py-2 h-auto font-bold uppercase tracking-wider">Item</TableHead>
              <TableHead className="text-[11px] py-2 h-auto font-bold uppercase tracking-wider">Date</TableHead>
              <TableHead className="text-[11px] py-2 h-auto font-bold uppercase tracking-wider">Total</TableHead>
              <TableHead className="text-[11px] py-2 h-auto font-bold uppercase tracking-wider">Status</TableHead>
              <TableHead className="text-[11px] py-2 h-auto font-bold uppercase tracking-wider text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <TableRow key={order.id} className="hover:bg-surface-hover/50">
                  <TableCell className="text-[11px] py-2.5 font-mono text-primary font-bold">
                    {order.order_number}
                  </TableCell>
                  <TableCell className="py-2.5">
                    <div className="text-[11px] font-bold text-text truncate max-w-[150px]">
                      {order.items[0]?.course?.title || 'System Order'}
                    </div>
                  </TableCell>
                  <TableCell className="text-[11px] py-2.5">
                    {new Date(order.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-[11px] py-2.5 font-black text-text">
                    {parseFloat(order.total) === 0 ? 'Free' : `$${parseFloat(order.total).toLocaleString()}`}
                  </TableCell>
                  <TableCell className="py-2.5">
                    <Badge variant={getStatusVariant(order.status)} className="capitalize text-[9px] font-black px-1.5 py-0">
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-2.5 text-right">
                    <Link to={`/dashboard/orders/${order.id}`}>
                      <Button variant="ghost" size="xs" className="h-7 w-7 p-0">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={6} className="text-center py-12 text-xs text-text-muted">No orders found</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Orders List - Mobile */}
      <div className="md:hidden space-y-2.5">
        {loading && orders.length === 0 ? (
          <div className="flex justify-center py-12"><RefreshCcw className="h-6 w-6 animate-spin text-primary/40" /></div>
        ) : filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <Link key={order.id} to={`/dashboard/orders/${order.id}`} className="block bg-surface p-3 rounded-xl border border-border shadow-sm active:scale-[0.98] transition-transform">
              <div className="flex justify-between items-start mb-2">
                <Badge variant={getStatusVariant(order.status)} className="text-[9px] font-black uppercase px-1.5 py-0">
                  {order.status}
                </Badge>
                <span className="text-[10px] font-mono text-primary font-bold">{order.order_number}</span>
              </div>
              <div className="flex justify-between items-end">
                <div className="space-y-0.5">
                  <h3 className="text-xs font-bold text-text truncate max-w-[180px]">
                    {order.items[0]?.course?.title || 'System Order'}
                  </h3>
                  <p className="text-[10px] text-text-muted">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-text">
                    {parseFloat(order.total) === 0 ? 'Free' : `$${parseFloat(order.total).toLocaleString()}`}
                  </div>
                  <div className="text-[9px] text-primary font-bold">Details <ArrowRight className="inline h-2 w-2" /></div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center py-12 bg-surface/50 rounded-xl border border-dashed border-border">
            <ShoppingBag className="h-8 w-8 mx-auto text-text-muted opacity-20 mb-2" />
            <p className="text-[11px] text-text-muted">No orders found</p>
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
  );
};

// Simple icon for list link
const ArrowRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
);

export default OrdersPage;
