/**
 * Audit Logger
 * Tüm admin işlemlerinin kaydedilmesi
 */

export type AuditAction = 
  | 'LOGIN'
  | 'LOGOUT'
  | 'APPROVE_ESCROW'
  | 'REJECT_ESCROW'
  | 'DELIVER_ESCROW'
  | 'CREATE_COUPON'
  | 'DELETE_COUPON'
  | 'UPDATE_COUPON'
  | 'BAN_USER'
  | 'DELETE_USER'
  | 'CHANGE_USER_ROLE'
  | 'VIEW_DATA'
  | 'EXPORT_DATA'
  | 'VIEW_ADMIN_PANEL'
  | 'CHANGE_ADMIN_PASSWORD'
  | 'UPDATE_SETTINGS';

export interface AuditLog {
  id: string;
  timestamp: number;
  adminId: string;
  adminEmail: string;
  adminName: string;
  action: AuditAction;
  resourceType: string; // 'Escrow', 'Coupon', 'User', etc.
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

const AUDIT_LOGS_KEY = 'audit_logs';
const MAX_LOGS = 10000; // Maksimum 10000 log tutulacak

/**
 * Yeni audit log kaydı oluştur
 */
export function createAuditLog(
  adminId: string,
  adminEmail: string,
  adminName: string,
  action: AuditAction,
  resourceType: string,
  resourceId: string,
  resourceName?: string,
  changes?: { before?: any; after?: any },
  status: 'success' | 'failure' = 'success',
  errorMessage?: string,
  metadata?: Record<string, any>
): AuditLog {
  const log: AuditLog = {
    id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    adminId,
    adminEmail,
    adminName,
    action,
    resourceType,
    resourceId,
    resourceName,
    changes,
    ipAddress: getClientIP(),
    userAgent: navigator.userAgent,
    status,
    errorMessage,
    metadata
  };

  saveAuditLog(log);
  return log;
}

/**
 * Audit log'u localStorage'a kaydet
 */
function saveAuditLog(log: AuditLog): void {
  try {
    const stored = localStorage.getItem(AUDIT_LOGS_KEY);
    const logs: AuditLog[] = stored ? JSON.parse(stored) : [];

    // Yeni log'u ekle
    logs.push(log);

    // En eski logları sil (maksimum log sayısı aşılırsa)
    if (logs.length > MAX_LOGS) {
      logs.splice(0, logs.length - MAX_LOGS);
    }

    localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(logs));

    // Server'a da gönder (isteğe bağlı)
    sendAuditLogToServer(log).catch(err => {
      console.warn('Audit log server gönderme hatası:', err);
    });

  } catch (error) {
    console.error('Audit log kaydetme hatası:', error);
  }
}

/**
 * Audit log'ları al
 */
