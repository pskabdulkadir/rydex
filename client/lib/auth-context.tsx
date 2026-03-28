import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile, LoginRequest, RegisterRequest, Subscription } from '@shared/api';

interface AuthContextType {
  user: UserProfile | null;
  subscription: (Subscription & { daysRemaining: number }) | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  
  // Auth methods
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  
  // Subscription methods
  checkSubscription: () => Promise<void>;
  isSubscriptionActive: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<(Subscription & { daysRemaining: number }) | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // LocalStorage'dan token'ı al ve restore et
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    if (savedToken) {
      setToken(savedToken);
      fetchProfile(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  // Subscription'ı kontrol et (her 30 saniyede bir - erken uyarı için)
  useEffect(() => {
    if (token && user) {
      checkSubscriptionValidity();
      const interval = setInterval(checkSubscriptionValidity, 30 * 1000); // 30 saniye
      return () => clearInterval(interval);
    }
  }, [token, user]);

  const fetchProfile = async (authToken: string) => {
    try {
      const response = await fetch('/api/auth/profile', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) throw new Error('Profile fetch failed');

      const data = await response.json();
      setUser(data.user);
      setError(null);
    } catch (err) {
      console.error('Profile fetch error:', err);
      localStorage.removeItem('auth_token');
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Giriş başarısız');
      }

      const data = await response.json();
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('auth_token', data.token);

      // userId ve kullanıcı bilgilerini localStorage'a kaydet
      if (data.user?.uid) {
        localStorage.setItem('userId', data.user.uid);
        localStorage.setItem('userName', data.user.username || 'Kullanıcı');
        if (data.user.email) {
          localStorage.setItem('userEmail', data.user.email);
        }
      }

      // Subscription'ı kontrol et
      await checkSubscriptionValidity();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Giriş hatası';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const responseData = await response.json();

        // 429 Too Many Requests hatası özel mesaj
        if (response.status === 429) {
          throw new Error('Çok fazla deneme yapıldı. Lütfen birkaç dakika sonra tekrar deneyin.');
        }

        throw new Error(responseData.message || 'Kayıt başarısız');
      }

      const responseData = await response.json();
      setToken(responseData.token);
      setUser(responseData.user);
      localStorage.setItem('auth_token', responseData.token);

      // userId ve kullanıcı bilgilerini localStorage'a kaydet
      if (responseData.user?.uid) {
        localStorage.setItem('userId', responseData.user.uid);
        localStorage.setItem('userName', responseData.user.username || 'Kullanıcı');
        if (responseData.user.email) {
          localStorage.setItem('userEmail', responseData.user.email);
        }
      }
    } catch (err) {
      let message = 'Kayıt hatası';

      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        message = 'Bağlantı hatası. İnternet bağlantınızı kontrol edin ve tekrar deneyin.';
      } else if (err instanceof Error) {
        message = err.message;
      }

      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setToken(null);
      setUser(null);
      setSubscription(null);
      // Tüm user data'yı localStorage'dan temizle
      localStorage.removeItem('auth_token');
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('systemInitialized');
      localStorage.removeItem('subscription');
    }
  };

  const refreshProfile = async () => {
    if (token) {
      await fetchProfile(token);
    }
  };

  const checkSubscriptionValidity = async () => {
    try {
      // Önce localStorage'dan subscription kontrol et
      const savedSubscription = localStorage.getItem('subscription');
      if (savedSubscription) {
        try {
          const sub = JSON.parse(savedSubscription);
          const now = Date.now();
          const daysRemaining = Math.max(0, Math.ceil((sub.endDate - now) / (1000 * 60 * 60 * 24)));

          // Subscription bilgisini güncelle
          setSubscription({
            ...sub,
            daysRemaining,
            status: daysRemaining > 0 ? 'active' : 'expired'
          });

          // Subscription'ın süresi dolduysa logout yap
          if (daysRemaining <= 0) {
            console.warn('⏰ Subscription süresi doldu, çıkış yapılıyor...');
            await logout();
          }
          return;
        } catch (e) {
          console.warn('⚠ localStorage subscription parse hatası:', e);
        }
      }

      // localStorage başarısız olursa API'ye sor
      if (token) {
        const response = await fetch('/api/subscription/active', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) return;

        const data = await response.json();

        if (data.subscription) {
          setSubscription(data.subscription);

          // Subscription'ın süresi dolduysa logout yap
          if (data.subscription.status === 'expired' && data.subscription.daysRemaining <= 0) {
            console.warn('⏰ Subscription süresi doldu, çıkış yapılıyor...');
            await logout();
          }
        } else {
          setSubscription(null);
        }
      }
    } catch (err) {
      console.error('Subscription check error:', err);
    }
  };

  const checkSubscription = checkSubscriptionValidity;

  const isSubscriptionActive = (): boolean => {
    if (!subscription) return false;
    return subscription.status === 'active' && subscription.daysRemaining > 0;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        subscription,
        token,
        loading,
        error,
        login,
        register,
        logout,
        refreshProfile,
        checkSubscription,
        isSubscriptionActive,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
