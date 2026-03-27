/**
 * useAdminAuth Hook
 * Admin authentication state ve token management
 */

import { useEffect, useState, useCallback } from 'react';
import {
  getAdminToken,
  refreshAdminToken,
  isTokenExpiringSoon,
  isAdminLoggedIn,
  getAdminUser,
  scheduleTokenRefresh,
  cancelTokenRefreshSchedule
} from '../admin-auth';

interface AdminAuthState {
  isLoggedIn: boolean;
  token: any | null;
  user: any | null;
  isTokenExpiring: boolean;
  tokenExpiresIn: number | null;
  isRefreshing: boolean;
}

/**
 * Admin authentication state'ini track et
 */
export function useAdminAuth() {
  const [authState, setAuthState] = useState<AdminAuthState>({
    isLoggedIn: false,
    token: null,
    user: null,
    isTokenExpiring: false,
    tokenExpiresIn: null,
    isRefreshing: false
  });

  // Token durumunu güncelle
  const updateAuthState = useCallback(() => {
    const token = getAdminToken();
    const user = getAdminUser();
    const isLoggedIn = isAdminLoggedIn();
    const isExpiring = isTokenExpiringSoon();

    const tokenExpiresIn = token ? Math.round((token.expiresAt - Date.now()) / 1000) : null;

    setAuthState({
      isLoggedIn,
      token,
      user,
      isTokenExpiring: isExpiring,
      tokenExpiresIn,
      isRefreshing: false
    });
  }, []);

  // Component mount olduğunda ve token değiştiğinde
  useEffect(() => {
    updateAuthState();

    // Token durumunu düzenli olarak kontrol et (her 10 saniyede)
    const checkInterval = setInterval(() => {
      updateAuthState();
    }, 10000);

    return () => clearInterval(checkInterval);
  }, [updateAuthState]);

  // Token refresh fonksiyonu
  const refreshToken = useCallback(async () => {
    setAuthState(prev => ({ ...prev, isRefreshing: true }));

    try {
      const result = await refreshAdminToken();

      if (result) {
        scheduleTokenRefresh(); // Yeni token için refresh zamanla
        updateAuthState();
        return { success: true, token: result };
      } else {
        setAuthState(prev => ({ ...prev, isLoggedIn: false }));
        return { success: false, error: 'Token yenileme başarısız' };
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Hata oluştu' };
    } finally {
      setAuthState(prev => ({ ...prev, isRefreshing: false }));
    }
  }, [updateAuthState]);

  return {
    ...authState,
    refreshToken,
    updateAuthState
  };
}

/**
 * Token expiry warning gösterme hook'u
 */
export function useTokenExpiryWarning() {
  const { isTokenExpiring, tokenExpiresIn } = useAdminAuth();
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (isTokenExpiring && tokenExpiresIn && tokenExpiresIn < 300) { // 5 dakikadan az kaldıysa
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
  }, [isTokenExpiring, tokenExpiresIn]);

  return {
    showWarning,
    tokenExpiresIn,
    dismissWarning: () => setShowWarning(false)
  };
}
