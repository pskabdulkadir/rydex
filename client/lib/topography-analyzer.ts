/**
 * Topografya & Harita Analiz Modülü
 * - Yükseklik analizi
 * - Eğim ve eğim yönü analizi
 * - Çukur ve yükseltilerin tespiti
 * - Su hattı yakınlığı
 * - Arazi uygunluk puanlaması
 */

export interface ElevationData {
  latitude: number;
  longitude: number;
  elevation: number; // metre
  timestamp: number;
}

export interface TopographicAnalysisResult {
  suitabilityScore: number; // 0-100 (Topografik Uygunluk)
  slopeAnalysis: {
    averageSlope: number; // derece
    maxSlope: number; // derece
    slopeType: "flat" | "gentle" | "moderate" | "steep";
  };
  reliefAnalysis: {
    elevation: number; // metre
    prominenceIndex: number; // 0-100
    roughness: number; // 0-100
  };
  terrainFeatures: {
    depressions: number; // Çukur sayısı
    elevations: number; // Yükseltme sayısı
    flatAreas: number; // Düz bölge yüzdesi
  };
  waterProximity: {
    nearWater: boolean;
    estimatedDistance: number; // metre
    waterType: "river" | "lake" | "stream" | "none";
  };
  timestamp: number;
}

export interface SlopePoint {
  x: number;
  y: number;
  elevation: number;
  slope: number; // derece
  aspect: number; // 0-360 derece (yön)
  slopeClass: "flat" | "gentle" | "moderate" | "steep" | "cliff";
}

export class TopographyAnalyzer {
  /**
   * Topografya verilerinin tam analizi
   */
  analyzeTopography(
    elevationData: ElevationData[],
    gridWidth: number = 10,
    gridHeight: number = 10
  ): TopographicAnalysisResult {
    if (elevationData.length === 0) {
      return this.getEmptyAnalysis();
    }

    // Yükseklik grid'i oluştur
    const grid = this.createElevationGrid(
      elevationData,
      gridWidth,
      gridHeight
    );

    // Eğim analizi
    const slopeAnalysis = this.analyzeSlopeData(grid);

    // Çukur/Yükseltme tespiti
    const terrainFeatures = this.detectTerrainFeatures(grid);

    // Relief (yer şekli) analizi
    const reliefAnalysis = this.analyzeRelief(grid);

    // Su yakınlığı tahmini
    const waterProximity = this.estimateWaterProximity(elevationData, grid);

    // Uygunluk puanı
    const suitabilityScore = this.calculateSuitability(
      slopeAnalysis,
      reliefAnalysis,
      terrainFeatures,
      waterProximity
    );

    return {
      suitabilityScore,
      slopeAnalysis,
      reliefAnalysis,
      terrainFeatures,
      waterProximity,
      timestamp: Date.now(),
    };
  }

