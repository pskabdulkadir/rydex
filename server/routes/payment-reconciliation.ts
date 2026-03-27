import { RequestHandler } from "express";

/**
 * GÖREV 13: Payment Reconciliation - Ödeme Uzlaştırması
 * Ödeme sistemi ile veritabanı arasındaki tutarsızlıkları bulma ve çözme
 * - Ödemeler arası eşleştirme
 * - Tutarsızlık raporlaması
 * - Otomatik uzlaştırma
 */

interface Payment {
  id: string;
  orderId: string;
  userId: string;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed" | "refunded";
  paymentMethod: string;
  createdAt: number;
  completedAt?: number;
  gatewayTransactionId?: string;
  reconciled: boolean;
  reconcilationDate?: number;
}

interface ReconciliationReport {
  id: string;
  timestamp: number;
  totalPayments: number;
  reconciledPayments: number;
  unreconciledPayments: number;
  discrepancies: Discrepancy[];
  totalAmount: number;
  reconciledAmount: number;
  unreconciledAmount: number;
  status: "pending" | "completed" | "warning" | "error";
}

interface Discrepancy {
  id: string;
  type: "missing_in_db" | "missing_in_gateway" | "amount_mismatch" | "status_mismatch";
  paymentId?: string;
  gatewayTransactionId?: string;
  description: string;
  affectedAmount?: number;
  severity: "low" | "medium" | "high";
  resolved: boolean;
  resolution?: string;
  resolvedAt?: number;
}

interface GatewayTransaction {
  id: string;
  transactionId: string;
  amount: number;
  currency: string;
  status: string;
  timestamp: number;
  metadata?: {
    orderId?: string;
    userId?: string;
  };
}

// Bellek içinde depolama
const payments = new Map<string, Payment>();
const reconciliationReports = new Map<string, ReconciliationReport>();
const discrepancies = new Map<string, Discrepancy>();
const gatewayTransactions: GatewayTransaction[] = [];

// Demo veri
function generateDemoData() {
  const now = Date.now();

  // Bazı ödemeler ekle
  for (let i = 1; i <= 10; i++) {
    const paymentId = `PAY-${1000 + i}`;
    payments.set(paymentId, {
      id: paymentId,
      orderId: `ORD-${2000 + i}`,
      userId: `user-${100 + i}`,
      amount: Math.random() * 1000,
      currency: "TRY",
      status: ["completed", "pending", "failed"][Math.floor(Math.random() * 3)] as any,
      paymentMethod: "credit_card",
      createdAt: now - i * 86400000,
      completedAt: i % 2 === 0 ? now - i * 86400000 + 3600000 : undefined,
      gatewayTransactionId: i % 3 === 0 ? `GW-${5000 + i}` : undefined,
      reconciled: i % 2 === 0,
      reconcilationDate: i % 2 === 0 ? now - i * 86400000 + 7200000 : undefined,
    });
  }

  // Gateway işlemleri ekle
  for (let i = 1; i <= 8; i++) {
    gatewayTransactions.push({
      id: `GW-${5000 + i}`,
      transactionId: `TXN-${6000 + i}`,
      amount: Math.random() * 1000,
      currency: "TRY",
      status: "completed",
      timestamp: now - i * 86400000,
      metadata: {
        orderId: `ORD-${2000 + i}`,
        userId: `user-${100 + i}`,
      },
    });
  }
}

// Demo veri oluştur
generateDemoData();

/**
 * Tüm ödemeleri uzlaştırmayı başlat
 */
