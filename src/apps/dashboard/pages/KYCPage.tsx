import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, AlertCircle, RefreshCcw, ChevronRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authApi } from '@/src/api/auth';
import { useToast } from '@/src/hooks/useToast';

const KYCPage: React.FC = () => {
  const [idNumber, setIdNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<string>('unverified');
  const toast = useToast();

  useEffect(() => {
    const checkVerificationStatus = async () => {
      try {
        const profile = await authApi.getProfile();
        setIsVerified(profile.is_verified || false);
        setVerificationStatus(profile.verification_status || 'unverified');
      } catch (err) {
        console.error('Failed to check verification status:', err);
      }
    };
    checkVerificationStatus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (idNumber.length < 11) {
      toast({
        title: "Invalid NIN",
        description: "Please enter a valid 11-digit NIN number.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setStatus('idle');
    try {
      await authApi.verifyKYC({ type: 'NIN', id_number: idNumber });
      setStatus('success');
      toast({
        title: "Verification Submitted",
        description: "Your NIN details have been submitted for verification.",
      });
    } catch (err: any) {
      setStatus('error');
      const msg = err.response?.data?.error || err.response?.data?.message || "Failed to submit NIN. Please try again.";
      setErrorMessage(msg);
      toast({
        title: "Submission Failed",
        description: msg,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'success') {
    return (
      <div className="max-w-md mx-auto mt-10 text-center space-y-6 p-8 bg-surface rounded-3xl border border-border shadow-xl">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={40} />
        </div>
        <h2 className="text-2xl font-black text-text uppercase tracking-tight">Submission Successful</h2>
        <p className="text-text-muted text-sm leading-relaxed font-medium">
          Your NIN verification request has been received. Our team will review your details and update your status within 24-48 hours.
        </p>
        <Button 
          onClick={() => window.history.back()}
          className="w-full h-12 rounded-xl font-black uppercase tracking-widest bg-gradient-primary text-white"
        >
          Return to Profile
        </Button>
      </div>
    );
  }

  if (isVerified) {
    return (
      <div className="max-w-md mx-auto mt-10 space-y-6 p-8 bg-surface rounded-3xl border border-border shadow-xl">
        <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldCheck size={48} />
        </div>
        <h2 className="text-2xl font-black text-emerald-600 uppercase tracking-tight text-center">Verified</h2>
        <p className="text-text-muted text-sm leading-relaxed font-medium text-center">
          Your identity has been verified. You now have full access to all platform features.
        </p>
        <div className="flex items-center justify-center gap-2 text-emerald-600 text-xs font-bold">
          <CheckCircle size={16} />
          <span>Verification Status: {verificationStatus}</span>
        </div>
        <Button 
          onClick={() => window.history.back()}
          className="w-full h-12 rounded-xl font-black uppercase tracking-widest bg-gradient-primary text-white"
        >
          Return to Profile
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-20">
      <div className="space-y-2">
        <h1 className="text-2xl font-black text-text tracking-tight uppercase">NIN Verification</h1>
        <p className="text-sm text-text-muted font-medium">Verify your Nigerian National Identification Number to unlock all platform features and earn your verified badge.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-surface rounded-3xl border border-border p-6 sm:p-8 shadow-md hover:shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">NIN Number</label>
                <div className="relative">
                  <Input
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter your 11-digit NIN"
                    maxLength={11}
                    className="h-14 rounded-xl text-lg font-bold tracking-widest bg-surface-alt/20 w-full"
                  />
                </div>
                <p className="text-[10px] text-text-muted font-medium italic">
                  * We use bank-level encryption. Your data is never shared.
                </p>
              </div>

              {status === 'error' && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold flex items-center gap-3">
                  <AlertCircle size={18} /> {errorMessage}
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading || idNumber.length < 11}
                className="w-full h-14 rounded-2xl font-black uppercase tracking-widest bg-gradient-primary text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all disabled:opacity-50"
              >
                {isLoading ? <RefreshCcw className="animate-spin mr-2" /> : <Shield className="mr-2" />}
                {isLoading ? 'Verifying...' : 'Verify NIN'}
              </Button>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-primary/5 rounded-3xl border border-primary/10 p-6 space-y-4">
            <h3 className="text-xs font-black text-primary uppercase tracking-widest">Why Verify?</h3>
            <ul className="space-y-3">
              {[
                "Enhanced account security",
                "Verified profile badge",
                "Access to premium courses",
                "Direct mentorship access",
                "Higher withdrawal limits"
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-2 text-xs font-bold text-text">
                  <CheckCircle size={14} className="text-primary mt-0.5 shrink-0" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-surface rounded-3xl border border-border p-6 space-y-3">
            <h3 className="text-[10px] font-black text-text-muted uppercase tracking-widest">Help & Support</h3>
            <p className="text-[11px] font-medium text-text-muted leading-relaxed">Having issues with verification? Contact our security team.</p>
            <button className="text-[10px] font-black text-primary uppercase tracking-wider flex items-center gap-1 hover:underline">
              Support Center <ChevronRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KYCPage;