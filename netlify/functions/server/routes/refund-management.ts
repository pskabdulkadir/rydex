import { RequestHandler } from "express";

/**
 * GÖREV 11: Refund Management - İade Yönetimi
 * Ödeme iadesi sistemi
 * - İade talepleri
 * - İade durumu takibi
 * - İade geçmişi
 * - Kısmi ve tam iadeler
 */

interface RefundRequest {
  id: string;
  orderId: string;
  userId: string;
  amount: number;
  reason: string;
  status: "pending" | "approved" | "rejected" | "processed";
  createdAt: number;
  updatedAt: number;
  refundedAt?: number;
  processedBy?: string;
  notes?: string;
  attachments?: string[];
}

interface RefundTransaction {
  id: string;
  refundId: string;
  orderId: string;
  amount: number;
  method: string;
  timestamp: number;
  status: "pending" | "completed" | "failed";
  transactionId?: string;
  errorMessage?: string;
}

// Bellek içinde depolama
const refundRequests = new Map<string, RefundRequest>();
const refundTransactions = new Map<string, RefundTransaction>();
const refundSequence = { count: 0 };

// İade talebi oluştur
export const handleCreateRefundRequest: RequestHandler = async (req, res) => {
  try {
    const { orderId, userId, amount, reason } = req.body as {
      orderId: string;
      userId: string;
      amount: number;
      reason: string;
    };

    if (!orderId || !userId || !amount || !reason) {
      return res.status(400).json({
        success: false,
        error: "Tüm alanlar gerekli: orderId, userId, amount, reason",
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "İade tutarı pozitif olmalıdır",
      });
    }

    const refundId = `REF-${Date.now()}-${++refundSequence.count}`;
    const now = Date.now();

    const refundRequest: RefundRequest = {
      id: refundId,
      orderId,
      userId,
      amount,
      reason,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };

    refundRequests.set(refundId, refundRequest);

    console.log(`📝 İade talebi oluşturuldu (${refundId}): ${orderId} - ₺${amount}`);

    res.json({
      success: true,
      message: "İade talebi başarıyla oluşturuldu",
      refund: refundRequest,
    });
  } catch (error) {
    console.error("İade talebi oluşturma hatası:", error);
    res.status(500).json({
      success: false,
      error: "İade talebi oluşturulurken bir hata oluştu",
    });
  }
};

// İade talebini getir
export const handleGetRefundRequest: RequestHandler = async (req, res) => {
  try {
    const { refundId } = req.params as { refundId: string };

    if (!refundId) {
      return res.status(400).json({
        success: false,
        error: "İade ID'si gerekli",
      });
    }

    const refund = refundRequests.get(refundId);

    if (!refund) {
      return res.status(404).json({
        success: false,
        error: "İade talebi bulunamadı",
      });
    }

    res.json({
      success: true,
      refund,
    });
  } catch (error) {
    console.error("İade talebini getirme hatası:", error);
    res.status(500).json({
      success: false,
      error: "İade talebini getirilirken bir hata oluştu",
    });
  }
};

// Kullanıcının tüm iade taleplerini getir
export const handleGetUserRefunds: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.query as { userId: string };

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "User ID gerekli",
      });
    }

    const userRefunds = Array.from(refundRequests.values()).filter(
      (r) => r.userId === userId
    );

    const stats = {
      total: userRefunds.length,
      pending: userRefunds.filter((r) => r.status === "pending").length,
      approved: userRefunds.filter((r) => r.status === "approved").length,
      rejected: userRefunds.filter((r) => r.status === "rejected").length,
      processed: userRefunds.filter((r) => r.status === "processed").length,
      totalAmount: userRefunds.reduce((sum, r) => sum + r.amount, 0),
    };

    console.log(`📊 Kullanıcı iade talepleri alınıyor (${userId}): ${stats.total} talep`);

    res.json({
      success: true,
      refunds: userRefunds.sort((a, b) => b.createdAt - a.createdAt),
      stats,
    });
  } catch (error) {
    console.error("Kullanıcı iade taleplerini getirme hatası:", error);
    res.status(500).json({
      success: false,
      error: "Kullanıcı iade talepleri getirilirken bir hata oluştu",
    });
  }
};

// Belirtilen sipariş için iade taleplerini getir
export const handleGetOrderRefunds: RequestHandler = async (req, res) => {
  try {
    const { orderId } = req.params as { orderId: string };

    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: "Sipariş ID'si gerekli",
      });
    }

    const orderRefunds = Array.from(refundRequests.values()).filter(
      (r) => r.orderId === orderId
    );

    const totalRefunded = orderRefunds
      .filter((r) => r.status === "processed")
      .reduce((sum, r) => sum + r.amount, 0);

    res.json({
      success: true,
      refunds: orderRefunds,
      totalRefunded,
      refundCount: orderRefunds.length,
    });
  } catch (error) {
    console.error("Sipariş iade taleplerini getirme hatası:", error);
    res.status(500).json({
      success: false,
      error: "Sipariş iade talepleri getirilirken bir hata oluştu",
    });
  }
};

