import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ArrowLeft, CreditCard, Calendar, Clock, CheckCircle, XCircle, AlertCircle, MapPin, Video, ExternalLink, BookOpen } from 'lucide-react';
import ordersApi, { Transaction } from '@/src/api/orders';
import eventsApi, { Event } from '@/src/api/events';
import coursesApi from '@/src/api/courses';
import { useToast } from '@/src/hooks/useToast';

const TransactionDetailPage: React.FC = () => {
  const { reference } = useParams<{ reference: string }>();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [eventDetails, setEventDetails] = useState<Event | null>(null);
  const [courseDetails, setCourseDetails] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { error: toastError } = useToast();

  useEffect(() => {
    if (reference) {
      fetchTransaction(reference);
    }
  }, [reference]);

  const fetchTransaction = async (ref: string) => {
    setLoading(true);
    setError(null);
    try {
      const tx = await ordersApi.getMyTransactionByReference(ref);
      setTransaction(tx);

      const itemType = (tx.item_type || '').toUpperCase();
      const itemId = tx.item_id ? parseInt(tx.item_id, 10) : null;

      if ((itemType === 'EVENT' || tx.event_id) && (itemId || tx.event_id)) {
        try {
          const ev = await eventsApi.getEvent(itemId || tx.event_id!);
          if (ev) setEventDetails(ev);
        } catch { /* ignore */ }
      }
      if ((itemType === 'COURSE' || itemType === 'ENROLLMENT' || tx.course_id) && (itemId || tx.course_id)) {
        try {
          const course = await coursesApi.getCourse(itemId || tx.course_id!);
          if (course) setCourseDetails(course);
        } catch { /* ignore */ }
      }
    } catch (err) {
      setError('Transaction not found.');
      toastError('Failed to load transaction details');
    } finally {
      setLoading(false);
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

  const formatAmount = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(num);
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'SUCCESS':
      case 'COMPLETED':
        return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case 'FAILED':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
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

  const itemName = transaction?.item_name || transaction?.event_title || transaction?.course_title || (transaction?.enrollment?.course_title) || '';
  const itemType = (transaction?.item_type || transaction?.transaction_type || '').toUpperCase();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="text-center py-20">
        <CreditCard className="h-12 w-12 mx-auto text-text-muted mb-4" />
        <h2 className="text-lg font-bold text-text mb-2">Transaction Not Found</h2>
        <p className="text-sm text-text-muted mb-6">{error || 'The transaction you are looking for does not exist.'}</p>
        <Link to="/dashboard/transactions">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Transactions
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-10">
      <div className="flex items-center gap-4">
        <Link to="/dashboard/transactions">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <h1 className="text-xl font-bold text-text">Transaction Details</h1>
      </div>

      <Card className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon(transaction.status)}
            <div>
              <p className="text-sm font-bold text-text">Transaction Status</p>
              <Badge variant={getStatusVariant(transaction.status)} className="mt-1">
                {transaction.status}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-text">{formatAmount(transaction.amount)}</p>
          </div>
        </div>

        <div className="border-t pt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Reference</p>
              <p className="text-sm font-mono text-primary break-all">{transaction.paystack_reference || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Item</p>
              <p className="text-sm font-bold text-text">{transaction.item_name || itemName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Type</p>
              <p className="text-sm font-bold text-text capitalize">{itemType.toLowerCase() || 'Payment'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Amount</p>
              <p className="text-sm font-black text-text">{formatAmount(transaction.amount)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">
                <Calendar className="h-3 w-3 inline mr-1" />
                Date
              </p>
              <p className="text-sm text-text">{formatDate(transaction.created_at)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">
                <Clock className="h-3 w-3 inline mr-1" />
                Last Updated
              </p>
              <p className="text-sm text-text">{formatDate(transaction.updated_at)}</p>
            </div>
          </div>

          {transaction.description && (
            <div>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Description</p>
              <p className="text-sm text-text bg-surface-alt/50 p-3 rounded-lg">{transaction.description}</p>
            </div>
          )}
        </div>
      </Card>

      {/* What Was Paid For */}
      {(itemName || eventDetails || courseDetails) && (
        <Card className="p-6 space-y-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-text flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" />
            What You Paid For
          </h2>

          <div className="border-t pt-4">
            <div className="flex items-start gap-4">
              {itemType === 'EVENT' || eventDetails ? (
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-text">
                  {eventDetails?.title || courseDetails?.title || itemName}
                </p>
                <Badge variant="outline" className="mt-1 text-[9px] font-bold uppercase">
                  {itemType === 'EVENT' ? 'Event' : 'Course'}
                </Badge>

                {/* Event details */}
                {eventDetails && (
                  <div className="mt-3 space-y-2 text-sm text-text">
                    <div className="flex items-center gap-2 text-text-secondary">
                      <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>{formatDate(eventDetails.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-text-secondary">
                      {eventDetails.is_online ? (
                        <><Video className="h-3.5 w-3.5 text-emerald-500 shrink-0" /><span>Online {eventDetails.event_url && <a href={eventDetails.event_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">Join Link <ExternalLink className="h-3 w-3 inline" /></a>}</span></>
                      ) : (
                        <><MapPin className="h-3.5 w-3.5 text-emerald-500 shrink-0" /><span>{eventDetails.location || 'Venue TBD'}</span></>
                      )}
                    </div>
                    {eventDetails.description && (
                      <p className="text-text-secondary text-xs leading-relaxed line-clamp-3 mt-1">
                        {eventDetails.description}
                      </p>
                    )}
                    <div className="flex gap-2 mt-2">
                      {eventDetails.registration_fee && parseFloat(eventDetails.registration_fee) > 0 && (
                        <span className="text-[10px] font-bold text-text-muted">Reg Fee: {formatAmount(eventDetails.registration_fee)}</span>
                      )}
                      {eventDetails.event_fee && parseFloat(eventDetails.event_fee) > 0 && (
                        <span className="text-[10px] font-bold text-text-muted">Event Fee: {formatAmount(eventDetails.event_fee)}</span>
                      )}
                    </div>
                    <Link to={`/dashboard/events/${eventDetails.id}`} className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2 font-medium">
                      <ExternalLink className="h-3 w-3" />
                      View Event Details
                    </Link>
                  </div>
                )}

                {/* Course details */}
                {courseDetails && (
                  <div className="mt-3 space-y-2 text-sm text-text">
                    {courseDetails.description && (
                      <p className="text-text-secondary text-xs leading-relaxed line-clamp-3">
                        {courseDetails.description}
                      </p>
                    )}
                    {courseDetails.price && (
                      <div className="flex items-center gap-2 text-text-secondary">
                        <span className="text-[10px] font-bold">Price: {formatAmount(courseDetails.price)}</span>
                      </div>
                    )}
                    <Link to={`/dashboard/course/${courseDetails.id}`} className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2 font-medium">
                      <ExternalLink className="h-3 w-3" />
                      View Course Details
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {transaction.enrollment && !eventDetails && !courseDetails && (
        <Card className="p-6">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Course</p>
          <Link to={`/dashboard/course/${transaction.enrollment.id}`} className="text-sm text-primary hover:underline font-medium">
            {transaction.enrollment.course_title}
          </Link>
        </Card>
      )}
    </div>
  );
};

export default TransactionDetailPage;
