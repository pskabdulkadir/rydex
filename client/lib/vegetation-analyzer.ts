/**
 * Bitki & Renk Yoğunluk Analiz Modülü
 * - Yeşil kanal yoğunluğu
 * - NDVI benzeri oran
 * - Bitki stres haritası
 * - Nem farkı tahmini
 * - Yüzey renk sapması
 */

export interface VegetationAnalysisResult {
  plantStressMap: number; // 0-100 (Bitki Stres Haritası)
  moistureDeficiency: number; // 0-100 (Nem Eksikliği)
  colorDeviation: number; // 0-100 (Yüzey Renk Sapması)
  ndviScore: number; // -1 to 1 (Normalize Difference Vegetation Index)
  greenIntensity: number; // 0-100 (Yeşil Kanal Yoğunluğu)
  abnormalZones: number; // Anomalili bölge sayısı
  timestamp: number;
}

export interface ColorSegment {
  regionId: number;
  dominantColor: { r: number; g: number; b: number };
  h: number; // Hue
  s: number; // Saturation
  v: number; // Value
  pixelCount: number;
  anomalyLevel: number; // 0-100
}

export class VegetationAnalyzer {
  /**
   * Görüntünün tam bitki analizi
   */
  analyzeVegetation(imageData: ImageData): VegetationAnalysisResult {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;

    // Yeşil kanal yoğunluğu
    const greenIntensity = this.calculateGreenIntensity(data);

    // NDVI benzeri oran (Normalized Difference Vegetation Index)
    const ndviScore = this.calculateNDVI(data);

    // Bitki stres haritası
    const plantStressMap = this.calculatePlantStress(data, greenIntensity);

    // Nem farkı tahmini
    const moistureDeficiency = this.calculateMoistureDeficiency(
      data,
      plantStressMap
    );

    // Yüzey renk sapması
    const colorDeviation = this.calculateColorDeviation(data);

    // Anomalili bölgeleri say
    const abnormalZones = this.countAbnormalZones(data, width, height);

    return {
      plantStressMap,
      moistureDeficiency,
      colorDeviation,
      ndviScore,
      greenIntensity,
      abnormalZones,
      timestamp: Date.now(),
    };
  }

  /**
   * Yeşil kanal yoğunluğunu hesapla
   */
  private calculateGreenIntensity(data: Uint8ClampedArray): number {
    let greenSum = 0;
    let pixelCount = 0;

    for (let i = 1; i < data.length; i += 4) {
      greenSum += data[i];
      pixelCount++;
    }

    return (greenSum / (pixelCount * 255)) * 100;
  }

  /**
   * NDVI benzeri oran hesapla
   * NDVI = (NIR - Red) / (NIR + Red)
   * Web kamerasında NIR yerine Green kullan
   */
  private calculateNDVI(data: Uint8ClampedArray): number {
    let ndviSum = 0;
    let pixelCount = 0;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i] / 255;
      const g = data[i + 1] / 255; // Green = NIR tahmini
      const b = data[i + 2] / 255;

