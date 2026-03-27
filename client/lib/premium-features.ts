/**
 * Premium Özellikler Modülü
 * - Isı haritası (Heatmap) oluşturma
 * - Alan geçmişi takibi
 * - AI pattern karşılaştırması
 * - Veri bulut yedekleme (yapı)
 * - Gelişmiş raporlar
 */

export interface HeatmapData {
  points: HeatmapPoint[];
  minValue: number;
  maxValue: number;
  gridSize: number;
}

export interface HeatmapPoint {
  x: number;
  y: number;
  value: number; // 0-100
  type: string; // "magnetic", "camera", "vegetation", vb.
}

export interface AreaHistory {
  id: string;
  timestamp: number;
  location: { latitude: number; longitude: number };
  anomalyScore: number;
  anomalyLevel: "düşük" | "orta" | "yüksek";
  findings: string;
  notes: string;
}

export interface AIPatternMatch {
  similarity: number; // 0-100 (Benzerlik yüzdesi)
  patternType: string;
  description: string;
  confidence: number;
  historicalMatches: number;
}

export class PremiumFeatures {
  /**
   * Isı haritası oluştur
   */
  generateHeatmap(points: HeatmapPoint[], gridSize: number = 20): HeatmapData {
    if (points.length === 0) {
      return {
        points: [],
        minValue: 0,
        maxValue: 100,
        gridSize,
      };
    }

    // Min/Max değerleri bul
    const values = points.map((p) => p.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    // Noktaları normalize et
    const normalizedPoints = points.map((p) => ({
      ...p,
      value: ((p.value - minValue) / (maxValue - minValue + 1)) * 100,
    }));

    return {
      points: normalizedPoints,
      minValue,
      maxValue,
      gridSize,
    };
  }

  /**
   * Isı haritası grid'i oluştur
   */
  generateHeatmapGrid(
    heatmapData: HeatmapData,
    width: number,
    height: number
  ): number[][] {
    const grid: number[][] = Array(height)
      .fill(null)
      .map(() => Array(width).fill(0));

    // Gaussian Radial Basis Function ile interpolasyon
    const sigma = 5; // Etki yarıçapı

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let sum = 0;
        let weightSum = 0;

        for (const point of heatmapData.points) {
          const dx = x - point.x;
          const dy = y - point.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Gaussian weights
          const weight = Math.exp(-(distance * distance) / (2 * sigma * sigma));
          sum += point.value * weight;
          weightSum += weight;
        }

        if (weightSum > 0) {
          grid[y][x] = sum / weightSum;
        }
      }
    }

