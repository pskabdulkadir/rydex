/**
 * Sinyal Yoğunluk Analiz Modülü
 * - WiFi RSSI analizi
 * - GSM/LTE sinyal gücü
 * - Sinyal zayıflama haritası
 * - Anomalili sinyal alanları tespiti
 * - Sinyal stabilitesi analizi
 */

export interface SignalReading {
  timestamp: number;
  type: "wifi" | "gsm" | "lte" | "5g";
  rssi: number; // dBm cinsinden (-30 güçlü, -120 zayıf)
  signalStrength: number; // 0-100 ölçeğinde
  frequency?: number; // MHz
  bands?: string[]; // "2.4GHz", "5GHz", vb.
}

export interface SignalAnalysisResult {
  signalAttenuationScore: number; // 0-100 (Zayıflama yoğunluğu)
  averageStrength: number; // -100 ile 0 arasında dBm
  signalStability: number; // 0-100 (Sinyal istikrarı)
  deadZones: number; // Zayıf sinyal bölgesi sayısı
  anomalyCount: number; // Ani düşüşler
  signalVariation: number; // 0-100 (Değişkenlik)
  dominantSignalType: "wifi" | "gsm" | "lte" | "5g" | "none";
  frequencyAnalysis: {
    band2_4GHz: number;
    band5GHz: number;
    bandLTE: number;
  };
  timestamp: number;
}

export interface SignalAnomalyZone {
  startIndex: number;
  endIndex: number;
  severity: number; // 0-100
  avgRSSI: number;
  minRSSI: number;
  duration: number; // millisecond
}

export class SignalAnalyzer {
  /**
   * Sinyal verilerinin tam analizi
   */
  analyzeSignals(readings: SignalReading[]): SignalAnalysisResult {
    if (readings.length === 0) {
      return this.getEmptyAnalysis();
    }

    // Sinyal gücü istatistikleri
    const rssiValues = readings.map((r) => r.rssi);
    const averageStrength = rssiValues.reduce((a, b) => a + b) / rssiValues.length;

    // Sinyal zayıflaması
    const signalAttenuationScore = this.calculateAttenuation(rssiValues);

    // Sinyal istikrarı
    const signalStability = this.calculateStability(rssiValues);

    // Ölü bölgeleri tespit et
    const deadZones = this.detectDeadZones(readings);

    // Anomalileri tespit et
    const anomalies = this.detectSignalAnomalies(readings);

    // Sinyal değişimi
    const signalVariation = this.calculateVariation(rssiValues);

    // Baskın sinyal türü
    const dominantSignalType = this.findDominantSignalType(readings);

    // Frekans analizi
    const frequencyAnalysis = this.analyzeFrequencies(readings);

    return {
      signalAttenuationScore,
      averageStrength,
      signalStability,
      deadZones,
      anomalyCount: anomalies.length,
      signalVariation,
      dominantSignalType,
      frequencyAnalysis,
      timestamp: Date.now(),
    };
  }

  /**
   * Sinyal zayıflaması hesapla
   */
  private calculateAttenuation(rssiValues: number[]): number {
    if (rssiValues.length < 2) return 0;

    // Normalize RSSI (-120 dBm ile -30 dBm arasında)
    const normalizedValues = rssiValues.map((rssi) => {
      // -120 -> 0, -30 -> 100
      return Math.max(0, Math.min(100, ((rssi + 120) / 90) * 100));
    });

    // Zayıflama: değerlerdeki düşüş
    let attenuationSum = 0;
    for (let i = 1; i < normalizedValues.length; i++) {
      if (normalizedValues[i] < normalizedValues[i - 1]) {
        attenuationSum += normalizedValues[i - 1] - normalizedValues[i];
      }
    }

    // Normalize (0-100)
    const avgAttenuation = (attenuationSum / normalizedValues.length) * 2;
    return Math.min(avgAttenuation, 100);
  }

