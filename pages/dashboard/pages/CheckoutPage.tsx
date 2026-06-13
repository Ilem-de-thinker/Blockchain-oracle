import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { User } from '../../../types';
import ordersApi, { CreateOrderData, CreateOrderResponse } from '../../../src/api/orders';
import { useToast } from '../../../src/hooks/useToast';
import { getErrorMessage } from '../../../src/api/errorHandler';

type PaymentMethod = 'card' | 'paypal' | 'crypto';

interface CartItem {
  type: 'course' | 'subscription';
  id: number;
  title: string;
  thumbnail_url?: string;
  price: string;
}

const CheckoutPage: React.FC<{ user: User | null }> = ({ user }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [step, setStep] = useState<'cart' | 'billing' | 'processing' | 'success'>('cart');
  const [orderResult, setOrderResult] = useState<CreateOrderResponse | null>(null);

  const [billingAddress, setBillingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zip: '',
    country: '',
  });
  const [discountCode, setDiscountCode] = useState('');
  const [billingErrors, setBillingErrors] = useState<Record<string, string>>({});

  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const itemsParam = searchParams.get('items');
    if (!itemsParam) {
      toast.error('No items in cart.');
      navigate('/dashboard/orders');
      return;
    }

    try {
      const items: CartItem[] = JSON.parse(decodeURIComponent(itemsParam));
      if (items.length === 0) {
        toast.error('No items in cart.');
        navigate('/dashboard/orders');
        return;
      }
      setCartItems(items);
    } catch {
      toast.error('Invalid cart data.');
      navigate('/dashboard/orders');
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  const subtotal = cartItems.reduce((sum, item) => sum + parseFloat(item.price), 0);
  const tax = subtotal * 0.075;
  const total = subtotal + tax;

  const validateBilling = (): boolean => {
    const errors: Record<string, string> = {};
    if (!billingAddress.street.trim()) errors.street = 'Street address is required.';
    if (!billingAddress.city.trim()) errors.city = 'City is required.';
    if (!billingAddress.state.trim()) errors.state = 'State is required.';
    if (!billingAddress.zip.trim()) errors.zip = 'ZIP code is required.';
    if (!billingAddress.country.trim()) errors.country = 'Country is required.';
    setBillingErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateCard = (): boolean => {
    const errors: Record<string, string> = {};
    if (!cardNumber.trim() || cardNumber.replace(/\s/g, '').length < 16) errors.cardNumber = 'Valid card number is required.';
    if (!cardExpiry.trim() || !/^\d{2}\/\d{2}$/.test(cardExpiry)) errors.cardExpiry = 'Valid expiry (MM/YY) is required.';
    if (!cardCvc.trim() || cardCvc.length < 3) errors.cardCvc = 'Valid CVC is required.';
    if (!cardName.trim()) errors.cardName = 'Cardholder name is required.';
    setCardErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (step === 'cart') {
      setStep('billing');
    } else if (step === 'billing') {
      if (validateBilling()) {
        setStep('processing');
      }
    }
  };

  const handleCreateOrder = async () => {
    if (paymentMethod === 'card') {
      toast.info('Card processing is not available. You will be redirected to Paystack.');
    }

    setProcessing(true);
    setStep('processing');
    setError(null);

    try {
      const orderData: CreateOrderData = {
        items: cartItems.map((item) => ({ type: item.type, id: item.id })),
        discount_code: discountCode || undefined,
        billing_address: {
          street: billingAddress.street,
          city: billingAddress.city,
          state: billingAddress.state,
          zip: billingAddress.zip,
          country: billingAddress.country,
        },
      };

      const result = await ordersApi.createOrder(orderData);
      setOrderResult(result);

      if (result.payment_url) {
        sessionStorage.setItem(
          'pending_payment_context',
          JSON.stringify({
            type: 'course',
            reference: result.order_number,
            next: '/dashboard/courses',
          })
        );
        window.location.href = result.payment_url;
        return;
      }

      toast.success('Payment successful! Your order has been completed.');
      setStep('success');
    } catch (err: any) {
      const message = getErrorMessage(err) || 'Payment failed. Please try again.';
      setError(message);
      toast.error(message);
      setStep('billing');
    } finally {
      setProcessing(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : v;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'course': return 'fa-book';
      case 'subscription': return 'fa-sync';
      default: return 'fa-shopping-cart';
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <i className="fas fa-circle-notch fa-spin text-3xl text-emerald-600"></i>
      </div>
    );
  }

  if (step === 'success' && orderResult) {
    return (
      <div className="p-6">
        <div className="max-w-lg mx-auto">
          <div className="bg-surface rounded-xl border border-border p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-check text-2xl text-emerald-600"></i>
            </div>
            <h1 className="text-xl font-bold text-text mb-2">Payment Successful!</h1>
            <p className="text-sm text-text-muted mb-6">
              Your order <span className="font-mono font-medium">{orderResult.order_number}</span> has been completed.
            </p>
            <div className="bg-bg rounded-lg p-4 mb-6">
              <div className="text-sm text-text-secondary">
                <span className="font-medium">Total Paid:</span>{' '}
                <span className="font-bold text-text">{orderResult.currency} {parseFloat(orderResult.total).toFixed(2)}</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/dashboard/orders"
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
              >
                <i className="fas fa-receipt mr-2"></i>View Orders
              </Link>
              <Link
                to="/dashboard/courses"
                className="px-4 py-2 rounded-lg border border-gray-300 text-text-secondary text-sm font-medium hover:bg-bg transition-colors"
              >
                <i className="fas fa-book mr-2"></i>My Courses
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-text-muted mb-6">
        <Link to="/dashboard" className="hover:text-emerald-600">Dashboard</Link>
        <i className="fas fa-chevron-right text-xs"></i>
        <Link to="/dashboard/orders" className="hover:text-emerald-600">Orders</Link>
        <i className="fas fa-chevron-right text-xs"></i>
        <span className="text-text font-medium">Checkout</span>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        {['cart', 'billing'].map((s, i) => {
          const stepLabels = ['Cart', 'Billing'];
          const stepIcons = ['fa-shopping-cart', 'fa-map-marker-alt'];
          const isActive = step === s || (step === 'processing' && s === 'billing');
          const isCompleted = (step === 'billing' && i === 0) || (step === 'processing') || (step === 'success');
          return (
            <React.Fragment key={s}>
              {i > 0 && <div className={`w-16 h-0.5 ${isCompleted ? 'bg-emerald-600' : 'bg-gray-200'}`}></div>}
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm ${
                  isActive ? 'bg-emerald-600 text-white' : isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-text-muted'
                }`}>
                  <i className={`fas ${stepIcons[i]}`}></i>
                </div>
                <span className={`text-xs mt-1 ${isActive ? 'text-emerald-600 font-medium' : 'text-text-muted'}`}>{stepLabels[i]}</span>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 mb-6">
          <i className="fas fa-exclamation-circle mr-2"></i>{error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Cart Step */}
          {step === 'cart' && (
            <div className="bg-surface rounded-xl border border-border overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <h2 className="text-sm font-bold text-text">
                  <i className="fas fa-shopping-cart mr-2 text-emerald-600"></i>Cart Items
                </h2>
              </div>
              <div className="divide-y divide-gray-100">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 px-4 py-4">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <i className={`fas ${getTypeIcon(item.type)} text-text-muted`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text">{item.title}</p>
                      <p className="text-xs text-text-muted capitalize">{item.type}</p>
                    </div>
                    <p className="text-sm font-semibold text-text">${parseFloat(item.price).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="px-4 py-3 bg-bg flex justify-end">
                <button
                  onClick={handleNextStep}
                  className="px-6 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
                >
                  Continue to Billing <i className="fas fa-arrow-right ml-2"></i>
                </button>
              </div>
            </div>
          )}

          {/* Billing Step */}
          {step === 'billing' && (
            <div className="bg-surface rounded-xl border border-border p-6 space-y-6">
              <h2 className="text-base font-bold text-text">
                <i className="fas fa-map-marker-alt mr-2 text-emerald-600"></i>Billing Address
              </h2>

              <div>
                <label htmlFor="street" className="block text-sm font-medium text-text-secondary mb-1">Street Address</label>
                <input
                  id="street"
                  type="text"
                  value={billingAddress.street}
                  onChange={(e) => setBillingAddress({ ...billingAddress, street: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    billingErrors.street ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
                {billingErrors.street && <p className="text-xs text-red-500 mt-1">{billingErrors.street}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-text-secondary mb-1">City</label>
                  <input
                    id="city"
                    type="text"
                    value={billingAddress.city}
                    onChange={(e) => setBillingAddress({ ...billingAddress, city: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      billingErrors.city ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                  {billingErrors.city && <p className="text-xs text-red-500 mt-1">{billingErrors.city}</p>}
                </div>
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-text-secondary mb-1">State</label>
                  <input
                    id="state"
                    type="text"
                    value={billingAddress.state}
                    onChange={(e) => setBillingAddress({ ...billingAddress, state: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      billingErrors.state ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                  {billingErrors.state && <p className="text-xs text-red-500 mt-1">{billingErrors.state}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="zip" className="block text-sm font-medium text-text-secondary mb-1">ZIP Code</label>
                  <input
                    id="zip"
                    type="text"
                    value={billingAddress.zip}
                    onChange={(e) => setBillingAddress({ ...billingAddress, zip: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      billingErrors.zip ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                  {billingErrors.zip && <p className="text-xs text-red-500 mt-1">{billingErrors.zip}</p>}
                </div>
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-text-secondary mb-1">Country</label>
                  <input
                    id="country"
                    type="text"
                    value={billingAddress.country}
                    onChange={(e) => setBillingAddress({ ...billingAddress, country: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      billingErrors.country ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                  {billingErrors.country && <p className="text-xs text-red-500 mt-1">{billingErrors.country}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="discount" className="block text-sm font-medium text-text-secondary mb-1">Discount Code (optional)</label>
                <div className="flex gap-2">
                  <input
                    id="discount"
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    placeholder="Enter code"
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-gray-100">
                <button
                  onClick={() => setStep('cart')}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-text-secondary text-sm font-medium hover:bg-bg transition-colors"
                >
                  <i className="fas fa-arrow-left mr-2"></i>Back
                </button>
                <button
                  onClick={handleNextStep}
                  className="px-6 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
                >
                  Continue to Payment <i className="fas fa-arrow-right ml-2"></i>
                </button>
              </div>
            </div>
          )}

          {/* Payment Step */}
          {step === 'payment' && (
            <div className="bg-surface rounded-xl border border-border p-6 space-y-6">
              <h2 className="text-base font-bold text-text">
                <i className="fas fa-credit-card mr-2 text-emerald-600"></i>Payment Method
              </h2>

              {/* Payment Method Selection */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'card' as PaymentMethod, icon: 'fa-credit-card', label: 'Card' },
                  { value: 'paypal' as PaymentMethod, icon: 'fa-paypal', label: 'PayPal' },
                  { value: 'crypto' as PaymentMethod, icon: 'fa-bitcoin', label: 'Crypto' },
                ].map((method) => (
                  <button
                    key={method.value}
                    onClick={() => {
                      setPaymentMethod(method.value);
                      if (method.value !== 'card') setStep('processing');
                    }}
                    className={`p-4 rounded-lg border text-center transition-colors ${
                      paymentMethod === method.value
                        ? 'border-emerald-300 bg-emerald-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <i className={`fas ${method.icon} text-xl mb-2 ${
                      paymentMethod === method.value ? 'text-emerald-600' : 'text-text-muted'
                    }`}></i>
                    <p className="text-xs font-medium text-text-secondary">{method.label}</p>
                  </button>
                ))}
              </div>

              {/* Card Details */}
              {paymentMethod === 'card' && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="cardName" className="block text-sm font-medium text-text-secondary mb-1">Cardholder Name</label>
                    <input
                      id="cardName"
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="John Doe"
                      className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        cardErrors.cardName ? 'border-red-300' : 'border-gray-200'
                      }`}
                    />
                    {cardErrors.cardName && <p className="text-xs text-red-500 mt-1">{cardErrors.cardName}</p>}
                  </div>
                  <div>
                    <label htmlFor="cardNumber" className="block text-sm font-medium text-text-secondary mb-1">Card Number</label>
                    <input
                      id="cardNumber"
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        cardErrors.cardNumber ? 'border-red-300' : 'border-gray-200'
                      }`}
                    />
                    {cardErrors.cardNumber && <p className="text-xs text-red-500 mt-1">{cardErrors.cardNumber}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="cardExpiry" className="block text-sm font-medium text-text-secondary mb-1">Expiry Date</label>
                      <input
                        id="cardExpiry"
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => {
                          let v = e.target.value.replace(/\D/g, '');
                          if (v.length >= 2) v = v.substring(0, 2) + '/' + v.substring(2);
                          setCardExpiry(v);
                        }}
                        placeholder="MM/YY"
                        maxLength={5}
                        className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                          cardErrors.cardExpiry ? 'border-red-300' : 'border-gray-200'
                        }`}
                      />
                      {cardErrors.cardExpiry && <p className="text-xs text-red-500 mt-1">{cardErrors.cardExpiry}</p>}
                    </div>
                    <div>
                      <label htmlFor="cardCvc" className="block text-sm font-medium text-text-secondary mb-1">CVC</label>
                      <input
                        id="cardCvc"
                        type="text"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').substring(0, 4))}
                        placeholder="123"
                        maxLength={4}
                        className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                          cardErrors.cardCvc ? 'border-red-300' : 'border-gray-200'
                        }`}
                      />
                      {cardErrors.cardCvc && <p className="text-xs text-red-500 mt-1">{cardErrors.cardCvc}</p>}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-4 border-t border-gray-100">
                <button
                  onClick={() => setStep('billing')}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-text-secondary text-sm font-medium hover:bg-bg transition-colors"
                >
                  <i className="fas fa-arrow-left mr-2"></i>Back
                </button>
                <button
                  onClick={handleCreateOrder}
                  disabled={processing}
                  className="px-6 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {processing ? (
                    <span className="flex items-center gap-2">
                      <i className="fas fa-circle-notch fa-spin"></i>
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <i className="fas fa-lock"></i>
                      Pay ${total.toFixed(2)}
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Processing Step */}
          {step === 'processing' && (
            <div className="bg-surface rounded-xl border border-border p-8 text-center">
              <i className="fas fa-circle-notch fa-spin text-4xl text-emerald-600 mb-4"></i>
              <h2 className="text-lg font-bold text-text mb-2">Processing Payment</h2>
              <p className="text-sm text-text-muted">Redirecting you to secure payment...</p>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div>
          <div className="bg-surface rounded-xl border border-border p-4 sticky top-24">
            <h3 className="text-sm font-bold text-text border-b border-gray-100 pb-2 mb-4">
              <i className="fas fa-receipt mr-2 text-emerald-600"></i>Order Summary
            </h3>
            <div className="space-y-3 text-sm">
              {cartItems.map((item, index) => (
                <div key={index} className="flex justify-between text-text-secondary">
                  <span className="truncate mr-2">{item.title}</span>
                  <span className="font-medium">${parseFloat(item.price).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-gray-100 pt-2 flex justify-between text-text-secondary">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-text">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