export const handleStartReconciliation: RequestHandler = async (req, res) => {
  try {
    const reportId = `REC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const report: ReconciliationReport = {
      id: reportId,
      timestamp: Date.now(),
      totalPayments: payments.size,
      reconciledPayments: 0,
      unreconciledPayments: 0,
      discrepancies: [],
      totalAmount: 0,
      reconciledAmount: 0,
      unreconciledAmount: 0,
      status: "pending",
    };

    // Tüm ödemeleri kontrol et
    const reconciledSet = new Set<string>();

    for (const [paymentId, payment] of payments.entries()) {
      report.totalAmount += payment.amount;

      // Gateway'de karşılık gelen işlem ara
      const gatewayMatch = gatewayTransactions.find(
        (gt) =>
          (gt.metadata?.orderId === payment.orderId ||
            gt.id === payment.gatewayTransactionId) &&
          Math.abs(gt.amount - payment.amount) < 0.01 // Tuple toleransı
      );

      if (gatewayMatch) {
        // Eşleştirme başarılı
        reconciledSet.add(paymentId);
        report.reconciledPayments++;
        report.reconciledAmount += payment.amount;

        // Ödemeyi reconciled olarak işaretle
        payment.reconciled = true;
        payment.reconcilationDate = Date.now();
        payments.set(paymentId, payment);
      } else {
        // Eşleştirme başarısız
        report.unreconciledPayments++;
        report.unreconciledAmount += payment.amount;

        // Discrepancy ekle
        const discrepancyId = `DIS-${Date.now()}-${Math.random()}`;
        const discrepancy: Discrepancy = {
          id: discrepancyId,
          type: "missing_in_gateway",
          paymentId,
          description: `Ödeme ${paymentId} gateway'de bulunamadı`,
          affectedAmount: payment.amount,
          severity: payment.status === "completed" ? "high" : "low",
          resolved: false,
        };

        report.discrepancies.push(discrepancy);
        discrepancies.set(discrepancyId, discrepancy);
      }
    }

    // Gateway'de bizde olmayan işlemleri ara
    for (const gatewayTx of gatewayTransactions) {
      const paymentMatch = Array.from(payments.values()).find(
        (p) =>
          (p.orderId === gatewayTx.metadata?.orderId ||
            p.gatewayTransactionId === gatewayTx.id) &&
          Math.abs(p.amount - gatewayTx.amount) < 0.01
      );

      if (!paymentMatch) {
        const discrepancyId = `DIS-${Date.now()}-${Math.random()}`;
        const discrepancy: Discrepancy = {
          id: discrepancyId,
          type: "missing_in_db",
          gatewayTransactionId: gatewayTx.id,
          description: `Gateway işlemi ${gatewayTx.id} veritabanında bulunamadı`,
          affectedAmount: gatewayTx.amount,
          severity: "high",
          resolved: false,
        };

        report.discrepancies.push(discrepancy);
        discrepancies.set(discrepancyId, discrepancy);
      }
    }

    // Rapor durumunu belirle
    if (report.discrepancies.length === 0) {
      report.status = "completed";
      console.log(`✅ Uzlaştırma başarılı (${reportId}): Sorun yok`);
    } else if (
      report.discrepancies.some((d) => d.severity === "high")
    ) {
      report.status = "error";
      console.error(
        `❌ Uzlaştırma hatası (${reportId}): ${report.discrepancies.filter((d) => d.severity === "high").length} ciddi sorun`
      );
    } else {
      report.status = "warning";
      console.warn(
        `⚠️ Uzlaştırma uyarı (${reportId}): ${report.discrepancies.length} uyarı`
      );
    }

    reconciliationReports.set(reportId, report);

    res.json({
      success: true,
      message: "Uzlaştırma başarıyla tamamlandı",
      report,
    });
  } catch (error) {
    console.error("Uzlaştırma hatası:", error);
    res.status(500).json({
      success: false,
      error: "Uzlaştırma sırasında bir hata oluştu",
    });
  }
};

/**
 * Uzlaştırma raporunu getir
 */
export const handleGetReconciliationReport: RequestHandler = async (req, res) => {
  try {
    const { reportId } = req.params as { reportId: string };

    if (!reportId) {
      return res.status(400).json({
        success: false,
        error: "Rapor ID'si gerekli",
      });
    }

    const report = reconciliationReports.get(reportId);

    if (!report) {
      return res.status(404).json({
        success: false,
        error: "Rapor bulunamadı",
      });
    }

    res.json({
      success: true,
      report,
    });
  } catch (error) {
    console.error("Uzlaştırma raporu getirme hatası:", error);
    res.status(500).json({
      success: false,
      error: "Uzlaştırma raporu getirilirken bir hata oluştu",
    });
  }
};

