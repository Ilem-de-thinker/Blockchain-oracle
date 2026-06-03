import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, UserRole } from '../types';
import { authApi, mapBackendRoleToFrontend } from '../src/api/auth';
import { useToast } from '../src/hooks/useToast';
import { getErrorMessage, getFieldErrors } from '../src/api/errorHandler';
import { useTheme } from '../contexts/ThemeContext';
import { Users2Icon, LockIcon } from 'lucide-react';

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (callback?: (notification: any) => void) => void;
          disableAutoSelect: () => void;
        };
        oauth2: {
          initTokenClient: (config: any) => {
            requestAccessToken: () => void;
          };
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID = '197664427535-vhc6mus6m7hs3pkklffb61ovvq2f7ltq.apps.googleusercontent.com';

const LoginPage: React.FC<{ onLogin: (user: User) => void }> = ({ onLogin }) => {
  const navigate = useNavigate();
  const { error: showError, success: showSuccess } = useToast();
  const { themeMode } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false);

  useEffect(() => {
    if (window.google?.accounts) {
      setGoogleScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => setGoogleScriptLoaded(true);
    script.onerror = () => {
      console.error('Failed to load Google Identity Services');
      setGoogleScriptLoaded(false);
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const redirectByRole = (user: User) => {
    if (user.role === UserRole.SUPER_ADMIN) navigate('/super-admin');
    else if (user.role === UserRole.ADMIN) navigate('/admin');
    else if (user.role === UserRole.INSTRUCTOR) navigate('/tutor');
    else if (user.role === UserRole.INFLUENCER) navigate('/influencer');
    else if (user.role === UserRole.CONTRIBUTOR) navigate('/contributor');
    else navigate('/dashboard');
  };

  const handleGoogleLogin = async () => {
    if (!googleScriptLoaded || !window.google?.accounts) {
      showError('Google Sign-In is not available. Please try email/password.');
      return;
    }

    setFieldErrors({});
    setIsGoogleLoading(true);

    try {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response: any) => {
          try {
            if (!response.credential) {
              throw new Error('No credential received from Google');
            }

            const backendResponse = await authApi.googleLogin(response.credential);

            const user: User = {
              id: backendResponse.user.id.toString(),
              name: backendResponse.user.full_name,
              email: backendResponse.user.email,
              role: mapBackendRoleToFrontend(backendResponse.user.role),
              avatar: backendResponse.user.profile_picture || undefined,
            };

            authApi.storeUser(user);
            onLogin(user);
            showSuccess(`Welcome back, ${user.name}!`);
            redirectByRole(user);
          } catch (err: any) {
            const msg = getErrorMessage(err);
            showError(msg, 'Google Sign-In Failed');
            setIsGoogleLoading(false);
          }
        },
      });

      window.google.accounts.oauth2
        .initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'email profile',
          callback: async (tokenResponse: any) => {
            if (tokenResponse.error) {
              showError('Google Sign-In was cancelled.', 'Sign-In Cancelled');
              setIsGoogleLoading(false);
              return;
            }

            try {
              const backendResponse = await authApi.googleLogin(tokenResponse.access_token);

              const user: User = {
                id: backendResponse.user.id.toString(),
                name: backendResponse.user.full_name,
                email: backendResponse.user.email,
                role: mapBackendRoleToFrontend(backendResponse.user.role),
                avatar: backendResponse.user.profile_picture || undefined,
              };

              authApi.storeUser(user);
              onLogin(user);
              showSuccess(`Welcome back, ${user.name}!`);
              redirectByRole(user);
            } catch (err: any) {
              const msg = getErrorMessage(err);
              showError(msg, 'Google Sign-In Failed');
              setIsGoogleLoading(false);
            }
          },
        })
        .requestAccessToken();

      setTimeout(() => {
        if (isGoogleLoading) setIsGoogleLoading(false);
      }, 30000);
    } catch {
      showError('Google Sign-In failed. Please try again.');
      setIsGoogleLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setIsLoading(true);

    try {
      const response = await authApi.login({ email, password });

      const user: User = {
        id: response.user.id.toString(),
        name: response.user.full_name,
        email: response.user.email,
        role: mapBackendRoleToFrontend(response.user.role),
        avatar: response.user.profile_picture || undefined,
      };

      authApi.storeUser(user);
      onLogin(user);
      showSuccess(`Welcome back, ${user.name}!`);
      redirectByRole(user);
    } catch (err: any) {
      const parsed = getFieldErrors(err);
      if (parsed) {
        setFieldErrors(parsed);
      }
      showError(getErrorMessage(err), 'Login Failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role: string) => {
    setFieldErrors({});
    setIsLoading(true);

    try {
      const response = await authApi.demoLogin(role);

      const user: User = {
        id: response.user.id.toString(),
        name: response.user.full_name,
        email: response.user.email,
        role: mapBackendRoleToFrontend(response.user.role),
        avatar: response.user.profile_picture || undefined,
      };

      authApi.storeUser(user);
      onLogin(user);
      showSuccess(`Logged in as ${user.name} (Demo)`);
      redirectByRole(user);
    } catch {
      showError('Demo login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-bg">
      {/* Subtle Professional Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      {/* Main Login Card */}
      <div className="relative w-full max-w-[360px] z-10">
        <div className="relative backdrop-blur-xl bg-surface/80 border border-border/50 rounded-xl shadow-xl overflow-hidden">
          <div className="p-6 sm:p-7">
            {/* Logo & Title */}
            <div className="text-center mb-5">
              <div className="inline-flex items-center justify-center w-11 h-11 rounded-lg mb-3 bg-surface-alt border border-border/50 shadow-sm" >
                <img src="/Logo/logo.png" alt="BlockchainOracle Logo" className="w-7 h-7 object-contain" />
              </div>
              <h2 className="text-xl font-bold text-text tracking-tight">Welcome Back</h2>
              <p className="text-text-muted mt-0.5 text-xs">Sign in to your professional workspace</p>
            </div>

            {/* Form */}
            <form className="space-y-4" onSubmit={handleAuth}>
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <Users2Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted"/>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setFieldErrors((prev) => ({ ...prev, email: undefined })); }}
                    required
                    className={`w-full pl-11 pr-4 py-2.5 text-sm rounded-lg border transition-all duration-200 bg-surface-alt/50 text-text placeholder:text-text-muted/40 focus:outline-none focus:ring-2 ${fieldErrors.email ? 'border-red-500/50 focus:ring-red-500/50' : 'border-border focus:border-primary/50 focus:ring-primary/20'}`}
                    placeholder="name@company.com"
                  />
                </div>
                {fieldErrors.email && (
                  <p className="text-[10px] text-red-500 mt-1 ml-1 flex items-center gap-1">
                    <i className="fas fa-exclamation-circle"></i>
                    {fieldErrors.email[0]}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">
                  Password
                </label>
                <div className="relative">
                  <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setFieldErrors((prev) => ({ ...prev, password: undefined })); }}
                    required
                    className={`w-full pl-11 pr-11 py-2.5 text-sm rounded-lg border transition-all duration-200 bg-surface-alt/50 text-text placeholder:text-text-muted/40 focus:outline-none focus:ring-2 ${fieldErrors.password ? 'border-red-500/50 focus:ring-red-500/50' : 'border-border focus:border-primary/50 focus:ring-primary/20'}`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors"
                  >
                    <i className={`fas fa-${showPassword ? 'eye-slash' : 'eye'} text-xs`}></i>
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-[10px] text-red-500 mt-1 ml-1 flex items-center gap-1">
                    <i className="fas fa-exclamation-circle"></i>
                    {fieldErrors.password[0]}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="w-3.5 h-3.5 rounded border-border text-primary focus:ring-primary/20 accent-primary" />
                  <span className="text-[11px] text-text-muted group-hover:text-text transition-colors font-medium">Remember me</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] font-bold text-primary hover:text-primary-dark transition-colors"
                >
                  Forgot?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-lg font-bold text-sm text-white bg-primary hover:brightness-110 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-[0.99]"
              >
                <span className="flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <i className="fas fa-circle-notch fa-spin"></i>
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <i className="fas fa-arrow-right text-[10px]"></i>
                    </>
                  )}
                </span>
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/60"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-surface text-[9px] font-bold text-text-muted uppercase tracking-[0.2em]">OR</span>
              </div>
            </div>

            {/* Google Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              className="w-full py-2.5 rounded-lg font-semibold text-xs border border-border bg-surface-alt/50 hover:bg-surface-alt transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 shadow-sm"
            >
              {isGoogleLoading ? (
                <>
                  <i className="fas fa-circle-notch fa-spin text-text-muted"></i>
                  <span className="text-text-muted">Connecting...</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="text-text">Continue with Google</span>
                </>
              )}
            </button>

            {/* Sign Up Link */}
            <p className="text-center text-[11px] mt-6 text-text-muted">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-bold text-primary hover:text-primary-dark transition-colors"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
