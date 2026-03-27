/**
 * Kamera Analiz Modülü
 * - Kenar algılama (Canny-benzeri)
 * - Çizgi tespiti (Hough Transform-benzeri)
 * - Dik açı algılama
 * - Simetri analizi
 * - Renk segmentasyonu (HSV)
 * - Yüzey doku analizi
 */

export interface CameraAnalysisResult {
  geometricAnomalyScore: number; // 0-100
  edgeIntensity: number; // Kenarların yoğunluğu
  straightLineCount: number; // Düz çizgi sayısı
  rightAngleCount: number; // Dik açı sayısı
  symmetryScore: number; // Simetri puanı (0-100)
  colorAnomalies: number; // Renk sapmalarının sayısı
  textureVariation: number; // Doku değişim yoğunluğu
  timestamp: number;
}

export interface EdgePoint {
  x: number;
  y: number;
  intensity: number;
}

export interface DetectedLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  angle: number; // Derece (0-180)
  length: number;
  strength: number; // 0-100
}

export class CameraAnalyzer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(canvas?: HTMLCanvasElement) {
    this.canvas = canvas || document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d")!;
  }

  /**
   * Video frame'inin tam analizini yap
   */
  analyzeFrame(
    imageData: ImageData,
    width: number,
    height: number
  ): CameraAnalysisResult {
    // Gri seviye dönüşümü
    const grayscale = this.toGrayscale(imageData);

    // Kenar tespiti (Sobel operator)
    const edges = this.detectEdges(grayscale, width, height);

    // Çizgi tespiti (Hough Transform)
    const lines = this.detectLines(edges, width, height);

    // Geometrik özellikleri analiz et
    const geometricScore = this.analyzeGeometry(lines, edges, width, height);
    const rightAngles = this.detectRightAngles(lines);
    const symmetry = this.analyzeSymmetry(edges, width, height);

    // Renk anomalileri tespit et
    const colorAnomalies = this.detectColorAnomalies(imageData, width, height);

    // Doku değişimini analiz et
    const textureVariation = this.analyzeTexture(grayscale, width, height);

    // Kenar yoğunluğu hesapla
    const edgeIntensity = this.calculateEdgeIntensity(edges);

    return {
      geometricAnomalyScore: geometricScore,
      edgeIntensity,
      straightLineCount: lines.length,
      rightAngleCount: rightAngles,
      symmetryScore: symmetry,
      colorAnomalies,
      textureVariation,
      timestamp: Date.now(),
    };
  }

  /**
   * Görüntüyü gri seviyeye dönüştür
   */
  private toGrayscale(imageData: ImageData): Uint8ClampedArray {
    const data = imageData.data;
    const grayscale = new Uint8ClampedArray(imageData.width * imageData.height);

    for (let i = 0; i < grayscale.length; i++) {
      const r = data[i * 4];
      const g = data[i * 4 + 1];
      const b = data[i * 4 + 2];

      // BT.601 standardı kullan
      grayscale[i] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    }

    return grayscale;
  }

  /**
   * Kenar tespiti - Sobel operator
   */
  private detectEdges(
    grayscale: Uint8ClampedArray,
    width: number,
    height: number
  ): EdgePoint[] {
    const edges: EdgePoint[] = [];
    const sobelX = [
      [-1, 0, 1],
      [-2, 0, 2],
      [-1, 0, 1],
    ];
    const sobelY = [
      [-1, -2, -1],
      [0, 0, 0],
      [1, 2, 1],
    ];

    const threshold = 50;

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let gx = 0;
        let gy = 0;

        // Sobel konvolüsyon
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const pixel = grayscale[(y + dy) * width + (x + dx)];
            gx += pixel * sobelX[dy + 1][dx + 1];
            gy += pixel * sobelY[dy + 1][dx + 1];
          }
        }

        const magnitude = Math.sqrt(gx * gx + gy * gy);

        if (magnitude > threshold) {
          edges.push({
            x,
            y,
            intensity: Math.min(magnitude / 2.56, 100), // Normalize to 0-100
          });
        }
      }
    }

    return edges;
  }

  /**
   * Çizgi tespiti - Hough Transform
   */
  private detectLines(
    edges: EdgePoint[],
    width: number,
    height: number
  ): DetectedLine[] {
    const lines: DetectedLine[] = [];
    const diagonalLength = Math.sqrt(width * width + height * height);
    const rhoMax = Math.ceil(diagonalLength / 2);

    // Hough uzayı (düz ve açı için) - basitleştirilmiş versiyon
    const houghSpace = new Map<string, number>();

    for (const edge of edges) {
      // Farklı açılar için test et
      for (let angle = 0; angle < 180; angle += 5) {
        const angleRad = (angle * Math.PI) / 180;
        const rho = Math.round(
          edge.x * Math.cos(angleRad) + edge.y * Math.sin(angleRad)
        );

        if (Math.abs(rho) < rhoMax) {
          const key = `${rho},${angle}`;
          houghSpace.set(key, (houghSpace.get(key) || 0) + edge.intensity);
        }
      }
    }

    // Tepe noktalarını bul
    const threshold = 100;
    const foundLines = new Map<string, DetectedLine>();

    for (const [key, votes] of houghSpace) {
      if (votes > threshold) {
        const [rhoStr, angleStr] = key.split(",");
        const rho = parseInt(rhoStr);
        const angle = parseInt(angleStr);

        // Bu parametreler için bir çizgi oluştur
        const angleRad = (angle * Math.PI) / 180;

        // Çizginin uç noktalarını hesapla
        let x1 = 0,
          y1 = 0,
          x2 = width,
          y2 = 0;

        if (Math.abs(Math.cos(angleRad)) > 0.1) {
          x1 = rho / Math.cos(angleRad);
          x2 = rho / Math.cos(angleRad);
          y1 = 0;
          y2 = height;
        } else {
          x1 = 0;
          x2 = width;
          y1 = rho / Math.sin(angleRad);
          y2 = rho / Math.sin(angleRad);
        }

        // Sınırlar içinde klip et
        x1 = Math.max(0, Math.min(width, x1));
        x2 = Math.max(0, Math.min(width, x2));
        y1 = Math.max(0, Math.min(height, y1));
        y2 = Math.max(0, Math.min(height, y2));

        const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

        if (length > 20) {
          // Minimum çizgi uzunluğu
          foundLines.set(key, {
            x1,
            y1,
            x2,
            y2,
            angle,
            length,
            strength: Math.min(votes / 2, 100),
          });
        }
      }
    }

    return Array.from(foundLines.values());
  }

  /**
   * Dik açıları tespit et
   */
  private detectRightAngles(lines: DetectedLine[]): number {
    let count = 0;
    const threshold = 15; // Derece cinsinden tolerans

    for (let i = 0; i < lines.length; i++) {
      for (let j = i + 1; j < lines.length; j++) {
        const angleDiff = Math.abs(lines[i].angle - lines[j].angle);
        const normalizedDiff = Math.min(angleDiff, 180 - angleDiff);

        // 90 dereceye yakın mı?
        if (Math.abs(normalizedDiff - 90) < threshold) {
          count++;
        }
      }
    }

    return count;
  }

  /**
   * Geometrik anomali skorunu hesapla
   */
  private analyzeGeometry(
    lines: DetectedLine[],
    edges: EdgePoint[],
    width: number,
    height: number
  ): number {
    let score = 0;

    // Düz çizgilerin sayısı (doğal olmayan düzenleme göstergesi)
    const lineCount = lines.length;
    const normalLineCount = (width + height) / 100; // Beklenen normal çizgi sayısı

    if (lineCount > normalLineCount * 1.5) {
      score += Math.min((lineCount / normalLineCount) * 20, 30);
    }

    // Çizgilerin uzunluğu (dikdörtgen şekiller göstergesi)
    const longLines = lines.filter((l) => l.length > Math.max(width, height) * 0.3);
    score += Math.min(longLines.length * 5, 20);

    // Kenar yoğunluğu
    const edgeIntensity = this.calculateEdgeIntensity(edges);
    if (edgeIntensity > 40) {
      score += Math.min((edgeIntensity / 100) * 30, 30);
    }

    // Dik açılar (yapay yapıları göstergesi)
    const rightAngleCount = this.detectRightAngles(lines);
    score += Math.min(rightAngleCount * 3, 20);

    return Math.min(score, 100);
  }

  /**
   * Simetri analizi
   */
  private analyzeSymmetry(
    edges: EdgePoint[],
    width: number,
    height: number
  ): number {
    if (edges.length === 0) return 0;

    const centerX = width / 2;
    const centerY = height / 2;

    let symmetricPoints = 0;
    const tolerance = 5; // Piksel cinsinden

    for (const edge of edges) {
      // Yatay simetri kontrol et
      const mirrorX = 2 * centerX - edge.x;
      const mirrorY = edge.y;

      for (const other of edges) {
        if (
          Math.abs(other.x - mirrorX) < tolerance &&
          Math.abs(other.y - mirrorY) < tolerance
        ) {
          symmetricPoints++;
          break;
        }
      }
    }

    return (symmetricPoints / edges.length) * 100;
  }

  /**
   * Renk anomalilerini tespit et
   */
  private detectColorAnomalies(
    imageData: ImageData,
    width: number,
    height: number
  ): number {
    const data = imageData.data;
    let anomalies = 0;

    // HSV renk uzayında anomalileri tespit et
    const sampleSize = Math.floor(width * height * 0.1); // %10 örnek
    const step = Math.floor((width * height) / sampleSize);

    const colors: { h: number; s: number; v: number }[] = [];

    for (let i = 0; i < width * height; i += step) {
      const r = data[i * 4] / 255;
      const g = data[i * 4 + 1] / 255;
      const b = data[i * 4 + 2] / 255;

      const { h, s, v } = this.rgbToHsv(r, g, b);
      colors.push({ h, s, v });
    }

    // Yeşil kanal yoğunluğundaki sapmaları kontrol et
    if (colors.length > 0) {
      const avgSaturation =
        colors.reduce((sum, c) => sum + c.s, 0) / colors.length;

      for (const color of colors) {
        // Bitki stres (düşük yeşil saturasyon)
        if (Math.abs(color.h - 120) < 30 && color.s < avgSaturation * 0.5) {
          anomalies++;
        }
        // Toprak renk sapması
        if (Math.abs(color.h - 30) < 20 && color.v > 0.7) {
          anomalies++;
        }
      }
    }

    return Math.min(anomalies, sampleSize);
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
   * Doku değişimini analiz et
   */
  private analyzeTexture(
    grayscale: Uint8ClampedArray,
    width: number,
    height: number
  ): number {
    let variation = 0;
    let count = 0;

    // Gradyan değişimini hesapla
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x += 2) {
        // Hızlı işlem için adım atla
        const center = grayscale[y * width + x];
        const right = grayscale[y * width + (x + 1)];
        const bottom = grayscale[(y + 1) * width + x];

        variation += Math.abs(right - center) + Math.abs(bottom - center);
        count++;
      }
    }

    // Normalize et (0-100)
    return Math.min((variation / count) * 2, 100);
  }

  /**
   * Kenar yoğunluğunu hesapla
   */
  private calculateEdgeIntensity(edges: EdgePoint[]): number {
    if (edges.length === 0) return 0;

    const avgIntensity =
      edges.reduce((sum, e) => sum + e.intensity, 0) / edges.length;
    return Math.min(avgIntensity, 100);
  }

  /**
   * Taş dizilim düzenini algıla
   */
  detectStonePattern(lines: DetectedLine[]): number {
    // Paralel çizgileri bul (yapı göstergesi)
    let patternScore = 0;
    const angleThreshold = 10; // Derece

    for (let i = 0; i < lines.length; i++) {
      for (let j = i + 1; j < lines.length; j++) {
        const angleDiff = Math.abs(lines[i].angle - lines[j].angle);
        const normalizedDiff = Math.min(angleDiff, 180 - angleDiff);

        if (normalizedDiff < angleThreshold) {
          patternScore += lines[i].strength * lines[j].strength;
        }
      }
    }

    return Math.min(patternScore / 100, 100);
  }

  /**
   * Dairesel formları algıla
   */
  detectCircularShapes(edges: EdgePoint[], width: number, height: number): number {
    if (edges.length < 10) return 0;

    // Basit dairesel form algılama
    const centerX = width / 2;
    const centerY = height / 2;

    const distances = edges.map(
      (e) => Math.sqrt((e.x - centerX) ** 2 + (e.y - centerY) ** 2)
    );
    const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length;

    // Uzaklıkların standart sapması
    const variance =
      distances.reduce((sum, d) => sum + (d - avgDistance) ** 2, 0) /
      distances.length;
    const stdDev = Math.sqrt(variance);

    // Düşük standart sapma = yuvarlak şekil
    const circularScore = Math.max(0, 100 - (stdDev / avgDistance) * 100);
    return Math.min(circularScore, 100);
  }
}