  /**
   * Sinyal istikrarı hesapla
   */
  private calculateStability(rssiValues: number[]): number {
    if (rssiValues.length === 0) return 0;

    // Standart sapma hesapla
    const avg = rssiValues.reduce((a, b) => a + b) / rssiValues.length;
    const variance =
      rssiValues.reduce((sum, v) => sum + (v - avg) ** 2) / rssiValues.length;
    const stdDev = Math.sqrt(variance);

    // Düşük standart sapma = yüksek istikrar
    // stdDev ~5 dBm = %100 istikrar, stdDev ~20 dBm = %0
    const stability = Math.max(0, 100 - stdDev * 5);
    return Math.min(stability, 100);
  }

  /**
   * Ölü bölgeleri tespit et
   */
  private detectDeadZones(readings: SignalReading[]): number {
    const weakThreshold = -100; // dBm
    let zoneCount = 0;
    let inZone = false;

    for (const reading of readings) {
      if (reading.rssi < weakThreshold) {
        if (!inZone) {
          zoneCount++;
          inZone = true;
        }
      } else {
        inZone = false;
      }
    }

    return zoneCount;
  }

  /**
   * Sinyal anomalilerini tespit et
   */
  private detectSignalAnomalies(readings: SignalReading[]): SignalAnomalyZone[] {
    const anomalies: SignalAnomalyZone[] = [];
    const threshold = 15; // dBm cinsinden ani düşüş eşiği

    for (let i = 1; i < readings.length; i++) {
      const drop = readings[i - 1].rssi - readings[i].rssi;

      // Ani düşüş tespit et
      if (drop > threshold) {
        const startIdx = i - 1;
        let endIdx = i;

        // Anomali bölgesinin sonunu bul
        while (
          endIdx < readings.length - 1 &&
          readings[endIdx].rssi < readings[i - 1].rssi - threshold / 2
        ) {
          endIdx++;
        }

        const zoneReadings = readings.slice(startIdx, endIdx + 1);
        const rssiValues = zoneReadings.map((r) => r.rssi);

        anomalies.push({
          startIndex: startIdx,
          endIndex: endIdx,
          severity: Math.min((drop / 30) * 100, 100), // Normalize
          avgRSSI: rssiValues.reduce((a, b) => a + b) / rssiValues.length,
          minRSSI: Math.min(...rssiValues),
          duration: zoneReadings[zoneReadings.length - 1].timestamp - zoneReadings[0].timestamp,
        });

        // Sonraki anomaliyi bulmak için atla
        i = endIdx;
      }
    }

    return anomalies;
  }

  /**
   * Sinyal değişimi hesapla
   */
  private calculateVariation(rssiValues: number[]): number {
    if (rssiValues.length < 2) return 0;

    let variationSum = 0;
    for (let i = 1; i < rssiValues.length; i++) {
      variationSum += Math.abs(rssiValues[i] - rssiValues[i - 1]);
    }

    const avgVariation = variationSum / (rssiValues.length - 1);

    // Normalize: 0-20 dBm -> 0-100
    return Math.min((avgVariation / 20) * 100, 100);
  }

  /**
   * Baskın sinyal türünü bul
   */
  private findDominantSignalType(
    readings: SignalReading[]
  ): "wifi" | "gsm" | "lte" | "5g" | "none" {
    const typeCounts: Record<string, number> = {
      wifi: 0,
      gsm: 0,
      lte: 0,
      "5g": 0,
    };

    for (const reading of readings) {
      typeCounts[reading.type]++;
    }

    const dominant = Object.entries(typeCounts).reduce((a, b) =>
      b[1] > a[1] ? b : a
    );

    return (dominant[0] as "wifi" | "gsm" | "lte" | "5g") || "none";
  }

