import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { authApi, mapBackendRoleToFrontend } from '../src/api/auth';
import { User } from '../types';

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

interface GoogleSignInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogin: (user: User) => void;
  onDismiss?: () => void;
}

const GoogleSignInModal: React.FC<GoogleSignInModalProps> = ({ open, onOpenChange, onLogin, onDismiss }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false);

  useEffect(() => {
    if (open && !authApi.isAuthenticated()) {
      if (window.google?.accounts) {
        setGoogleScriptLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => setGoogleScriptLoaded(true);
      script.onerror = () => setGoogleScriptLoaded(false);
      document.head.appendChild(script);

      return () => {
        const existing = document.head.querySelector(`script[src="${script.src}"]`);
        if (existing) document.head.removeChild(existing);
      };
    }
  }, [open]);

  const handleGoogleLogin = async () => {
    if (!googleScriptLoaded || !window.google?.accounts) {
      alert('Google Sign-In is not available. Please try again later.');
      return;
    }

    setIsLoading(true);

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
            onOpenChange(false);
          } catch (err: any) {
            alert(err.message || 'Google Sign-In failed');
            setIsLoading(false);
          }
        },
      });

      window.google.accounts.oauth2
        .initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'email profile',
          callback: async (tokenResponse: any) => {
            if (tokenResponse.error) {
              setIsLoading(false);
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
              onOpenChange(false);
            } catch (err: any) {
              alert(err.message || 'Google Sign-In failed');
              setIsLoading(false);
            }
          },
        })
        .requestAccessToken();

      setTimeout(() => {
        if (isLoading) setIsLoading(false);
      }, 30000);
    } catch {
      alert('Google Sign-In failed. Please try again.');
      setIsLoading(false);
    }
  };

  const handleDismiss = () => {
    onDismiss?.();
    onOpenChange(false);
  };

  const handleGoToLogin = () => {
    onOpenChange(false);
    navigate('/login');
  };

  if (authApi.isAuthenticated()) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-md bg-white text-gray-900 border-gray-100 shadow-2xl overflow-hidden"
        data-page-type="public"
      >
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ 
               backgroundImage: 'linear-gradient(#7c3aed 1px, transparent 1px), linear-gradient(90deg, #7c3aed 1px, transparent 1px)',
               backgroundSize: '20px 20px' 
             }} 
        />
        <div className="relative z-10">
          <DialogHeader>
            <div className="mx-auto w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center mb-4 shadow-sm border border-purple-100">
              <img src="/Logo/logo.png" alt="BlockchainOracle Logo" className="w-10 h-10 object-contain" />
            </div>
            <DialogTitle className="text-xl font-bold text-center text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Welcome to Blo|&lt;Chain<span style={{ fontWeight: 300, fontSize: '1.2em', fontFamily: "'Montserrat', sans-serif" }}>0</span>racle
            </DialogTitle>
            <DialogDescription className="text-center text-gray-500 mt-2">
              Sign in to access courses, track your progress, and join the Web3 revolution.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-6">
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading || !googleScriptLoaded}
              className="w-full py-3 border border-gray-300 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:shadow-md bg-white text-gray-900"
            >
              {isLoading ? (
                <>
                  <i className="fas fa-circle-notch fa-spin text-gray-400"></i>
                  <span>Connecting to Google...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-gray-400">or</span>
              </div>
            </div>

            <button
              onClick={handleGoToLogin}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/20 hover:scale-[1.02] active:scale-95 border-none outline-none"
            >
              Sign In with Email
            </button>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            By continuing, you agree to our{' '}
            <a href="#" className="text-purple-600 hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-purple-600 hover:underline">Privacy Policy</a>
          </p>

          <button
            onClick={handleDismiss}
            className="w-full mt-4 py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Maybe later, just browsing
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GoogleSignInModal;
