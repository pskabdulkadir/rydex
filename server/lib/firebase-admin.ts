import * as admin from 'firebase-admin';

let adminDb: any = null;
let adminAuth: any = null;
let isInitialized = false;

/**
 * Firebase Admin SDK'yı başlat
 * FIREBASE_ADMIN_KEY ortam değişkeninden okur
 */
export function initializeFirebaseAdmin() {
  if (isInitialized && adminDb && adminAuth) {
    return { adminDb, adminAuth };
  }

  try {
    const adminKey = process.env.FIREBASE_ADMIN_KEY;

    if (!adminKey) {
      console.warn('⚠️ FIREBASE_ADMIN_KEY ortam değişkeni bulunamadı');
      return { adminDb: null, adminAuth: null };
    }

    // FIREBASE_ADMIN_KEY'i JSON objesine çevir
    let serviceAccount: any;
    
    if (adminKey.startsWith('{')) {
      // Zaten JSON string formatında
      serviceAccount = JSON.parse(adminKey);
    } else {
      // Base64 encoded formatında
      serviceAccount = JSON.parse(
        Buffer.from(adminKey, 'base64').toString('utf-8')
      );
    }

    // Firebase Admin Apps'in kontrol et
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

      adminDb = admin.firestore();
      adminAuth = admin.auth();
      isInitialized = true;

      console.log('✅ Firebase Admin SDK başarıyla başlatıldı');
    } else {
      // Zaten başlatılmış
      adminDb = admin.firestore();
      adminAuth = admin.auth();
      isInitialized = true;
    }

    return { adminDb, adminAuth };
  } catch (error) {
    console.error('❌ Firebase Admin başlatma hatası:', error);
    
    if (error instanceof SyntaxError) {
      console.error('💡 FIREBASE_ADMIN_KEY doğru JSON formatında mı? Kontrol et.');
    }
    
    return { adminDb: null, adminAuth: null };
  }
}

/**
 * Firestore veritabanı örneğini getir
 */
export function getAdminDb() {
  if (!adminDb) {
    const { adminDb: db } = initializeFirebaseAdmin();
    adminDb = db;
  }
  return adminDb;
}

/**
 * Firebase Auth örneğini getir
 */
export function getAdminAuth() {
  if (!adminAuth) {
    const { adminAuth: auth } = initializeFirebaseAdmin();
    adminAuth = auth;
  }
  return adminAuth;
}

/**
 * Export for direct usage
 */
export { admin };
