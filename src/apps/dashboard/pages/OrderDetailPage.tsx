import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { User } from '@/types';
import ordersApi, { Order } from '@/src/api/orders';
import { useToast } from '@/src/hooks/useToast';

const OrderDetailPage: React.FC<{ user: User | null }> = ({ user }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadOrder(parseInt(id));
  }, [id]);

  const loadOrder = async (orderId: number) => {
    try {
      setLoading(true);
      const data = await ordersApi.getOrder(orderId);
      setOrder(data);
      setError(null);
    } catch {
      setError('Failed to load order details.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order || !confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      const result = await ordersApi.cancelOrder(order.id);
      toast.warning(result.message || 'Canceling orders is not supported.', 'Not available');
      await loadOrder(order.id);
    } catch {
      setError('Failed to cancel order.');
    } finally {
      setCancelling(false);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-text-secondary';
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <i className="fas fa-circle-notch fa-spin text-3xl text-emerald-600 mb-3"></i>
          <p className="text-text-secondary">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          <i className="fas fa-exclamation-circle mr-2"></i>{error}
        </div>
        <button onClick={() => navigate('/dashboard/orders')} className="mt-4 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm">
          <i className="fas fa-arrow-left mr-2"></i>Back to Orders
        </button>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-text-muted">
        <Link to="/dashboard" className="hover:text-emerald-600">Dashboard</Link>
        <i className="fas fa-chevron-right text-xs"></i>
        <Link to="/dashboard/orders" className="hover:text-emerald-600">Orders</Link>
        <i className="fas fa-chevron-right text-xs"></i>
        <span className="text-text font-medium">{order.order_number}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-text">{order.order_number}</h1>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getStatusColor(order.status)}`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>
          <p className="text-sm text-text-muted mt-1">
            Placed on {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {order.status === 'pending' && (
            <button
              onClick={handleCancelOrder}
              disabled={cancelling}
              className="px-4 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 text-sm font-medium disabled:opacity-50"
            >
              {cancelling ? <><i className="fas fa-circle-notch fa-spin mr-1"></i>Cancelling...</> : <><i className="fas fa-ban mr-1"></i>Cancel Order</>}
            </button>
          )}
          <button
            onClick={() => navigate('/dashboard/orders')}
            className="px-4 py-2 rounded-lg border border-gray-300 text-text-secondary hover:bg-gray-50 text-sm font-medium"
          >
            <i className="fas fa-arrow-left mr-1"></i>Back
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 bg-surface rounded-xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-sm font-bold text-text">
              <i className="fas fa-shopping-bag mr-2 text-emerald-600"></i>Order Items
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 px-4 py-4">
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <i className={`fas ${getTypeIcon(item.type)} text-text-muted`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text">
                    {item.course?.title || `${item.type.charAt(0).toUpperCase() + item.type.slice(1)} Purchase`}
                  </p>
                  <p className="text-xs text-text-muted capitalize">{item.type} &middot; Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold text-text">${parseFloat(item.price).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <div className="bg-surface rounded-xl border border-border p-4 space-y-3">
            <h2 className="text-sm font-bold text-text border-b border-gray-100 pb-2">
              <i className="fas fa-receipt mr-2 text-emerald-600"></i>Order Summary
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-text-secondary">
                <span>Subtotal</span>
                <span>${parseFloat(order.subtotal).toFixed(2)}</span>
              </div>
              {order.discount && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount ({order.discount.code})</span>
                  <span>-${parseFloat(order.discount.amount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-text-secondary">
                <span>Tax</span>
                <span>${parseFloat(order.tax).toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-text">
                <span>Total</span>
                <span>{order.currency} {parseFloat(order.total).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-xl border border-border p-4 space-y-3">
            <h2 className="text-sm font-bold text-text border-b border-gray-100 pb-2">
              <i className="fas fa-info-circle mr-2 text-emerald-600"></i>Order Info
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">Payment Status</span>
                <span className={`font-medium capitalize ${order.payment_status === 'paid' ? 'text-emerald-600' : order.payment_status === 'failed' ? 'text-red-600' : 'text-amber-600'}`}>
                  {order.payment_status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Payment Method</span>
                <span className="font-medium capitalize">{order.payment_method || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Currency</span>
                <span className="font-medium">{order.currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Last Updated</span>
                <span className="font-medium">{new Date(order.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default OrderDetailPage;
