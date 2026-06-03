import React, { useState, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import ordersApi from '@/src/api/orders';

const PaymentVerifyPage: React.FC = () => {
  const { reference: referenceParam } = useParams<{ reference: string }>();
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reference = referenceParam || searchParams.get('reference') || searchParams.get('trxref') || searchParams.get('ref');
  const pendingContext = (() => {
    const raw = sessionStorage.getItem('pending_payment_context');

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as {
        type?: 'course' | 'event';
        reference?: string;
        courseId?: number;
        eventId?: number;
        next?: string;
      };
    } catch {
      return null;
    }
  })();
  const itemType = (searchParams.get('type') as 'course' | 'event' | null) || pendingContext?.type || 'course';
  const nextPath =
    searchParams.get('next') ||
    pendingContext?.next ||
    (itemType === 'event' ? '/dashboard/registrations' : '/dashboard/courses');

  useEffect(() => {
    if (!reference) {
      setError('No payment reference provided.');
      setVerifying(false);
      return;
    }
    verifyPayment(reference);
  }, [reference]);

  const verifyPayment = async (ref: string) => {
    try {
      setVerifying(true);
      setError(null);
      await ordersApi.verifyTransaction(ref);
      sessionStorage.removeItem('pending_payment_context');
      setSuccess(true);
    } catch {
      setError('Payment verification failed. Please review your transactions if the amount was deducted.');
    } finally {
      setVerifying(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-surface rounded-2xl shadow-lg border border-border p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-circle-notch fa-spin text-2xl text-amber-600"></i>
          </div>
          <h2 className="text-lg font-bold text-text mb-2">Verifying Payment</h2>
          <p className="text-sm text-text-muted">Please wait while we confirm your payment...</p>
          <p className="text-xs text-text-muted mt-2 font-mono">{reference}</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-surface rounded-2xl shadow-lg border border-border p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-check text-2xl text-emerald-600"></i>
          </div>
          <h2 className="text-lg font-bold text-text mb-2">Payment Successful!</h2>
          <p className="text-sm text-text-muted mb-6">
            {itemType === 'event'
              ? 'Your payment has been verified and your event registration is complete.'
              : 'Your payment has been verified and your course enrollment is complete.'}
          </p>
          <div className="flex flex-col gap-2">
            <Link to={nextPath} className="w-full py-2.5 rounded-lg bg-emerald-600 text-white font-medium text-sm hover:bg-emerald-700 transition-colors">
              {itemType === 'event' ? 'Go to My Registrations' : 'Go to My Courses'}
            </Link>
            <Link to="/dashboard/transactions" className="w-full py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors">
              View Transactions
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-surface rounded-2xl shadow-lg border border-border p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-exclamation-triangle text-2xl text-red-600"></i>
        </div>
        <h2 className="text-lg font-bold text-text mb-2">Verification Failed</h2>
        <p className="text-sm text-text-muted mb-6">{error}</p>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => reference && verifyPayment(reference)}
            className="w-full py-2.5 rounded-lg bg-amber-600 text-white font-medium text-sm hover:bg-amber-700 transition-colors"
          >
            <i className="fas fa-redo mr-1"></i>Try Again
          </button>
          <Link to="/dashboard/transactions" className="w-full py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors">
            Back to Transactions
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentVerifyPage;
