/**
 * Supabase / Neon Veritabanı Entegrasyonu
 * Gerçek tarama verilerinin kalıcı depolanması
 */

// Supabase client'ını import et (isteğe bağlı)
let createClient: any = null;

try {
  const supabaseModule = require('@supabase/supabase-js');
  createClient = supabaseModule.createClient;
} catch (error) {
  console.warn('⚠️ Supabase modülü yüklü değil - bellek içi depolama kullanılacak');
}

// Veritabanı bağlantısı (Supabase/Neon kullanabilir)
interface DatabaseConfig {
  supabaseUrl?: string;
  supabaseKey?: string;
  neonConnectionString?: string;
  useInMemory?: boolean; // Geliştirme ortamında bellek içi depolama
}

interface ScanRecord {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
  address: string;
  satellite_image_url?: string;
  depth: number;
  area: number;
  magnetic_data?: any;
  geology_data?: any;
  archaeology_data?: any;
  terrain_data?: any;
  climate_data?: any;
  artifact_data?: any;
  status: 'pending' | 'synced' | 'failed';
  created_at: string;
  updated_at: string;
}

interface MagnetometerRecord {
  id: string;
  device_id: string;
  latitude: number;
  longitude: number;
  x: number;
  y: number;
  z: number;
  total: number;
  created_at: string;
}

interface UserRecord {
  id: string;
  username: string;
  phone: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
  // Üyelik onay sistemi
  approval_status: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  // Paket ve abonelik bilgisi
  current_package?: string;
  subscription_start?: string;
  subscription_end?: string;
  is_active: boolean;
}

interface ReceiptRecord {
  id: string;
  user_id: string;
  subscription_id: string;
  plan: string;
  amount: number;
  currency: string;
  file_name: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  approval_notes?: string;
  uploaded_at: string;
  approved_at?: string;
}

class DatabaseManager {
  private supabase: any = null;
  private useInMemory: boolean = false;
  private inMemoryScans: ScanRecord[] = [];
  private inMemoryMagnetometer: MagnetometerRecord[] = [];
  private inMemoryUsers: UserRecord[] = [];
  private inMemoryReceipts: ReceiptRecord[] = [];

  constructor(config: DatabaseConfig) {
    try {
      if (config.useInMemory) {
        this.useInMemory = true;
        console.log('📊 Bellek içi veritabanı kullanılıyor (geliştirme ortamı)');
      } else if (config.supabaseUrl && config.supabaseKey && createClient) {
        try {
          // Supabase bağlantısı (createClient yüklü olmalı)
          this.supabase = createClient(config.supabaseUrl, config.supabaseKey);
          console.log('✅ Supabase bağlantısı başarıyla kuruldu');
        } catch (supabaseError) {
          console.warn('⚠️ Supabase bağlantı hatası:', supabaseError instanceof Error ? supabaseError.message : String(supabaseError));
          this.useInMemory = true;
          console.log('📊 Yedek: Bellek içi depolama kullanılıyor');
        }
      } else if (config.neonConnectionString) {
        console.log('✅ Neon veritabanı yapılandırması hazır (PostgreSQL)');
        // Neon bağlantısı ileride gerçeklenebilir
        this.useInMemory = true;
        console.log('📊 Şu an bellek içi depolama kullanılıyor');
      } else {
        this.useInMemory = true;
        console.log('⚠️ Veritabanı yapılandırması eksik - bellek içi depolama kullanılıyor');
      }
    } catch (error) {
      console.error('❌ Veritabanı başlatma hatası:', error);
      this.useInMemory = true;
    }
  }

