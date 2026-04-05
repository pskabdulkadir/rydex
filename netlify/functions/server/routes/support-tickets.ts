import { RequestHandler } from "express";

/**
 * GÖREV 14: Support Ticket System - Destek Bilet Sistemi
 * Müşteri destek taleplerine yanıt sistemi
 * - Bilet oluşturma
 * - Bilet kategorileri
 * - Mesaj gönderme
 * - Bilet takibi
 * - Yönetici atanması
 */

type TicketStatus = "open" | "in_progress" | "waiting_customer" | "resolved" | "closed";
type TicketPriority = "low" | "medium" | "high" | "critical";
type TicketCategory = "bug" | "feature_request" | "billing" | "general" | "other";

interface SupportTicket {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: number;
  updatedAt: number;
  resolvedAt?: number;
  assignedTo?: string;
  messages: TicketMessage[];
  attachments?: string[];
  estimatedResolutionTime?: number;
  tags?: string[];
}

interface TicketMessage {
  id: string;
  ticketId: string;
  sender: {
    id: string;
    name: string;
    role: "customer" | "support" | "admin";
  };
  content: string;
  attachments?: string[];
  createdAt: number;
  isResolutionNote?: boolean;
}

// Bellek içinde depolama
const tickets = new Map<string, SupportTicket>();
const ticketMessages = new Map<string, TicketMessage[]>();
const ticketSequence = { count: 0 };

// Kategori seçenekleri
const TICKET_CATEGORIES: Record<TicketCategory, string> = {
  bug: "Hata Bildirimi",
  feature_request: "Özellik İsteği",
  billing: "Faturalandırma",
  general: "Genel Soru",
  other: "Diğer",
};

/**
 * Yeni destek bilet oluştur
 */
export const handleCreateTicket: RequestHandler = async (req, res) => {
  try {
    const { userId, title, description, category, priority } = req.body as {
      userId: string;
      title: string;
      description: string;
      category: TicketCategory;
      priority: TicketPriority;
    };

    if (!userId || !title || !description || !category) {
      return res.status(400).json({
        success: false,
        error: "Tüm alanlar gerekli: userId, title, description, category",
      });
    }

    if (!["bug", "feature_request", "billing", "general", "other"].includes(category)) {
      return res.status(400).json({
        success: false,
        error: "Geçersiz kategori",
      });
    }

    const ticketId = `TKT-${Date.now()}-${++ticketSequence.count}`;
    const now = Date.now();

    const ticket: SupportTicket = {
      id: ticketId,
      userId,
      title,
      description,
      category,
      priority: priority || "medium",
      status: "open",
      createdAt: now,
      updatedAt: now,
      messages: [
        {
          id: `MSG-${now}`,
          ticketId,
          sender: {
            id: userId,
            name: `Kullanıcı ${userId}`,
            role: "customer",
          },
          content: description,
          createdAt: now,
        },
      ],
    };

    tickets.set(ticketId, ticket);
    ticketMessages.set(ticketId, ticket.messages);

    console.log(
      `🎟️ Destek bilet oluşturuldu (${ticketId}): ${title} (${category})`
    );

    res.json({
      success: true,
      message: "Destek bilet başarıyla oluşturuldu",
      ticket,
    });
  } catch (error) {
    console.error("Destek bilet oluşturma hatası:", error);
    res.status(500).json({
      success: false,
      error: "Destek bilet oluşturulurken bir hata oluştu",
    });
  }
};

/**
 * Destek biletini getir
 */
export const handleGetTicket: RequestHandler = async (req, res) => {
  try {
    const { ticketId } = req.params as { ticketId: string };

    if (!ticketId) {
      return res.status(400).json({
        success: false,
        error: "Bilet ID'si gerekli",
      });
    }

    const ticket = tickets.get(ticketId);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: "Destek bilet bulunamadı",
      });
    }

    res.json({
      success: true,
      ticket,
    });
  } catch (error) {
    console.error("Destek biletini getirme hatası:", error);
    res.status(500).json({
      success: false,
      error: "Destek biletini getirilirken bir hata oluştu",
    });
  }
};

/**
 * Kullanıcının tüm biletlerini getir
 */
export const handleGetUserTickets: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.query as { userId: string };

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "User ID gerekli",
      });
    }

    const userTickets = Array.from(tickets.values())
      .filter((t) => t.userId === userId)
      .sort((a, b) => b.createdAt - a.createdAt);

    const stats = {
      total: userTickets.length,
      open: userTickets.filter((t) => t.status === "open").length,
      in_progress: userTickets.filter((t) => t.status === "in_progress").length,
      waiting_customer: userTickets.filter((t) => t.status === "waiting_customer")
        .length,
      resolved: userTickets.filter((t) => t.status === "resolved").length,
    };

    console.log(`📋 Kullanıcı biletleri alınıyor (${userId}): ${stats.total} bilet`);

    res.json({
      success: true,
      tickets: userTickets,
      stats,
    });
  } catch (error) {
    console.error("Kullanıcı biletlerini getirme hatası:", error);
    res.status(500).json({
      success: false,
      error: "Kullanıcı biletleri getirilirken bir hata oluştu",
    });
  }
};

