import { RequestHandler } from "express";
import { getAdminDb } from "../lib/firebase-admin";

/**
 * Firestore users collection'ından tüm kullanıcıları sil
 */
export const handleDeleteAllFirestoreUsers: RequestHandler = async (req, res) => {
  try {
    // Admin auth kontrol et
    const authToken = req.headers.authorization?.split('Bearer ')[1];
    const adminToken = req.headers['x-admin-token'] as string;

    if (!authToken && !adminToken) {
      return res.status(401).json({
        success: false,
        error: "Admin kimliği doğrulanmadı",
      });
    }

    // Firebase Admin SDK'yı başlat
    const firestoreDb = getAdminDb();
    if (!firestoreDb) {
      return res.status(500).json({
        success: false,
        error: "Firestore bağlantısı kurulamadı",
        hint: "FIREBASE_ADMIN_KEY ortam değişkenini kontrol edin",
      });
    }

    console.log("\n🗑️ FIRESTORE USERS COLLECTION SİLME BAŞLANDI");

    // Tüm kullanıcıları al
    const usersSnapshot = await firestoreDb.collection("users").get();
    
    if (usersSnapshot.empty) {
      console.log("ℹ️ Firestore'da silinecek kullanıcı bulunamadı");
      return res.json({
        success: true,
        message: "Silinecek kullanıcı bulunamadı",
        deletedCount: 0,
      });
    }

    const deletePromises: Promise<void>[] = [];
    let deletedCount = 0;

    // Batch işlem ile sil (Firestore limitleri için)
    const batch = firestoreDb.batch();
    
    usersSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
      deletedCount++;
      console.log(`  🗑️ Siliniyor: ${doc.id}`);
    });

    // Batch'i commit et
    await batch.commit();

    console.log(`✅ ${deletedCount} kullanıcı başarıyla silindi`);
    console.log(`⏱️ Tamamlanma zamanı: ${new Date().toLocaleString('tr-TR')}\n`);

    return res.json({
      success: true,
      message: `${deletedCount} kullanıcı Firestore'dan silindi`,
      deletedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Firestore silme hatası:", error);
    return res.status(500).json({
      success: false,
      error: "Firestore kullanıcıları silinirken hata oluştu",
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Firestore'daki tüm koleksiyonları listele
 */
export const handleListFirestoreCollections: RequestHandler = async (req, res) => {
  try {
    const firestoreDb = getAdminDb();
    if (!firestoreDb) {
      return res.status(500).json({
        success: false,
        error: "Firestore bağlantısı kurulamadı",
      });
    }

    const collections = await firestoreDb.listCollections();
    const collectionData = [];

    for (const collection of collections) {
      const snapshot = await collection.count().get();
      collectionData.push({
        name: collection.id,
        documentCount: snapshot.data().count,
      });
    }

    return res.json({
      success: true,
      collections: collectionData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Koleksiyon listeleme hatası:", error);
    return res.status(500).json({
      success: false,
      error: "Koleksiyonlar listelenirken hata oluştu",
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Belirtilen koleksiyondaki tüm dokümanları sil
 */
export const handleDeleteFirestoreCollection: RequestHandler = async (req, res) => {
  try {
    const { collectionName } = req.body;

    if (!collectionName) {
      return res.status(400).json({
        success: false,
        error: "collectionName parametresi gerekli",
      });
    }

    // Güvenli koleksiyon isimleri (sadece bunları silebilecek)
    const allowedCollections = ["users", "demo_users", "test_data"];

    if (!allowedCollections.includes(collectionName)) {
      return res.status(403).json({
        success: false,
        error: `"${collectionName}" koleksiyonu silinemez. İzin verilen koleksiyonlar: ${allowedCollections.join(", ")}`,
      });
    }

    const firestoreDb = getAdminDb();
    if (!firestoreDb) {
      return res.status(500).json({
        success: false,
        error: "Firestore bağlantısı kurulamadı",
      });
    }

    console.log(`\n🗑️ ${collectionName} KOLEKSIYONU SİLME BAŞLANDI`);

    const snapshot = await firestoreDb.collection(collectionName).get();
    const batch = firestoreDb.batch();
    let deletedCount = 0;

    snapshot.forEach((doc) => {
      batch.delete(doc.ref);
      deletedCount++;
    });

    await batch.commit();

    console.log(`✅ ${deletedCount} doküman silindi\n`);

    return res.json({
      success: true,
      message: `${deletedCount} doküman "${collectionName}" koleksiyonundan silindi`,
      deletedCount,
      collectionName,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Koleksiyon silme hatası:", error);
    return res.status(500).json({
      success: false,
      error: "Koleksiyon silinirken hata oluştu",
      details: error instanceof Error ? error.message : String(error),
    });
  }
};
