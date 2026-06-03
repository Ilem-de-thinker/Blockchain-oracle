import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../src/api/auth';
import { getErrorMessage } from '../src/api/errorHandler';

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
          <p className="text-sm text-gray-500">Reset Password</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-center mb-5">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
              <i className="fas fa-lock text-emerald-600"></i>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Set New Password</h2>
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

          <form className="space-y-3" onSubmit={handleSubmit}>
            {/* Hidden fields for uid and token if not in URL */}
            {!searchParams.get('uid') && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">UID (from email)</label>
                <input
                  type="text"
                  value={uidb64}
                  onChange={(e) => setUidb64(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  placeholder="Enter UID"
                />
              </div>
            )}

            {!searchParams.get('token') && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Token (from email)</label>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  placeholder="Enter token"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">New Password</label>
              <div className="relative">
                <i className="fas fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full pl-9 pr-9 py-2 text-sm border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  placeholder="Min 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <i className={`fas fa-${showPassword ? 'eye-slash' : 'eye'} text-xs`}></i>
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters long</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Confirm Password</label>
              <div className="relative">
                <i className="fas fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pl-9 pr-9 py-2 text-sm border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <i className={`fas fa-${showConfirmPassword ? 'eye-slash' : 'eye'} text-xs`}></i>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !uidb64 || !token}
              className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg font-medium text-sm transition-all disabled:opacity-50"
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

export default ResetPasswordPage;
