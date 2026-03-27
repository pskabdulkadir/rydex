/**
 * Geliştirilmiş Manyetik Alan Analiz Modülü
 * - Sapma öölçümü ve tespiti
 * - Pik algılama (Peak Detection)
 * - Anomali haritası
 * - 3D alan modelleme
 * - Spektral analiz
 */

import { MagneticReading } from "@shared/magnetometer";

export interface AnomalyPoint {
  x: number;
  y: number;
  timestamp: number;
  magneticStrength: number;
  anomalyLevel: number; // 0-100
  type: "peak" | "valley" | "gradient";
}

export interface MagneticFieldMap {
  width: number;
  height: number;
  data: number[][]; // Magnetik alan şiddeti grid'i
  anomalies: AnomalyPoint[];
  maxStrength: number;
  minStrength: number;
  avgStrength: number;
}

export interface AdvancedMagneticAnalysis {
  anomalyScore: number; // 0-100
  deviationMap: number; // Sapma yoğunluğu
  peakCount: number; // Tespit edilen pik sayısı
  valleyCount: number; // Tespit edilen vadi sayısı
  gradientIntensity: number; // Gradient yoğunluğu
  anomalyPoints: AnomalyPoint[];
  spatialDistribution: "uniform" | "clustered" | "scattered";
  timestamp: number;
}

export class AdvancedMagnetometer {
  /**
   * Manyetik alan verilerinin tam analizi
   */
  analyzeFieldData(
    readings: MagneticReading[],
    position?: { x: number; y: number }
  ): AdvancedMagneticAnalysis {
    if (readings.length === 0) {
      return this.getEmptyAnalysis();
    }

    // Temel istatistikler
    const strengthValues = readings.map((r) => r.total);
    const avgStrength = strengthValues.reduce((a, b) => a + b) / readings.length;
    const maxStrength = Math.max(...strengthValues);
    const minStrength = Math.min(...strengthValues);

    // Sapma tespiti
    const deviationMap = this.calculateDeviation(strengthValues, avgStrength);

    // Pik ve vadi algılama
    const { peaks, valleys } = this.detectPeaksAndValleys(strengthValues);

    // Gradient analizi
    const gradientIntensity = this.analyzeGradient(readings);

    // Anomali noktaları
    const anomalyPoints = this.identifyAnomalies(
      readings,
      avgStrength,
      position
    );

    // Mekansal dağılım
    const spatialDistribution = this.analyzeSpatialDistribution(
      anomalyPoints
    );

    // Anomali puanı hesapla
    const anomalyScore = this.calculateAnomalyScore(
      anomalyPoints,
      deviationMap,
      peaks.length,
      valleys.length
    );

    return {
      anomalyScore,
      deviationMap,
      peakCount: peaks.length,
      valleyCount: valleys.length,
      gradientIntensity,
      anomalyPoints,
      spatialDistribution,
      timestamp: Date.now(),
    };
  }

  /**
   * Sapma haritası hesapla
   */
  private calculateDeviation(
    values: number[],
    average: number
  ): number {
    const deviations = values.map((v) => Math.abs(v - average));
    const avgDeviation = deviations.reduce((a, b) => a + b) / deviations.length;

    // Normalize (0-100)
    return Math.min((avgDeviation / average) * 100, 100);
  }

  /**
   * Pik ve vadi algılama (Peak Detection)
   */
  private detectPeaksAndValleys(values: number[]): {
    peaks: number[];
    valleys: number[];
  } {
    const peaks: number[] = [];
    const valleys: number[] = [];

    // En az 3 veri noktası gerekli
    if (values.length < 3) {
      return { peaks, valleys };
    }

    for (let i = 1; i < values.length - 1; i++) {
      // Pik tespiti (lokal maksimum)
      if (values[i] > values[i - 1] && values[i] > values[i + 1]) {
        // Eşik kontrolü: ortalamanın %20 üstü
        const threshold = values.reduce((a, b) => a + b) / values.length;
        if (values[i] > threshold * 1.2) {
          peaks.push(i);
        }
      }

      // Vadi tespiti (lokal minimum)
      if (values[i] < values[i - 1] && values[i] < values[i + 1]) {
        const threshold = values.reduce((a, b) => a + b) / values.length;
        if (values[i] < threshold * 0.8) {
          valleys.push(i);
        }
      }
    }

    return { peaks, valleys };
  }

