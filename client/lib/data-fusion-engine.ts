/**
 * Çoklu Veri Birleştirme Motoru
 * - Tüm analiz sonuçlarının birleştirilmesi
 * - Ağırlıklı skor formülü
 * - Anomali sınıflandırması
 * - Rapor oluşturma
 */

export interface FusionAnalysisInput {
  geometricAnomaly: number; // 0-100 (Kamera)
  plantStress: number; // 0-100 (Bitki)
  magneticDeviation: number; // 0-100 (Manyetik)
  signalAttenuation: number; // 0-100 (Sinyal)
  topographicSuitability: number; // 0-100 (Topografya)
}

export interface FusionResult {
  finalAnomalyScore: number; // 0-100
  anomalyLevel: "düşük" | "orta" | "yüksek";
  confidenceScore: number; // 0-100
  scoreBreakdown: {
    geometric: number;
    magnetic: number;
    vegetation: number;
    signal: number;
    topographic: number;
  };
  recommendations: string[];
  riskFactors: string[];
  timestamp: number;
}

export class DataFusionEngine {
  /**
   * Ağırlıklı formül ile final anomali skorunu hesapla
   * Final Skor = (0.30 × Geometrik) + (0.20 × Manyetik) + (0.20 × Bitki) + 
   *               (0.10 × Sinyal) + (0.20 × Topografya)
   */
  fusionAnalysis(input: FusionAnalysisInput): FusionResult {
    // Ağırlıklar
    const weights = {
      geometric: 0.30, // Kamera analizi - en önemli
      magnetic: 0.20, // Manyetik alan
      vegetation: 0.20, // Bitki yoğunluğu
      signal: 0.10, // Sinyal (ek veri)
      topographic: 0.20, // Topografya
    };

    // Ağırlıklı final skor
    const finalScore =
      weights.geometric * input.geometricAnomaly +
      weights.magnetic * input.magneticDeviation +
      weights.vegetation * input.plantStress +
      weights.signal * input.signalAttenuation +
      weights.topographic * (100 - input.topographicSuitability); // Uygunluk tersine çeviril

    // Güven puanı (veri tutarlılığı)
    const confidenceScore = this.calculateConfidence(input);

    // Anomali seviyesini belirle
    const anomalyLevel = this.classifyAnomalyLevel(finalScore);

    // Öneriler ve risk faktörleri
    const { recommendations, riskFactors } = this.generateInsights(input);

    return {
      finalAnomalyScore: Math.round(finalScore),
      anomalyLevel,
      confidenceScore,
      scoreBreakdown: {
        geometric: Math.round(input.geometricAnomaly * weights.geometric),
        magnetic: Math.round(input.magneticDeviation * weights.magnetic),
        vegetation: Math.round(input.plantStress * weights.vegetation),
        signal: Math.round(input.signalAttenuation * weights.signal),
        topographic: Math.round(
          (100 - input.topographicSuitability) * weights.topographic
        ),
      },
      recommendations,
      riskFactors,
      timestamp: Date.now(),
    };
  }

  /**
   * Güven puanı hesapla
   */
  private calculateConfidence(input: FusionAnalysisInput): number {
    const values = [
      input.geometricAnomaly,
      input.magneticDeviation,
      input.plantStress,
      input.signalAttenuation,
      input.topographicSuitability,
    ];

    const avg = values.reduce((a, b) => a + b) / values.length;
    const variance =
      values.reduce((sum, v) => sum + (v - avg) ** 2, 0) / values.length;
    const stdDev = Math.sqrt(variance);

    // Düşük standart sapma = yüksek tutarlılık = yüksek güven
    // stdDev ~20 = %100 güven, stdDev ~50 = %40 güven
    const confidence = Math.max(0, 100 - stdDev * 1.2);

    return Math.round(Math.min(confidence, 100));
  }

  /**
   * Anomali seviyesini sınıflandır
   */
  private classifyAnomalyLevel(
    score: number
  ): "düşük" | "orta" | "yüksek" {
    if (score < 30) return "düşük";
    if (score < 70) return "orta";
    return "yüksek";
  }

