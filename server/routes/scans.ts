import { RequestHandler } from 'express';
import { getDatabase } from '../database';

/**
 * Tarama verisi kaydet
 * JSONB alanlarına uygun formatta veri gönderir
 */
export const handleSaveScan: RequestHandler = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string || req.body.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı ID gerekli',
      });
    }

    const {
      id,
      title,
      description,
      location,
      depth,
      area,
      features,
      satelliteImageUrl,
    } = req.body;

    // Validasyon
    if (!id || !title || !location) {
      return res.status(400).json({
        success: false,
        message: 'ID, başlık ve konum zorunludur',
      });
    }

    if (!location.latitude || !location.longitude) {
      return res.status(400).json({
        success: false,
        message: 'Konum enlem ve boylam değerleri gerekli',
      });
    }

    // JSONB alanlarını düzgün formatta hazırla
    const scanData = {
      id,
      userId,
      title: title.trim(),
      description: description?.trim() || '',
      location: {
        latitude: parseFloat(location.latitude),
        longitude: parseFloat(location.longitude),
        address: location.address || 'Bilinmeyen',
      },
      depth: parseFloat(depth) || 0,
      area: parseFloat(area) || 0,
      satelliteImageUrl: satelliteImageUrl || null,

      // Features - JSONB formatta saklanacak
      features: {
        magnetometer: features?.magnetometer
          ? {
              x: parseFloat(features.magnetometer.x) || 0,
              y: parseFloat(features.magnetometer.y) || 0,
              z: parseFloat(features.magnetometer.z) || 0,
              total: parseFloat(features.magnetometer.total) || 0,
              timestamp: features.magnetometer.timestamp || Date.now(),
            }
          : null,

        geologyAnalysis: features?.geologyAnalysis
          ? {
              soilType: features.geologyAnalysis.soilType || 'Bilinmeyen',
              density: parseFloat(features.geologyAnalysis.density) || 0,
              composition: features.geologyAnalysis.composition || [],
              depth: parseFloat(features.geologyAnalysis.depth) || 0,
              confidence: parseFloat(features.geologyAnalysis.confidence) || 0,
            }
          : null,

        archaeologyDatabase: features?.archaeologyDatabase
          ? {
              siteName: features.archaeologyDatabase.siteName || '',
              period: features.archaeologyDatabase.period || 'Bilinmeyen',
              artifacts: Array.isArray(features.archaeologyDatabase.artifacts)
                ? features.archaeologyDatabase.artifacts.map((a: any) => ({
                    name: a.name || '',
                    type: a.type || '',
                    confidence: parseFloat(a.confidence) || 0,
                    depth: parseFloat(a.depth) || 0,
                  }))
                : [],
              historicalRelevance: features.archaeologyDatabase.historicalRelevance || 'Düşük',
            }
          : null,

        topography: features?.topography
          ? {
              elevation: parseFloat(features.topography.elevation) || 0,
              slope: parseFloat(features.topography.slope) || 0,
              aspectAngle: parseFloat(features.topography.aspectAngle) || 0,
              terrainType: features.topography.terrainType || 'Düz',
            }
          : null,

        climateData: features?.climateData
          ? {
              temperature: parseFloat(features.climateData.temperature) || 0,
              humidity: parseFloat(features.climateData.humidity) || 0,
              precipitation: parseFloat(features.climateData.precipitation) || 0,
              windSpeed: parseFloat(features.climateData.windSpeed) || 0,
              weatherCondition: features.climateData.weatherCondition || 'Açık',
            }
          : null,

        artifactDetection: features?.artifactDetection
          ? {
              detectedObjects: Array.isArray(features.artifactDetection.detectedObjects)
                ? features.artifactDetection.detectedObjects.map((obj: any) => ({
                    type: obj.type || '',
                    confidence: parseFloat(obj.confidence) || 0,
                    location: {
                      x: parseFloat(obj.location?.x) || 0,
                      y: parseFloat(obj.location?.y) || 0,
                      z: parseFloat(obj.location?.z) || 0,
                    },
                  }))
                : [],
              totalArtifacts: parseInt(features.artifactDetection.totalArtifacts) || 0,
              scanQuality: features.artifactDetection.scanQuality || 'İyi',
            }
          : null,
      },

      timestamp: Date.now(),
      status: 'synced',
    };

    const db = getDatabase();

    // Tarama verilerini Supabase'ye kaydet
    const result = await db.saveScan(scanData);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error || 'Tarama kaydedilemedi',
      });
    }

    console.log(
      `✅ Tarama kaydedildi: "${title}" (${userId}) - ID: ${id}`
    );

    res.status(201).json({
      success: true,
      scan: {
        id: scanData.id,
        title: scanData.title,
        location: scanData.location,
        timestamp: scanData.timestamp,
        status: scanData.status,
      },
      message: 'Tarama başarıyla kaydedildi',
    });
  } catch (error) {
    console.error('Tarama kaydetme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Tarama kaydedilirken hata oluştu',
      error: error instanceof Error ? error.message : 'Bilinmeyen hata',
    });
  }
};

/**
 * Kullanıcının taramalarını getir
 */
export const handleGetUserScans: RequestHandler = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const limit = parseInt(req.query.limit as string) || 50;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı ID gerekli',
      });
    }

    const db = getDatabase();
    const scans = await db.getUserScans(userId, limit);

    res.json({
      success: true,
      scans,
      count: scans.length,
    });
  } catch (error) {
    console.error('Tarama sorgulaması hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Taramalar alınamadı',
    });
  }
};

/**
 * Belirli bir alandaki taramaları getir
 */
export const handleGetAreaScans: RequestHandler = async (req, res) => {
  try {
    const { latitude, longitude, radius } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Enlem ve boylam gerekli',
      });
    }

    const db = getDatabase();
    const data = await db.getAreaData(
      parseFloat(latitude as string),
      parseFloat(longitude as string),
      parseFloat(radius as string) || 50
    );

    res.json({
      success: true,
      ...data,
      scanCount: data.scans.length,
      magnetometerCount: data.magnetometer.length,
    });
  } catch (error) {
    console.error('Alan tarama sorgulaması hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Alan verileri alınamadı',
    });
  }
};

/**
 * Tarama istatistiklerini getir
 */
export const handleGetScanStats: RequestHandler = async (req, res) => {
  try {
    const db = getDatabase();
    const stats = await db.getStats();

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('İstatistik hatası:', error);
    res.status(500).json({
      success: false,
      message: 'İstatistikler alınamadı',
    });
  }
};
