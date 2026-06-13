import { useEffect } from 'react';
import { authApi } from '../src/api/auth';

/**
 * Hook to automatically refresh JWT token before expiry
 * Checks every minute and refreshes if token expires within 5 minutes
 */
export const useTokenRefresh = () => {
  useEffect(() => {
    // Check immediately on mount
    checkAndRefresh();

    // Set up interval to check every minute
    const interval = setInterval(checkAndRefresh, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const checkAndRefresh = async () => {
    if (!authApi.isAuthenticated()) {
      return;
    }

    if (authApi.isTokenExpiring()) {
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          await authApi.refreshToken(refreshToken);
          console.log('Token refreshed successfully');
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
        // Tokens will be cleared by the authApi method
      }
    }
  };
};

/**
 * Utility to check token status (for debugging)
 */
export const checkTokenStatus = () => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    return { authenticated: false, message: 'No token found' };
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiry = payload.exp * 1000;
    const now = Date.now();
    const expiresAt = new Date(expiry);
    const timeRemaining = expiry - now;

    return {
      authenticated: true,
      username: payload.username,
      exp: expiresAt.toLocaleString(),
      timeRemaining: `${Math.floor(timeRemaining / 1000 / 60)} minutes`,
      isExpiring: timeRemaining < 5 * 60 * 1000,
    };
  } catch {
    return { authenticated: false, message: 'Invalid token' };
  }
};

export default useTokenRefresh;