    return grid;
  }

  /**
   * Alan geçmişi kaydı oluştur
   */
  createHistoryRecord(
    location: { latitude: number; longitude: number },
    anomalyScore: number,
    anomalyLevel: "düşük" | "orta" | "yüksek",
    findings: string,
    notes: string = ""
  ): AreaHistory {
    return {
      id: `area_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      location,
      anomalyScore,
      anomalyLevel,
      findings,
      notes,
    };
  }

  /**
   * Geçmiş kayıtlarını sorgu
   */
  queryHistory(
    records: AreaHistory[],
    filters: {
      startDate?: number;
      endDate?: number;
      minScore?: number;
      maxScore?: number;
      anomalyLevel?: "düşük" | "orta" | "yüksek";
      nearbyRadius?: number; // km
      location?: { latitude: number; longitude: number };
    }
  ): AreaHistory[] {
    let filtered = [...records];

    // Tarih filtreleme
    if (filters.startDate) {
      filtered = filtered.filter((r) => r.timestamp >= filters.startDate!);
    }
    if (filters.endDate) {
      filtered = filtered.filter((r) => r.timestamp <= filters.endDate!);
    }

    // Skor filtreleme
    if (filters.minScore !== undefined) {
      filtered = filtered.filter((r) => r.anomalyScore >= filters.minScore!);
    }
    if (filters.maxScore !== undefined) {
      filtered = filtered.filter((r) => r.anomalyScore <= filters.maxScore!);
    }

    // Anomali seviyesi filtreleme
    if (filters.anomalyLevel) {
      filtered = filtered.filter((r) => r.anomalyLevel === filters.anomalyLevel);
    }

    // Konum filtreleme (yakın alan)
    if (filters.location && filters.nearbyRadius) {
      filtered = filtered.filter((r) => {
        const distance = this.calculateDistance(
          filters.location!.latitude,
          filters.location!.longitude,
          r.location.latitude,
          r.location.longitude
        );
        return distance <= filters.nearbyRadius!;
      });
    }

    return filtered;
  }

  /**
   * İki konum arasındaki mesafeyi hesapla (Haversine)
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
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

  /**
   * AI pattern karşılaştırması
   */
  comparePatterns(
    currentAnalysis: {
      geometric: number;
      magnetic: number;
      vegetation: number;
      signal: number;
      topographic: number;
    },
    historicalRecords: AreaHistory[]
  ): AIPatternMatch[] {
    const matches: AIPatternMatch[] = [];

    // Pattern türlerini tanımla
    const patterns = [
      {
        type: "metal_cluster",
        description: "Metal yığını (Hazine göstergesi)",
        signature: { magnetic: 70, geometric: 60, vegetation: 40 },
      },
      {
        type: "structure",
        description: "Yer altı yapısı",
        signature: { geometric: 75, magnetic: 55, vegetation: 35 },
      },
      {
        type: "vegetation_anomaly",
        description: "Bitki stres anomalisi",
        signature: { vegetation: 75, magnetic: 40, geometric: 50 },
      },
      {
        type: "water_source",
        description: "Su kaynağı (çukur/depresyon)",
        signature: { topographic: 30, vegetation: 80, signal: 70 },
      },
      {
        type: "cemetery_area",
        description: "Mezarlık alanı (yoğun anomaliler)",
        signature: { magnetic: 65, geometric: 70, vegetation: 50 },
      },
    ];

    // Her pattern için benzerliği hesapla
    for (const pattern of patterns) {
      const similarity = this.calculatePatternSimilarity(
        currentAnalysis,
        pattern.signature as typeof currentAnalysis
      );

      // Geçmiş kayıtlardan benzeri taramaları say
      const historicalMatches = historicalRecords.filter(
        (r) => r.anomalyLevel === "yüksek"
      ).length;

      if (similarity > 40) {
        matches.push({
          similarity: Math.round(similarity),
          patternType: pattern.type,
          description: pattern.description,
          confidence: Math.min(50 + (similarity / 100) * 50, 100),
          historicalMatches,
        });
      }
    }

    // Benzerliğe göre sıralama
    return matches.sort((a, b) => b.similarity - a.similarity);
  }

  /**
   * Pattern benzerliğini hesapla
   */
  private calculatePatternSimilarity(
    current: Record<string, number>,
    signature: Record<string, number>
  ): number {
    let totalDifference = 0;
    let count = 0;

    for (const key in signature) {
      const currentValue = current[key] || 0;
      const signatureValue = signature[key] || 0;

      // Normalize fark (0-100)
      const difference = Math.abs(currentValue - signatureValue);
      totalDifference += difference;
      count++;
    }

    const avgDifference = totalDifference / count;
    // Düşük fark = yüksek benzerlik
    return 100 - avgDifference;
  }

  /**
   * Bulut yedekleme verisi hazırla
   */
  prepareCloudBackup(
    analysis: any,
    history: AreaHistory[]
  ): {
    data: string;
    timestamp: number;
    checksum: string;
  } {
    const backupData = {
      analysis,
      history,
      version: "1.0",
      platform: "MLAS",
    };

    const jsonData = JSON.stringify(backupData);
    const checksum = this.calculateChecksum(jsonData);

    return {
      data: jsonData,
      timestamp: Date.now(),
      checksum,
    };
  }

  /**
   * Basit checksum hesapla
   */
  private calculateChecksum(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Gelişmiş istatistiksel rapor
   */
  generateAdvancedReport(records: AreaHistory[]): {
    totalScans: number;
    averageScore: number;
    highAnomalies: number;
    trends: {
      increasing: boolean;
      scoreChange: number;
    };
    statistics: {
      min: number;
      max: number;
      median: number;
      stdDev: number;
    };
    recommendations: string[];
  } {
    if (records.length === 0) {
      return {
        totalScans: 0,
        averageScore: 0,
        highAnomalies: 0,
        trends: { increasing: false, scoreChange: 0 },
        statistics: { min: 0, max: 0, median: 0, stdDev: 0 },
        recommendations: ["Yeterli veri yok - daha fazla tarama yapın"],
      };
    }

    const scores = records.map((r) => r.anomalyScore).sort((a, b) => a - b);

    // İstatistikler
    const min = Math.min(...scores);
    const max = Math.max(...scores);
    const average = scores.reduce((a, b) => a + b) / scores.length;
    const median = scores[Math.floor(scores.length / 2)];

    const variance =
      scores.reduce((sum, score) => sum + (score - average) ** 2, 0) /
      scores.length;
    const stdDev = Math.sqrt(variance);

    // Trend analizi
    const recentScores = records.slice(-10).map((r) => r.anomalyScore);
    const recentAvg = recentScores.reduce((a, b) => a + b) / recentScores.length;
    const olderScores = records.slice(0, Math.max(1, records.length - 10)).map((r) => r.anomalyScore);
    const olderAvg = olderScores.reduce((a, b) => a + b) / olderScores.length;

    const scoreChange = recentAvg - olderAvg;
    const increasing = scoreChange > 0;

    // Yüksek anomaliler
    const highAnomalies = records.filter((r) => r.anomalyLevel === "yüksek").length;

    // Öneriler
    const recommendations: string[] = [];

    if (highAnomalies > 5) {
      recommendations.push("Çok sayıda yüksek anomali algılandı - Detaylı araştırma gerekli");
    }

    if (increasing) {
      recommendations.push("Anomali skorları artış gösteriyor - Düzenli takip yapın");
    }

    if (stdDev < 15) {
      recommendations.push("Tutarlı anomali dağılımı - Alan belirli özellikler taşıyor");
    }

    if (average > 60) {
      recommendations.push("Yüksek ortalama skor - Araştırmaya değer alan");
    }

    if (recommendations.length === 0) {
      recommendations.push("Normal dağılım gösteren alan - Rutin takip yapın");
    }

    return {
      totalScans: records.length,
      averageScore: Math.round(average),
      highAnomalies,
      trends: {
        increasing,
        scoreChange: Math.round(scoreChange * 10) / 10,
      },
      statistics: {
        min,
        max,
        median,
        stdDev: Math.round(stdDev * 10) / 10,
      },
      recommendations,
    };
  }

  /**
   * Anomali haritası oluştur
   */
  generateAnomalyMap(
    records: AreaHistory[]
  ): Array<{
    latitude: number;
    longitude: number;
    score: number;
    level: string;
    timestamp: number;
  }> {
    return records.map((r) => ({
      latitude: r.location.latitude,
      longitude: r.location.longitude,
      score: r.anomalyScore,
      level: r.anomalyLevel,
      timestamp: r.timestamp,
    }));
  }

  /**
   * Zaman serisinde eğilim analizi
   */
  analyzeTrendLine(
    records: AreaHistory[]
  ): {
    slope: number;
    intercept: number;
    r2: number;
    forecast: number[];
  } {
    if (records.length < 2) {
      return {
        slope: 0,
        intercept: 0,
        r2: 0,
        forecast: [],
      };
    }

    // Doğrusal regresyon
    const n = records.length;
    const indices = Array.from({ length: n }, (_, i) => i);
    const scores = records.map((r) => r.anomalyScore);

    const sumX = indices.reduce((a, b) => a + b);
    const sumY = scores.reduce((a, b) => a + b);
    const sumXY = indices.reduce((sum, x, i) => sum + x * scores[i], 0);
    const sumX2 = indices.reduce((sum, x) => sum + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // R² hesapla
    const yMean = sumY / n;
    const ssRes = scores.reduce((sum, y, i) => {
      const predicted = slope * i + intercept;
      return sum + (y - predicted) ** 2;
    }, 0);
    const ssTot = scores.reduce((sum, y) => sum + (y - yMean) ** 2, 0);
    const r2 = 1 - ssRes / ssTot;

    // Gelecek tahminleri
    const forecast = Array.from({ length: 7 }, (_, i) => {
      return Math.max(0, Math.min(100, slope * (n + i) + intercept));
    });

    return {
      slope: Math.round(slope * 100) / 100,
      intercept: Math.round(intercept * 100) / 100,
      r2: Math.round(r2 * 10000) / 10000,
      forecast,
    };
  }
}
