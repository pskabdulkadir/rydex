import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  connectAuthEmulator,
  setPersistence,
  browserLocalPersistence 
} from 'firebase/auth';
import { 
  getFirestore,
  connectFirestoreEmulator 
} from 'firebase/firestore';

// Firebase Configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Check if Firebase is properly configured
const isFirebaseConfigured = !!(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId
);

// Initialize Firebase only if config is valid
let app: ReturnType<typeof initializeApp> | null = null;
let auth: ReturnType<typeof getAuth> | null = null;
let db: ReturnType<typeof getFirestore> | null = null;

if (isFirebaseConfigured) {
  try {
    // Initialize Firebase
    app = initializeApp(firebaseConfig);

    // Initialize Firebase Authentication
    auth = getAuth(app);

    // Set persistence to localStorage (kullanıcı browser kapatsa da login kalsın)
    setPersistence(auth, browserLocalPersistence).catch((error) => {
      console.error('Persistence ayarlanırken hata:', error);
    });

    // Initialize Firestore
    db = getFirestore(app);

    // Emulator setup (sadece development'da)
    if (import.meta.env.DEV) {
      try {
        // Auth emulator kontrolü
        if (window.location.hostname === 'localhost') {
          // connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
        }
        // Firestore emulator kontrolü
        // connectFirestoreEmulator(db, 'localhost', 8080);
      } catch (error: any) {
        // Emulator zaten başlatılmış olabilir
        if (!error.message?.includes('already called')) {
          console.log('Emulator setup:', error.message);
        }
      }
    }

    console.log('✅ Firebase başarıyla başlatıldı');
  } catch (error) {
    console.warn('⚠️ Firebase başlatma hatası, localStorage fallback kullanılacak:', error);
  }
} else {
  console.warn('⚠️ Firebase config eksik, localStorage fallback kullanılacak');
  console.warn('   Gerekli environment variables:');
  console.warn('   - VITE_FIREBASE_API_KEY');
  console.warn('   - VITE_FIREBASE_AUTH_DOMAIN');
  console.warn('   - VITE_FIREBASE_PROJECT_ID');
}

// Export with fallback support
export { app, auth, db };
export const isFirebaseEnabled = () => isFirebaseConfigured && app !== null;

// localStorage-based fallback for when Firebase is not available
export const localStorageFallback = {
  setItem: (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error('localStorage setItem error:', e);
    }
  },
  getItem: (key: string) => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.error('localStorage getItem error:', e);
      return null;
    }
  },
  removeItem: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('localStorage removeItem error:', e);
    }
  },
};