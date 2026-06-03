import React, { useEffect, useState } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import adminOrdersApi, { AdminOrder } from '../../../src/api/admin-orders';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { useToast } from '../../../src/hooks/useToast';
import { 
  ArrowLeft,
  Package,
  User,
  CreditCard,
  Calendar,
  MapPin,
  Phone,
  Mail,
  FileText,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const toast = useToast();
  
  const basePath = location.pathname.startsWith('/super-admin') ? '/super-admin' : '/admin';

  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id]);

  const loadOrder = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const orderData = await adminOrdersApi.getOrder(parseInt(id));
      setOrder(orderData);
      setError(null);
    } catch (err) {
      console.error('Failed to load order:', err);
      setError('Order not found');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    if (!confirm('Are you sure you want to cancel this order?')) return;
    
    try {
      setCancelling(true);
      await adminOrdersApi.cancelOrder(order.id);
      toast.success('Order cancelled successfully');
      loadOrder();
    } catch (err) {
      console.error('Failed to cancel order:', err);
      toast.error('Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'refunded': return 'bg-gray-100 text-gray-700';
      default: return 'bg-surface-hover text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <i className="fas fa-circle-notch fa-spin text-4xl text-primary"></i>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Package className="h-12 w-12 text-text-muted opacity-20 mb-4" />
        <p className="text-text-muted font-medium">{error || 'Order not found'}</p>
        <Link to={`${basePath}/orders`} className="mt-4">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-text-muted mb-2">
            <Link to={`${basePath}/orders`} className="hover:text-primary">
              Orders
            </Link>
            <span>/</span>
            <span className="text-primary">{order.order_number}</span>
          </div>
          <h1 className="text-2xl font-bold text-text">Order Details</h1>
          <p className="text-sm text-text-muted">
            View complete order information and manage order status
          </p>
        </div>
        <div className="flex items-center gap-3">
          {order.status === 'pending' && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleCancelOrder}
              isLoading={cancelling}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Cancel Order
            </Button>
          )}
        </div>
      </div>

      {/* Order Status Banner */}
      <div className={`rounded-2xl border p-4 ${getStatusColor(order.status)}`}>
        <div className="flex items-center gap-3">
          {getStatusIcon(order.status)}
          <div>
            <p className="font-bold capitalize">{order.status}</p>
            <p className="text-sm opacity-80">
              {order.status === 'completed' && 'This order has been completed successfully.'}
              {order.status === 'pending' && 'This order is awaiting payment confirmation.'}
              {order.status === 'cancelled' && 'This order has been cancelled.'}
              {order.status === 'refunded' && 'This order has been refunded.'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Summary */}
          <div className="bg-surface rounded-2xl border border-border p-6">
            <h2 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Summary
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-text-muted">Order Number</p>
                <p className="font-semibold text-text font-mono">{order.order_number}</p>
              </div>
              <div>
                <p className="text-text-muted">Created</p>
                <p className="font-semibold text-text">{formatDate(order.created_at)}</p>
              </div>
              <div>
                <p className="text-text-muted">Payment Method</p>
                <p className="font-semibold text-text capitalize">{order.payment_method || 'Online'}</p>
              </div>
              <div>
                <p className="text-text-muted">Payment Status</p>
                <Badge 
                  variant={
                    order.payment_status === 'paid' ? 'success' : 
                    order.payment_status === 'failed' ? 'destructive' : 'warning'
                  }
                >
                  {order.payment_status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-surface rounded-2xl border border-border p-6">
            <h2 className="text-lg font-bold text-text mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items.length > 0 ? (
                order.items.map((item, index) => (
                  <div key={item.id || index} className="flex items-center gap-4 p-4 rounded-xl bg-bg">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <i className={`fas ${
                        item.type === 'course' ? 'fa-book' : 
                        item.type === 'event' ? 'fa-calendar' : 
                        item.type === 'subscription' ? 'fa-sync' : 'fa-shopping-cart'
                      } text-primary`}></i>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-text">
                        {item.course?.title || `Order Item #${item.id}`}
                      </p>
                      <p className="text-xs text-text-muted capitalize">{item.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-text">{order.currency} {parseFloat(item.price).toFixed(2)}</p>
                      <p className="text-xs text-text-muted">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-text-muted py-8">No items in this order</p>
              )}
            </div>
          </div>

          {/* Billing Address */}
          {order.billing_address && (
            <div className="bg-surface rounded-2xl border border-border p-6">
              <h2 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Billing Address
              </h2>
              <div className="text-sm text-text-secondary">
                <p>{order.billing_address.street}</p>
                <p>{order.billing_address.city}, {order.billing_address.state}</p>
                <p>{order.billing_address.zip} {order.billing_address.country}</p>
              </div>
            </div>
          )}
        </div>

        {/* Customer & Payment Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-surface rounded-2xl border border-border p-6">
            <h2 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer
            </h2>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-lg font-bold text-primary">
                  {order.user.full_name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-semibold text-text">{order.user.full_name}</p>
                <p className="text-xs text-text-muted">@{order.user.username}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-text-secondary">
                <Mail className="h-4 w-4" />
                <span>{order.user.email}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <Link to={`${basePath}/users/${order.user.id}`}>
                <Button variant="outline" size="sm" className="w-full">
                  View Customer Profile
                </Button>
              </Link>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-surface rounded-2xl border border-border p-6">
            <h2 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Summary
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Subtotal</span>
                <span className="font-medium text-text">{order.currency} {parseFloat(order.subtotal).toFixed(2)}</span>
              </div>
              {order.discount && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount ({order.discount.code})</span>
                  <span className="font-medium">-{order.currency} {parseFloat(order.discount.amount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-text-secondary">Tax</span>
                <span className="font-medium text-text">{order.currency} {parseFloat(order.tax).toFixed(2)}</span>
              </div>
              <div className="pt-3 border-t border-border flex justify-between">
                <span className="font-bold text-text">Total</span>
                <span className="font-bold text-lg text-text">{order.currency} {parseFloat(order.total).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;