export function getAuditLogs(
  filters?: {
    adminId?: string;
    action?: AuditAction;
    resourceType?: string;
    startDate?: number;
    endDate?: number;
    limit?: number;
  }
): AuditLog[] {
  try {
    const stored = localStorage.getItem(AUDIT_LOGS_KEY);
    if (!stored) return [];

    let logs: AuditLog[] = JSON.parse(stored);

    // Filtreleme
    if (filters) {
      if (filters.adminId) {
        logs = logs.filter(l => l.adminId === filters.adminId);
      }
      if (filters.action) {
        logs = logs.filter(l => l.action === filters.action);
      }
      if (filters.resourceType) {
        logs = logs.filter(l => l.resourceType === filters.resourceType);
      }
      if (filters.startDate) {
        logs = logs.filter(l => l.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        logs = logs.filter(l => l.timestamp <= filters.endDate!);
      }

      // Limit'i uygula (en yeni loglardan başla)
      if (filters.limit) {
        logs = logs.slice(-filters.limit);
      }
    }

    // En yeni logları önce göster
    return logs.reverse();

  } catch (error) {
    console.error('Audit log okuma hatası:', error);
    return [];
  }
}

/**
 * Spesifik bir kaynakla ilgili logları al
 */
export function getAuditLogsByResource(
  resourceType: string,
  resourceId: string
): AuditLog[] {
  return getAuditLogs({ resourceType, limit: 100 }).filter(
    l => l.resourceId === resourceId
  );
}

/**
 * Admin tarafından yapılan işlemleri al
 */
export function getAuditLogsByAdmin(
  adminId: string,
  limit: number = 100
): AuditLog[] {
  return getAuditLogs({ adminId, limit });
}

/**
 * Tarih aralığında işlemleri al
 */
export function getAuditLogsByDateRange(
  startDate: number,
  endDate: number
): AuditLog[] {
  return getAuditLogs({ startDate, endDate });
}

/**
 * Audit log istatistikleri
 */
export function getAuditLogStats(): {
  totalLogs: number;
  successfulActions: number;
  failedActions: number;
  actionBreakdown: Record<AuditAction, number>;
  adminBreakdown: Record<string, number>;
  lastLogTime: number | null;
} {
  const logs = getAuditLogs({ limit: 10000 });

  const stats = {
    totalLogs: logs.length,
    successfulActions: logs.filter(l => l.status === 'success').length,
    failedActions: logs.filter(l => l.status === 'failure').length,
    actionBreakdown: {} as Record<AuditAction, number>,
    adminBreakdown: {} as Record<string, number>,
    lastLogTime: logs.length > 0 ? logs[0].timestamp : null
  };

  logs.forEach(log => {
    // Action breakdown
    stats.actionBreakdown[log.action] = (stats.actionBreakdown[log.action] || 0) + 1;

    // Admin breakdown
    const adminKey = `${log.adminName} (${log.adminEmail})`;
    stats.adminBreakdown[adminKey] = (stats.adminBreakdown[adminKey] || 0) + 1;
  });

  return stats;
}

/**
 * Audit log'ları temizle (isteğe bağlı - yönetici fonksiyonu)
 */
export function clearAuditLogs(): void {
  if (confirm('Tüm audit log\'ları silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
    try {
      localStorage.removeItem(AUDIT_LOGS_KEY);
      console.log('✓ Tüm audit log\'ları temizlendi');
    } catch (error) {
      console.error('Audit log temizleme hatası:', error);
    }
  }
}

/**
 * Audit log'ları JSON olarak indir
 */
export function downloadAuditLogs(): void {
  try {
    const logs = getAuditLogs({ limit: 10000 });
    const dataStr = JSON.stringify(logs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit_logs_${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Audit log indirme hatası:', error);
  }
}

/**
 * Client IP adresini al (tarayıcıdan)
 */
function getClientIP(): string {
  // Tarayıcıdan doğrudan IP alınması mümkün değil,
  // server tarafından X-Forwarded-For veya socket.remoteAddress kullanılır
  return 'browser-based';
}

/**
 * Audit log'u server'a gönder
 */
async function sendAuditLogToServer(log: AuditLog): Promise<void> {
  try {
    const token = localStorage.getItem('admin_auth_token');
    if (!token) return;

    await fetch('/api/admin/audit-log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${JSON.parse(token).token}`
      },
      body: JSON.stringify(log)
    });
  } catch (error) {
    console.warn('Audit log sunucu gönderimi başarısız:', error);
  }
}

/**
 * Activity Timeline formatı (Admin Panel'de göstermek için)
 */
export function formatAuditLogForTimeline(log: AuditLog): {
  icon: string;
  title: string;
  description: string;
  timestamp: string;
  color: string;
} {
  const actionTitles: Record<AuditAction, string> = {
    LOGIN: 'Giriş Yapıldı',
    LOGOUT: 'Çıkış Yapıldı',
    APPROVE_ESCROW: 'Escrow Onaylandı',
    REJECT_ESCROW: 'Escrow Reddedildi',
    DELIVER_ESCROW: 'Escrow Teslim Edildi',
    CREATE_COUPON: 'Kupon Oluşturuldu',
    DELETE_COUPON: 'Kupon Silindi',
    UPDATE_COUPON: 'Kupon Güncellendu',
    BAN_USER: 'Kullanıcı Engellendi',
    DELETE_USER: 'Kullanıcı Silindi',
    CHANGE_USER_ROLE: 'Kullanıcı Rolü Değiştirildi',
    VIEW_DATA: 'Veri Görüntülendi',
    EXPORT_DATA: 'Veri Dışa Aktarıldı',
    VIEW_ADMIN_PANEL: 'Admin Panel Açıldı',
    CHANGE_ADMIN_PASSWORD: 'Şifre Değiştirildi',
    UPDATE_SETTINGS: 'Ayarlar Güncellendi'
  };

  const icons: Record<AuditAction, string> = {
    LOGIN: '📋',
    LOGOUT: '🚪',
    APPROVE_ESCROW: '✅',
    REJECT_ESCROW: '❌',
    DELIVER_ESCROW: '📦',
    CREATE_COUPON: '✨',
    DELETE_COUPON: '🗑️',
    UPDATE_COUPON: '✏️',
    BAN_USER: '🚫',
    DELETE_USER: '👤',
    CHANGE_USER_ROLE: '👥',
    VIEW_DATA: '👁️',
    EXPORT_DATA: '💾',
    VIEW_ADMIN_PANEL: '🛡️',
    CHANGE_ADMIN_PASSWORD: '🔐',
    UPDATE_SETTINGS: '⚙️'
  };

  const colors: Record<'success' | 'failure', string> = {
    success: 'bg-green-500/10 border-green-500/30',
    failure: 'bg-red-500/10 border-red-500/30'
  };

  const date = new Date(log.timestamp);
  const timeString = date.toLocaleTimeString('tr-TR');
  const dateString = date.toLocaleDateString('tr-TR');

  return {
    icon: icons[log.action] || '📝',
    title: actionTitles[log.action] || log.action,
    description: `${log.adminName} - ${log.resourceType} #${log.resourceId}`,
    timestamp: `${dateString} ${timeString}`,
    color: colors[log.status]
  };
}
