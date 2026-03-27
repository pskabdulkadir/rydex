/**
 * PDF Rapor Oluşturucu Modülü
 * - Anomali raporu oluştur
 * - Koordinat ve zaman verisi içer
 * - Analiz grafikleri
 * - PDF/CSV dışa aktar
 */

export interface ReportData {
  title: string;
  date: string;
  location: {
    latitude: number;
    longitude: number;
  };
  anomalyScore: number;
  anomalyLevel: "düşük" | "orta" | "yüksek";
  scoreBreakdown: {
    geometric: number;
    magnetic: number;
    vegetation: number;
    signal: number;
    topographic: number;
  };
  findings: string[];
  recommendations: string[];
  riskFactors: string[];
  technicalNotes: string;
}

export class ReportGenerator {
  /**
   * HTML tabanlı rapor oluştur
   */
  generateHTMLReport(reportData: ReportData): string {
    const html = `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${reportData.title}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #333;
      line-height: 1.6;
      background: #f5f5f5;
    }
    
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .header {
      text-align: center;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    
    .header h1 {
      font-size: 28px;
      color: #1f2937;
      margin-bottom: 10px;
    }
    
    .header p {
      color: #6b7280;
      font-size: 14px;
    }
    
    .section {
      margin-bottom: 30px;
    }
    
    .section h2 {
      font-size: 18px;
      color: #1f2937;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 10px;
      margin-bottom: 15px;
    }
    
    .meta-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      background: #f9fafb;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    
    .meta-item {
      display: flex;
      flex-direction: column;
    }
    
    .meta-label {
      font-weight: 600;
      color: #6b7280;
      font-size: 12px;
      text-transform: uppercase;
      margin-bottom: 5px;
    }
    
    .meta-value {
      color: #1f2937;
      font-size: 14px;
    }
    
    .score-box {
      background: #f0f9ff;
      border-left: 4px solid #0ea5e9;
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    
    .score-value {
      font-size: 36px;
      font-weight: bold;
      color: #0ea5e9;
    }
    
    .score-label {
      color: #6b7280;
      margin-top: 5px;
    }
    
    .anomaly-high {
      border-left-color: #ef4444;
      background: #fef2f2;
    }
    
    .anomaly-high .score-value {
      color: #ef4444;
    }
    
    .anomaly-medium {
      border-left-color: #eab308;
      background: #fffbeb;
    }
    
    .anomaly-medium .score-value {
      color: #eab308;
    }
    
    .anomaly-low {
      border-left-color: #22c55e;
      background: #f0fdf4;
    }
    
    .anomaly-low .score-value {
      color: #22c55e;
    }
    
    .breakdown {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 15px;
      margin: 20px 0;
    }
    
    .breakdown-item {
      text-align: center;
      padding: 15px;
      background: #f9fafb;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }
    
    .breakdown-label {
      font-size: 12px;
      font-weight: 600;
      color: #6b7280;
      margin-bottom: 8px;
    }
    
    .breakdown-value {
      font-size: 24px;
      font-weight: bold;
      color: #1f2937;
    }
    
    .breakdown-bar {
      height: 4px;
      background: #e5e7eb;
      border-radius: 2px;
      margin-top: 8px;
      overflow: hidden;
    }
    
    .breakdown-fill {
      height: 100%;
      background: #3b82f6;
      width: var(--fill-width);
    }
    
    ul, ol {
      margin-left: 20px;
      margin-bottom: 15px;
    }
    
    li {
      margin-bottom: 8px;
      color: #374151;
    }
    
    .recommendation {
      background: #ecfdf5;
      border-left: 4px solid #10b981;
      padding: 12px 15px;
      margin-bottom: 10px;
      border-radius: 4px;
    }
    
    .risk-factor {
      background: #fef2f2;
      border-left: 4px solid #ef4444;
      padding: 12px 15px;
      margin-bottom: 10px;
      border-radius: 4px;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 12px;
      color: #9ca3af;
      text-align: center;
    }
    
    .chart-container {
      margin: 20px 0;
      padding: 20px;
      background: #f9fafb;
      border-radius: 8px;
      text-align: center;
    }
    
    @media print {
      body {
        background: white;
      }
      .container {
        box-shadow: none;
        padding: 20px;
      }
      .page-break {
        page-break-after: always;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Başlık -->
    <div class="header">
      <h1>${reportData.title}</h1>
      <p>${reportData.date}</p>
    </div>
    
    <!-- Konum ve Zaman Bilgisi -->
    <div class="section">
      <h2>Tarama Bilgisi</h2>
      <div class="meta-info">
        <div class="meta-item">
          <span class="meta-label">Enlem</span>
          <span class="meta-value">${reportData.location.latitude.toFixed(
            6
          )}°</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Boylam</span>
          <span class="meta-value">${reportData.location.longitude.toFixed(
            6
          )}°</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Tarih</span>
          <span class="meta-value">${new Date(reportData.date).toLocaleDateString(
            "tr-TR"
          )}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Saat</span>
          <span class="meta-value">${new Date(reportData.date).toLocaleTimeString(
            "tr-TR"
          )}</span>
        </div>
      </div>
    </div>
    
    <!-- Anomali Skoru -->
    <div class="section">
      <h2>Anomali Taraması Sonuçları</h2>
      <div class="score-box anomaly-${reportData.anomalyLevel}">
        <div class="score-value">${reportData.anomalyScore}</div>
        <div class="score-label">Anomali Skoru (0-100)</div>
        <div class="score-label" style="margin-top: 10px; font-weight: 600; text-transform: uppercase;">
          Seviye: ${reportData.anomalyLevel.toUpperCase()}
        </div>
      </div>
    </div>
    
    <!-- Skor Dağılımı -->
    <div class="section">
      <h2>Analiz Bileşenleri</h2>
      <div class="breakdown">
        <div class="breakdown-item">
          <div class="breakdown-label">Geometrik</div>
          <div class="breakdown-value">${reportData.scoreBreakdown.geometric}</div>
          <div class="breakdown-bar">
            <div class="breakdown-fill" style="--fill-width: ${
              reportData.scoreBreakdown.geometric
            }%;"></div>
          </div>
        </div>
        <div class="breakdown-item">
          <div class="breakdown-label">Manyetik</div>
          <div class="breakdown-value">${reportData.scoreBreakdown.magnetic}</div>
          <div class="breakdown-bar">
            <div class="breakdown-fill" style="--fill-width: ${
              reportData.scoreBreakdown.magnetic
            }%;"></div>
          </div>
        </div>
        <div class="breakdown-item">
          <div class="breakdown-label">Bitki</div>
          <div class="breakdown-value">${reportData.scoreBreakdown.vegetation}</div>
          <div class="breakdown-bar">
            <div class="breakdown-fill" style="--fill-width: ${
              reportData.scoreBreakdown.vegetation
            }%;"></div>
          </div>
        </div>
        <div class="breakdown-item">
          <div class="breakdown-label">Sinyal</div>
          <div class="breakdown-value">${reportData.scoreBreakdown.signal}</div>
          <div class="breakdown-bar">
            <div class="breakdown-fill" style="--fill-width: ${
              reportData.scoreBreakdown.signal
            }%;"></div>
          </div>
        </div>
        <div class="breakdown-item">
          <div class="breakdown-label">Topografya</div>
          <div class="breakdown-value">${reportData.scoreBreakdown.topographic}</div>
          <div class="breakdown-bar">
            <div class="breakdown-fill" style="--fill-width: ${
              reportData.scoreBreakdown.topographic
            }%;"></div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Risk Faktörleri -->
    <div class="section">
      <h2>Risk Faktörleri</h2>
      ${reportData.riskFactors.map((risk) => `<div class="risk-factor">${risk}</div>`).join("")}
    </div>
    
    <!-- Öneriler -->
    <div class="section">
      <h2>Öneriler</h2>
      ${reportData.recommendations.map((rec) => `<div class="recommendation">${rec}</div>`).join("")}
    </div>
    
    <!-- Teknik Notlar -->
    ${
      reportData.technicalNotes
        ? `
    <div class="section">
      <h2>Teknik Notlar</h2>
      <p>${reportData.technicalNotes}</p>
    </div>
    `
        : ""
    }
    
    <!-- Bulgular -->
    ${
      reportData.findings.length > 0
        ? `
    <div class="section">
      <h2>Bulgular</h2>
      <ul>
        ${reportData.findings.map((f) => `<li>${f}</li>`).join("")}
      </ul>
    </div>
    `
        : ""
    }
    
    <!-- Altlık -->
    <div class="footer">
      <p>Bu rapor, yüzey ve çevresel veri analizine dayalı istatistiksel değerlendirme üretir.</p>
      <p>Oluşturulma Tarihi: ${new Date().toLocaleString("tr-TR")}</p>
      <p>Sistem: Çok Katmanlı Saha Analiz Sistemi (MLAS) v1.0</p>
    </div>
  </div>
</body>
</html>
    `;

    return html;
  }