  /**
   * Gradient analizi
   */
  private analyzeGradient(readings: MagneticReading[]): number {
    if (readings.length < 2) return 0;

    const gradients: number[] = [];

    for (let i = 1; i < readings.length; i++) {
      const gradient = Math.abs(readings[i].total - readings[i - 1].total);
      gradients.push(gradient);
    }

    const avgGradient = gradients.reduce((a, b) => a + b) / gradients.length;
    const maxGradient = Math.max(...gradients);

    // Normalize (0-100)
    return Math.min((avgGradient / maxGradient) * 100, 100);
  }

  /**
   * Anomali noktalarını tespit et
   */
  private identifyAnomalies(
    readings: MagneticReading[],
    baseline: number,
    position?: { x: number; y: number }
  ): AnomalyPoint[] {
    const anomalies: AnomalyPoint[] = [];
    const threshold = baseline * 0.15; // %15 sapma eşiği

    let xPos = position?.x ?? 0;
    let yPos = position?.y ?? 0;

    for (let i = 0; i < readings.length; i++) {
      const reading = readings[i];
      const deviation = Math.abs(reading.total - baseline);

      if (deviation > threshold) {
        // Pik mi, vadi mi, gradient mi?
        let type: "peak" | "valley" | "gradient" = "gradient";

        if (reading.total > baseline * 1.2) {
          type = "peak";
        } else if (reading.total < baseline * 0.8) {
          type = "valley";
        }

        anomalies.push({
          x: xPos,
          y: yPos,
          timestamp: reading.timestamp,
          magneticStrength: reading.total,
          anomalyLevel: Math.min((deviation / (baseline * 0.5)) * 100, 100),
          type,
        });

        // Pozisyonu güncelle (simülasyon için)
        xPos += Math.random() * 2 - 1;
        yPos += Math.random() * 2 - 1;
      }
    }

    return anomalies;
  }

  /**
   * Mekansal dağılım analizi
   */
  private analyzeSpatialDistribution(
    anomalies: AnomalyPoint[]
  ): "uniform" | "clustered" | "scattered" {
    if (anomalies.length < 2) return "scattered";

    // Merkez noktasını hesapla
    const centerX = anomalies.reduce((sum, a) => sum + a.x, 0) / anomalies.length;
    const centerY = anomalies.reduce((sum, a) => sum + a.y, 0) / anomalies.length;

    // Merkeze olan mesafeleri hesapla
    const distances = anomalies.map((a) =>
      Math.sqrt((a.x - centerX) ** 2 + (a.y - centerY) ** 2)
    );

    // Standart sapma
    const avgDistance = distances.reduce((a, b) => a + b) / distances.length;
    const variance =
      distances.reduce((sum, d) => sum + (d - avgDistance) ** 2) /
      distances.length;
    const stdDev = Math.sqrt(variance);

    // Varyasyon katsayısı
    const coefficientOfVariation = stdDev / avgDistance;

    // Sınıflandırma
    if (coefficientOfVariation < 0.3) {
      return "uniform"; // Düzgün dağılım
    } else if (coefficientOfVariation < 0.7) {
      return "clustered"; // Kümelenmiş
    } else {
      return "scattered"; // Dağınık
    }
  }

  /**
   * Anomali puanı hesapla
   */
  private calculateAnomalyScore(
    anomalyPoints: AnomalyPoint[],
    deviationMap: number,
    peakCount: number,
    valleyCount: number
  ): number {
    let score = 0;

    // Anomali noktaları
    score += Math.min(anomalyPoints.length * 5, 40);

    // Sapma haritası
    score += deviationMap * 0.3;

    // Pik sayısı
    score += Math.min(peakCount * 3, 20);

    // Vadi sayısı
    score += Math.min(valleyCount * 2, 15);

    // Anomalilerin ortalama seviyesi
    if (anomalyPoints.length > 0) {
      const avgAnomalyLevel =
        anomalyPoints.reduce((sum, a) => sum + a.anomalyLevel, 0) /
        anomalyPoints.length;
      score += avgAnomalyLevel * 0.25;
    }

    return Math.min(score, 100);
  }

