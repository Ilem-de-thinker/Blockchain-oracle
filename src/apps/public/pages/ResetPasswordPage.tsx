import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '@/src/api/auth';
import { getErrorMessage } from '@/src/api/errorHandler';

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [uidb64, setUidb64] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const uid = searchParams.get('uid');
    const tkn = searchParams.get('token');
    if (uid && tkn) {
      setUidb64(uid);
      setToken(tkn);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (!uidb64 || !token) {
      setError('Invalid or missing reset credentials');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.resetPassword(uidb64, token, newPassword);

      setSuccess(response.message || 'Password reset successfully!');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(getErrorMessage(err) || 'Failed to reset password. Please try again.');
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

              <Link
                to="/"
                className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-purple-600 transition-colors mb-4 w-fit"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back to Home
              </Link>
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-lock text-purple-600"></i>
                </div>
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">Set New Password</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Create a strong password to secure your account
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-xs">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-700 text-xs text-center">
                  <i className="fas fa-check-circle mr-1"></i>
                  {success}
                </div>
              )}

              <form className="space-y-4" onSubmit={handleSubmit}>
                {/* Hidden fields for uid and token if not in URL */}
                {!searchParams.get('uid') && (
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">UID (from email)</label>
                    <input
                      type="text"
                      value={uidb64}
                      onChange={(e) => setUidb64(e.target.value)}
                      required
                      className="w-full pl-11 pr-4 py-2.5 text-sm rounded-lg border border-gray-300 text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-purple-500 focus:ring-purple-500/20"
                      placeholder="Enter UID"
                    />
                  </div>
                )}

                {!searchParams.get('token') && (
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Token (from email)</label>
                    <input
                      type="text"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      required
                      className="w-full pl-11 pr-4 py-2.5 text-sm rounded-lg border border-gray-300 text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-purple-500 focus:ring-purple-500/20"
                      placeholder="Enter token"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">New Password</label>
                  <div className="relative">
                    <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={8}
                      className="w-full pl-11 pr-11 py-2.5 text-sm rounded-lg border border-gray-300 text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-purple-500 focus:ring-purple-500/20"
                      placeholder="Min 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <i className={`fas fa-${showPassword ? 'eye-slash' : 'eye'} text-xs`}></i>
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1 ml-1">Must be at least 8 characters long</p>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Confirm Password</label>
                  <div className="relative">
                    <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full pl-11 pr-11 py-2.5 text-sm rounded-lg border border-gray-300 text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-purple-500 focus:ring-purple-500/20"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <i className={`fas fa-${showConfirmPassword ? 'eye-slash' : 'eye'} text-xs`}></i>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !uidb64 || !token}
                  className="w-full py-2.5 rounded-lg font-bold text-sm text-white bg-purple-600 hover:brightness-110 transition-all duration-200 disabled:opacity-50 shadow-sm active:scale-[0.99]"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <i className="fas fa-circle-notch fa-spin"></i>
                      Resetting...
                    </span>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </form>

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

export default ResetPasswordPage;