// İade talebini onayla
export const handleApproveRefund: RequestHandler = async (req, res) => {
  try {
    const { refundId, adminId, notes } = req.body as {
      refundId: string;
      adminId: string;
      notes?: string;
    };

    if (!refundId || !adminId) {
      return res.status(400).json({
        success: false,
        error: "İade ID'si ve yönetici ID'si gerekli",
      });
    }

    const refund = refundRequests.get(refundId);

    if (!refund) {
      return res.status(404).json({
        success: false,
        error: "İade talebi bulunamadı",
      });
    }

    if (refund.status !== "pending") {
      return res.status(400).json({
        success: false,
        error: `Bu iade talebi zaten ${refund.status} durumundadır`,
      });
    }

    refund.status = "approved";
    refund.updatedAt = Date.now();
    refund.processedBy = adminId;
    if (notes) refund.notes = notes;

    refundRequests.set(refundId, refund);

    console.log(`✅ İade talebi onaylandı (${refundId}): ₺${refund.amount}`);

    res.json({
      success: true,
      message: "İade talebi onaylandı",
      refund,
    });
  } catch (error) {
    console.error("İade talebini onaylama hatası:", error);
    res.status(500).json({
      success: false,
      error: "İade talebi onaylanırken bir hata oluştu",
    });
  }
};

// İade talebini reddet
export const handleRejectRefund: RequestHandler = async (req, res) => {
  try {
    const { refundId, adminId, reason } = req.body as {
      refundId: string;
      adminId: string;
      reason?: string;
    };

    if (!refundId || !adminId) {
      return res.status(400).json({
        success: false,
        error: "İade ID'si ve yönetici ID'si gerekli",
      });
    }

    const refund = refundRequests.get(refundId);

    if (!refund) {
      return res.status(404).json({
        success: false,
        error: "İade talebi bulunamadı",
      });
    }

    if (refund.status !== "pending") {
      return res.status(400).json({
        success: false,
        error: `Bu iade talebi zaten ${refund.status} durumundadır`,
      });
    }

    refund.status = "rejected";
    refund.updatedAt = Date.now();
    refund.processedBy = adminId;
    if (reason) refund.notes = reason;

    refundRequests.set(refundId, refund);

    console.log(`❌ İade talebi reddedildi (${refundId}): ${reason || "Belirtilmemiş"}`);

    res.json({
      success: true,
      message: "İade talebi reddedildi",
      refund,
    });
  } catch (error) {
    console.error("İade talebini reddetme hatası:", error);
    res.status(500).json({
      success: false,
      error: "İade talebi reddedilirken bir hata oluştu",
    });
  }
};

// İade işlemi başlat (Ödeme gerçekleştir)
export const handleProcessRefund: RequestHandler = async (req, res) => {
  try {
    const { refundId, paymentMethod, adminId } = req.body as {
      refundId: string;
      paymentMethod: string;
      adminId: string;
    };

    if (!refundId || !paymentMethod || !adminId) {
      return res.status(400).json({
        success: false,
        error: "İade ID'si, ödeme yöntemi ve yönetici ID'si gerekli",
      });
    }

    const refund = refundRequests.get(refundId);

    if (!refund) {
      return res.status(404).json({
        success: false,
        error: "İade talebi bulunamadı",
      });
    }

    if (refund.status !== "approved") {
      return res.status(400).json({
        success: false,
        error: "İade talebi onaylı değildir",
      });
    }

    // İade işlemi oluştur
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const refundTransaction: RefundTransaction = {
      id: transactionId,
      refundId,
      orderId: refund.orderId,
      amount: refund.amount,
      method: paymentMethod,
      timestamp: Date.now(),
      status: "pending",
      transactionId: `REFUND-${Date.now()}`,
    };

    // Gerçek ödeme sisteminde bu burada yapılır
    // Demo için hemen tamamlanmış olarak işaretleyelim (80% başarı)
    const isSuccess = Math.random() > 0.2;

    if (isSuccess) {
      refundTransaction.status = "completed";
      refund.status = "processed";
      refund.refundedAt = Date.now();

      console.log(
        `💰 İade işlemi tamamlandı (${transactionId}): ₺${refund.amount} ${paymentMethod} ile geri gönderildi`
      );
    } else {
      refundTransaction.status = "failed";
      refundTransaction.errorMessage = "Ödeme başarısız. Lütfen ödeme yönteminizi kontrol edin.";

      console.error(
        `⚠️ İade işlemi başarısız (${transactionId}): ${refundTransaction.errorMessage}`
      );
    }

    refundRequests.set(refundId, refund);
    refundTransactions.set(transactionId, refundTransaction);

    res.json({
      success: isSuccess,
      message: isSuccess
        ? "İade başarıyla işlendi"
        : "İade işlemi başarısız oldu",
      transaction: refundTransaction,
      refund,
    });
  } catch (error) {
    console.error("İade işleme hatası:", error);
    res.status(500).json({
      success: false,
      error: "İade işlenirken bir hata oluştu",
    });
  }
};