  /**
   * CSV formatında rapor oluştur
   */
  generateCSVReport(reportData: ReportData): string {
    const csv = [
      ["Alan Anomali Taraması Raporu"],
      [],
      ["Başlık", reportData.title],
      ["Tarih", reportData.date],
      ["Enlem", reportData.location.latitude],
      ["Boylam", reportData.location.longitude],
      [],
      ["SONUÇLAR"],
      ["Anomali Skoru", reportData.anomalyScore],
      ["Anomali Seviyesi", reportData.anomalyLevel],
      [],
      ["SKOR DAĞILIMI"],
      ["Bileşen", "Skor"],
      ["Geometrik", reportData.scoreBreakdown.geometric],
      ["Manyetik", reportData.scoreBreakdown.magnetic],
      ["Bitki", reportData.scoreBreakdown.vegetation],
      ["Sinyal", reportData.scoreBreakdown.signal],
      ["Topografya", reportData.scoreBreakdown.topographic],
      [],
      ["RİSK FAKTÖRLERİ"],
      ...reportData.riskFactors.map((r) => [r]),
      [],
      ["ÖNERİLER"],
      ...reportData.recommendations.map((r) => [r]),
      [],
      ["BULGULAR"],
      ...reportData.findings.map((f) => [f]),
    ];

    return csv.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
  }