  /**
   * Yükseklik grid'i oluştur
   */
  private createElevationGrid(
    elevationData: ElevationData[],
    width: number,
    height: number
  ): number[][] {
    const grid: number[][] = Array(height)
      .fill(null)
      .map(() => Array(width).fill(0));

    if (elevationData.length === 0) return grid;

    // Veriyay grid'e dağıt
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) % elevationData.length;
        grid[y][x] = elevationData[index].elevation;
      }
    }

    // Interpolasyon (Basit moving average)
    return this.smoothElevationGrid(grid);
  }

  /**
   * Yükseklik grid'ini yumuşat
   */
  private smoothElevationGrid(grid: number[][]): number[][] {
    const smoothed = grid.map((row) => [...row]);
    const height = grid.length;
    const width = grid[0].length;

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const sum =
          grid[y - 1][x - 1] +
          grid[y - 1][x] +
          grid[y - 1][x + 1] +
          grid[y][x - 1] +
          grid[y][x] +
          grid[y][x + 1] +
          grid[y + 1][x - 1] +
          grid[y + 1][x] +
          grid[y + 1][x + 1];

        smoothed[y][x] = sum / 9;
      }
    }

    return smoothed;
  }

  /**
   * Eğim analizi
   */
  private analyzeSlopeData(grid: number[][]): {
    averageSlope: number;
    maxSlope: number;
    slopeType: "flat" | "gentle" | "moderate" | "steep";
  } {
    const slopes: number[] = [];
    const height = grid.length;
    const width = grid[0].length;

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        // Sobel filtresini kullan
        const gx =
          grid[y - 1][x - 1] -
          grid[y - 1][x + 1] +
          2 * (grid[y][x - 1] - grid[y][x + 1]) +
          grid[y + 1][x - 1] -
          grid[y + 1][x + 1];

        const gy =
          grid[y - 1][x - 1] -
          grid[y + 1][x - 1] +
          2 * (grid[y - 1][x] - grid[y + 1][x]) +
          grid[y - 1][x + 1] -
          grid[y + 1][x + 1];

        // Eğimi dereceye dönüştür
        const magnitude = Math.sqrt(gx * gx + gy * gy);
        const slope = Math.atan(magnitude / 8) * (180 / Math.PI); // 8 = grid hücre boyutu

        slopes.push(slope);
      }
    }

    const averageSlope =
      slopes.reduce((a, b) => a + b, 0) / slopes.length;
    const maxSlope = Math.max(...slopes);

    // Eğim türünü belirle
    let slopeType: "flat" | "gentle" | "moderate" | "steep" = "flat";
    if (averageSlope > 0.5 && averageSlope < 5) slopeType = "gentle";
    else if (averageSlope >= 5 && averageSlope < 15) slopeType = "moderate";
    else if (averageSlope >= 15) slopeType = "steep";

    return {
      averageSlope,
      maxSlope,
      slopeType,
    };
  }

  /**
   * Arazi özelliklerini tespit et
   */
  private detectTerrainFeatures(grid: number[][]): {
    depressions: number;
    elevations: number;
    flatAreas: number;
  } {
    let depressions = 0;
    let elevations = 0;
    let flatAreas = 0;

    const height = grid.length;
    const width = grid[0].length;
    const avg =
      grid.flat().reduce((a, b) => a + b, 0) / grid.flat().length;

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const current = grid[y][x];
        const neighbors = [
          grid[y - 1][x - 1],
          grid[y - 1][x],
          grid[y - 1][x + 1],
          grid[y][x - 1],
          grid[y][x + 1],
          grid[y + 1][x - 1],
          grid[y + 1][x],
          grid[y + 1][x + 1],
        ];

        const neighborAvg = neighbors.reduce((a, b) => a + b) / neighbors.length;

        // Çukur (lokal minimum)
        if (neighbors.every((n) => n >= current)) {
          depressions++;
        }
        // Yükseltme (lokal maksimum)
        else if (neighbors.every((n) => n <= current)) {
          elevations++;
        }
        // Düz bölge
        else if (Math.abs(current - neighborAvg) < 0.5) {
          flatAreas++;
        }
      }
    }

    const totalCells = (height - 2) * (width - 2);
    const flatAreaPercentage = (flatAreas / totalCells) * 100;

    return {
      depressions,
      elevations,
      flatAreas: flatAreaPercentage,
    };
  }

  /**
   * Relief (yer şekli) analizi
   */
  private analyzeRelief(grid: number[][]): {
    elevation: number;
    prominenceIndex: number;
    roughness: number;
  } {
    const elevations = grid.flat();
    const elevation = elevations.reduce((a, b) => a + b) / elevations.length;

    // Yükseklik aralığı (relief yüksekliği)
    const maxElevation = Math.max(...elevations);
    const minElevation = Math.min(...elevations);
    const reliefHeight = maxElevation - minElevation;

    // Belirginlik indeksi (0-100)
    const prominenceIndex = Math.min((reliefHeight / 1000) * 100, 100);

    // Pürüzlülük (roughness) = yükseklik değişiminin standart sapması
    const avg = elevation;
    const variance =
      elevations.reduce((sum, e) => sum + (e - avg) ** 2, 0) / elevations.length;
    const roughness = Math.sqrt(variance);

    // Normalize
    const normalizedRoughness = Math.min((roughness / 100) * 100, 100);

    return {
      elevation,
      prominenceIndex,
      roughness: normalizedRoughness,
    };
  }

  /**
   * Su yakınlığını tahmin et
   */
  private estimateWaterProximity(
    elevationData: ElevationData[],
    grid: number[][]
  ): {
    nearWater: boolean;
    estimatedDistance: number;
    waterType: "river" | "lake" | "stream" | "none";
  } {
    if (elevationData.length === 0) {
      return {
        nearWater: false,
        estimatedDistance: Infinity,
        waterType: "none",
      };
    }

    // Depresyon (çukur) analizi - su hattı olabilir
    const terrainFeatures = this.detectTerrainFeatures(grid);

    // Depresyon sayısı su hattı göstergesi
    const estimatedWaterDistance = Math.max(
      50,
      500 - terrainFeatures.depressions * 10
    );

    // Eğim analizi
    const slopeAnalysis = this.analyzeSlopeData(grid);

    let waterType: "river" | "lake" | "stream" | "none" = "none";
    let nearWater = false;

    if (terrainFeatures.depressions > 5) {
      nearWater = true;
      if (slopeAnalysis.averageSlope > 10) {
        waterType = "river"; // Eğimli = ırmak
      } else {
        waterType = "lake"; // Düz = göl
      }

      if (estimatedWaterDistance < 100) {
        waterType = "stream"; // Çok yakın = dere
      }
    }

    return {
      nearWater,
      estimatedDistance: estimatedWaterDistance,
      waterType,
    };
  }

  /**
   * Uygunluk puanı hesapla
   */
  private calculateSuitability(
    slopeAnalysis: {
      averageSlope: number;
      maxSlope: number;
      slopeType: "flat" | "gentle" | "moderate" | "steep";
    },
    reliefAnalysis: {
      elevation: number;
      prominenceIndex: number;
      roughness: number;
    },
    terrainFeatures: {
      depressions: number;
      elevations: number;
      flatAreas: number;
    },
    waterProximity: {
      nearWater: boolean;
      estimatedDistance: number;
      waterType: "river" | "lake" | "stream" | "none";
    }
  ): number {
    let score = 50; // Başlangıç puanı

    // Eğim uygunluğu
    if (slopeAnalysis.averageSlope < 2) {
      score += 25; // Çok uygun (düz)
    } else if (slopeAnalysis.averageSlope < 10) {
      score += 15;
    } else if (slopeAnalysis.averageSlope < 20) {
      score += 5;
    } else {
      score -= 10;
    }

    // Düz bölge yüzdesi
    score += (terrainFeatures.flatAreas / 100) * 15;

    // Su yakınlığı
    if (waterProximity.nearWater && waterProximity.estimatedDistance < 500) {
      score += 10; // Su yakınlığı olumlu
    }

    // Pürüzlülük (düşük = daha iyi)
    if (reliefAnalysis.roughness < 20) {
      score += 15;
    } else if (reliefAnalysis.roughness < 50) {
      score += 5;
    } else {
      score -= 5;
    }

    // Belirginlik indeksi (çok yüksek = uygunsuz)
    if (reliefAnalysis.prominenceIndex < 30) {
      score += 10;
    } else if (reliefAnalysis.prominenceIndex > 70) {
      score -= 15;
    }

    return Math.max(0, Math.min(score, 100));
  }

  /**
   * Eğim haritası oluştur
   */
  generateSlopeMap(grid: number[][]): number[][] {
    const slopeMap: number[][] = Array(grid.length)
      .fill(null)
      .map(() => Array(grid[0].length).fill(0));

    const height = grid.length;
    const width = grid[0].length;

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const gx =
          grid[y - 1][x - 1] -
          grid[y - 1][x + 1] +
          2 * (grid[y][x - 1] - grid[y][x + 1]) +
          grid[y + 1][x - 1] -
          grid[y + 1][x + 1];

        const gy =
          grid[y - 1][x - 1] -
          grid[y + 1][x - 1] +
          2 * (grid[y - 1][x] - grid[y + 1][x]) +
          grid[y - 1][x + 1] -
          grid[y + 1][x + 1];

        const magnitude = Math.sqrt(gx * gx + gy * gy);
        const slope = Math.atan(magnitude / 8) * (180 / Math.PI);

        // Normalize (0-100)
        slopeMap[y][x] = Math.min((slope / 90) * 100, 100);
      }
    }

    return slopeMap;
  }

  /**
   * Aspect (yön) haritası oluştur
   */
  generateAspectMap(grid: number[][]): number[][] {
    const aspectMap: number[][] = Array(grid.length)
      .fill(null)
      .map(() => Array(grid[0].length).fill(0));

    const height = grid.length;
    const width = grid[0].length;

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const gx =
          grid[y - 1][x - 1] -
          grid[y - 1][x + 1] +
          2 * (grid[y][x - 1] - grid[y][x + 1]) +
          grid[y + 1][x - 1] -
          grid[y + 1][x + 1];

        const gy =
          grid[y - 1][x - 1] -
          grid[y + 1][x - 1] +
          2 * (grid[y - 1][x] - grid[y + 1][x]) +
          grid[y - 1][x + 1] -
          grid[y + 1][x + 1];

        let aspect = Math.atan2(gy, gx) * (180 / Math.PI);
        if (aspect < 0) aspect += 360;

        aspectMap[y][x] = aspect;
      }
    }

    return aspectMap;
  }

  /**
   * Boş analiz döndür
   */
  private getEmptyAnalysis(): TopographicAnalysisResult {
    return {
      suitabilityScore: 0,
      slopeAnalysis: {
        averageSlope: 0,
        maxSlope: 0,
        slopeType: "flat",
      },
      reliefAnalysis: {
        elevation: 0,
        prominenceIndex: 0,
        roughness: 0,
      },
      terrainFeatures: {
        depressions: 0,
        elevations: 0,
        flatAreas: 0,
      },
      waterProximity: {
        nearWater: false,
        estimatedDistance: Infinity,
        waterType: "none",
      },
      timestamp: Date.now(),
    };
  }
}
