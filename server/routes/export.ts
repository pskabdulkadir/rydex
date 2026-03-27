import { RequestHandler } from "express";
import { Response } from "express";

/**
 * GÖREV 8: CSV/PDF Export
 * - CSV formatında dışa aktarma
 * - PDF formatında dışa aktarma
 * - Seçili alanlar
 * - Filtreleme
 */

/**
 * Veriyi CSV formatına dönüştür
 */
function convertToCSV(data: any[]): string {
  if (data.length === 0) {
    return "";
  }

  // Tüm benzersiz keys'leri bul
  const keys = new Set<string>();
  data.forEach((item) => {
    Object.keys(item).forEach((key) => keys.add(key));
  });

  const headers = Array.from(keys);
  const csvContent: string[] = [];

  // Header satırını ekle
  csvContent.push(headers.map((h) => escapeCSV(h)).join(","));

  // Data satırlarını ekle
  data.forEach((item) => {
    const row = headers.map((header) => {
      const value = item[header];
      return escapeCSV(formatValue(value));
    });
    csvContent.push(row.join(","));
  });

  return csvContent.join("\n");
}

/**
 * CSV değerlerini escape et
 */
function escapeCSV(value: string): string {
  if (value === null || value === undefined) {
    return "";
  }

  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Değeri formatla (nested objeleri string'e çevir)
 */
function formatValue(value: any): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  if (typeof value === "boolean") {
    return value ? "Evet" : "Hayır";
  }

  if (typeof value === "number") {
    if (value > 9999999999) {
      // Timestamp benzeri sayılar
      return new Date(value).toLocaleString("tr-TR");
    }
    return value.toString();
  }

  return value.toString();
}

/**
 * Basit HTML -> PDF (not a full PDF generator)
 * Gerçek uygulamada pdfkit gibi library kullanılmalı
 */
function generatePDFContent(data: any[], title: string): string {
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          color: #333;
        }
        h1 {
          color: #2c3e50;
          border-bottom: 3px solid #3498db;
          padding-bottom: 10px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th {
          background-color: #3498db;
          color: white;
          padding: 12px;
          text-align: left;
          font-weight: bold;
        }
        td {
          border: 1px solid #ddd;
          padding: 10px;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        .footer {
          margin-top: 30px;
          padding-top: 10px;
          border-top: 1px solid #ddd;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <p>Dişa Aktarma Tarihi: ${new Date().toLocaleString("tr-TR")}</p>
      <table>
  `;

  if (data.length === 0) {
    html += `<tr><td colspan="5">Veri yok</td></tr>`;
  } else {
    // Headers
    const keys = new Set<string>();
    data.forEach((item) => {
      Object.keys(item).forEach((key) => keys.add(key));
    });

    const headers = Array.from(keys).slice(0, 5); // Maksimum 5 sütun

    html += "<thead><tr>";
    headers.forEach((header) => {
      html += `<th>${header}</th>`;
    });
    html += "</tr></thead>";

    // Rows
    html += "<tbody>";
    data.forEach((item) => {
      html += "<tr>";
      headers.forEach((header) => {
        const value = formatValue(item[header]);
        html += `<td>${value}</td>`;
      });
      html += "</tr>";
    });
    html += "</tbody>";
  }

  html += `
      </table>
      <div class="footer">
        <p>Toplam Kayıt: ${data.length}</p>
        <p>© 2024 Tüm hakları saklıdır</p>
      </div>
    </body>
    </html>
  `;

  return html;
}

/**
 * CSV olarak dışa aktar
 */
export const handleExportCSV: RequestHandler = async (req, res) => {
  try {
    const { type, ids, filename } = req.query as {
      type: string;
      ids?: string;
      filename?: string;
    };

    if (!type) {
      return res.status(400).json({
        success: false,
        error: "Dışa aktarılacak veri türü gerekli",
      });
    }

    // Mock veri
    const mockData = {
      users: [
        {
          id: "user_1",
          email: "admin@example.com",
          displayName: "Yönetici",
          status: "active",
          createdAt: new Date().toISOString(),
        },
        {
          id: "user_2",
          email: "user@example.com",
          displayName: "Test Kullanıcısı",
          status: "active",
          createdAt: new Date().toISOString(),
        },
      ],
      payments: [
        {
          id: "pay_1",
          userId: "user_1",
          amount: 100,
          status: "completed",
          transactionId: "TRX_123456",
          createdAt: new Date().toISOString(),
        },
        {
          id: "pay_2",
          userId: "user_2",
          amount: 50,
          status: "pending",
          transactionId: "TRX_789012",
          createdAt: new Date().toISOString(),
        },
      ],
      subscriptions: [
        {
          id: "sub_1",
          userId: "user_1",
          plan: "annual",
          status: "active",
          endDate: new Date().toISOString(),
        },
        {
          id: "sub_2",
          userId: "user_2",
          plan: "monthly",
          status: "active",
          endDate: new Date().toISOString(),
        },
      ],
    };

    let data: any[] = mockData[type as keyof typeof mockData] || [];

    // ID'ler belirtilmişse filtrele
    if (ids) {
      const idList = ids.split(",");
      data = data.filter((item) => idList.includes(item.id));
    }

    const csv = convertToCSV(data);
    const exportFilename =
      filename || `${type}_${new Date().getTime()}.csv`;

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${exportFilename}"`
    );
    res.send(csv);

    console.log(
      `📥 CSV dışa aktarması: ${exportFilename} (${data.length} satır)`
    );
  } catch (error) {
    console.error("CSV dışa aktarma hatası:", error);
    res.status(500).json({
      success: false,
      error: "CSV dışa aktarma başarısız",
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * PDF olarak dışa aktar (HTML olarak döneriz, frontend'te PDF'ye dönüştürülür)
 */
export const handleExportPDF: RequestHandler = async (req, res) => {
  try {
    const { type, ids, filename } = req.query as {
      type: string;
      ids?: string;
      filename?: string;
    };

    if (!type) {
      return res.status(400).json({
        success: false,
        error: "Dışa aktarılacak veri türü gerekli",
      });
    }

    // Mock veri
    const mockData = {
      users: [
        {
          id: "user_1",
          email: "admin@example.com",
          displayName: "Yönetici",
          status: "active",
          createdAt: new Date().toISOString(),
        },
        {
          id: "user_2",
          email: "user@example.com",
          displayName: "Test Kullanıcısı",
          status: "active",
          createdAt: new Date().toISOString(),
        },
      ],
      payments: [
        {
          id: "pay_1",
          userId: "user_1",
          amount: 100,
          status: "completed",
          transactionId: "TRX_123456",
          createdAt: new Date().toISOString(),
        },
      ],
      subscriptions: [
        {
          id: "sub_1",
          userId: "user_1",
          plan: "annual",
          status: "active",
          endDate: new Date().toISOString(),
        },
      ],
    };

    let data: any[] = mockData[type as keyof typeof mockData] || [];

    // ID'ler belirtilmişse filtrele
    if (ids) {
      const idList = ids.split(",");
      data = data.filter((item) => idList.includes(item.id));
    }

    const title = `${type} - Dışa Aktarma Raporu`;
    const pdfContent = generatePDFContent(data, title);

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(pdfContent);

    console.log(
      `📥 PDF dışa aktarması (HTML): ${type}_${new Date().getTime()}.pdf (${data.length} satır)`
    );
  } catch (error) {
    console.error("PDF dışa aktarma hatası:", error);
    res.status(500).json({
      success: false,
      error: "PDF dışa aktarma başarısız",
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * JSON olarak dışa aktar
 */
export const handleExportJSON: RequestHandler = async (req, res) => {
  try {
    const { type, ids, filename } = req.query as {
      type: string;
      ids?: string;
      filename?: string;
    };

    if (!type) {
      return res.status(400).json({
        success: false,
        error: "Dışa aktarılacak veri türü gerekli",
      });
    }

    // Mock veri
    const mockData = {
      users: [
        {
          id: "user_1",
          email: "admin@example.com",
          displayName: "Yönetici",
        },
      ],
      payments: [
        {
          id: "pay_1",
          userId: "user_1",
          amount: 100,
          status: "completed",
        },
      ],
    };

    let data: any[] = mockData[type as keyof typeof mockData] || [];

    // ID'ler belirtilmişse filtrele
    if (ids) {
      const idList = ids.split(",");
      data = data.filter((item) => idList.includes(item.id));
    }

    const exportFilename = filename || `${type}_${new Date().getTime()}.json`;

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${exportFilename}"`
    );
    res.json({
      success: true,
      type,
      exportDate: new Date().toISOString(),
      totalRecords: data.length,
      data,
    });

    console.log(
      `📥 JSON dışa aktarması: ${exportFilename} (${data.length} satır)`
    );
  } catch (error) {
    console.error("JSON dışa aktarma hatası:", error);
    res.status(500).json({
      success: false,
      error: "JSON dışa aktarma başarısız",
    });
  }
};

/**
 * Excel olarak dışa aktar (mock - gerçek Excel kütüphanesi gereklidir)
 */
export const handleExportExcel: RequestHandler = async (req, res) => {
  try {
    const { type, ids, filename } = req.query as {
      type: string;
      ids?: string;
      filename?: string;
    };

    if (!type) {
      return res.status(400).json({
        success: false,
        error: "Dışa aktarılacak veri türü gerekli",
      });
    }

    // Mock - gerçek Excel dosyası oluşturmak için xlsx kütüphanesi gereklidir
    // Şimdilik CSV olarak dönüyoruz
    const mockData = [
      { id: "1", status: "completed" },
      { id: "2", status: "pending" },
    ];

    const csv = convertToCSV(mockData);
    const exportFilename = filename || `${type}_${new Date().getTime()}.csv`;

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${exportFilename}"`
    );
    res.send(csv);

    console.log(
      `📥 Excel dışa aktarması (CSV formatında): ${exportFilename}`
    );
  } catch (error) {
    console.error("Excel dışa aktarma hatası:", error);
    res.status(500).json({
      success: false,
      error: "Excel dışa aktarma başarısız",
    });
  }
};