/**
 * Bilete mesaj ekle
 */
export const handleAddTicketMessage: RequestHandler = async (req, res) => {
  try {
    const { ticketId, userId, content, role } = req.body as {
      ticketId: string;
      userId: string;
      content: string;
      role: "customer" | "support" | "admin";
    };

    if (!ticketId || !userId || !content) {
      return res.status(400).json({
        success: false,
        error: "Bilet ID, User ID ve içerik gerekli",
      });
    }

    const ticket = tickets.get(ticketId);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: "Destek bilet bulunamadı",
      });
    }

    const message: TicketMessage = {
      id: `MSG-${Date.now()}`,
      ticketId,
      sender: {
        id: userId,
        name: role === "customer" ? `Kullanıcı ${userId}` : `${role.toUpperCase()} ${userId}`,
        role,
      },
      content,
      createdAt: Date.now(),
    };

    ticket.messages.push(message);
    ticket.updatedAt = Date.now();

    // Müşteri cevap verdiyse "waiting_customer" statüsünü kaldır
    if (role === "customer" && ticket.status === "waiting_customer") {
      ticket.status = "in_progress";
    }

    tickets.set(ticketId, ticket);
    ticketMessages.set(ticketId, ticket.messages);

    console.log(`💬 Bilete mesaj eklendi (${ticketId}): ${role}`);

    res.json({
      success: true,
      message: "Mesaj başarıyla eklendi",
      ticketMessage: message,
      ticket,
    });
  } catch (error) {
    console.error("Bilete mesaj ekleme hatası:", error);
    res.status(500).json({
      success: false,
      error: "Bilete mesaj eklenirken bir hata oluştu",
    });
  }
};

/**
 * Bilet durumunu güncelle
 */
export const handleUpdateTicketStatus: RequestHandler = async (req, res) => {
  try {
    const { ticketId, status, adminId } = req.body as {
      ticketId: string;
      status: TicketStatus;
      adminId: string;
    };

    if (!ticketId || !status || !adminId) {
      return res.status(400).json({
        success: false,
        error: "Bilet ID, status ve admin ID gerekli",
      });
    }

    const ticket = tickets.get(ticketId);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: "Destek bilet bulunamadı",
      });
    }

    const oldStatus = ticket.status;
    ticket.status = status;
    ticket.updatedAt = Date.now();

    if (status === "resolved" || status === "closed") {
      ticket.resolvedAt = Date.now();
    }

    // Yönetici notu ekle
    const adminNote: TicketMessage = {
      id: `MSG-${Date.now()}`,
      ticketId,
      sender: {
        id: adminId,
        name: `Admin ${adminId}`,
        role: "admin",
      },
      content: `Bilet durumu "${oldStatus}" -> "${status}" olarak güncellendi`,
      createdAt: Date.now(),
      isResolutionNote: true,
    };

    ticket.messages.push(adminNote);
    tickets.set(ticketId, ticket);

    console.log(`📌 Bilet durumu güncellendi (${ticketId}): ${oldStatus} -> ${status}`);

    res.json({
      success: true,
      message: "Bilet durumu başarıyla güncellendi",
      ticket,
    });
  } catch (error) {
    console.error("Bilet durumunu güncelleme hatası:", error);
    res.status(500).json({
      success: false,
      error: "Bilet durumu güncellenirken bir hata oluştu",
    });
  }
};

/**
 * Bilete yönetici ata
 */
export const handleAssignTicket: RequestHandler = async (req, res) => {
  try {
    const { ticketId, adminId } = req.body as {
      ticketId: string;
      adminId: string;
    };

    if (!ticketId || !adminId) {
      return res.status(400).json({
        success: false,
        error: "Bilet ID ve admin ID gerekli",
      });
    }

    const ticket = tickets.get(ticketId);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: "Destek bilet bulunamadı",
      });
    }

    ticket.assignedTo = adminId;
    ticket.updatedAt = Date.now();
    ticket.status = "in_progress";

    // Atama notu ekle
    const assignmentNote: TicketMessage = {
      id: `MSG-${Date.now()}`,
      ticketId,
      sender: {
        id: adminId,
        name: `Admin ${adminId}`,
        role: "admin",
      },
      content: `Bilet ${adminId} tarafından alındı`,
      createdAt: Date.now(),
      isResolutionNote: true,
    };

    ticket.messages.push(assignmentNote);
    tickets.set(ticketId, ticket);

    console.log(`👤 Bilete yönetici atandı (${ticketId}): ${adminId}`);

    res.json({
      success: true,
      message: "Bilet başarıyla yöneticiye atandı",
      ticket,
    });
  } catch (error) {
    console.error("Bilete yönetici atama hatası:", error);
    res.status(500).json({
      success: false,
      error: "Bilete yönetici atanırken bir hata oluştu",
    });
  }
};

