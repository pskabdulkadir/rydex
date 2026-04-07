import { Invoice, InvoiceItem, Currency, GenerateInvoiceRequest, GenerateInvoiceResponse } from '@shared/api';
import { generateInvoiceNumber, formatCurrency } from './currency-service';

/**
 * Invoice Oluşturma ve Yönetim Servisi
 * Türk vergi yasalarına uygun fatura oluşturur
 */

// Bellekte faturalar saklama (üretimde veritabanı kullanılır)
const invoicesStore = new Map<string, Invoice>();

/**
 * Yeni fatura oluştur
 */
export function createInvoice(request: GenerateInvoiceRequest): Invoice {
  const invoice: Invoice = {
    id: `inv_${Date.now()}`,
    invoiceNumber: generateInvoiceNumber(),
    userId: request.userId,
    paymentId: request.paymentId,
    packageId: request.packageId,
    packageName: getPackageName(request.packageId),
    amount: request.amount,
    currency: request.currency,
    userEmail: request.userEmail,
    userName: request.userName || 'Müşteri',
    issueDate: Date.now(),
    dueDate: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 gün
    status: 'issued',
    items: createInvoiceItems(request),
  };

  invoicesStore.set(invoice.id, invoice);
  return invoice;
}

/**
 * Paket adını al
 */
function getPackageName(packageId: string): string {
  const packageNames: Record<string, string> = {
    starter: 'Starter Paketi',
    professional: 'Profesyonel Paketi',
    enterprise: 'Enterprise Paketi',
    master: 'Master License Paketi',
  };

  return packageNames[packageId] || 'Premium Paket';
}

/**
 * Fatura satırlarını oluştur
 */
function createInvoiceItems(request: GenerateInvoiceRequest): InvoiceItem[] {
  return [
    {
      id: `item_1`,
      description: `${getPackageName(request.packageId)} - Aylık Abonelik`,
      quantity: 1,
      unitPrice: request.amount,
      total: request.amount,
    },
  ];
}

/**
 * Faturayı ID'ye göre al
 */
export function getInvoice(invoiceId: string): Invoice | null {
  return invoicesStore.get(invoiceId) || null;
}

/**
 * Faturayı ID'ye göre al (getInvoice için alias)
 */
export function getInvoiceById(invoiceId: string): Invoice | null {
  return getInvoice(invoiceId);
}

/**
 * Kullanıcının tüm faturalarını al
 */
export function getUserInvoices(userId: string): Invoice[] {
  return Array.from(invoicesStore.values()).filter(inv => inv.userId === userId);
}

/**
 * Faturayı güncelle
 */
export function updateInvoice(invoiceId: string, updates: Partial<Invoice>): Invoice | null {
  const invoice = invoicesStore.get(invoiceId);
  if (!invoice) return null;

  const updated: Invoice = {
    ...invoice,
    ...updates,
  };

  invoicesStore.set(invoiceId, updated);
  return updated;
}

/**
 * Faturayı PDF olarak oluştur (HTML şablonu)
 */
