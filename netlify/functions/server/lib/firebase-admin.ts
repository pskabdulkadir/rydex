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

  // Dosya yolunu belirle
  const serviceAccountPath = path.resolve(process.cwd(), "server/lib/firebase-adminsdk.json");

  // Dosyanın varlığını kontrol et
  if (fs.existsSync(serviceAccountPath)) {
    try {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      
      adminApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });

      adminDbInstance = adminApp.firestore();
      adminAuthInstance = adminApp.auth();

      console.log("🚀 [AKN Global] Admin SDK dosyadan başarıyla yüklendi.");
      return adminApp;
    } catch (error) {
      console.error("❌ [AKN Global] Admin SDK JSON dosyası okunamadı:", error);
    }
  } else {
    console.warn("⚠️ [AKN Global] firebase-adminsdk.json bulunamadı. Admin işlemleri kısıtlı olabilir.");
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
  if (!adminDbInstance) {
    throw new Error('Firebase Firestore başlatılamadı. firebase-adminsdk.json dosyasını kontrol edin.');
  }
  return adminDbInstance;
};

export const getAdminAuth = () => {
  if (!adminAuthInstance) {
    throw new Error('Firebase Auth başlatılamadı. firebase-adminsdk.json dosyasını kontrol edin.');
  }
  return adminAuthInstance;
};

export default admin;