/**
 * Tüm uzlaştırma raporlarını getir
 */
export const handleGetAllReconciliationReports: RequestHandler = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 500);
    const reports = Array.from(reconciliationReports.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);

    const stats = {
      total: reconciliationReports.size,
      completed: Array.from(reconciliationReports.values()).filter((r) => r.status === "completed")
        .length,
      error: Array.from(reconciliationReports.values()).filter((r) => r.status === "error").length,
      warning: Array.from(reconciliationReports.values()).filter((r) => r.status === "warning")
        .length,
    };

    console.log(
      `📊 Uzlaştırma raporları alınıyor: ${reports.length} kayıt`
    );

    res.json({
      success: true,
      reports,
      stats,
      total: reconciliationReports.size,
    });
  } catch (error) {
    console.error("Tüm uzlaştırma raporlarını getirme hatası:", error);
    res.status(500).json({
      success: false,
      error: "Uzlaştırma raporları getirilirken bir hata oluştu",
    });
  }
};

/**
 * Tutarsızlık hakkında bilgi getir
 */
export const handleGetDiscrepancy: RequestHandler = async (req, res) => {
  try {
    const { discrepancyId } = req.params as { discrepancyId: string };

    if (!discrepancyId) {
      return res.status(400).json({
        success: false,
        error: "Tutarsızlık ID'si gerekli",
      });
    }

    const discrepancy = discrepancies.get(discrepancyId);

    if (!discrepancy) {
      return res.status(404).json({
        success: false,
        error: "Tutarsızlık bulunamadı",
      });
    }

    res.json({
      success: true,
      discrepancy,
    });
  } catch (error) {
    console.error("Tutarsızlık getirme hatası:", error);
    res.status(500).json({
      success: false,
      error: "Tutarsızlık getirilirken bir hata oluştu",
    });
  }
};

/**
 * Tutarsızlığı çöz
 */
export const handleResolveDiscrepancy: RequestHandler = async (req, res) => {
  try {
    const { discrepancyId, resolution, action } = req.body as {
      discrepancyId: string;
      resolution: string;
      action: "ignore" | "refund" | "collect" | "correct";
    };

    if (!discrepancyId || !resolution || !action) {
      return res.status(400).json({
        success: false,
        error: "Tutarsızlık ID'si, çözüm ve aksiyon gerekli",
      });
    }

    const discrepancy = discrepancies.get(discrepancyId);

    if (!discrepancy) {
      return res.status(404).json({
        success: false,
        error: "Tutarsızlık bulunamadı",
      });
    }

    if (discrepancy.resolved) {
      return res.status(400).json({
        success: false,
        error: "Bu tutarsızlık zaten çözülmüş",
      });
    }

    // Tutarsızlığı çöz
    discrepancy.resolved = true;
    discrepancy.resolution = `${action.toUpperCase()}: ${resolution}`;
    discrepancy.resolvedAt = Date.now();

    discrepancies.set(discrepancyId, discrepancy);

    console.log(
      `✅ Tutarsızlık çözüldü (${discrepancyId}): ${action.toUpperCase()}`
    );

    res.json({
      success: true,
      message: "Tutarsızlık başarıyla çözüldü",
      discrepancy,
    });
  } catch (error) {
    console.error("Tutarsızlık çözme hatası:", error);
    res.status(500).json({
      success: false,
      error: "Tutarsızlık çözülürken bir hata oluştu",
    });
  }
};

/**
 * Çözümlenmemiş tutarsızlıkları getir
 */