  /**
   * İçgörüler ve öneriler oluştur
   */
  private generateInsights(
    input: FusionAnalysisInput
  ): { recommendations: string[]; riskFactors: string[] } {
    const recommendations: string[] = [];
    const riskFactors: string[] = [];

    // Kamera analizi
    if (input.geometricAnomaly > 70) {
      riskFactors.push("Yüksek geometrik anomali - Yapay yapı göstergesi");
      recommendations.push(
        "Alan detaylı görsel inceleme yapın - Heykeller veya taş yapı olabilir"
      );
    } else if (input.geometricAnomaly > 40) {
      riskFactors.push("Orta düzeyde geometrik anomali");
      recommendations.push("Ek çizgi analizi ve simetri kontrolü yapın");
    }

    // Manyetik anomali
    if (input.magneticDeviation > 75) {
      riskFactors.push("Güçlü manyetik anomali - Çok yüksek metal konsantrasyonu");
      recommendations.push(
        "Metal dedektör kullanarak ek ölçümler alın - Hazine veya yer altı yapısı"
      );
    } else if (input.magneticDeviation > 50) {
      riskFactors.push("Belirgin manyetik sapma - Kaynaklar bulunabilir");
      recommendations.push(
        "Farklı açılardan manyetik ölçümler tekrarlayın - Konumu doğrulayın"
      );
    }

    // Bitki stres
    if (input.plantStress > 70) {
      riskFactors.push(
        "Yüksek bitki stresi - Nem eksikliği veya toksik toprak"
      );
      recommendations.push(
        "Toprak analizi yapın - Yer altı yapı nedeniyle su döngüsü bozulmuş olabilir"
      );
    } else if (input.plantStress > 40) {
      riskFactors.push("Orta düzeyde bitki stres göstergesi");
      recommendations.push(
        "Bitki ve toprak örnekleri alarak daha detaylı analiz yapın"
      );
    }

    // Sinyal sorunları
    if (input.signalAttenuation > 60) {
      riskFactors.push("Önemli sinyal zayıflaması - Yer altı anomalileri");
      recommendations.push(
        "Metal veya elektromanyetik kaynaklar tespit edebilir - Daha hassas sensör kullanın"
      );
    }

    // Topografya
    if (input.topographicSuitability < 30) {
      riskFactors.push("Düşük topografik uygunluk - Dik eğim veya çukurlar");
      recommendations.push(
        "Eğim haritası kontrol edin - Su depolanması için uygun bölgeler olabilir"
      );
    } else if (input.topographicSuitability < 50) {
      riskFactors.push("Orta uygunluk - Bazı topografik kısıtlamalar");
      recommendations.push("Eğim ve depresyon alanlarında daha detaylı araştırma yapın");
    }

    // Kombinasyon analizi
    const highScores = [
      input.geometricAnomaly > 60,
      input.magneticDeviation > 60,
      input.plantStress > 60,
    ].filter(Boolean).length;

    if (highScores >= 2) {
      recommendations.push(
        "UYARI: Çoklu yüksek anomali algılandı - Detaylı arkeolojik araştırma önerilir"
      );
      riskFactors.push("Çoklu anomali kaynakları - Yüksek buluntu olasılığı");
    }

    // Boş uyarı kontrolleri
    if (recommendations.length === 0) {
      recommendations.push(
        "Düşük anomali - Normal alan özelliği, rutin takip önerilir"
      );
    }

    if (riskFactors.length === 0) {
      riskFactors.push("Minör anomaliler - Doğal arazi varyasyonu");
    }

    return { recommendations, riskFactors };
  }

