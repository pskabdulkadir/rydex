import { RequestHandler } from 'express';
import { GenerateInvoiceRequest, GenerateInvoiceResponse } from '@shared/api';
import {
  createInvoice,
  getInvoice,
  getUserInvoices,
  updateInvoice,
  generateInvoiceHTML,
  getInvoiceResponse,
} from '../lib/invoice-service';

/**
 * Fatura oluştur
 * POST /api/invoice/generate
 */
export const generateInvoiceHandler: RequestHandler = (req, res) => {
  try {
    const request = req.body as GenerateInvoiceRequest;

    // Validasyon
    if (!request.userId || !request.paymentId || !request.packageId || !request.amount) {
      return res.status(400).json({
        success: false,
        error: 'Gerekli alanlar: userId, paymentId, packageId, amount, currency',
      });
    }

    // Fatura oluştur
    const invoice = createInvoice(request);

    const response: GenerateInvoiceResponse = getInvoiceResponse(invoice);

    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Fatura oluşturulurken hata oluştu',
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Faturayı getir
 * GET /api/invoice/:invoiceId
 */
export const getInvoiceHandler: RequestHandler = (req, res) => {
  try {
    const { invoiceId } = req.params;

    if (!invoiceId) {
      return res.status(400).json({
        success: false,
        error: 'invoiceId gerekli',
      });
    }

    const invoice = getInvoice(invoiceId);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: 'Fatura bulunamadı',
      });
    }

    res.json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Fatura alınamadı',
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Kullanıcı faturalarını listele
 * GET /api/invoice/user/:userId
 */
export const getUserInvoicesHandler: RequestHandler = (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId gerekli',
      });
    }

    const invoices = getUserInvoices(userId);

    res.json({
      success: true,
      data: invoices,
      count: invoices.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Faturalar alınamadı',
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Faturayı güncelle
 * PUT /api/invoice/:invoiceId
 */
export const updateInvoiceHandler: RequestHandler = (req, res) => {
  try {
    const { invoiceId } = req.params;
    const updates = req.body;

    if (!invoiceId) {
      return res.status(400).json({
        success: false,
        error: 'invoiceId gerekli',
      });
    }

    const invoice = updateInvoice(invoiceId, updates);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: 'Fatura bulunamadı',
      });
    }

    res.json({
      success: true,
      message: 'Fatura başarıyla güncellendi',
      data: invoice,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Fatura güncellenirken hata oluştu',
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Faturayı PDF olarak indir
 * GET /api/invoice/:invoiceId/download
 */
export const downloadInvoiceHandler: RequestHandler = (req, res) => {
  try {
    const { invoiceId } = req.params;

    if (!invoiceId) {
      return res.status(400).json({
        success: false,
        error: 'invoiceId gerekli',
      });
    }

    const invoice = getInvoice(invoiceId);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: 'Fatura bulunamadı',
      });
    }

    const html = generateInvoiceHTML(invoice);

    // HTML'i yanıt olarak gönder (tarayıcı PDF'ye dönüştürebilir)
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="fatura-${invoice.invoiceNumber}.html"`);
    res.send(html);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Fatura indirilirken hata oluştu',
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Faturayı HTML olarak görüntüle
 * GET /api/invoice/:invoiceId/view
 */
export const viewInvoiceHandler: RequestHandler = (req, res) => {
  try {
    const { invoiceId } = req.params;

    if (!invoiceId) {
      return res.status(400).json({
        success: false,
        error: 'invoiceId gerekli',
      });
    }

    const invoice = getInvoice(invoiceId);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: 'Fatura bulunamadı',
      });
    }

    const html = generateInvoiceHTML(invoice);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Fatura görüntülenirken hata oluştu',
      details: error instanceof Error ? error.message : String(error),
    });
  }
};
