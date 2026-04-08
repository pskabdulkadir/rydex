import { RequestHandler } from "express";
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, UserProfile } from "@shared/api";
import { getDatabase, UserRecord } from "../database";
import { getAdminDb } from "../lib/firebase-admin";

// Basit in-memory user store (Üretimde veritabanı kullanılacak)
const users = new Map<string, UserProfile & { password: string }>();
const tokens = new Map<string, string>();

// Test kullanıcılarını başlangıçta initialize et
function initializeDemoUsers() {
  const demoUserId = 'user_demo_001';
  const testUser: UserProfile & { password: string } = {
    uid: demoUserId,
    email: 'demo@test.com',
    username: 'testuser',
    phone: '05551234567',
    password: Buffer.from('123456').toString('base64'),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isAdmin: false,
    lastLogin: Date.now(),
    preferences: {
      theme: 'light',
      language: 'tr',
      notifications: true,
    },
    statistics: {
      totalScans: 0,
      totalScanTime: 0,
      areasExplored: 0,
    },
    subscription: {
      plan: 'free',
      isActive: false,
      daysRemaining: 0,
      endDate: 0,
    },
  };

  users.set(demoUserId, testUser);
  console.log('✅ Demo kullanıcı yüklendi: testuser (şifre: 123456)');
}

// JWT token oluştur (basit - üretimde real JWT kullanılacak)
function generateToken(userId: string): string {
  const token = `token_${userId}_${Date.now()}_${Math.random().toString(36).substr(2)}`;
  tokens.set(token, userId);
  return token;
}

// Token'dan userId'yi al
export function getUserIdFromToken(token: string): string | null {
  return tokens.get(token) || null;
}

// Export et ki server startup'ında kullanılabilsin
export { initializeDemoUsers };

/**
 * Register Handler
 */
export const handleRegister: RequestHandler<any, RegisterResponse, RegisterRequest> = async (req, res) => {
  try {
    const { username, phone, password, email } = req.body as any;
    const db = getDatabase();

    // Validasyon
    if (!username || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Kullanıcı adı, telefon ve şifre zorunludur",
      });
    }

    if (username.length < 3) {
      return res.status(400).json({
        success: false,
        message: "Kullanıcı adı en az 3 karakter olmalı",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Şifre en az 6 karakter olmalı",
      });
    }

    // Telefon validasyonu
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return res.status(400).json({
        success: false,
        message: "Geçerli bir telefon numarası girin",
      });
    }

    // Kullanıcı adı ve telefon kontrolü (bellek içi önce)
    const existingUser = Array.from(users.values()).find(
      u => u.username === username || u.phone === phone
    );
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: existingUser.username === username
          ? "Bu kullanıcı adı zaten kayıtlı"
          : "Bu telefon numarası zaten kayıtlı",
      });
    }

    // Yeni kullanıcı oluştur
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const passwordHash = Buffer.from(password).toString("base64"); // Basit encoding (üretimde bcrypt kullanılmalı)

    // Veritabanıya kaydet
    const dbUser: UserRecord = {
      id: userId,
      username,
      email: email || undefined,
      phone,
      password_hash: passwordHash,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      approval_status: 'pending', // Admin onayını beklet
      is_active: false, // Onay alana kadar inaktif
    };

    const dbResult = await db.saveUser(dbUser);
    if (!dbResult.success) {
      return res.status(409).json({
        success: false,
        message: dbResult.error || "Kullanıcı kaydı başarısız",
      });
    }

        // Firebase Firestore'a da kaydet
        const firestoreDb = getAdminDb();
        if (firestoreDb) {
          try {
            await firestoreDb.collection('users').doc(userId).set({
              id: userId,
              username: username,
              phone: phone,
              email: email || `user_${userId}@app.local`,
              approval_status: 'pending', // Yeni üye onay bekliyor
              is_active: false, // Onay alana kadar inaktif
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              // Ek alanlar admin panelinde görünmesi için
              last_login: new Date().toISOString(),
              current_package: 'free',
              subscription_start: null,
              subscription_end: null,
              rejection_reason: null,
              approved_by: null,
              approved_at: null,
            }, { merge: true });
            console.log(`✅ Kullanıcı Firestore'a kaydedildi: ${username} (ID: ${userId}) - Onay bekleniyor`);
          } catch (firestoreError) {
            console.warn(`⚠️ Firestore kayıt hatası (devam ediliyor): ${username}`, firestoreError);
            // Hata olsa bile kayıt işlemine devam et, Firestore olmasa da sistem çalışmalı
          }
        }

    // Bellek içi cache'de de tut
    const newUser: UserProfile & { password: string } = {
      uid: userId,
      email: email || `user_${userId}@app.local`,
      username,
      phone,
      password: passwordHash,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isAdmin: false,
      lastLogin: Date.now(),
      preferences: {
        theme: "light",
        language: "tr",
        notifications: true,
      },
      statistics: {
        totalScans: 0,
        totalScanTime: 0,
        areasExplored: 0,
      },
      subscription: {
        plan: "free",
        isActive: true,
        daysRemaining: 0,
        endDate: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 yıl free
      },
    };

    users.set(userId, newUser);

    // Otomatik free subscription oluştur ve localStorage'a kaydet
    const freeSubscription = {
      id: `sub_${userId}_${Date.now()}`,
      userId,
      plan: 'free' as const,
      status: 'active' as const,
      startDate: Date.now(),
      endDate: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 yıl
      daysRemaining: 365,
    };

    // Kayıt akışında localStorage'a subscription kaydet (AppLayout kontrolü için)
    // Bu sonradan sadece reference, subscription route'lar bunu kullanıyor

    const token = generateToken(userId);

    // Şifreyi çıkar response'dan
    const { password: _, ...userProfile } = newUser;

    console.log(`✅ Yeni kullanıcı kaydedildi: ${username} (${phone}) - ID: ${userId}`);

    res.status(201).json({
      success: true,
      user: userProfile as UserProfile,
      token,
      message: "Kayıt başarılı! Giriş yapabilirsiniz.",
    });
  } catch (error) {
    console.error("Register hatası:", error);
    res.status(500).json({
      success: false,
      message: "Kayıt sırasında hata oluştu",
    });
  }
};

