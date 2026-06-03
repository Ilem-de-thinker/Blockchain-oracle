import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../src/api/auth';
import { getErrorMessage } from '../src/api/errorHandler';

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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center">
              <img src="/Logo/logo.png" alt="BlockchainOracle Logo" className="w-6 h-6 object-contain" />
            </div>
            <span className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Blo|&lt;Chain<span style={{ fontWeight: 300, fontSize: '1.2em', fontFamily: "'Montserrat', sans-serif" }}>0</span>racle
            </span>
          </div>
          <p className="text-sm text-gray-500">Password Recovery</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-center mb-5">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
              <i className="fas fa-key text-emerald-600"></i>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Forgot Password?</h2>
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
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <i className="fas fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    placeholder="user@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg font-medium text-sm transition-all disabled:opacity-50"
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
                className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg font-medium text-sm transition-all"
              >
                Proceed to Reset Password
              </button>
            </div>
          )}

          <div className="mt-5 pt-4 border-t border-gray-100 text-center text-xs text-gray-600">
            Remember your password?{' '}
            <Link to="/login" className="text-emerald-600 font-medium hover:underline">
              Back to Sign In
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          © 2026 Blockchain Oracle. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