// İade işlem durumunu kontrol et
export const handleGetRefundTransactionStatus: RequestHandler = async (
  req,
  res
) => {
  try {
    const { transactionId } = req.params as { transactionId: string };

    if (!transactionId) {
      return res.status(400).json({
        success: false,
        error: "İşlem ID'si gerekli",
      });
    }

    const transaction = refundTransactions.get(transactionId);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: "İşlem bulunamadı",
      });
    }

    res.json({
      success: true,
      transaction,
    });
  } catch (error) {
    console.error("İade işlem durumunu kontrol hatası:", error);
    res.status(500).json({
      success: false,
      error: "İade işlem durumu kontrol edilirken bir hata oluştu",
    });
  }
};

// Tüm iade taleplerini getir (Admin)
export const handleGetAllRefunds: RequestHandler = async (req, res) => {
  try {
    const status = (req.query.status as string) || undefined;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 500);

    let allRefunds = Array.from(refundRequests.values());

    if (status) {
      allRefunds = allRefunds.filter((r) => r.status === status);
    }

    allRefunds = allRefunds.sort((a, b) => b.createdAt - a.createdAt).slice(0, limit);

    const stats = {
      total: refundRequests.size,
      pending: Array.from(refundRequests.values()).filter((r) => r.status === "pending").length,
      approved: Array.from(refundRequests.values()).filter((r) => r.status === "approved").length,
      rejected: Array.from(refundRequests.values()).filter((r) => r.status === "rejected").length,
      processed: Array.from(refundRequests.values()).filter((r) => r.status === "processed").length,
      totalAmount: Array.from(refundRequests.values()).reduce((sum, r) => sum + r.amount, 0),
      totalRefunded: Array.from(refundRequests.values())
        .filter((r) => r.status === "processed")
        .reduce((sum, r) => sum + r.amount, 0),
    };

    console.log(`📊 Tüm iade talepleri alınıyor: ${allRefunds.length} kayıt`);

    res.json({
      success: true,
      refunds: allRefunds,
      stats,
      total: refundRequests.size,
    });
  } catch (error) {
    console.error("Tüm iade taleplerini getirme hatası:", error);
    res.status(500).json({
      success: false,
      error: "İade talepleri getirilirken bir hata oluştu",
    });
  }
};

// İade istatistiklerini getir
export const handleGetRefundStatistics: RequestHandler = async (req, res) => {
  try {
    const allRefunds = Array.from(refundRequests.values());
    const allTransactions = Array.from(refundTransactions.values());

    const stats = {
      totalRefundRequests: allRefunds.length,
      totalRefundAmount: allRefunds.reduce((sum, r) => sum + r.amount, 0),
      refundsByStatus: {
        pending: allRefunds.filter((r) => r.status === "pending").length,
        approved: allRefunds.filter((r) => r.status === "approved").length,
        rejected: allRefunds.filter((r) => r.status === "rejected").length,
        processed: allRefunds.filter((r) => r.status === "processed").length,
      },
      refundedAmount: allRefunds
        .filter((r) => r.status === "processed")
        .reduce((sum, r) => sum + r.amount, 0),
      averageRefundAmount:
        allRefunds.length > 0
          ? allRefunds.reduce((sum, r) => sum + r.amount, 0) / allRefunds.length
          : 0,
      transactionStats: {
        total: allTransactions.length,
        completed: allTransactions.filter((t) => t.status === "completed").length,
        pending: allTransactions.filter((t) => t.status === "pending").length,
        failed: allTransactions.filter((t) => t.status === "failed").length,
      },
      successRate:
        allTransactions.length > 0
          ? (allTransactions.filter((t) => t.status === "completed").length /
              allTransactions.length) *
            100
          : 0,
    };

    console.log(`📈 İade istatistikleri: ${allRefunds.length} talep, ₺${stats.refundedAmount.toFixed(2)} iade edildi`);

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("İade istatistiklerini getirme hatası:", error);
    res.status(500).json({
      success: false,
      error: "İade istatistikleri getirilirken bir hata oluştu",
    });
  }
};
