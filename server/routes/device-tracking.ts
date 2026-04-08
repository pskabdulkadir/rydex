import { RequestHandler } from 'express';

interface DeviceInfo {
  id: string;
  userId: string;
  ipAddress: string;
  userAgent: string;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  os: string;
  browser: string;
  screenResolution: string;
  language: string;
  timezone: string;
  location?: {
    country?: string;
    region?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  };
  lastActive: number;
  firstSeen: number;
  sessionCount: number;
}

// Bellek içi cihaz deposu
const deviceStore: Map<string, DeviceInfo> = new Map();

/**
 * Cihaz bilgilerini kaydet veya güncelle
 */
export const handleTrackDevice: RequestHandler = async (req, res) => {
  try {
    const {
      ipAddress,
      userAgent,
      deviceType,
      os,
      browser,
      screenResolution,
      language,
      timezone,
      location,
    } = req.body;

    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı ID gerekli'
      });
    }

    // Cihaz ID'si oluştur (user agent + IP hash)
    const deviceId = `device_${userId}_${Buffer.from(`${userAgent}_${ipAddress}`).toString('base64').substring(0, 16)}`;

    // Mevcut cihazı kontrol et
    let device = deviceStore.get(deviceId);

    if (device) {
      // Cihazı güncelle
      device.lastActive = Date.now();
      device.sessionCount = (device.sessionCount || 0) + 1;
      device.ipAddress = ipAddress;
      device.userAgent = userAgent;
      if (location) device.location = location;
    } else {
      // Yeni cihaz oluştur
      device = {
        id: deviceId,
        userId,
        ipAddress,
        userAgent,
        deviceType: deviceType || 'unknown',
        os: os || 'Unknown',
        browser: browser || 'Unknown',
        screenResolution: screenResolution || 'Unknown',
        language: language || 'Unknown',
        timezone: timezone || 'Unknown',
        location,
        lastActive: Date.now(),
        firstSeen: Date.now(),
        sessionCount: 1,
      };
      deviceStore.set(deviceId, device);
    }

    console.log(`📱 Cihaz kaydedildi: ${deviceType} - ${userId}`);

    res.json({
      success: true,
      deviceId,
      message: 'Cihaz bilgisi kaydedildi'
    });
  } catch (error) {
    console.error('Cihaz izleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Cihaz bilgisi kaydedilemedi'
    });
  }
};

/**
 * Kullanıcının tüm cihazlarını getir (Admin)
 */
export const handleGetUserDevices: RequestHandler = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Kullanıcı ID gerekli'
      });
    }

    // Bellekten cihazları filtrele
    const userDevices = Array.from(deviceStore.values()).filter(d => d.userId === userId);

    res.json({
      success: true,
      devices: userDevices,
      count: userDevices.length
    });
  } catch (error) {
    console.error('Kullanıcı cihazları getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Cihazlar alınamadı'
    });
  }
};

/**
 * Tüm cihazları getir (Admin - tüm kullanıcılar)
 */
export const handleGetAllDevices: RequestHandler = async (req, res) => {
  try {
    const allDevices = Array.from(deviceStore.values());

    // Son 24 saatte aktif olanları göster
    const activeDevices = allDevices.filter(d => 
      d.lastActive > Date.now() - 24 * 60 * 60 * 1000
    );

    res.json({
      success: true,
      devices: allDevices,
      activeDevices: activeDevices.length,
      totalDevices: allDevices.length,
      count: allDevices.length
    });
  } catch (error) {
    console.error('Tüm cihazları getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Cihazlar alınamadı'
    });
  }
};

/**
 * Cihaz istatistikleri (Admin)
 */
export const handleGetDeviceStats: RequestHandler = async (req, res) => {
  try {
    const devices = Array.from(deviceStore.values());

    // Cihaz tiplerine göre say
    const deviceTypes = devices.reduce((acc, d) => {
      acc[d.deviceType] = (acc[d.deviceType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // İşletim sistemlerine göre say
    const osTypes = devices.reduce((acc, d) => {
      acc[d.os] = (acc[d.os] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Tarayıcılara göre say
    const browsers = devices.reduce((acc, d) => {
      acc[d.browser] = (acc[d.browser] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Son 24 saatte aktif kullanıcılar
    const activeUsers = new Set(
      devices
        .filter(d => d.lastActive > Date.now() - 24 * 60 * 60 * 1000)
        .map(d => d.userId)
    ).size;

    res.json({
      success: true,
      stats: {
        totalDevices: devices.length,
        activeUsers,
        deviceTypes,
        osTypes,
        browsers,
      }
    });
  } catch (error) {
    console.error('Cihaz istatistikleri hatası:', error);
    res.status(500).json({
      success: false,
      message: 'İstatistikler alınamadı'
    });
  }
};
