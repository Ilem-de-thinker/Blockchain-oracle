import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminOrdersApi, { AdminOrder } from '../../../src/api/admin-orders';
import { 
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell 
} from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import { Eye, Ban, MoreHorizontal } from 'lucide-react';
import { ReportActions } from '../../../components/ui/ReportActions';

const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  useEffect(() => {
    loadOrders();
  }, [filter, currentPage]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const statusParam = filter === 'all' ? undefined : filter;
      const data = await adminOrdersApi.getOrders(currentPage, pageSize, statusParam);
      setOrders(data.results);
      setTotalItems(data.count);
      setTotalPages(Math.ceil(data.count / pageSize));
      setError(null);
    } catch {
      setError('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
      await adminOrdersApi.cancelOrder(orderId);
      await loadOrders();
    } catch {
      setError('Failed to cancel order.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-surface-hover text-gray-700';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'course': return 'fa-book';
      case 'subscription': return 'fa-sync';
      case 'event': return 'fa-calendar';
      default: return 'fa-shopping-cart';
    }
  };

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
          <h1 className="text-2xl font-bold text-text">Order Management</h1>
          <p className="text-text-muted">View and manage all platform orders</p>
        </div>
        <ReportActions />
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <i className="fas fa-exclamation-circle mr-2"></i>{error}
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {['all', 'completed', 'pending', 'cancelled'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === f
                ? 'bg-purple-600 text-white'
                : 'bg-surface border border-border text-gray-700 hover:bg-bg'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <span className="ml-auto text-sm text-text-muted">
          {totalItems} total orders
        </span>
      </div>

      {/* Orders Table */}
      <Table variant="striped" className="bg-surface rounded-2xl border border-gray-100 overflow-hidden">
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>
                <span className="text-sm font-mono text-gray-700">{order.order_number}</span>
              </TableCell>
              <TableCell>
                <div>
                  <p className="text-sm font-medium text-text">{order.user.full_name}</p>
                  <p className="text-xs text-text-muted">{order.user.email}</p>
                </div>
              </TableCell>
                  <TableCell>
                <div className="flex items-center gap-1">
                  <i className={`fas ${getTypeIcon(order.items[0]?.type || 'course')} text-gray-400 text-xs`}></i>
                  <span className="text-sm text-gray-700">
                    {order.items[0]?.course?.title || 'Multiple items'}
                  </span>
                  {order.items.length > 1 && (
                    <span className="text-xs text-gray-400">(+{order.items.length - 1})</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm font-semibold text-text">
                  {order.currency} {parseFloat(order.total).toFixed(2)}
                </span>
              </TableCell>
              <TableCell>
                <Badge variant={order.payment_status === 'paid' ? 'success' : order.payment_status === 'failed' ? 'destructive' : 'warning'}>
                  {order.payment_status}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={order.status === 'completed' ? 'success' : order.status === 'cancelled' ? 'destructive' : 'warning'}>
                  {order.status}
                </Badge>
              </TableCell>
              <TableCell className="text-text-secondary">{new Date(order.created_at).toLocaleDateString()}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="xs">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to={`/admin/orders/${order.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        <span>View Order</span>
                      </Link>
                    </DropdownMenuItem>
                    {order.status === 'pending' && (
                      <DropdownMenuItem 
                        onClick={() => handleCancelOrder(order.id)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Ban className="mr-2 h-4 w-4" />
                        <span>Cancel Order</span>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {orders.length === 0 && !error && (
        <div className="text-center py-12">
          <div className="w-12 h-12 rounded-full bg-surface-hover flex items-center justify-center mx-auto mb-3">
            <i className="fas fa-shopping-cart text-gray-400 text-lg"></i>
          </div>
          <p className="text-sm font-medium text-text">No orders found</p>
          {filter !== 'all' && (
            <button onClick={() => setFilter('all')} className="text-sm text-purple-600 hover:text-purple-700 mt-2">
              Clear filter
            </button>
          )}
        </div>
      )}
      {/* Pagination */}
      {!loading && orders.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-secondary">
            Showing page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-border text-sm disabled:opacity-50 hover:bg-bg"
            >
              <i className="fas fa-chevron-left text-xs"></i>
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === pageNum
                      ? 'bg-purple-600 text-white'
                      : 'border border-border text-gray-700 hover:bg-bg'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-border text-sm disabled:opacity-50 hover:bg-bg"
            >
              <i className="fas fa-chevron-right text-xs"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