export function generateInvoiceHTML(invoice: Invoice): string {
  const issueDate = new Date(invoice.issueDate).toLocaleDateString('tr-TR');
  const dueDate = new Date(invoice.dueDate).toLocaleDateString('tr-TR');
  
  const itemsHTML = invoice.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #ddd;">${item.description}</td>
      <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: right;">${formatCurrency(item.unitPrice, invoice.currency)}</td>
      <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: right;">${formatCurrency(item.total, invoice.currency)}</td>
    </tr>
  `
    )
    .join('');

  const html = `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fatura - ${invoice.invoiceNumber}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 40px;
      border-bottom: 2px solid #007bff;
      padding-bottom: 20px;
    }
    .company-info h1 {
      margin: 0 0 10px 0;
      color: #007bff;
      font-size: 28px;
    }
    .company-info p {
      margin: 5px 0;
      color: #666;
      font-size: 14px;
    }
    .invoice-info {
      text-align: right;
    }
    .invoice-info p {
      margin: 5px 0;
      font-weight: 500;
    }
    .invoice-number {
      font-size: 20px;
      color: #007bff;
      font-weight: bold;
    }
    .status {
      display: inline-block;
      padding: 5px 15px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
      margin-top: 10px;
    }
    .status.paid {
      background: #d4edda;
      color: #155724;
    }
    .status.issued {
      background: #cfe2ff;
      color: #084298;
    }
    .bill-to {
      margin-bottom: 40px;
    }
    .bill-to h3 {
      margin: 0 0 10px 0;
      color: #333;
      font-size: 12px;
      text-transform: uppercase;
      color: #666;
    }
    .bill-to p {
      margin: 5px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 30px 0;
    }
    th {
      background: #007bff;
      color: white;
      padding: 15px;
      text-align: left;
      font-weight: 600;
    }
    th:nth-child(3),
    th:nth-child(4) {
      text-align: right;
    }
    .totals {
      margin: 30px 0;
      text-align: right;
    }
    .totals-row {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 10px;
    }
    .totals-label {
      width: 200px;
      text-align: right;
      padding-right: 20px;
      font-weight: 500;
    }
    .totals-value {
      width: 150px;
      text-align: right;
      padding-right: 20px;
    }
    .total-amount {
      font-size: 24px;
      color: #007bff;
      font-weight: bold;
      border-top: 2px solid #ddd;
      padding-top: 10px;
      margin-top: 10px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
    .notes {
      margin-top: 30px;
      padding: 15px;
      background: #f9f9f9;
      border-left: 4px solid #007bff;
      border-radius: 4px;
    }
    @media print {
      body {
        background: white;
        padding: 0;
      }
      .container {
        box-shadow: none;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="company-info">
        <h1>🔍 RYDEX</h1>
        <p>Hazine Arama Teknolojileri</p>
        <p>E-posta: support@rydex.com</p>
        <p>Telefon: +90 542 578 37 48</p>
      </div>
      <div class="invoice-info">
        <div class="invoice-number">${invoice.invoiceNumber}</div>
        <p>Fatura Tarihi: ${issueDate}</p>
        <p>Ödeme Tarihi: ${dueDate}</p>
        <div class="status ${invoice.status}">${invoice.status === 'paid' ? 'ÖDENDI' : 'KESİLDİ'}</div>
      </div>
    </div>

    <!-- Bill To -->
    <div class="bill-to">
      <h3>Faturalanan</h3>
      <p><strong>${invoice.userName}</strong></p>
      <p>${invoice.userEmail}</p>
    </div>

    <!-- Items Table -->
    <table>
      <thead>
        <tr>
          <th>Açıklama</th>
          <th style="text-align: center;">Miktar</th>
          <th style="text-align: right;">Birim Fiyatı</th>
          <th style="text-align: right;">Toplam</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHTML}
      </tbody>
    </table>

    <!-- Totals -->
    <div class="totals">
      <div class="totals-row">
        <span class="totals-label">Ara Toplam:</span>
        <span class="totals-value">${formatCurrency(invoice.amount, invoice.currency)}</span>
      </div>
      <div class="totals-row">
        <span class="totals-label">KDV (0%):</span>
        <span class="totals-value">${formatCurrency(0, invoice.currency)}</span>
      </div>
      <div class="totals-row total-amount">
        <span class="totals-label">TOPLAM:</span>
        <span class="totals-value">${formatCurrency(invoice.amount, invoice.currency)}</span>
      </div>
    </div>

    <!-- Notes -->
    ${invoice.notes ? `
    <div class="notes">
      <strong>Notlar:</strong>
      <p>${invoice.notes}</p>
    </div>
    ` : ''}

    <!-- Footer -->
    <div class="footer">
      <p>Bu fatura, ödemeniz hakkında resmi bir belgedir.</p>
      <p>© 2024 RYDEX - Tüm Hakları Saklıdır</p>
    </div>
  </div>
</body>
</html>
  `;

  return html;
}

/**
 * Invoice JSON'ı al (API yanıtı için)
 */
export function getInvoiceResponse(invoice: Invoice): GenerateInvoiceResponse {
  return {
    success: true,
    invoiceId: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    message: `Fatura ${invoice.invoiceNumber} başarıyla oluşturuldu`,
  };
}