  /**
   * Frekans analizi
   */
  private analyzeFrequencies(readings: SignalReading[]): {
    band2_4GHz: number;
    band5GHz: number;
    bandLTE: number;
  } {
    let band2_4Count = 0;
    let band5Count = 0;
    let bandLTECount = 0;

    for (const reading of readings) {
      if (reading.bands) {
        if (reading.bands.includes("2.4GHz")) band2_4Count++;
        if (reading.bands.includes("5GHz")) band5Count++;
        if (reading.bands.includes("LTE")) bandLTECount++;
      }

      // WiFi varsayımı
      if (reading.type === "wifi") {
        // Frekansı tahmin et
        if (reading.rssi > -80) {
          band2_4Count++;
        } else {
          band5Count++;
        }
      }

      // LTE/5G
      if (reading.type === "lte") bandLTECount++;
      if (reading.type === "5g") bandLTECount++;
    }

    const total = band2_4Count + band5Count + bandLTECount || 1;

    return {
      band2_4GHz: (band2_4Count / total) * 100,
      band5GHz: (band5Count / total) * 100,
      bandLTE: (bandLTECount / total) * 100,
    };
  }

  /**
   * Sinyal zayıflaması haritası oluştur
   */
  generateAttenuationMap(
    readings: SignalReading[],
    width: number = 10,
    height: number = 10
  ): number[][] {
    const map: number[][] = Array(height)
      .fill(null)
      .map(() => Array(width).fill(0));

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = Math.floor((y * width + x) % readings.length);
        const rssi = readings[index].rssi;

        // RSSI'yi 0-100 ölçeğine dönüştür
        const normalized = Math.max(0, Math.min(100, ((rssi + 120) / 90) * 100));
        map[y][x] = 100 - normalized; // Zayıflama: düşük sinyal = yüksek zayıflama
      }
    }

    return map;
  }

  /**
   * Sinyal kalitesi endeksi
   */
  calculateSignalQualityIndex(readings: SignalReading[]): number {
    if (readings.length === 0) return 0;

    const analysis = this.analyzeSignals(readings);

    // Composite quality score
    let quality = 100;

    // Zayıflama
    quality -= analysis.signalAttenuationScore * 0.3;

    // Istikrarsızlık
    quality -= (100 - analysis.signalStability) * 0.4;

    // Anomaliler
    quality -= Math.min(analysis.anomalyCount * 5, 30);

    return Math.max(quality, 0);
  }

  /**
   * Sinyal tahmin modeli
   */
  predictNextSignal(readings: SignalReading[]): number {
    if (readings.length === 0) return -100;
    if (readings.length === 1) return readings[0].rssi;

    // Basit doğrusal eğilim tahmini
    const recentReadings = readings.slice(-10);
    const values = recentReadings.map((r) => r.rssi);

    let trend = 0;
    for (let i = 1; i < values.length; i++) {
      trend += values[i] - values[i - 1];
    }
    trend = trend / (values.length - 1);

    const lastValue = values[values.length - 1];
    const predicted = lastValue + trend;

    // Sınırlar içinde kal
    return Math.max(-120, Math.min(-30, predicted));
  }

  /**
   * Boş analiz döndür
   */
  private getEmptyAnalysis(): SignalAnalysisResult {
    return {
      signalAttenuationScore: 0,
      averageStrength: -120,
      signalStability: 0,
      deadZones: 0,
      anomalyCount: 0,
      signalVariation: 0,
      dominantSignalType: "none",
      frequencyAnalysis: {
        band2_4GHz: 0,
        band5GHz: 0,
        bandLTE: 0,
      },
      timestamp: Date.now(),
    };
  }

  /**
   * Sinyal haritası oluştur (gerçek konum tabanlı)
   */
  generateSignalHeatmap(
    readings: SignalReading[],
    width: number,
    height: number,
    positions: Array<{ x: number; y: number }>
  ): number[][] {
    const heatmap: number[][] = Array(height)
      .fill(null)
      .map(() => Array(width).fill(-120));

    // Her konum için en yakın sinyal ölçümünü bul
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Grid hücresinde sinyal tahmini (interpolasyon)
        let nearestSignal = -120;
        let minDistance = Infinity;

        for (let i = 0; i < Math.min(readings.length, positions.length); i++) {
          const pos = positions[i];
          if (!pos) continue;

          const distance = Math.sqrt((pos.x - x) ** 2 + (pos.y - y) ** 2);

          if (distance < minDistance) {
            minDistance = distance;
            nearestSignal = readings[i].rssi;
          }
        }

        heatmap[y][x] = nearestSignal;
      }
    }

    return heatmap;
  }
}