  /**
   * JSON formatında rapor oluştur
   */
  generateJSONReport(reportData: ReportData): string {
    return JSON.stringify(reportData, null, 2);
  }

  /**
   * Raporu dosya olarak indir (HTML)
   */
  downloadHTMLReport(reportData: ReportData, filename: string = "rapor.html"): void {
    const html = this.generateHTMLReport(reportData);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    this.downloadFile(blob, filename);
  }

  /**
   * Raporu dosya olarak indir (CSV)
   */
  downloadCSVReport(reportData: ReportData, filename: string = "rapor.csv"): void {
    const csv = this.generateCSVReport(reportData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    this.downloadFile(blob, filename);
  }

  /**
   * Raporu dosya olarak indir (JSON)
   */
  downloadJSONReport(reportData: ReportData, filename: string = "rapor.json"): void {
    const json = this.generateJSONReport(reportData);
    const blob = new Blob([json], { type: "application/json;charset=utf-8" });
    this.downloadFile(blob, filename);
  }

  /**
   * Dosyayı indir
   */
  private downloadFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Raporu yazdır (tarayıcı print dialog'u)
   */
  printReport(reportData: ReportData): void {
    const html = this.generateHTMLReport(reportData);
    const printWindow = window.open("", "", "width=900,height=600");
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.print();
    }
  }

  /**
   * PDF'ye dönüştür (html2pdf kütüphanesi gerekir)
   * Alternatif: tarayıcının kaydet-PDF seçeneğini kullanmak
   */
  async downloadPDFReport(
    reportData: ReportData,
    filename: string = "rapor.pdf"
  ): Promise<void> {
    // HTML'i açık pencerenin print fonksiyonu ile PDF'e çevir
    const html = this.generateHTMLReport(reportData);

    // İlk olarak HTML'i indir ve ardından tarayıcının "PDF olarak kaydet" işlevini kullan
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const printWindow = window.open(url, "_blank");
    if (printWindow) {
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  }
}
