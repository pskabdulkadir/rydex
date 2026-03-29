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

// Validate Firebase config
if (
  !firebaseConfig.apiKey ||
  !firebaseConfig.authDomain ||
  !firebaseConfig.projectId
) {
  console.error('❌ Firebase config eksik! .env dosyasını kontrol edin.');
  console.error('Gerekli:', 'VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Set persistence to localStorage (kullanıcı browser kapatsa da login kalsın)
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error('Persistence ayarlanırken hata:', error);
});

// Initialize Firestore
export const db = getFirestore(app);

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

export { app };