      // Basit NDVI: (Green - Red) / (Green + Red)
      const denominator = g + r;
      if (denominator > 0) {
        const ndvi = (g - r) / denominator;
        ndviSum += ndvi;
        pixelCount++;
      }
    }

    return pixelCount > 0 ? ndviSum / pixelCount : 0;
  }

  /**
   * Bitki stres haritası hesapla
   */
  private calculatePlantStress(
    data: Uint8ClampedArray,
    greenIntensity: number
  ): number {
    const healthyGreenThreshold = 60;

    if (greenIntensity > healthyGreenThreshold) {
      return 0; // Sağlıklı bitki
    }

    // Stres seviyesi: yeşilden sapma oranı
    const stressLevel = ((healthyGreenThreshold - greenIntensity) /
      healthyGreenThreshold) * 100;
    return Math.min(stressLevel, 100);
  }

  /**
   * Nem farkı tahmini
   */
  private calculateMoistureDeficiency(
    data: Uint8ClampedArray,
    plantStressMap: number
  ): number {
    let moistureIndicator = 0;
    let pixelCount = 0;

    // Nem eksikliği göstergeleri:
    // 1. Yüksek Red/Blue oranı (solmuş bitki = kırmızımtırak)
    // 2. Düşük Green kanal

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Kırmızımtırak (solmuş bitki)
      if (r > g && r > b) {
        moistureIndicator += (r - g) / 255;
      }

      pixelCount++;
    }

    const baseMoisture = (moistureIndicator / pixelCount) * 100;
    const adjustedMoisture = (baseMoisture + plantStressMap) / 2;

    return Math.min(adjustedMoisture, 100);
  }

  /**
   * Yüzey renk sapması hesapla
   */
  private calculateColorDeviation(data: Uint8ClampedArray): number {
    const colorSegments = this.segmentByColor(data);

    let deviationSum = 0;
    const targetColor = { r: 101, g: 67, b: 33 }; // Toprak renginin RGB ortalama değerleri

    for (const segment of colorSegments) {
      const colorDist = Math.sqrt(
        (segment.dominantColor.r - targetColor.r) ** 2 +
          (segment.dominantColor.g - targetColor.g) ** 2 +
          (segment.dominantColor.b - targetColor.b) ** 2
      );

      deviationSum += colorDist * (segment.pixelCount / data.length);
    }

    // Normalize (0-100)
    return Math.min((deviationSum / 255) * 100, 100);
  }

  /**
   * Renk segmentasyonu
   */
  private segmentByColor(data: Uint8ClampedArray): ColorSegment[] {
    const segments = new Map<string, ColorSegment>();
    let regionId = 0;

    // Renk histogramı oluştur
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Rengi 32 ton'a indirge (hızlı işlem)
      const quantizedR = Math.floor(r / 8) * 8;
      const quantizedG = Math.floor(g / 8) * 8;
      const quantizedB = Math.floor(b / 8) * 8;

      const key = `${quantizedR},${quantizedG},${quantizedB}`;

      if (!segments.has(key)) {
        const { h, s, v } = this.rgbToHsv(
          quantizedR / 255,
          quantizedG / 255,
          quantizedB / 255
        );

        segments.set(key, {
          regionId: regionId++,
          dominantColor: {
            r: quantizedR,
            g: quantizedG,
            b: quantizedB,
          },
          h,
          s,
          v,
          pixelCount: 0,
          anomalyLevel: 0,
        });
      }

      const segment = segments.get(key)!;
      segment.pixelCount++;
    }

    // Anomali seviyesi belirle
    for (const segment of segments.values()) {
      segment.anomalyLevel = this.assessColorAnomaly(segment);
    }

    return Array.from(segments.values());
  }

  /**
   * Renk anomalisi değerlendir
   */
  private assessColorAnomaly(segment: ColorSegment): number {
    let anomalyScore = 0;

    // Normal toprak rengi: 0-40 (kırmızı), 0-30 (yeşil), 0-20 (mavi)
    const isNormalSoil =
      segment.dominantColor.r <= 150 &&
      segment.dominantColor.g <= 120 &&
      segment.dominantColor.b <= 80;

    if (!isNormalSoil) {
      anomalyScore += 30;
    }

    // Çok düşük doygunluk (gri/beyaz = anomalili yapı olabilir)
    if (segment.s < 0.2) {
      anomalyScore += 20;
    }

    // Çok yüksek Value (çok parlak = yapay/metal)
    if (segment.v > 0.8) {
      anomalyScore += 25;
    }

    // Yeşil renginin eksikliği
    if (segment.dominantColor.g < segment.dominantColor.r * 0.5) {
      anomalyScore += 25;
    }

    return Math.min(anomalyScore, 100);
  }

  /**
   * Anomalili bölgeleri say
   */
  private countAbnormalZones(
    data: Uint8ClampedArray,
    width: number,
    height: number
  ): number {
    let abnormalCount = 0;

    // Pencere bazlı anomali tespiti
    const windowSize = 16; // 16x16 piksel pencere

    for (let y = 0; y < height; y += windowSize) {
      for (let x = 0; x < width; x += windowSize) {
        const windowAnomaly = this.assessWindowAnomaly(
          data,
          width,
          x,
          y,
          windowSize
        );

        if (windowAnomaly > 60) {
          abnormalCount++;
        }
      }
    }

    return abnormalCount;
  }

  /**
   * Pencere için anomali skoru hesapla
   */
  private assessWindowAnomaly(
    data: Uint8ClampedArray,
    width: number,
    startX: number,
    startY: number,
    windowSize: number
  ): number {
    let redSum = 0,
      greenSum = 0,
      blueSum = 0;
    let pixelCount = 0;

    for (let y = startY; y < Math.min(startY + windowSize, window.innerHeight); y++) {
      for (let x = startX; x < Math.min(startX + windowSize, width); x++) {
        const idx = (y * width + x) * 4;
        redSum += data[idx];
        greenSum += data[idx + 1];
        blueSum += data[idx + 2];
        pixelCount++;
      }
    }

    if (pixelCount === 0) return 0;

    const avgR = redSum / pixelCount;
    const avgG = greenSum / pixelCount;
    const avgB = blueSum / pixelCount;

    // Anomali puanı
    let score = 0;

    // Yeşil kanal çok düşükse (bitki yok)
    if (avgG < 80) {
      score += 40;
    }

    // Kırmızı çok yüksekse (metal veya açık toprak)
    if (avgR > 180) {
      score += 30;
    }

    // Renk dengesi normal değilse
    const colorBalance = Math.abs(avgR - avgG) + Math.abs(avgG - avgB);
    if (colorBalance > 100) {
      score += 30;
    }

    return Math.min(score, 100);
  }

  /**
   * RGB'den HSV'ye dönüştür
   */
  private rgbToHsv(
    r: number,
    g: number,
    b: number
  ): { h: number; s: number; v: number } {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    let h = 0;
    if (delta !== 0) {
      if (max === r) {
        h = 60 * (((g - b) / delta) % 6);
      } else if (max === g) {
        h = 60 * ((b - r) / delta + 2);
      } else {
        h = 60 * ((r - g) / delta + 4);
      }
    }

    const s = max === 0 ? 0 : delta / max;
    const v = max;

    return { h: h < 0 ? h + 360 : h, s, v };
  }

  /**
   * Bitki yoğunluğu haritası oluştur
   */
  generateVegetationHeatmap(
    imageData: ImageData
  ): Uint8ClampedArray {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    const heatmap = new Uint8ClampedArray(width * height);

    const windowSize = 8;

    for (let y = 0; y < height; y += windowSize) {
      for (let x = 0; x < width; x += windowSize) {
        let greenSum = 0;
        let pixelCount = 0;

        for (let dy = 0; dy < windowSize && y + dy < height; dy++) {
          for (let dx = 0; dx < windowSize && x + dx < width; dx++) {
            const idx = ((y + dy) * width + (x + dx)) * 4;
            greenSum += data[idx + 1]; // Green channel
            pixelCount++;
          }
        }

        const avgGreen = greenSum / pixelCount;
        const intensity = Math.floor((avgGreen / 255) * 100);

        for (let dy = 0; dy < windowSize && y + dy < height; dy++) {
          for (let dx = 0; dx < windowSize && x + dx < width; dx++) {
            heatmap[(y + dy) * width + (x + dx)] = intensity;
          }
        }
      }
    }

    return heatmap;
  }
}
