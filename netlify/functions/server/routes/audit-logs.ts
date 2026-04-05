/**
 * Audit Logging Routes
 * Admin işlemlerinin kaydedilmesi ve raporlanması
 */

import { RequestHandler } from 'express';

interface AuditLog {
  id: string;
  timestamp: number;
  adminId: string;
  adminEmail: string;
  adminName: string;
  action: string;
  resourceType: string;
  resourceId: string;
  resourceName?: string;
  changes?: {
    before?: any;
    after?: any;
  };
  ipAddress?: string;
  userAgent?: string;
  status: 'success' | 'failure';
  errorMessage?: string;
  metadata?: Record<string, any>;
}

// In-memory audit log storage (üretimde database kullanılmalı)
const auditLogs: AuditLog[] = [];

/**
 * Audit log kaydı ekle
 * POST /api/admin/audit-log
 */
export const handleCreateAuditLog: RequestHandler = async (req, res) => {
  try {
    const log: AuditLog = req.body;

    // Ekstra bilgiler ekle
    log.ipAddress = req.ip || 'unknown';
    log.userAgent = req.get('user-agent') || 'unknown';
    log.timestamp = log.timestamp || Date.now();

    // In-memory storage'a ekle
    auditLogs.push(log);

    // Maksimum 10000 log tutulacak
    if (auditLogs.length > 10000) {
      auditLogs.shift();
    }

    // Console'a log yaz (hata ayıklama)
    console.log(`📝 [AUDIT] ${log.adminName} - ${log.action} on ${log.resourceType}`);

    // TODO: Database'e kaydet
    // await db.auditLogs.insert(log);

    res.json({
      success: true,
      message: 'Audit log kaydedildi',
      logId: log.id
    });

  } catch (error) {
    console.error('Audit log kaydetme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Audit log kaydedilemedi',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Audit loglarını al
 * GET /api/admin/audit-logs
 */
export const handleGetAuditLogs: RequestHandler = (req, res) => {
  try {
    const { adminId, action, resourceType, startDate, endDate, limit = '100' } = req.query;

    let filtered = [...auditLogs];

    // Filtreleme
    if (adminId) {
      filtered = filtered.filter(l => l.adminId === adminId);
    }

    if (action) {
      filtered = filtered.filter(l => l.action === action);
    }

    if (resourceType) {
      filtered = filtered.filter(l => l.resourceType === resourceType);
    }

    if (startDate) {
      const start = parseInt(startDate as string);
      filtered = filtered.filter(l => l.timestamp >= start);
    }

    if (endDate) {
      const end = parseInt(endDate as string);
      filtered = filtered.filter(l => l.timestamp <= end);
    }

    // Son logları göster
    const limitNum = parseInt(limit as string);
    filtered = filtered.slice(-limitNum).reverse();

    res.json({
      success: true,
      total: auditLogs.length,
      filtered: filtered.length,
      logs: filtered
    });

  } catch (error) {
    console.error('Audit log okuma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Audit loglar alınamadı'
    });
  }
};

/**
 * Spesifik bir kaynakla ilgili logları al
 * GET /api/admin/audit-logs/:resourceType/:resourceId
 */
export const handleGetAuditLogsByResource: RequestHandler = (req, res) => {
  try {
    const { resourceType, resourceId } = req.params;

    const filtered = auditLogs
      .filter(l => l.resourceType === resourceType && l.resourceId === resourceId)
      .reverse();

    res.json({
      success: true,
      resourceType,
      resourceId,
      count: filtered.length,
      logs: filtered
    });

  } catch (error) {
    console.error('Resource audit log okuma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Resource audit loglar alınamadı'
    });
  }
};

/**
 * Admin tarafından yapılan işlemleri al
 * GET /api/admin/audit-logs/admin/:adminId
 */
export const handleGetAuditLogsByAdmin: RequestHandler = (req, res) => {
  try {
    const { adminId } = req.params;
    const { limit = '100' } = req.query;

    const filtered = auditLogs
      .filter(l => l.adminId === adminId)
      .slice(-parseInt(limit as string))
      .reverse();

    res.json({
      success: true,
      adminId,
      count: filtered.length,
      logs: filtered
    });

  } catch (error) {
    console.error('Admin audit log okuma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Admin audit loglar alınamadı'
    });
  }
};

/**
 * Audit log istatistikleri
 * GET /api/admin/audit-logs/stats
 */
export const handleGetAuditLogStats: RequestHandler = (req, res) => {
  try {
    const stats = {
      totalLogs: auditLogs.length,
      successfulActions: auditLogs.filter(l => l.status === 'success').length,
      failedActions: auditLogs.filter(l => l.status === 'failure').length,
      actionBreakdown: {} as Record<string, number>,
      adminBreakdown: {} as Record<string, number>,
      lastLogTime: auditLogs.length > 0 ? auditLogs[auditLogs.length - 1].timestamp : null,
      first24Hours: 0,
      last7Days: 0
    };

    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

    auditLogs.forEach(log => {
      // Action breakdown
      stats.actionBreakdown[log.action] = (stats.actionBreakdown[log.action] || 0) + 1;

      // Admin breakdown
      const adminKey = `${log.adminName}`;
      stats.adminBreakdown[adminKey] = (stats.adminBreakdown[adminKey] || 0) + 1;

      // Time-based stats
      if (log.timestamp >= oneDayAgo) {
        stats.first24Hours++;
      }
      if (log.timestamp >= sevenDaysAgo) {
        stats.last7Days++;
      }
    });

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Audit log stats hatası:', error);
    res.status(500).json({
      success: false,
      message: 'İstatistikler alınamadı'
    });
  }
};

/**
 * Tarih aralığında logları al
 * GET /api/admin/audit-logs/range
 */
export const handleGetAuditLogsByDateRange: RequestHandler = (req, res) => {
  try {
    const { startDate, endDate, limit = '100' } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'startDate ve endDate parametreleri gereklidir'
      });
    }

    const start = parseInt(startDate as string);
    const end = parseInt(endDate as string);

    const filtered = auditLogs
      .filter(l => l.timestamp >= start && l.timestamp <= end)
      .slice(-parseInt(limit as string))
      .reverse();

    res.json({
      success: true,
      startDate,
      endDate,
      count: filtered.length,
      logs: filtered
    });

  } catch (error) {
    console.error('Tarih aralığı audit log okuma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Tarih aralığı loglar alınamadı'
    });
  }
};

/**
 * Audit loglarını dışa aktar (JSON)
 * GET /api/admin/audit-logs/export/json
 */
export const handleExportAuditLogs: RequestHandler = (req, res) => {
  try {
    const { format = 'json', limit = '10000' } = req.query;

    const logsToExport = auditLogs.slice(-parseInt(limit as string));

    if (format === 'csv') {
      // CSV formatında dışa aktar
      const headers = ['ID', 'Timestamp', 'Admin', 'Action', 'Resource', 'Status', 'IP'];
      const rows = logsToExport.map(log => [
        log.id,
        new Date(log.timestamp).toISOString(),
        `${log.adminName} (${log.adminEmail})`,
        log.action,
        `${log.resourceType}:${log.resourceId}`,
        log.status,
        log.ipAddress || 'N/A'
      ]);

      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${Date.now()}.csv"`);
      res.send(csv);
    } else {
      // JSON formatında dışa aktar
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${Date.now()}.json"`);
      res.json(logsToExport);
    }

  } catch (error) {
    console.error('Audit log export hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Audit loglar dışa aktarılamadı'
    });
  }
};

export type { AuditLog };
