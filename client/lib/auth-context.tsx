import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile, LoginRequest, RegisterRequest, Subscription } from '@shared/api';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { getUserSubscription, migrateUserDataToFirestore } from './firestore-user';

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

  // Firebase Authentication State listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      try {
        if (firebaseUser) {
          // Kullanıcı giriş yapmış
          const idToken = await firebaseUser.getIdToken();
          setToken(idToken);

          // Firestore'dan user profile'ı çek
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            const userProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              username: userData.username || firebaseUser.displayName || 'Kullanıcı',
              phone: userData.phone || '',
              createdAt: userData.createdAt || new Date().toISOString(),
              updatedAt: userData.updatedAt || new Date().toISOString(),
            };
            setUser(userProfile);
            localStorage.setItem('auth_token', idToken);
            localStorage.setItem('userId', firebaseUser.uid);
            localStorage.setItem('userName', userProfile.username);
            if (firebaseUser.email) {
              localStorage.setItem('userEmail', firebaseUser.email);
            }
          } else {
            // localStorage'dan migration kontrol et
            const savedUserProfile = localStorage.getItem('user_profile');
            if (savedUserProfile) {
              try {
                // localStorage'dan migration yap
                console.log('📦 localStorage\'dan Firestore\'a migration başlatılıyor...');
                await migrateUserDataToFirestore(firebaseUser.uid);

                const migratedData = JSON.parse(savedUserProfile);
                const userProfile: UserProfile = {
                  uid: firebaseUser.uid,
                  email: firebaseUser.email || migratedData.email || '',
                  username: firebaseUser.displayName || migratedData.username || 'Kullanıcı',
                  phone: migratedData.phone || '',
                  createdAt: migratedData.createdAt || new Date().toISOString(),
                  updatedAt: migratedData.updatedAt || new Date().toISOString(),
                };

                // Firestore'da profili oluştur
                await setDoc(doc(db, 'users', firebaseUser.uid), userProfile);
                setUser(userProfile);
                console.log('✅ Migration başarılı');
              } catch (migrationErr) {
                console.warn('⚠️ Migration sırasında hata:', migrationErr);
                // Migration başarısız olsa da kullanıcıya giriş yaptırmaya devam et
                const userProfile: UserProfile = {
                  uid: firebaseUser.uid,
                  email: firebaseUser.email || '',
                  username: firebaseUser.displayName || 'Kullanıcı',
                  phone: '',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                };
                await setDoc(doc(db, 'users', firebaseUser.uid), userProfile);
                setUser(userProfile);
              }
            } else {
              // Yeni kullanıcı, profil oluştur
              const userProfile: UserProfile = {
                uid: firebaseUser.uid,
                email: firebaseUser.email || '',
                username: firebaseUser.displayName || 'Kullanıcı',
                phone: '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              await setDoc(doc(db, 'users', firebaseUser.uid), userProfile);
              setUser(userProfile);
            }
          }
        } else {
          // Kullanıcı giriş yapmamış
          setToken(null);
          setUser(null);
          setSubscription(null);
          localStorage.removeItem('auth_token');
          localStorage.removeItem('userId');
          localStorage.removeItem('userName');
          localStorage.removeItem('userEmail');
        }
      } catch (err) {
        console.error('Auth state change error:', err);
        setError(err instanceof Error ? err.message : 'Yetkilendirme hatası');
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // Subscription'ı kontrol et (her 30 saniyede bir - erken uyarı için)
  useEffect(() => {
    if (token && user) {
      checkSubscriptionValidity();
      const interval = setInterval(checkSubscriptionValidity, 30 * 1000); // 30 saniye
      return () => clearInterval(interval);
    }
  }, [token, user]);

  const login = async (credentials: LoginRequest) => {
    setLoading(true);
    setError(null);

    try {
      // Firebase Authentication ile giriş yap
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      const firebaseUser = userCredential.user;
      const idToken = await firebaseUser.getIdToken();

      // Firestore'dan kullanıcı profilini çek
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const userProfile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          username: userData.username || firebaseUser.displayName || 'Kullanıcı',
          phone: userData.phone || '',
          createdAt: userData.createdAt || new Date().toISOString(),
          updatedAt: userData.updatedAt || new Date().toISOString(),
        };
        setUser(userProfile);
        setToken(idToken);
        localStorage.setItem('auth_token', idToken);
        localStorage.setItem('userId', firebaseUser.uid);
        localStorage.setItem('userName', userProfile.username);
        if (firebaseUser.email) {
          localStorage.setItem('userEmail', firebaseUser.email);
        }
      }

      // Subscription'ı kontrol et
      await checkSubscriptionValidity();
    } catch (err) {
      let message = 'Giriş hatası';
      if (err instanceof Error) {
        if (err.message.includes('user-not-found')) {
          message = 'Kullanıcı bulunamadı';
        } else if (err.message.includes('wrong-password')) {
          message = 'Yanlış şifre';
        } else if (err.message.includes('too-many-requests')) {
          message = 'Çok fazla başarısız deneme. Lütfen daha sonra tekrar deneyin.';
        } else {
          message = err.message;
        }
      }
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    setLoading(true);
    setError(null);

    try {
      // Firebase Authentication'da yeni kullanıcı oluştur
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      const firebaseUser = userCredential.user;

      // Display name'i güncelle
      if (data.username) {
        await updateProfile(firebaseUser, {
          displayName: data.username,
        });
      }

      // Firestore'da kullanıcı profilini oluştur
      const userProfile: UserProfile = {
        uid: firebaseUser.uid,
        email: data.email,
        username: data.username || 'Kullanıcı',
        phone: data.phone || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), userProfile);

      // Token'ı al
      const idToken = await firebaseUser.getIdToken();

      setToken(idToken);
      setUser(userProfile);
      localStorage.setItem('auth_token', idToken);
      localStorage.setItem('userId', firebaseUser.uid);
      localStorage.setItem('userName', userProfile.username);
      localStorage.setItem('userEmail', data.email);
    } catch (err) {
      let message = 'Kayıt hatası';

      if (err instanceof Error) {
        if (err.message.includes('email-already-in-use')) {
          message = 'Bu e-posta zaten kullanılıyor';
        } else if (err.message.includes('weak-password')) {
          message = 'Şifre en az 6 karakter olmalıdır';
        } else if (err.message.includes('invalid-email')) {
          message = 'Geçersiz e-posta adresi';
        } else if (err.message === 'Failed to fetch') {
          message = 'Bağlantı hatası. İnternet bağlantınızı kontrol edin ve tekrar deneyin.';
        } else {
          message = err.message;
        }
      }

      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Firebase'den çıkış yap
      await signOut(auth);
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
    if (auth.currentUser) {
      try {
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          const userProfile: UserProfile = {
            uid: auth.currentUser.uid,
            email: auth.currentUser.email || '',
            username: userData.username || auth.currentUser.displayName || 'Kullanıcı',
            phone: userData.phone || '',
            createdAt: userData.createdAt || new Date().toISOString(),
            updatedAt: userData.updatedAt || new Date().toISOString(),
          };
          setUser(userProfile);
        }
      } catch (err) {
        console.error('Refresh profile error:', err);
      }
    }
  };

  const checkSubscriptionValidity = async () => {
    try {
      if (!auth.currentUser) return;

      // Önce Firestore'dan subscription kontrol et
      try {
        const sub = await getUserSubscription(auth.currentUser.uid);
        if (sub) {
          setSubscription(sub);

          // Subscription'ın süresi dolduysa logout yap
          if (sub.daysRemaining <= 0) {
            console.warn('⏰ Subscription süresi doldu, çıkış yapılıyor...');
            await logout();
          }
          return;
        }
      } catch (firestoreErr) {
        console.warn('⚠ Firestore subscription kontrol hatası:', firestoreErr);
      }

      // Firestore başarısız olursa localStorage'dan kontrol et
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

      // Hiçbiri başarısız olursa API'ye sor
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
