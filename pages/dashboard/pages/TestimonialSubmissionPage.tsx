import React, { useState, useEffect, useCallback } from 'react';
import { User } from '../../../types';
import testimonialsApi, { Testimonial } from '../../../src/api/testimonials';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { useToast } from '../../../src/hooks/useToast';
import { MessageSquare, Plus, Trash2, RefreshCcw, Eye, EyeOff, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Textarea } from '../../../components/ui/textarea';

interface TestimonialSubmissionPageProps {
  user: User | null;
}

const TestimonialSubmissionPage: React.FC<TestimonialSubmissionPageProps> = ({ user }) => {
  const { error: toastError, success: toastSuccess } = useToast();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [quote, setQuote] = useState('');
  const [makePublic, setMakePublic] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const loadTestimonials = useCallback(async () => {
    try {
      setLoading(true);
      const response = await testimonialsApi.getMyTestimonials();
      setTestimonials(response.results || []);
    } catch (err) {
      // API not ready yet - use empty state
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTestimonials();
  }, [loadTestimonials]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quote.trim() || quote.trim().length < 50) {
      toastError('Testimonial must be at least 50 characters.');
      return;
    }

    setSubmitting(true);
    try {
      await testimonialsApi.submitTestimonial({
        quote: quote.trim(),
        make_public: makePublic,
      });
      toastSuccess('Testimonial submitted successfully! It will appear on the landing page after admin approval.');
      setQuote('');
      setMakePublic(true);
      setShowForm(false);
      loadTestimonials();
    } catch (err) {
      toastError('Failed to submit testimonial. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;

    try {
      await testimonialsApi.deleteMyTestimonial(id);
      toastSuccess('Testimonial deleted.');
      loadTestimonials();
    } catch (err) {
      toastError('Failed to delete testimonial.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge className="bg-amber-100 text-amber-700 border-amber-200"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-full overflow-hidden px-1 sm:px-2">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-text tracking-tight">My Testimonial</h1>
          <p className="text-[10px] sm:text-xs text-text-muted">Share your experience on the landing page</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={loadTestimonials} className="h-8 px-2 text-[10px] sm:text-xs">
            <RefreshCcw className={`h-3 w-3 sm:mr-1.5 ${loading && 'animate-spin'}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          {!showForm && (
            <Button size="sm" onClick={() => setShowForm(true)} className="h-8 px-3 text-[10px] sm:text-xs">
              <Plus className="h-3 w-3 mr-1" /> New Testimonial
            </Button>
          )}
        </div>
      </div>

      {/* Submit Form */}
      {showForm && (
        <div className="bg-surface rounded-xl border border-border p-4 sm:p-6 shadow-md">
          <h3 className="text-sm font-bold text-text mb-4">Submit Your Testimonial</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-2">
                Your Testimonial <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                placeholder="Share your experience with BlockchainOracle... (minimum 50 characters)"
                className="min-h-[120px] text-sm resize-none"
                maxLength={500}
              />
              <div className="flex justify-between mt-1">
                <p className="text-[10px] text-text-muted">Minimum 50 characters</p>
                <p className="text-[10px] text-text-muted">{quote.length}/500</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={makePublic}
                  onChange={(e) => setMakePublic(e.target.checked)}
                  className="h-4 w-4 rounded border-border"
                />
                <span className="text-sm text-text">Make this public on the landing page</span>
              </label>
              {makePublic ? (
                <Eye className="h-4 w-4 text-green-500" />
              ) : (
                <EyeOff className="h-4 w-4 text-text-muted" />
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="submit"
                disabled={submitting || quote.trim().length < 50}
                className="h-9 text-xs"
              >
                {submitting ? 'Submitting...' : 'Submit Testimonial'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => { setShowForm(false); setQuote(''); }}
                className="h-9 text-xs"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Existing Testimonials */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <RefreshCcw className="animate-spin h-6 w-6 text-text-muted" />
        </div>
      ) : testimonials.length > 0 ? (
        <div className="space-y-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-surface rounded-xl border border-border p-4 sm:p-5 shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {getStatusBadge(testimonial.status)}
                    {testimonial.is_public ? (
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200"><Eye className="w-3 h-3 mr-1" /> Public</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-500 border-gray-200"><EyeOff className="w-3 h-3 mr-1" /> Private</Badge>
                    )}
                  </div>
                  <p className="text-sm text-text leading-relaxed">"{testimonial.quote}"</p>
                  <p className="text-[10px] text-text-muted mt-2">
                    Submitted {new Date(testimonial.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {(testimonial.status === 'pending' || testimonial.status === 'rejected') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(testimonial.id)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-surface rounded-xl border border-dashed border-border">
          <MessageSquare className="h-10 w-10 mx-auto text-text-muted mb-2" />
          <p className="text-xs font-medium text-text-muted">No testimonials yet</p>
          <p className="text-[10px] text-text-muted mt-1">Share your experience to be featured on our landing page</p>
          {!showForm && (
            <Button size="sm" onClick={() => setShowForm(true)} className="mt-4 h-8 text-[10px]">
              <Plus className="h-3 w-3 mr-1" /> Submit Your First Testimonial
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default TestimonialSubmissionPage;
