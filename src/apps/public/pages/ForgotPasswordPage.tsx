import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '@/src/api/auth';
import { getErrorMessage } from '@/src/api/errorHandler';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetData, setResetData] = useState<{ uid: string; token: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await authApi.forgotPassword(email);
      
      setSuccess(response.message || 'Password reset instructions have been sent to your email.');
      setResetData({ uid: response.uid, token: response.token });
      
      // In production, redirect to a "check your email" page
      // For development, we'll show the uid and token
    } catch (err: any) {
      setError(getErrorMessage(err) || 'Failed to process request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Subtle Professional Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Split Card */}
      <div className="relative w-full max-w-4xl z-10">
        <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
          {/* Left Side - Branding (hidden on mobile) */}
          <div className="hidden md:flex relative md:w-[45%] bg-gradient-to-br from-purple-700 via-purple-600 to-indigo-700 p-8 sm:p-10 lg:p-12 flex-col items-center justify-center text-center min-h-[600px]">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl" />
              <div className="absolute bottom-10 right-10 w-48 h-48 bg-white rounded-full blur-3xl" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white rounded-full blur-3xl" />
            </div>
            <div className="relative z-10">
              <img src="/Logo/logo.png" alt="BlockchainOracle Logo" className="w-16 h-16 object-contain mx-auto mb-6 brightness-0 invert" />
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">Blo|&lt;Chain<span style={{ fontWeight: 300, fontSize: '1.2em' }}>0</span>racle</h1>
              <p className="text-purple-200 text-sm sm:text-base leading-relaxed max-w-xs">
                Decentralized intelligence for the modern blockchain ecosystem
              </p>
              <div className="mt-8 flex items-center justify-center gap-3">
                <div className="w-2 h-2 rounded-full bg-purple-300 animate-pulse" />
                <span className="text-purple-200 text-xs font-medium">Secure &bull; Decentralized &bull; Fast</span>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="md:w-[55%] p-8 sm:p-10 lg:p-12 flex flex-col justify-center">
            <div className="max-w-sm mx-auto w-full">
              {/* Logo for mobile */}
              <div className="text-center mb-6 md:hidden">
                <img src="/Logo/logo.png" alt="BlockchainOracle Logo" className="w-12 h-12 object-contain mx-auto mb-3" />
              </div>

              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-key text-purple-600"></i>
                </div>
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">Forgot Password?</h2>
                <p className="text-sm text-gray-500 mt-1">
                  No worries! Enter your email and we'll send you reset instructions.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-xs">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-700 text-xs">
                  {success}
                </div>
              )}

              {!resetData ? (
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
                    <div className="relative">
                      <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full pl-11 pr-4 py-2.5 text-sm rounded-lg border border-gray-300 text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-purple-500 focus:ring-purple-500/20"
                        placeholder="user@example.com"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 rounded-lg font-bold text-sm text-white bg-purple-600 hover:brightness-110 transition-all duration-200 disabled:opacity-50 shadow-sm active:scale-[0.99]"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <i className="fas fa-circle-notch fa-spin"></i>
                        Sending...
                      </span>
                    ) : (
                      'Send Reset Link'
                    )}
                  </button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
                    <p className="text-xs font-medium text-amber-800 mb-2">Development Mode - Reset Credentials:</p>
                    <div className="space-y-2">
                      <div>
                        <span className="text-xs text-amber-700">UID:</span>
                        <code className="block mt-1 px-2 py-1 bg-white rounded text-xs text-gray-800 break-all">
                          {resetData.uid}
                        </code>
                      </div>
                      <div>
                        <span className="text-xs text-amber-700">Token:</span>
                        <code className="block mt-1 px-2 py-1 bg-white rounded text-xs text-gray-800 break-all">
                          {resetData.token}
                        </code>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => navigate(`/reset-password?uid=${resetData.uid}&token=${resetData.token}`)}
                    className="w-full py-2.5 rounded-lg font-bold text-sm text-white bg-purple-600 hover:brightness-110 transition-all duration-200 shadow-sm active:scale-[0.99]"
                  >
                    Proceed to Reset Password
                  </button>
                </div>
              )}

              <div className="mt-6 pt-5 border-t border-gray-100 text-center text-xs text-gray-500">
                Remember your password?{' '}
                <Link to="/login" className="font-bold text-purple-600 hover:text-purple-700 transition-colors">
                  Back to Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