  /**
   * Manyetik alan haritasını oluştur
   */
  generateFieldMap(
    readings: MagneticReading[],
    gridWidth: number = 10,
    gridHeight: number = 10
  ): MagneticFieldMap {
    const data: number[][] = Array(gridHeight)
      .fill(null)
      .map(() => Array(gridWidth).fill(0));

    const strengthValues = readings.map((r) => r.total);
    const avgStrength = strengthValues.reduce((a, b) => a + b) / readings.length;
    const maxStrength = Math.max(...strengthValues);
    const minStrength = Math.min(...strengthValues);

    // Grid'i doldur
    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        const index = Math.floor((y * gridWidth + x) % readings.length);
        data[y][x] = readings[index].total;
      }
    }

    // Anomali noktalarını tespit et
    const anomalies = this.identifyAnomalies(readings, avgStrength);

    return {
      width: gridWidth,
      height: gridHeight,
      data,
      anomalies,
      maxStrength,
      minStrength,
      avgStrength,
    };
  }

  /**
   * 3D alan vektörü analizi
   */
  analyze3DField(readings: MagneticReading[]): {
    xVariation: number;
    yVariation: number;
    zVariation: number;
    vectorMagnitude: number[];
    dominantAxis: "x" | "y" | "z";
  } {
    const xValues = readings.map((r) => r.x);
    const yValues = readings.map((r) => r.y);
    const zValues = readings.map((r) => r.z);

    const xVariation = this.calculateVariation(xValues);
    const yVariation = this.calculateVariation(yValues);
    const zVariation = this.calculateVariation(zValues);

    const vectorMagnitude = readings.map((r) => r.total);

    // Dominant eksen
    const variations = { x: xVariation, y: yVariation, z: zVariation };
    const dominantAxis = (Object.keys(variations) as Array<"x" | "y" | "z">).reduce((a, b) =>
      variations[a] > variations[b] ? a : b
    );

    return {
      xVariation,
      yVariation,
      zVariation,
      vectorMagnitude,
      dominantAxis,
    };
  }

  /**
   * Varyasyon hesapla
   */
  private calculateVariation(values: number[]): number {
    if (values.length === 0) return 0;

    const avg = values.reduce((a, b) => a + b) / values.length;
    const variance =
      values.reduce((sum, v) => sum + (v - avg) ** 2) / values.length;

    return Math.sqrt(variance);
  }

  /**
   * Boş analiz döndür
   */
  private getEmptyAnalysis(): AdvancedMagneticAnalysis {
    return {
      anomalyScore: 0,
      deviationMap: 0,
      peakCount: 0,
      valleyCount: 0,
      gradientIntensity: 0,
      anomalyPoints: [],
      spatialDistribution: "scattered",
      timestamp: Date.now(),
    };
  }

  /**
   * Spektral enerji analizi
   */
  analyzeSpectralEnergy(readings: MagneticReading[]): {
    lowFrequency: number;
    midFrequency: number;
    highFrequency: number;
    dominantFrequency: string;
  } {
    if (readings.length < 2) {
      return {
        lowFrequency: 0,
        midFrequency: 0,
        highFrequency: 0,
        dominantFrequency: "none",
      };
    }

    const values = readings.map((r) => r.total);

    // Basit frekans analizi (zaman alanında)
    let lowEnergy = 0; // Yavaş değişimler
    let midEnergy = 0; // Orta hızlı değişimler
    let highEnergy = 0; // Hızlı değişimler

    for (let i = 1; i < values.length; i++) {
      const diff = Math.abs(values[i] - values[i - 1]);

      if (diff < 2) {
        lowEnergy += diff;
      } else if (diff < 5) {
        midEnergy += diff;
      } else {
        highEnergy += diff;
      }
    }

    const total = lowEnergy + midEnergy + highEnergy;
    const lowFrequency = (lowEnergy / total) * 100;
    const midFrequency = (midEnergy / total) * 100;
    const highFrequency = (highEnergy / total) * 100;

    let dominantFrequency = "mid";
    if (lowFrequency > midFrequency && lowFrequency > highFrequency) {
      dominantFrequency = "low";
    } else if (highFrequency > midFrequency && highFrequency > lowFrequency) {
      dominantFrequency = "high";
    }

    return {
      lowFrequency,
      midFrequency,
      highFrequency,
      dominantFrequency,
    };
  }
}