/**
 * Tüm biletleri getir (Admin)
 */
export const handleGetAllTickets: RequestHandler = async (req, res) => {
  try {
    const status = req.query.status as string | undefined;
    const category = req.query.category as string | undefined;
    const priority = req.query.priority as string | undefined;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 500);

    let allTickets = Array.from(tickets.values());

    if (status) allTickets = allTickets.filter((t) => t.status === status);
    if (category) allTickets = allTickets.filter((t) => t.category === category);
    if (priority) allTickets = allTickets.filter((t) => t.priority === priority);

    allTickets = allTickets.sort((a, b) => b.createdAt - a.createdAt).slice(0, limit);

    const stats = {
      total: tickets.size,
      open: Array.from(tickets.values()).filter((t) => t.status === "open").length,
      in_progress: Array.from(tickets.values()).filter((t) => t.status === "in_progress")
        .length,
      waiting_customer: Array.from(tickets.values()).filter(
        (t) => t.status === "waiting_customer"
      ).length,
      resolved: Array.from(tickets.values()).filter((t) => t.status === "resolved")
        .length,
      critical: Array.from(tickets.values()).filter((t) => t.priority === "critical")
        .length,
      high: Array.from(tickets.values()).filter((t) => t.priority === "high").length,
    };

    console.log(`📊 Tüm biletler alınıyor: ${allTickets.length} kayıt`);

    res.json({
      success: true,
      tickets: allTickets,
      stats,
      total: tickets.size,
    });
  } catch (error) {
    console.error("Tüm biletleri getirme hatası:", error);
    res.status(500).json({
      success: false,
      error: "Biletler getirilirken bir hata oluştu",
    });
  }
};

/**
 * Bilet istatistiklerini getir
 */
export const handleGetTicketStatistics: RequestHandler = async (req, res) => {
  try {
    const allTickets = Array.from(tickets.values());

    const stats = {
      total: allTickets.length,
      byStatus: {
        open: allTickets.filter((t) => t.status === "open").length,
        in_progress: allTickets.filter((t) => t.status === "in_progress").length,
        waiting_customer: allTickets.filter((t) => t.status === "waiting_customer")
          .length,
        resolved: allTickets.filter((t) => t.status === "resolved").length,
        closed: allTickets.filter((t) => t.status === "closed").length,
      },
      byPriority: {
        critical: allTickets.filter((t) => t.priority === "critical").length,
        high: allTickets.filter((t) => t.priority === "high").length,
        medium: allTickets.filter((t) => t.priority === "medium").length,
        low: allTickets.filter((t) => t.priority === "low").length,
      },
      byCategory: Object.keys(TICKET_CATEGORIES).reduce(
        (acc, cat) => {
          acc[cat] = allTickets.filter((t) => t.category === cat).length;
          return acc;
        },
        {} as Record<string, number>
      ),
      avgResponseTime: allTickets.length > 0
        ? allTickets.reduce((sum, t) => sum + (t.messages.length > 0 ? 1 : 0), 0) /
          allTickets.length
        : 0,
      avgResolutionTime:
        allTickets.filter((t) => t.resolvedAt).length > 0
          ? allTickets
              .filter((t) => t.resolvedAt)
              .reduce((sum, t) => sum + (t.resolvedAt! - t.createdAt), 0) /
            allTickets.filter((t) => t.resolvedAt).length
          : 0,
    };

    console.log(`📈 Bilet istatistikleri: ${stats.total} bilet`);

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Bilet istatistiklerini getirme hatası:", error);
    res.status(500).json({
      success: false,
      error: "Bilet istatistikleri getirilirken bir hata oluştu",
    });
  }
};

/**
 * Biletler arasında arama yapıı
 */
export const handleSearchTickets: RequestHandler = async (req, res) => {
  try {
    const { query } = req.query as { query: string };

    if (!query) {
      return res.status(400).json({
        success: false,
        error: "Arama sorgusu gerekli",
      });
    }

    const results = Array.from(tickets.values()).filter(
      (t) =>
        t.id.toLowerCase().includes(query.toLowerCase()) ||
        t.title.toLowerCase().includes(query.toLowerCase()) ||
        t.description.toLowerCase().includes(query.toLowerCase())
    );

    console.log(`🔍 Bilet araması yapıldı: "${query}" (${results.length} sonuç)`);

    res.json({
      success: true,
      results,
      count: results.length,
    });
  } catch (error) {
    console.error("Bilet arama hatası:", error);
    res.status(500).json({
      success: false,
      error: "Biletler aranırken bir hata oluştu",
    });
  }
};
