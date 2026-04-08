import admin from "firebase-admin";
import path from "path";
import fs from "fs";

/**
 * AKN Global Group - Firebase Admin SDK Dosya Tabanlı Başlatma
 */
let adminApp: admin.app.App | null = null;
let adminDbInstance: admin.firestore.Firestore | null = null;
let adminAuthInstance: admin.auth.Auth | null = null;

const initializeFirebaseAdmin = () => {
  if (adminApp && admin.apps.length > 0) {
    return adminApp;
  }

  let serviceAccount: any = null;

  // 1. Önce ortam değişkenlerinden dene (Netlify/Vercel production)
  // FIREBASE_SERVICE_ACCOUNT_JSON veya FIREBASE_ADMIN_KEY
  const firebaseCredentials = process.env.FIREBASE_SERVICE_ACCOUNT_JSON || process.env.FIREBASE_ADMIN_KEY;
  if (firebaseCredentials) {
    try {
      serviceAccount = JSON.parse(firebaseCredentials);
      console.log("🚀 [AKN Global] Admin SDK ortam değişkeninden yüklendi (Production).");
    } catch (error) {
      console.error("❌ [AKN Global] Firebase credentials ayrıştırılamadı:", error);
    }
  }

  // 2. Eğer başarısız olursa, lokal dosyadan dene (development)
  if (!serviceAccount) {
    const serviceAccountPath = path.resolve(process.cwd(), "server/lib/firebase-adminsdk.json");

    if (fs.existsSync(serviceAccountPath)) {
      try {
        serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
        console.log("🚀 [AKN Global] Admin SDK dosyadan başarıyla yüklendi.");
      } catch (error) {
        console.error("❌ [AKN Global] Admin SDK JSON dosyası okunamadı:", error);
      }
    }
  }

  // 3. Service account'u başlat
  if (serviceAccount) {
    try {
      adminApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });

      adminDbInstance = adminApp.firestore();
      adminAuthInstance = adminApp.auth();
      return adminApp;
    } catch (error) {
      console.error("❌ [AKN Global] Firebase başlatılamadı:", error);
    }
  } else {
    console.warn("⚠️ [AKN Global] Firebase Admin SDK başlatılamadı. FIREBASE_ADMIN_KEY ortam değişkenini veya firebase-adminsdk.json dosyasını kontrol edin.");
  }
  return null;
};

// İlk başlatma
initializeFirebaseAdmin();

// Export'lar
export { initializeFirebaseAdmin };

export const adminDb = adminDbInstance;
export const adminAuth = adminAuthInstance;

// Geriye uyumluluk için helper fonksiyonlar
export const getAdminDb = () => {
  return adminDbInstance;
};

export const getAdminAuth = () => {
  return adminAuthInstance;
};

export default admin;