/**
 * Login Handler
 */
export const handleLogin: RequestHandler<any, LoginResponse, LoginRequest> = async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = getDatabase();

    // Validasyon
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "E-posta ve şifre gerekli",
      });
    }

    // Önce bellek içi cache'de ara
    let user = Array.from(users.values()).find(u => u.email === email);

    // Cache'de yoksa veritabanıdan ara
    if (!user) {
      const dbUser = await db.getUserByUsername(email);
      if (dbUser) {
        // Veritabanı kaydından UserProfile oluştur
        user = {
          uid: dbUser.id,
          email: dbUser.email || email,
          username: dbUser.username,
          phone: dbUser.phone,
          password: dbUser.password_hash,
          createdAt: new Date(dbUser.created_at).getTime(),
          updatedAt: new Date(dbUser.updated_at).getTime(),
          isAdmin: false,
          lastLogin: dbUser.last_login ? new Date(dbUser.last_login).getTime() : undefined,
          preferences: {
            theme: "light",
            language: "tr",
            notifications: true,
          },
          statistics: {
            totalScans: 0,
            totalScanTime: 0,
            areasExplored: 0,
          },
          subscription: {
            plan: "free",
            isActive: false,
            daysRemaining: 0,
            endDate: 0,
          },
        };
        // Cache'e ekle
        users.set(dbUser.id, { ...user, password: dbUser.password_hash });
      }
    }

          // Firebase'den de kontrol et
          if (!user) {
            const firestoreDb = getAdminDb();
            if (firestoreDb) {
              try {
                // E-posta veya username ile ara
                const snapshot = await firestoreDb
                  .collection('users')
                  .where('email', '==', email)
                  .limit(1)
                  .get();

                if (!snapshot.empty) {
                  const firestoreUser = snapshot.docs[0].data();
                  user = {
                    uid: firestoreUser.id || snapshot.docs[0].id,
                    email: firestoreUser.email || email,
                    username: firestoreUser.username,
                    phone: firestoreUser.phone || '',
                    password: '', // Firestore'da şifre saklanmaz
                    createdAt: new Date(firestoreUser.created_at).getTime(),
                    updatedAt: new Date(firestoreUser.updated_at).getTime(),
                    isAdmin: false,
                    preferences: {
                      theme: "light",
                      language: "tr",
                      notifications: true,
                    },
                    statistics: {
                      totalScans: 0,
                      totalScanTime: 0,
                      areasExplored: 0,
                    },
                    subscription: {
                      plan: "free",
                      isActive: false,
                      daysRemaining: 0,
                      endDate: 0,
                    },
                  };
                }
              } catch (firestoreError) {
                console.warn('Firebase login kontrolü hatası:', firestoreError);
              }
            }
          }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Kullanıcı adı veya şifre hatalı",
      });
    }

    // Şifre kontrol et (base64'ü decode et ve karşılaştır)
    const incomingPassword = Buffer.from(password).toString("base64");
    if (user.password !== incomingPassword) {
      return res.status(401).json({
        success: false,
        message: "Kullanıcı adı veya şifre hatalı",
      });
    }

    // Token oluştur
    const token = generateToken(user.uid);

    // Son giriş zamanını güncelle
    user.lastLogin = Date.now();
    users.set(user.uid, { ...user, password: user.password });

    // Veritabanıya da güncelle
    await db.updateLastLogin(user.uid);

    // Şifreyi çıkar
    const { password: _, ...userProfile } = user;

    console.log(`✅ Giriş başarılı: ${user.username} (ID: ${user.uid})`);

    res.json({
      success: true,
      user: userProfile as UserProfile,
      token,
    });
  } catch (error) {
    console.error("Login hatası:", error);
    res.status(500).json({
      success: false,
      message: "Giriş sırasında hata oluştu",
    });
  }
};

/**
 * Profil Bilgisi Handler
 */
export const handleGetProfile: RequestHandler = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token gerekli",
      });
    }

    const userId = getUserIdFromToken(token);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Geçersiz token",
      });
    }

    const user = users.get(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Kullanıcı bulunamadı",
      });
    }

    const { password: _, ...userProfile } = user;
    res.json({
      success: true,
      user: userProfile as UserProfile,
    });
  } catch (error) {
    console.error("Profile fetch hatası:", error);
    res.status(500).json({
      success: false,
      message: "Profil bilgisi alınamadı",
    });
  }
};

/**
 * Logout Handler
 */
export const handleLogout: RequestHandler = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (token) {
      tokens.delete(token);
    }

    res.json({
      success: true,
      message: "Çıkış yapıldı",
    });
  } catch (error) {
    console.error("Logout hatası:", error);
    res.status(500).json({
      success: false,
      message: "Çıkış sırasında hata oluştu",
    });
  }
};