export const handleGetUnresolvedDiscrepancies: RequestHandler = async (req, res) => {
  try {
    const severity = req.query.severity as string | undefined;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 500);

    let unresolvedDiscrepancies = Array.from(discrepancies.values()).filter(
      (d) => !d.resolved
    );

    if (severity) {
      unresolvedDiscrepancies = unresolvedDiscrepancies.filter(
        (d) => d.severity === severity
      );
    }

    unresolvedDiscrepancies = unresolvedDiscrepancies.slice(0, limit);

    const stats = {
      total: Array.from(discrepancies.values()).filter((d) => !d.resolved).length,
      high: unresolvedDiscrepancies.filter((d) => d.severity === "high").length,
      medium: unresolvedDiscrepancies.filter((d) => d.severity === "medium")
        .length,
      low: unresolvedDiscrepancies.filter((d) => d.severity === "low").length,
      totalAffectedAmount: unresolvedDiscrepancies.reduce(
        (sum, d) => sum + (d.affectedAmount || 0),
        0
      ),
    };

    console.log(
      `📊 Çözümlenmemiş tutarsızlıklar: ${stats.total} kayıt (₺${stats.totalAffectedAmount.toFixed(2)})`
    );

    res.json({
      success: true,
      discrepancies: unresolvedDiscrepancies,
      stats,
    });
  } catch (error) {
    console.error("Çözümlenmemiş tutarsızlıkları getirme hatası:", error);
    res.status(500).json({
      success: false,
      error: "Çözümlenmemiş tutarsızlıklar getirilirken bir hata oluştu",
    });
  }
};

/**
 * Ödeme detaylarını getir
 */
export const handleGetPaymentDetails: RequestHandler = async (req, res) => {
  try {
    const { paymentId } = req.params as { paymentId: string };

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        error: "Ödeme ID'si gerekli",
      });
    }

    const payment = payments.get(paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: "Ödeme bulunamadı",
      });
    }

    res.json({
      success: true,
      payment,
    });
  } catch (error) {
    console.error("Ödeme detaylarını getirme hatası:", error);
    res.status(500).json({
      success: false,
      error: "Ödeme detayları getirilirken bir hata oluştu",
    });
  }
};

/**
 * Uzlaştırma istatistiklerini getir
 */
export const handleGetReconciliationStats: RequestHandler = async (req, res) => {
  try {
    const allPayments = Array.from(payments.values());
    const allReports = Array.from(reconciliationReports.values());
    const allDiscrepancies = Array.from(discrepancies.values());

    const stats = {
      totalPayments: allPayments.length,
      reconciledPayments: allPayments.filter((p) => p.reconciled).length,
      unreconciledPayments: allPayments.filter((p) => !p.reconciled).length,
      totalAmount: allPayments.reduce((sum, p) => sum + p.amount, 0),
      reconciledAmount: allPayments
        .filter((p) => p.reconciled)
        .reduce((sum, p) => sum + p.amount, 0),
      unreconciledAmount: allPayments
        .filter((p) => !p.reconciled)
        .reduce((sum, p) => sum + p.amount, 0),
      reconciliationRate:
        allPayments.length > 0
          ? (allPayments.filter((p) => p.reconciled).length / allPayments.length) *
            100
          : 0,
      totalReports: allReports.length,
      latestReport: allReports.length > 0 ? allReports[0] : null,
      totalDiscrepancies: allDiscrepancies.length,
      unresolvedDiscrepancies: allDiscrepancies.filter((d) => !d.resolved).length,
      highSeverityDiscrepancies: allDiscrepancies.filter((d) => d.severity === "high")
        .length,
      totalAffectedAmount: allDiscrepancies.reduce(
        (sum, d) => sum + (d.affectedAmount || 0),
        0
      ),
    };

    console.log(
      `📈 Uzlaştırma istatistikleri: %${stats.reconciliationRate.toFixed(2)} uzlaştırıldı`
    );

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Uzlaştırma istatistiklerini getirme hatası:", error);
    res.status(500).json({
      success: false,
      error: "Uzlaştırma istatistikleri getirilirken bir hata oluştu",
    });
  }
};
