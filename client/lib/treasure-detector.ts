import {
  MagneticReading,
  TreasureResult,
  ResourceType,
  RESOURCE_THRESHOLDS,
} from "@shared/magnetometer";

export class TreasureDetector {
  private readonly anomalyThreshold: number = 15; // Anomali eşiği (µT)

  /**
   * Manyetik ölçümlerden kaynakları tespit et
   */
  detectResources(
    readings: MagneticReading[],
    baselineStrength: number
  ): TreasureResult[] {
    const results: TreasureResult[] = [];
    let anomalyCount = 0;

    readings.forEach((reading, index) => {
      const anomalyLevel = Math.abs(reading.total - baselineStrength);

      // Anomali kontrolü
      if (anomalyLevel > this.anomalyThreshold) {
        anomalyCount++;

        const resourceType = this.classifyResource(reading.total);
        const confidence = this.calculateConfidence(
          anomalyLevel,
          resourceType,
          anomalyCount
        );

        if (confidence > 30) {
          // Minimum %30 güven
          results.push({
            id: `treasure_${Date.now()}_${index}`,
            resourceType,
            magneticStrength: reading.total,
            anomalyLevel,
            timestamp: reading.timestamp,
            confidence,
          });
        }
      }
    });

    return results;
  }

  /**
   * Manyetik şiddete göre kaynak türünü sınıflandır
   */
  private classifyResource(magneticStrength: number): ResourceType {
    if (magneticStrength >= RESOURCE_THRESHOLDS[ResourceType.ARTIFACT]) {
      return ResourceType.ARTIFACT;
    } else if (
      magneticStrength >= RESOURCE_THRESHOLDS[ResourceType.VALUABLE_MATERIAL]
    ) {
      return ResourceType.VALUABLE_MATERIAL;
    } else if (magneticStrength >= RESOURCE_THRESHOLDS[ResourceType.MINERAL]) {
      return ResourceType.MINERAL;
    } else if (
      magneticStrength >=
      RESOURCE_THRESHOLDS[ResourceType.UNDERGROUND_STRUCTURE]
    ) {
      return ResourceType.UNDERGROUND_STRUCTURE;
    }
    return ResourceType.UNKNOWN;
  }

  /**
   * Kaynak güven düzeyini hesapla (0-100)
   */
  private calculateConfidence(
    anomalyLevel: number,
    resourceType: ResourceType,
    detectionCount: number
  ): number {
    let confidence = 50; // Başlangıç güveni

    // Anomali seviyesine göre arttır
    confidence += Math.min(anomalyLevel * 2, 30);

    // Kaynak türüne göre ayarla
    const typeConfidence: Record<string, number> = {
      [ResourceType.ARTIFACT]: 20,
      [ResourceType.VALUABLE_MATERIAL]: 15,
      [ResourceType.MINERAL]: 10,
      [ResourceType.UNDERGROUND_STRUCTURE]: 5,
      [ResourceType.UNKNOWN]: -10,
    };

    confidence += typeConfidence[resourceType] || 0;

    // Tekrarlayan deteksiyonlar güveni arttırır
    confidence += Math.min(detectionCount * 2, 15);

    return Math.min(Math.max(confidence, 0), 100);
  }

  /**
   * Eşiği ayarla
   */
  setAnomalyThreshold(threshold: number): void {
    if (threshold > 0 && threshold < 100) {
      (this.anomalyThreshold as any) = threshold;
    }
  }

  /**
   * Önceki ölçümlerden trend analizi yap
   */
  analyzeTrend(readings: MagneticReading[]): {
    trend: "increasing" | "decreasing" | "stable";
    average: number;
    max: number;
    min: number;
  } {
    if (readings.length === 0) {
      return {
        trend: "stable",
        average: 0,
        max: 0,
        min: 0,
      };
    }

    const values = readings.map((r) => r.total);
    const average = values.reduce((a, b) => a + b, 0) / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);

    // Son 5 okumaya bakarak trend belirle
    const recentReadings = readings.slice(-5);
    const recentValues = recentReadings.map((r) => r.total);

    let trend: "increasing" | "decreasing" | "stable" = "stable";
    if (recentValues.length > 1) {
      const slope =
        (recentValues[recentValues.length - 1] - recentValues[0]) /
        recentValues.length;
      if (slope > 2) {
        trend = "increasing";
      } else if (slope < -2) {
        trend = "decreasing";
      }
    }

    return {
      trend,
      average: parseFloat(average.toFixed(2)),
      max: parseFloat(max.toFixed(2)),
      min: parseFloat(min.toFixed(2)),
    };
  }
}
