import { RequestHandler } from "express";

/**
 * GÖREV 7: Bulk Operations
 * - Toplu seçme ve silme
 * - Toplu güncelleme
 * - Toplu durum değiştirme
 * - Toplu etiketleme
 */

interface BulkOperation {
  type: string; // users, payments, subscriptions, scans
  action: string; // delete, update, status, tag
  ids: string[];
  data?: Record<string, any>;
}

interface BulkResult {
  success: boolean;
  totalProcessed: number;
  successful: number;
  failed: number;
  errors: Array<{ id: string; error: string }>;
  details?: any;
}

// Test verileri depolama
const bulkDataStore = new Map<string, any>();

/**
 * Toplu silme işlemi
 */
export const handleBulkDelete: RequestHandler = async (req, res) => {
  try {
    const { type, ids } = req.body as { type: string; ids: string[] };

    if (!type || !ids || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Tür ve silecek ID'ler gerekli",
      });
    }

    if (ids.length > 1000) {
      return res.status(400).json({
        success: false,
        error: "Maksimum 1000 öğe aynı anda silinebilir",
      });
    }

    const result: BulkResult = {
      success: true,
      totalProcessed: ids.length,
      successful: 0,
      failed: 0,
      errors: [],
    };

    // Toplu silme operasyonu
    for (const id of ids) {
      try {
        // Veritabanından sil (mock işlem)
        bulkDataStore.delete(`${type}:${id}`);
        result.successful++;
      } catch (error) {
        result.failed++;
        result.errors.push({
          id,
          error: error instanceof Error ? error.message : "Bilinmeyen hata",
        });
      }
    }

    console.log(
      `🗑️ Toplu silme tamamlandı (${type}): ${result.successful}/${ids.length} başarılı`
    );

    res.json({
      success: result.successful > 0,
      totalProcessed: result.totalProcessed,
      successful: result.successful,
      failed: result.failed,
      message: `${result.successful} öğe başarıyla silindi, ${result.failed} başarısız oldu`,
      errors: result.errors.length > 0 ? result.errors : undefined,
    });
  } catch (error) {
    console.error("Toplu silme hatası:", error);
    res.status(500).json({
      success: false,
      error: "Toplu silme işlemi başarısız",
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Toplu güncelleme işlemi
 */
export const handleBulkUpdate: RequestHandler = async (req, res) => {
  try {
    const { type, ids, data } = req.body as {
      type: string;
      ids: string[];
      data: Record<string, any>;
    };

    if (!type || !ids || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Tür ve güncellenecek ID'ler gerekli",
      });
    }

    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({
        success: false,
        error: "Güncellenecek veriler gerekli",
      });
    }

    if (ids.length > 1000) {
      return res.status(400).json({
        success: false,
        error: "Maksimum 1000 öğe aynı anda güncellenebilir",
      });
    }

    const result: BulkResult = {
      success: true,
      totalProcessed: ids.length,
      successful: 0,
      failed: 0,
      errors: [],
      details: {
        updatedFields: Object.keys(data),
      },
    };

    // Toplu güncelleme operasyonu
    for (const id of ids) {
      try {
        const key = `${type}:${id}`;
        const existing = bulkDataStore.get(key) || {};
        const updated = { ...existing, ...data, updatedAt: Date.now() };
        bulkDataStore.set(key, updated);
        result.successful++;
      } catch (error) {
        result.failed++;
        result.errors.push({
          id,
          error: error instanceof Error ? error.message : "Bilinmeyen hata",
        });
      }
    }

    console.log(
      `✏️ Toplu güncelleme tamamlandı (${type}): ${result.successful}/${ids.length} başarılı`
    );

    res.json({
      success: result.successful > 0,
      totalProcessed: result.totalProcessed,
      successful: result.successful,
      failed: result.failed,
      message: `${result.successful} öğe başarıyla güncellendi, ${result.failed} başarısız oldu`,
      updatedFields: data,
      errors: result.errors.length > 0 ? result.errors : undefined,
    });
  } catch (error) {
    console.error("Toplu güncelleme hatası:", error);
    res.status(500).json({
      success: false,
      error: "Toplu güncelleme işlemi başarısız",
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Toplu durum değiştirme
 */
export const handleBulkStatusChange: RequestHandler = async (req, res) => {
  try {
    const { type, ids, status } = req.body as {
      type: string;
      ids: string[];
      status: string;
    };

    if (!type || !ids || ids.length === 0 || !status) {
      return res.status(400).json({
        success: false,
        error: "Tür, ID'ler ve yeni durum gerekli",
      });
    }

    if (ids.length > 1000) {
      return res.status(400).json({
        success: false,
        error: "Maksimum 1000 öğenin durumu aynı anda değiştirilebilir",
      });
    }

    const result: BulkResult = {
      success: true,
      totalProcessed: ids.length,
      successful: 0,
      failed: 0,
      errors: [],
      details: {
        newStatus: status,
      },
    };

    // Toplu durum değiştirme
    for (const id of ids) {
      try {
        const key = `${type}:${id}`;
        const existing = bulkDataStore.get(key) || {};
        const updated = { ...existing, status, updatedAt: Date.now() };
        bulkDataStore.set(key, updated);
        result.successful++;
      } catch (error) {
        result.failed++;
        result.errors.push({
          id,
          error: error instanceof Error ? error.message : "Bilinmeyen hata",
        });
      }
    }

    console.log(
      `🔄 Toplu durum değişimi tamamlandı (${type}): ${result.successful}/${ids.length} başarılı`
    );

    res.json({
      success: result.successful > 0,
      totalProcessed: result.totalProcessed,
      successful: result.successful,
      failed: result.failed,
      message: `${result.successful} öğenin durumu '${status}' olarak güncellendi`,
      newStatus: status,
      errors: result.errors.length > 0 ? result.errors : undefined,
    });
  } catch (error) {
    console.error("Toplu durum değiştirme hatası:", error);
    res.status(500).json({
      success: false,
      error: "Toplu durum değiştirme işlemi başarısız",
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Toplu etiketleme
 */
export const handleBulkTag: RequestHandler = async (req, res) => {
  try {
    const { type, ids, tags } = req.body as {
      type: string;
      ids: string[];
      tags: string[];
    };

    if (!type || !ids || ids.length === 0 || !tags || tags.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Tür, ID'ler ve etiketler gerekli",
      });
    }

    if (ids.length > 1000) {
      return res.status(400).json({
        success: false,
        error: "Maksimum 1000 öğeye aynı anda etiket eklenebilir",
      });
    }

    const result: BulkResult = {
      success: true,
      totalProcessed: ids.length,
      successful: 0,
      failed: 0,
      errors: [],
      details: {
        addedTags: tags,
      },
    };

    // Toplu etiketleme
    for (const id of ids) {
      try {
        const key = `${type}:${id}`;
        const existing = bulkDataStore.get(key) || { tags: [] };
        const existingTags = existing.tags || [];
        const newTags = [...new Set([...existingTags, ...tags])];
        const updated = { ...existing, tags: newTags, updatedAt: Date.now() };
        bulkDataStore.set(key, updated);
        result.successful++;
      } catch (error) {
        result.failed++;
        result.errors.push({
          id,
          error: error instanceof Error ? error.message : "Bilinmeyen hata",
        });
      }
    }

    console.log(
      `🏷️ Toplu etiketleme tamamlandı (${type}): ${result.successful}/${ids.length} başarılı`
    );

    res.json({
      success: result.successful > 0,
      totalProcessed: result.totalProcessed,
      successful: result.successful,
      failed: result.failed,
      message: `${result.successful} öğeye etiketler eklendi`,
      addedTags: tags,
      errors: result.errors.length > 0 ? result.errors : undefined,
    });
  } catch (error) {
    console.error("Toplu etiketleme hatası:", error);
    res.status(500).json({
      success: false,
      error: "Toplu etiketleme işlemi başarısız",
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Toplu etiket kaldırma
 */
export const handleBulkUntag: RequestHandler = async (req, res) => {
  try {
    const { type, ids, tags } = req.body as {
      type: string;
      ids: string[];
      tags: string[];
    };

    if (!type || !ids || ids.length === 0 || !tags || tags.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Tür, ID'ler ve kaldırılacak etiketler gerekli",
      });
    }

    const result: BulkResult = {
      success: true,
      totalProcessed: ids.length,
      successful: 0,
      failed: 0,
      errors: [],
      details: {
        removedTags: tags,
      },
    };

    // Toplu etiket kaldırma
    for (const id of ids) {
      try {
        const key = `${type}:${id}`;
        const existing = bulkDataStore.get(key) || { tags: [] };
        const existingTags = existing.tags || [];
        const newTags = existingTags.filter((tag: string) => !tags.includes(tag));
        const updated = { ...existing, tags: newTags, updatedAt: Date.now() };
        bulkDataStore.set(key, updated);
        result.successful++;
      } catch (error) {
        result.failed++;
        result.errors.push({
          id,
          error: error instanceof Error ? error.message : "Bilinmeyen hata",
        });
      }
    }

    console.log(
      `🏷️ Toplu etiket kaldırma tamamlandı (${type}): ${result.successful}/${ids.length} başarılı`
    );

    res.json({
      success: result.successful > 0,
      totalProcessed: result.totalProcessed,
      successful: result.successful,
      failed: result.failed,
      message: `${result.successful} öğeden etiketler kaldırıldı`,
      removedTags: tags,
      errors: result.errors.length > 0 ? result.errors : undefined,
    });
  } catch (error) {
    console.error("Toplu etiket kaldırma hatası:", error);
    res.status(500).json({
      success: false,
      error: "Toplu etiket kaldırma işlemi başarısız",
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Toplu işlem durumunu kontrol et
 */
export const handleGetBulkOperationStatus: RequestHandler = async (
  req,
  res
) => {
  try {
    const { operationId } = req.params;

    if (!operationId) {
      return res.status(400).json({
        success: false,
        error: "İşlem ID'si gerekli",
      });
    }

    // Mock - gerçek uygulamada veritabanından çekilir
    const status = {
      id: operationId,
      status: "completed",
      progress: 100,
      successful: 50,
      failed: 0,
      total: 50,
    };

    res.json({
      success: true,
      operation: status,
    });
  } catch (error) {
    console.error("Toplu işlem durumu kontrol hatası:", error);
    res.status(500).json({
      success: false,
      error: "Toplu işlem durumu kontrol edilirken hata oluştu",
    });
  }
};

/**
 * Toplu seçim doğrulaması (IDs var mı vs)
 */
export const handleValidateBulkSelection: RequestHandler = async (
  req,
  res
) => {
  try {
    const { type, ids } = req.body as { type: string; ids: string[] };

    if (!type || !ids || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Tür ve ID'ler gerekli",
      });
    }

    const validation = {
      totalSelected: ids.length,
      valid: true,
      warnings: [] as string[],
      maxAllowed: 1000,
    };

    if (ids.length > 1000) {
      validation.valid = false;
      validation.warnings.push("Maksimum 1000 öğe seçilebilir");
    }

    if (ids.length === 0) {
      validation.warnings.push("Hiç öğe seçilmemiş");
    }

    // Eksik/yinelenen IDs check
    const uniqueIds = new Set(ids);
    if (uniqueIds.size !== ids.length) {
      validation.warnings.push("Bazı ID'ler yinelenen, bunlar kaldırıldı");
    }

    res.json({
      success: validation.valid,
      validation: {
        totalSelected: validation.totalSelected,
        totalUnique: uniqueIds.size,
        maxAllowed: validation.maxAllowed,
        warnings: validation.warnings,
        canProceed: validation.valid && validation.totalSelected > 0,
      },
    });
  } catch (error) {
    console.error("Toplu seçim doğrulaması hatası:", error);
    res.status(500).json({
      success: false,
      error: "Toplu seçim doğrulama hatası",
    });
  }
};