  /**
   * Detaylı rapor oluştur
   */
  generateReport(
    fusionResult: FusionResult,
    location: { latitude: number; longitude: number },
    notes: string = ""
  ): {
    title: string;
    timestamp: string;
    location: string;
    summary: string;
    detailedFindings: string;
    recommendations: string;
    technicalDetails: string;
  } {
    const date = new Date(fusionResult.timestamp);

    const summary = `
Alan Anomali Analiz Raporu
===========================

Konum: ${location.latitude.toFixed(4)}°N, ${location.longitude.toFixed(4)}°E
Tarih: ${date.toLocaleDateString("tr-TR")}
Saat: ${date.toLocaleTimeString("tr-TR")}

SONUÇ: ${fusionResult.anomalyLevel.toUpperCase()} SEVİYE ANOMALI
Final Anomali Skoru: ${fusionResult.finalAnomalyScore}/100
Güven Puanı: ${fusionResult.confidenceScore}%
    `;

    const detailedFindings = `
DETAYLI BULGULAR
================

Skor Dağılımı:
- Geometrik Anomali: ${fusionResult.scoreBreakdown.geometric}/100
- Manyetik Sapma: ${fusionResult.scoreBreakdown.magnetic}/100
- Bitki Stresi: ${fusionResult.scoreBreakdown.vegetation}/100
- Sinyal Zayıflaması: ${fusionResult.scoreBreakdown.signal}/100
- Topografik Uygunluk: ${fusionResult.scoreBreakdown.topographic}/100

Risk Faktörleri:
${fusionResult.riskFactors.map((f) => `• ${f}`).join("\n")}
    `;

    const recommendations = `
ÖNERİLER
========
${fusionResult.recommendations.map((r) => `• ${r}`).join("\n")}
    `;

    const technicalDetails = `
TEKNİK DETAYLAR
===============

Analiz Yöntemi: Çok Katmanlı Saha Analiz Sistemi (MLAS)
- Kamera: Kenar algılama, çizgi tespiti, simetri analizi
- Manyetik: Sapma ölçümü, pik algılama, alan modelleme
- Bitki: NDVI benzeri oran, stres haritası, nem analizi
- Sinyal: RSSI analizi, zayıflama haritası, anomali tespiti
- Topografya: Eğim analizi, yükseklik grid'i, su hattı tahmini

Veri Entegrasyonu: Ağırlıklı formül
- Geometrik: %30
- Manyetik: %20
- Bitki: %20
- Sinyal: %10
- Topografya: %20

${notes ? `\nEK Notlar:\n${notes}` : ""}
    `;

    return {
      title: "Alan Anomali Analiz Raporu",
      timestamp: date.toISOString(),
      location: `${location.latitude.toFixed(4)}°N, ${location.longitude.toFixed(
        4
      )}°E`,
      summary,
      detailedFindings,
      recommendations,
      technicalDetails,
    };
  }

  /**
   * Anomali sınıflandırması
   */
  classifyAnomaly(score: number): {
    level: "düşük" | "orta" | "yüksek";
    description: string;
    recommendations: string[];
  } {
    if (score < 30) {
      return {
        level: "düşük",
        description:
          "Doğal arazi özelliği - Hazine bulma olasılığı düşük",
        recommendations: [
          "Rutin takip yapın",
          "Diğer alanları da analiz edin",
        ],
      };
    } else if (score < 70) {
      return {
        level: "orta",
        description: "Orta düzeyde anomali - Dikkat gerekli",
        recommendations: [
          "Alan detaylı araştırma yapın",
          "Ek ölçümler alın",
          "Lokal çalışmalara başlayın",
        ],
      };
    } else {
      return {
        level: "yüksek",
        description: "Yüksek anomali - Buluntu olasılığı çok yüksek",
        recommendations: [
          "Acil araştırma başlatın",
          "Uzman ekip görevlendir",
          "Sistemli kazı planı oluştur",
          "Arkeolojik kayıt tut",
        ],
      };
    }
  }

  /**
   * Zaman serisi analizi - Trend tespiti
   */
  analyzeTrend(
    results: FusionResult[]
  ): {
    trend: "ascending" | "descending" | "stable";
    changeRate: number; // Puan/gün
    prediction: number; // Tahmini skor
  } {
    if (results.length < 2) {
      return {
        trend: "stable",
        changeRate: 0,
        prediction: results.length > 0 ? results[results.length - 1].finalAnomalyScore : 0,
      };
    }

    const scores = results.map((r) => r.finalAnomalyScore);
    const firstScore = scores[0];
    const lastScore = scores[scores.length - 1];

    const timeSpan =
      (results[results.length - 1].timestamp - results[0].timestamp) / (24 * 60 * 60 * 1000); // gün
    const changeRate = (lastScore - firstScore) / Math.max(timeSpan, 1);

    let trend: "ascending" | "descending" | "stable" = "stable";
    if (changeRate > 5) trend = "ascending";
    else if (changeRate < -5) trend = "descending";

    // Basit doğrusal tahmin
    const prediction = lastScore + changeRate * 7; // 7 gün tahmini

    return {
      trend,
      changeRate: Math.round(changeRate * 100) / 100,
      prediction: Math.round(Math.max(0, Math.min(100, prediction))),
    };
  }
}