  /**
   * Tarama kaydını kaydet
   */
  async saveScan(scan: any): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const scanRecord: ScanRecord = {
        id: scan.id,
        user_id: scan.userId,
        title: scan.title,
        description: scan.description,
        latitude: scan.location.latitude,
        longitude: scan.location.longitude,
        address: scan.location.address || 'Bilinmeyen',
        satellite_image_url: scan.satelliteImageUrl,
        depth: scan.depth || 0,
        area: scan.area || 0,
        magnetic_data: scan.features?.magnetometer,
        geology_data: scan.features?.geologyAnalysis,
        archaeology_data: scan.features?.archaeologyDatabase,
        terrain_data: scan.features?.topography,
        climate_data: scan.features?.climateData,
        artifact_data: scan.features?.artifactDetection,
        status: 'synced',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (this.useInMemory) {
        this.inMemoryScans.push(scanRecord);
        console.log(`💾 Tarama kaydedildi (Bellek): ${scanRecord.id}`);
        return { success: true, id: scanRecord.id };
      }

      if (this.supabase && createClient) {
        try {
          const { data, error } = await this.supabase
            .from('scans')
            .insert([scanRecord])
            .select();

          if (error) {
            console.error('Supabase tarama kaydetme hatası:', error.message);
            // Supabase hatası durumunda bellek içinde de kaydet
            this.inMemoryScans.push(scanRecord);
            return { success: true, id: scanRecord.id };
          }

          console.log(`💾 Tarama kaydedildi (Supabase): ${scanRecord.id}`);
          return { success: true, id: scanRecord.id };
        } catch (supabaseError) {
          console.warn('Supabase işlem hatası, bellek içine kaydediliyor:', supabaseError instanceof Error ? supabaseError.message : String(supabaseError));
          this.inMemoryScans.push(scanRecord);
          return { success: true, id: scanRecord.id };
        }
      }

      return { success: false, error: 'Veritabanı yapılandırması eksik' };
    } catch (error) {
      console.error('Tarama kaydetme hatası:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Bilinmeyen hata' 
      };
    }
  }

  /**
   * Manyetometre kaydını kaydet
   */
  async saveMagnetometerData(data: any): Promise<{ success: boolean; error?: string }> {
    try {
      const record: MagnetometerRecord = {
        id: `mag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        device_id: data.deviceId || 'unknown',
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
        x: data.x || 0,
        y: data.y || 0,
        z: data.z || 0,
        total: data.total || 0,
        created_at: new Date().toISOString(),
      };

      if (this.useInMemory) {
        this.inMemoryMagnetometer.push(record);
        console.log(`📊 Manyetometre kaydedildi (Bellek): ${record.id}`);
        return { success: true };
      }

      if (this.supabase && createClient) {
        try {
          const { error } = await this.supabase
            .from('magnetometer_data')
            .insert([record]);

          if (error) {
            console.warn('Supabase manyetometre kaydetme hatası:', error.message);
            this.inMemoryMagnetometer.push(record);
            return { success: true };
          }

          console.log(`📊 Manyetometre kaydedildi (Supabase): ${record.id}`);
          return { success: true };
        } catch (supabaseError) {
          console.warn('Supabase işlem hatası, bellek içine kaydediliyor:', supabaseError instanceof Error ? supabaseError.message : String(supabaseError));
          this.inMemoryMagnetometer.push(record);
          return { success: true };
        }
      }

      return { success: false, error: 'Veritabanı yapılandırması eksik' };
    } catch (error) {
      console.error('Manyetometre kaydetme hatası:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Bilinmeyen hata' 
      };
    }
  }

  /**
   * Kullanıcının taramalarını getir
   */
  async getUserScans(userId: string, limit: number = 50): Promise<ScanRecord[]> {
    try {
      if (this.useInMemory) {
        return this.inMemoryScans
          .filter(s => s.user_id === userId)
          .slice(-limit);
      }

      if (this.supabase) {
        const { data, error } = await this.supabase
          .from('scans')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) {
          console.error('Supabase tarama sorgulama hatası:', error);
          return [];
        }

        return data || [];
      }

      return [];
    } catch (error) {
      console.error('Tarama getirme hatası:', error);
      return [];
    }
  }

  /**
   * Manyetometre verilerini getir
   */
  async getMagnetometerData(
    latitude: number,
    longitude: number,
    radiusKm: number = 50,
    limit: number = 100
  ): Promise<MagnetometerRecord[]> {
    try {
      if (this.useInMemory) {
        return this.inMemoryMagnetometer
          .filter(m => {
            const distance = this.calculateDistance(
              m.latitude, m.longitude,
              latitude, longitude
            );
            return distance <= radiusKm;
          })
          .slice(-limit);
      }

      if (this.supabase) {
        // Supabase'de mesafe bazlı sorgulama için PostGIS kullanılabilir
        const { data, error } = await this.supabase
          .from('magnetometer_data')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) {
          console.error('Supabase manyetometre sorgulama hatası:', error);
          return [];
        }

        // Client tarafında filtreleme (ideal olarak server tarafında yapılmalı)
        return (data || []).filter(m => {
          const distance = this.calculateDistance(
            m.latitude, m.longitude,
            latitude, longitude
          );
          return distance <= radiusKm;
        });
      }

      return [];
    } catch (error) {
      console.error('Manyetometre verisi getirme hatası:', error);
      return [];
    }
  }

  /**
   * Belirli bir alandaki tüm verileri getir
   */
  async getAreaData(
    latitude: number,
    longitude: number,
    radiusKm: number = 50
  ): Promise<{ scans: ScanRecord[]; magnetometer: MagnetometerRecord[] }> {
    let scans: ScanRecord[] = [];

    if (this.useInMemory) {
      scans = this.inMemoryScans.filter(s => {
        const distance = this.calculateDistance(s.latitude, s.longitude, latitude, longitude);
        return distance <= radiusKm;
      });
    } else if (this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('scans')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          // Client-side mesafe filtrelemesi (ideal olarak server tarafında PostGIS ile yapılmalı)
          scans = data.filter((s: ScanRecord) => {
            const distance = this.calculateDistance(s.latitude, s.longitude, latitude, longitude);
            return distance <= radiusKm;
          });
        } else if (error) {
          console.error('Supabase alan verisi sorgulama hatası:', error);
        }
      } catch (error) {
        console.error('Alan verisi getirme hatası:', error);
      }
    }

    const magnetometer = await this.getMagnetometerData(latitude, longitude, radiusKm);

    return { scans, magnetometer };
  }

  /**
   * İstatistikleri al
   */
  async getStats(): Promise<{
    totalScans: number;
    totalMagnetometerReadings: number;
    lastScanDate?: string;
  }> {
    if (this.useInMemory) {
      return {
        totalScans: this.inMemoryScans.length,
        totalMagnetometerReadings: this.inMemoryMagnetometer.length,
        lastScanDate: this.inMemoryScans[this.inMemoryScans.length - 1]?.created_at,
      };
    }

    if (this.supabase) {
      try {
        const [scansCount, magCount] = await Promise.all([
          this.supabase.from('scans').select('count', { count: 'exact' }),
          this.supabase.from('magnetometer_data').select('count', { count: 'exact' }),
        ]);

        return {
          totalScans: scansCount.count || 0,
          totalMagnetometerReadings: magCount.count || 0,
        };
      } catch (error) {
        console.error('İstatistik getirme hatası:', error);
      }
    }

    return { totalScans: 0, totalMagnetometerReadings: 0 };
  }

  /**
   * Kullanıcı kaydını kaydet
   */
  async saveUser(user: UserRecord): Promise<{ success: boolean; error?: string }> {
    try {
      if (this.useInMemory) {
        // Aynı kullanıcı adı veya telefon var mı kontrol et
        const existing = this.inMemoryUsers.find(
          u => u.username === user.username || u.phone === user.phone
        );
        if (existing) {
          return {
            success: false,
            error: existing.username === user.username
              ? "Bu kullanıcı adı zaten kayıtlı"
              : "Bu telefon numarası zaten kayıtlı"
          };
        }

        this.inMemoryUsers.push(user);
        console.log(`👤 Kullanıcı kaydedildi (Bellek): ${user.username}`);
        return { success: true };
      }

      if (this.supabase && createClient) {
        try {
          // Aynı kullanıcı adı var mı kontrol et
          const { data: existing } = await this.supabase
            .from('users')
            .select('id')
            .or(`username.eq.${user.username},phone.eq.${user.phone}`)
            .limit(1);

          if (existing && existing.length > 0) {
            return {
              success: false,
              error: "Bu kullanıcı adı veya telefon zaten kayıtlı"
            };
          }

          const { error } = await this.supabase
            .from('users')
            .insert([user]);

          if (error) {
            console.warn('Supabase kullanıcı kaydetme hatası:', error.message);
            this.inMemoryUsers.push(user);
            return { success: true };
          }

          console.log(`👤 Kullanıcı kaydedildi (Supabase): ${user.username}`);
          return { success: true };
        } catch (supabaseError) {
          console.warn('Supabase işlem hatası, bellek içine kaydediliyor:', supabaseError instanceof Error ? supabaseError.message : String(supabaseError));
          this.inMemoryUsers.push(user);
          return { success: true };
        }
      }

      return { success: false, error: 'Veritabanı yapılandırması eksik' };
    } catch (error) {
      console.error('Kullanıcı kaydetme hatası:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      };
    }
  }

  /**
   * Kullanıcı adına göre kullanıcı bul
   */
  async getUserByUsername(username: string): Promise<UserRecord | null> {
    try {
      if (this.useInMemory) {
        return this.inMemoryUsers.find(u => u.username === username) || null;
      }

      if (this.supabase) {
        const { data, error } = await this.supabase
          .from('users')
          .select('*')
          .eq('username', username)
          .limit(1);

        if (error) {
          console.error('Supabase kullanıcı sorgulama hatası:', error);
          return null;
        }

        return (data && data.length > 0) ? data[0] : null;
      }

      return null;
    } catch (error) {
      console.error('Kullanıcı sorgulama hatası:', error);
      return null;
    }
  }

  /**
   * Kullanıcının son giriş zamanını güncelle
   */
  async updateLastLogin(userId: string): Promise<{ success: boolean }> {
    try {
      const now = new Date().toISOString();

      if (this.useInMemory) {
        const user = this.inMemoryUsers.find(u => u.id === userId);
        if (user) {
          user.last_login = now;
          user.updated_at = now;
        }
        return { success: true };
      }

      if (this.supabase) {
        await this.supabase
          .from('users')
          .update({ last_login: now, updated_at: now })
          .eq('id', userId);

        return { success: true };
      }

      return { success: false };
    } catch (error) {
      console.error('Son giriş güncelleme hatası:', error);
      return { success: false };
    }
  }

  /**
   * Dekont kaydını kaydet
   */
  async saveReceipt(receipt: ReceiptRecord): Promise<{ success: boolean; error?: string }> {
    try {
      if (this.useInMemory) {
        this.inMemoryReceipts.push(receipt);
        console.log(`📄 Dekont kaydedildi (Bellek): ${receipt.id}`);
        return { success: true };
      }

      if (this.supabase) {
        const { error } = await this.supabase
          .from('receipts')
          .insert([receipt]);

        if (error) {
          console.error('Supabase dekont kaydetme hatası:', error);
          return { success: false, error: error.message };
        }

        console.log(`📄 Dekont kaydedildi (Supabase): ${receipt.id}`);
        return { success: true };
      }

      return { success: false, error: 'Veritabanı yapılandırması eksik' };
    } catch (error) {
      console.error('Dekont kaydetme hatası:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      };
    }
  }

  /**
   * Kullanıcının dekonklarını getir
   */
  async getUserReceipts(userId: string): Promise<ReceiptRecord[]> {
    try {
      if (this.useInMemory) {
        return this.inMemoryReceipts.filter(r => r.user_id === userId);
      }

      if (this.supabase) {
        const { data, error } = await this.supabase
          .from('receipts')
          .select('*')
          .eq('user_id', userId)
          .order('uploaded_at', { ascending: false });

        if (error) {
          console.error('Supabase dekont sorgulama hatası:', error);
          return [];
        }

        return (data || []) as ReceiptRecord[];
      }

      return [];
    } catch (error) {
      console.error('Dekont sorgulama hatası:', error);
      return [];
    }
  }

  /**
   * Tüm onay bekleyen dekonları getir (Admin için)
   */
  async getPendingReceipts(): Promise<ReceiptRecord[]> {
    try {
      if (this.useInMemory) {
        return this.inMemoryReceipts.filter(r => r.status === 'pending');
      }

      if (this.supabase) {
        const { data, error } = await this.supabase
          .from('receipts')
          .select('*')
          .eq('status', 'pending')
          .order('uploaded_at', { ascending: true });

        if (error) {
          console.error('Supabase bekleyen dekont sorgulama hatası:', error);
          return [];
        }

        return (data || []) as ReceiptRecord[];
      }

      return [];
    } catch (error) {
      console.error('Bekleyen dekont sorgulama hatası:', error);
      return [];
    }
  }

  /**
   * Dekont onayı güncelle
   */
  async updateReceiptStatus(
    receiptId: string,
    status: 'approved' | 'rejected',
    approvedBy: string,
    notes?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (this.useInMemory) {
        const receipt = this.inMemoryReceipts.find(r => r.id === receiptId);
        if (receipt) {
          receipt.status = status;
          receipt.approved_by = approvedBy;
          receipt.approval_notes = notes;
          receipt.approved_at = new Date().toISOString();
        }
        console.log(`✅ Dekont güncellendi (Bellek): ${receiptId} -> ${status}`);
        return { success: true };
      }

      if (this.supabase) {
        const { error } = await this.supabase
          .from('receipts')
          .update({
            status,
            approved_by: approvedBy,
            approval_notes: notes,
            approved_at: new Date().toISOString()
          })
          .eq('id', receiptId);

        if (error) {
          console.error('Supabase dekont güncelleme hatası:', error);
          return { success: false, error: error.message };
        }

        console.log(`✅ Dekont güncellendi (Supabase): ${receiptId} -> ${status}`);
        return { success: true };
      }

      return { success: false, error: 'Veritabanı yapılandırması eksik' };
    } catch (error) {
      console.error('Dekont güncelleme hatası:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      };
    }
  }

  /**
   * Spesifik dekont bilgisini getir
   */
  async getReceipt(receiptId: string): Promise<ReceiptRecord | null> {
    try {
      if (this.useInMemory) {
        return this.inMemoryReceipts.find(r => r.id === receiptId) || null;
      }

      if (this.supabase) {
        const { data, error } = await this.supabase
          .from('receipts')
          .select('*')
          .eq('id', receiptId)
          .limit(1);

        if (error) {
          console.error('Supabase dekont getirme hatası:', error);
          return null;
        }

        return (data && data.length > 0) ? data[0] : null;
      }

      return null;
    } catch (error) {
      console.error('Dekont getirme hatası:', error);
      return null;
    }
  }

  /**
   * Onay bekleyen kullanıcıları getir (Admin için)
   */
  async getPendingUsers(): Promise<UserRecord[]> {
    try {
      if (this.useInMemory) {
        return this.inMemoryUsers.filter(u => u.approval_status === 'pending');
      }

      if (this.supabase) {
        const { data, error } = await this.supabase
          .from('users')
          .select('*')
          .eq('approval_status', 'pending')
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Supabase bekleyen kullanıcı sorgulama hatası:', error);
          return [];
        }

        return (data || []) as UserRecord[];
      }

      return [];
    } catch (error) {
      console.error('Bekleyen kullanıcı sorgulama hatası:', error);
      return [];
    }
  }

  /**
   * Kullanıcı onayı güncelle
   */
  async updateUserApprovalStatus(
    userId: string,
    status: 'approved' | 'rejected',
    approvedBy: string,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (this.useInMemory) {
        const user = this.inMemoryUsers.find(u => u.id === userId);
        if (user) {
          user.approval_status = status;
          user.approved_by = approvedBy;
          user.approved_at = new Date().toISOString();
          if (reason && status === 'rejected') {
            user.rejection_reason = reason;
          }
          if (status === 'approved') {
            user.is_active = true;
          }
        }
        console.log(`✅ Kullanıcı onayı güncellendi (Bellek): ${userId} -> ${status}`);
        return { success: true };
      }

      if (this.supabase) {
        const { error } = await this.supabase
          .from('users')
          .update({
            approval_status: status,
            approved_by: approvedBy,
            approved_at: new Date().toISOString(),
            rejection_reason: reason && status === 'rejected' ? reason : null,
            is_active: status === 'approved'
          })
          .eq('id', userId);

        if (error) {
          console.error('Supabase kullanıcı onay güncelleme hatası:', error);
          return { success: false, error: error.message };
        }

        console.log(`✅ Kullanıcı onayı güncellendi (Supabase): ${userId} -> ${status}`);
        return { success: true };
      }

      return { success: false, error: 'Veritabanı yapılandırması eksik' };
    } catch (error) {
      console.error('Kullanıcı onay güncelleme hatası:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      };
    }
  }

  /**
   * Kullanıcı abonelik bilgisini güncelle
   */
  async updateUserSubscription(
    userId: string,
    packageId: string,
    subscriptionEnd: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (this.useInMemory) {
        const user = this.inMemoryUsers.find(u => u.id === userId);
        if (user) {
          user.current_package = packageId;
          user.subscription_start = new Date().toISOString();
          user.subscription_end = subscriptionEnd;
          user.is_active = true;
        }
        console.log(`✅ Kullanıcı aboneliği güncellendi (Bellek): ${userId}`);
        return { success: true };
      }

      if (this.supabase) {
        const { error } = await this.supabase
          .from('users')
          .update({
            current_package: packageId,
            subscription_start: new Date().toISOString(),
            subscription_end: subscriptionEnd,
            is_active: true
          })
          .eq('id', userId);

        if (error) {
          console.error('Supabase abonelik güncelleme hatası:', error);
          return { success: false, error: error.message };
        }

        console.log(`✅ Kullanıcı aboneliği güncellendi (Supabase): ${userId}`);
        return { success: true };
      }

      return { success: false, error: 'Veritabanı yapılandırması eksik' };
    } catch (error) {
      console.error('Abonelik güncelleme hatası:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      };
    }
  }

  /**
   * Kullanıcı sil (Sahte üyeler için)
   */
  async deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (this.useInMemory) {
        const index = this.inMemoryUsers.findIndex(u => u.id === userId);
        if (index > -1) {
          this.inMemoryUsers.splice(index, 1);
          console.log(`🗑️ Kullanıcı silindi (Bellek): ${userId}`);
          return { success: true };
        }
        return { success: false, error: 'Kullanıcı bulunamadı' };
      }

      if (this.supabase) {
        const { error } = await this.supabase
          .from('users')
          .delete()
          .eq('id', userId);

        if (error) {
          console.error('Supabase kullanıcı silme hatası:', error);
          return { success: false, error: error.message };
        }

        console.log(`🗑️ Kullanıcı silindi (Supabase): ${userId}`);
        return { success: true };
      }

      return { success: false, error: 'Veritabanı yapılandırması eksik' };
    } catch (error) {
      console.error('Kullanıcı silme hatası:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      };
    }
  }

  /**
   * Yardımcı: İki konum arasındaki mesafeyi hesapla (Haversine)
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Dünya yarıçapı (km)
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}

// Global database instance
let dbManager: DatabaseManager | null = null;

export function initializeDatabase(config: DatabaseConfig): DatabaseManager {
  dbManager = new DatabaseManager(config);
  return dbManager;
}

export function getDatabase(): DatabaseManager {
  if (!dbManager) {
    // Eğer initialize edilmemişse, bellek içi modu başlat
    dbManager = new DatabaseManager({ useInMemory: true });
  }
  return dbManager;
}

export type { ScanRecord, MagnetometerRecord, UserRecord, ReceiptRecord };
