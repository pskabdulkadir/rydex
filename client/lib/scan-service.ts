/**
 * Tarama Verisi Kaydetme Servisi
 * Supabase'ye JSONB formatta veri gönderme
 */

export interface ScanLocation {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface MagnetometerFeature {
  x: number;
  y: number;
  z: number;
  total: number;
  timestamp?: number;
}

export interface GeologyFeature {
  soilType: string;
  density: number;
  composition: string[];
  depth: number;
  confidence: number;
}

export interface ArchaeologyFeature {
  siteName: string;
  period: string;
  artifacts: Array<{
    name: string;
    type: string;
    confidence: number;
    depth: number;
  }>;
  historicalRelevance: 'Düşük' | 'Orta' | 'Yüksek';
}

export interface TopographyFeature {
  elevation: number;
  slope: number;
  aspectAngle: number;
  terrainType: string;
}

export interface ClimateFeature {
  temperature: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  weatherCondition: string;
}

export interface ArtifactDetectionFeature {
  detectedObjects: Array<{
    type: string;
    confidence: number;
    location: {
      x: number;
      y: number;
      z: number;
    };
  }>;
  totalArtifacts: number;
  scanQuality: 'Zayıf' | 'İyi' | 'Mükemmel';
}

export interface ScanFeatures {
  magnetometer?: MagnetometerFeature;
  geologyAnalysis?: GeologyFeature;
  archaeologyDatabase?: ArchaeologyFeature;
  topography?: TopographyFeature;
  climateData?: ClimateFeature;
  artifactDetection?: ArtifactDetectionFeature;
}

export interface SaveScanRequest {
  id: string;
  title: string;
  description?: string;
  location: ScanLocation;
  depth: number;
  area: number;
  features?: ScanFeatures;
  satelliteImageUrl?: string;
}

export interface SaveScanResponse {
  success: boolean;
  scan?: {
    id: string;
    title: string;
    location: ScanLocation;
    timestamp: number;
    status: string;
  };
  message: string;
  error?: string;
}

/**
 * Tarama verisi kaydet
 * Supabase'ye JSONB formatta kaydeder
 */
export async function saveScan(
  scanData: SaveScanRequest,
  userId?: string
): Promise<SaveScanResponse> {
  try {
    // userId gerekirse localStorage'dan al
    const userIdValue = userId || localStorage.getItem('userId');

    if (!userIdValue) {
      throw new Error('Kullanıcı ID bulunamadı. Lütfen giriş yapınız.');
    }

    const response = await fetch('/api/scan/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userIdValue,
      },
      body: JSON.stringify(scanData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Tarama kaydedilemedi');
    }

    const data: SaveScanResponse = await response.json();
    console.log('✅ Tarama başarıyla kaydedildi:', data.scan);
    return data;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Bilinmeyen hata';
    console.error('❌ Tarama kaydetme hatası:', message);
    return {
      success: false,
      message: message,
      error: message,
    };
  }
}

/**
 * Kullanıcının taramalarını getir
 */
export async function getUserScans(
  limit: number = 50,
  userId?: string
): Promise<any[]> {
  try {
    const userIdValue = userId || localStorage.getItem('userId');

    if (!userIdValue) {
      throw new Error('Kullanıcı ID bulunamadı');
    }

    const response = await fetch(`/api/scan/user?limit=${limit}`, {
      headers: {
        'x-user-id': userIdValue,
      },
    });

    if (!response.ok) {
      throw new Error('Taramalar alınamadı');
    }

    const data = await response.json();
    return data.scans || [];
  } catch (error) {
    console.error('Tarama getirme hatası:', error);
    return [];
  }
}

/**
 * Belirli bir alandaki taramaları getir
 */
export async function getAreaScans(
  latitude: number,
  longitude: number,
  radius: number = 50
): Promise<{ scans: any[]; magnetometer: any[] }> {
  try {
    const response = await fetch(
      `/api/scan/area?latitude=${latitude}&longitude=${longitude}&radius=${radius}`
    );

    if (!response.ok) {
      throw new Error('Alan verileri alınamadı');
    }

    const data = await response.json();
    return {
      scans: data.scans || [],
      magnetometer: data.magnetometer || [],
    };
  } catch (error) {
    console.error('Alan tarama getirme hatası:', error);
    return { scans: [], magnetometer: [] };
  }
}

/**
 * Tarama istatistiklerini getir
 */
export async function getScanStats(): Promise<any> {
  try {
    const response = await fetch('/api/scan/stats');

    if (!response.ok) {
      throw new Error('İstatistikler alınamadı');
    }

    const data = await response.json();
    return data.stats;
  } catch (error) {
    console.error('İstatistik getirme hatası:', error);
    return null;
  }
}

/**
 * Basit tarama verisi oluşturma helper'ı
 * Features olmadan temel tarama kaydı oluştur
 */
export function createBasicScan(
  title: string,
  location: ScanLocation,
  depth: number = 0,
  area: number = 0,
  description?: string
): SaveScanRequest {
  return {
    id: `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title,
    description,
    location,
    depth,
    area,
  };
}

/**
 * Tarama verisi örneği (test için)
 */
export function createExampleScan(): SaveScanRequest {
  return {
    id: `scan_example_${Date.now()}`,
    title: 'Test Taraması',
    description: 'Bu bir test taraması verisidir',
    location: {
      latitude: 40.7128,
      longitude: -74.006,
      address: 'New York, USA',
    },
    depth: 100,
    area: 1000,
    features: {
      magnetometer: {
        x: 12.34,
        y: 56.78,
        z: 90.12,
        total: 120.5,
        timestamp: Date.now(),
      },
      geologyAnalysis: {
        soilType: 'Kumlu Toprak',
        density: 1.8,
        composition: ['Kum', 'Çakıl', 'Kil'],
        depth: 150,
        confidence: 0.85,
      },
      topography: {
        elevation: 125,
        slope: 15.5,
        aspectAngle: 45,
        terrainType: 'Dağlık',
      },
      climateData: {
        temperature: 22.5,
        humidity: 65,
        precipitation: 0,
        windSpeed: 5.2,
        weatherCondition: 'Açık',
      },
    },
  };
}

/**
 * Dekont yükleme servisi
 */
export interface ReceiptUploadRequest {
  subscriptionId: string;
  plan: string;
  amount: number;
  currency: string;
  fileName: string;
  fileUrl: string; // Base64 veya URL
  fileSize: number;
  mimeType: string;
}

export async function uploadReceipt(
  receipt: ReceiptUploadRequest,
  userId?: string
): Promise<{ success: boolean; message: string; receiptId?: string }> {
  try {
    const userIdValue = userId || localStorage.getItem('userId');

    if (!userIdValue) {
      throw new Error('Kullanıcı ID bulunamadı');
    }

    const response = await fetch('/api/receipt/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userIdValue,
      },
      body: JSON.stringify(receipt),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Dekont yüklenemedi');
    }

    const data = await response.json();
    console.log('✅ Dekont başarıyla yüklendi');
    return {
      success: true,
      message: data.message,
      receiptId: data.receipt?.id,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Bilinmeyen hata';
    console.error('❌ Dekont yükleme hatası:', message);
    return {
      success: false,
      message: message,
    };
  }
}

/**
 * Kullanıcının dekonlarını getir
 */
export async function getUserReceipts(userId?: string): Promise<any[]> {
  try {
    const userIdValue = userId || localStorage.getItem('userId');

    if (!userIdValue) {
      throw new Error('Kullanıcı ID bulunamadı');
    }

    const response = await fetch('/api/receipt/user', {
      headers: {
        'x-user-id': userIdValue,
      },
    });

    if (!response.ok) {
      throw new Error('Dekontlar alınamadı');
    }

    const data = await response.json();
    return data.receipts || [];
  } catch (error) {
    console.error('Dekont getirme hatası:', error);
    return [];
  }
}
