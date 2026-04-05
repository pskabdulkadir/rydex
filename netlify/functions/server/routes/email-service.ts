/**
 * Email Service
 * Escrow onay/red ve user bilgilendirme emailleri
 */

import { RequestHandler } from 'express';

interface EmailTemplate {
  to: string;
  subject: string;
  htmlBody: string;
  textBody: string;
  type: 'escrow_approved' | 'escrow_rejected' | 'escrow_delivered' | 'payment_received' | 'refund_processed';
}

// In-memory email log (production'da database'e yazılmalı)
const emailLogs: any[] = [];

/**
 * Email template'leri
 */
const emailTemplates = {
  escrow_approved: (userName: string, amount: number, packageName: string): EmailTemplate => ({
    to: '',
    subject: '✅ Master License Satın Alımınız Onaylandı',
    htmlBody: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #0f172a; padding: 20px; border-radius: 12px; color: white;">
          <h2 style="color: #4ade80; margin-bottom: 20px;">✅ Satın Alımınız Onaylandı</h2>
          
          <p>Merhaba <strong>${userName}</strong>,</p>
          
          <p>Master License satın alımınızın ödeme onaylandı. İşleminizin detayları aşağıda yer almaktadır:</p>
          
          <div style="background-color: #1e293b; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Paket:</strong> ${packageName}</p>
            <p><strong>Tutar:</strong> ₺${amount.toLocaleString('tr-TR')}</p>
            <p><strong>Durum:</strong> <span style="color: #4ade80;">✓ Onaylandı</span></p>
          </div>
          
          <p>Kaynak kodunuz yakında gönderilebilir duruma getiriliyor. Ayrıca ekip tarafından elle kontrol edilmektedir.</p>
          
          <p style="margin-top: 30px; font-size: 12px; color: #94a3b8;">
            Bu bir otomatik email'dir. Lütfen yanıtlamayınız.
          </p>
        </div>
      </div>
    `,
    textBody: `Merhaba ${userName},\n\nMaster License satın alımınızın ödeme onaylandı.\n\nTutar: ₺${amount.toLocaleString('tr-TR')}\nPaket: ${packageName}\nDurum: Onaylandı\n\nKaynak kodunuz yakında gönderilebilir duruma getiriliyor.`,
    type: 'escrow_approved'
  }),

  escrow_rejected: (userName: string, amount: number, reason: string = 'Belgeler yetersiz'): EmailTemplate => ({
    to: '',
    subject: '❌ Master License Satın Alımınız Reddedildi',
    htmlBody: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #0f172a; padding: 20px; border-radius: 12px; color: white;">
          <h2 style="color: #ef4444; margin-bottom: 20px;">❌ Satın Alımınız Reddedildi</h2>
          
          <p>Merhaba <strong>${userName}</strong>,</p>
          
          <p>Üzülerek bildiririz ki Master License satın alım talebiniz reddedilmiştir.</p>
          
          <div style="background-color: #7f1d1d; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Tutar:</strong> ₺${amount.toLocaleString('tr-TR')}</p>
            <p><strong>Durum:</strong> <span style="color: #fca5a5;">✗ Reddedildi</span></p>
            <p><strong>Sebep:</strong> ${reason}</p>
          </div>
          
          <p>Para iadesi 3-5 iş günü içinde hesabınıza geri yatırılacaktır.</p>
          
          <p style="margin-top: 20px;">Sorularınız varsa lütfen <a href="mailto:support@example.com" style="color: #60a5fa;">destek</a>'e başvurunuz.</p>
          
          <p style="margin-top: 30px; font-size: 12px; color: #94a3b8;">
            Bu bir otomatik email'dir. Lütfen yanıtlamayınız.
          </p>
        </div>
      </div>
    `,
    textBody: `Merhaba ${userName},\n\nMaster License satın alım talebiniz reddedilmiştir.\n\nTutar: ₺${amount.toLocaleString('tr-TR')}\nDurum: Reddedildi\nSebep: ${reason}\n\nPara iadesi 3-5 iş günü içinde hesabınıza geri yatırılacaktır.`,
    type: 'escrow_rejected'
  }),

  escrow_delivered: (userName: string, downloadLink: string = 'https://example.com/download'): EmailTemplate => ({
    to: '',
    subject: '📦 Master License Kaynak Kodunuz Hazır',
    htmlBody: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #0f172a; padding: 20px; border-radius: 12px; color: white;">
          <h2 style="color: #60a5fa; margin-bottom: 20px;">📦 Kaynak Kodunuz Hazır</h2>
          
          <p>Merhaba <strong>${userName}</strong>,</p>
          
          <p>Harika! Master License kaynak kodunuz indirmeye hazır.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${downloadLink}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">
              📥 Kaynak Kodunu İndir
            </a>
          </div>
          
          <p><strong>Önemli Bilgiler:</strong></p>
          <ul style="color: #e2e8f0;">
            <li>İndirme linki 30 gün boyunca geçerlidir</li>
            <li>Kaynak kod GNU GPL v3 lisansı altında verilmektedir</li>
            <li>Teknoloji desteği için <a href="mailto:support@example.com" style="color: #60a5fa;">destek</a> ile iletişime geçin</li>
          </ul>
          
          <p style="margin-top: 30px; font-size: 12px; color: #94a3b8;">
            Bu bir otomatik email'dir. Lütfen yanıtlamayınız.
          </p>
        </div>
      </div>
    `,
    textBody: `Merhaba ${userName},\n\nMaster License kaynak kodunuz indirmeye hazır.\n\nİndirme: ${downloadLink}\n\nİndirme linki 30 gün boyunca geçerlidir.`,
    type: 'escrow_delivered'
  }),

  payment_received: (userName: string, amount: number, transactionId: string): EmailTemplate => ({
    to: '',
    subject: '✅ Ödemeniz Alındı',
    htmlBody: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #0f172a; padding: 20px; border-radius: 12px; color: white;">
          <h2 style="color: #4ade80; margin-bottom: 20px;">✅ Ödemeniz Alındı</h2>
          
          <p>Merhaba <strong>${userName}</strong>,</p>
          
          <p>Ödemeniz başarıyla alınmıştır. İşlem detayları:</p>
          
          <div style="background-color: #1e293b; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Tutar:</strong> ₺${amount.toLocaleString('tr-TR')}</p>
            <p><strong>İşlem ID:</strong> ${transactionId}</p>
            <p><strong>Tarih:</strong> ${new Date().toLocaleDateString('tr-TR')}</p>
          </div>
          
          <p style="margin-top: 30px; font-size: 12px; color: #94a3b8;">
            Bu bir otomatik email'dir. Lütfen yanıtlamayınız.
          </p>
        </div>
      </div>
    `,
    textBody: `Merhaba ${userName},\n\nÖdemeniz başarıyla alınmıştır.\n\nTutar: ₺${amount.toLocaleString('tr-TR')}\nİşlem ID: ${transactionId}`,
    type: 'payment_received'
  }),

  refund_processed: (userName: string, amount: number): EmailTemplate => ({
    to: '',
    subject: '↩️ Para İadeniz İşleniyor',
    htmlBody: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #0f172a; padding: 20px; border-radius: 12px; color: white;">
          <h2 style="color: #60a5fa; margin-bottom: 20px;">↩️ Para İadeniz İşleniyor</h2>
          
          <p>Merhaba <strong>${userName}</strong>,</p>
          
          <p>Başarılı bir şekilde başlatılan para iadesi başvurunuz işlenmeye alınmıştır.</p>
          
          <div style="background-color: #1e293b; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Tutar:</strong> ₺${amount.toLocaleString('tr-TR')}</p>
            <p><strong>Durum:</strong> İşleniyor</p>
            <p><strong>Tahmini Zaman:</strong> 3-5 iş günü</p>
          </div>
          
          <p>Para iadeniz 3-5 iş günü içinde orijinal ödeme yönteminize geri yatırılacaktır.</p>
          
          <p style="margin-top: 30px; font-size: 12px; color: #94a3b8;">
            Bu bir otomatik email'dir. Lütfen yanıtlamayınız.
          </p>
        </div>
      </div>
    `,
    textBody: `Merhaba ${userName},\n\nPara iadesi başvurunuz işleniyor.\n\nTutar: ₺${amount.toLocaleString('tr-TR')}\nTahmini Zaman: 3-5 iş günü`,
    type: 'refund_processed'
  })
};

/**
 * Email gönder (mock)
 * Production'da Nodemailer veya AWS SES kullanılmalı
 */
export async function sendEmail(template: EmailTemplate): Promise<boolean> {
  try {
    // Log email (console)
    console.log(`📧 Email gönderiliyor: ${template.to}`);
    console.log(`   Konu: ${template.subject}`);
    console.log(`   Tür: ${template.type}`);

    // Email log'u kaydet
    emailLogs.push({
      id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      to: template.to,
      subject: template.subject,
      type: template.type,
      timestamp: Date.now(),
      status: 'sent'
    });

    // Production'da gerçek email gönder:
    // const transporter = nodemailer.createTransport({...});
    // await transporter.sendMail({...});

    return true;
  } catch (error) {
    console.error('Email gönderme hatası:', error);
    return false;
  }
}

/**
 * Escrow Onaylandı Emaili
 * POST /api/email/escrow-approved
 */
export const handleEscrowApprovedEmail: RequestHandler = async (req, res) => {
  try {
    const { userEmail, userName, amount, packageName } = req.body;

    const template = emailTemplates.escrow_approved(userName, amount, packageName);
    template.to = userEmail;

    const sent = await sendEmail(template);

    res.json({
      success: sent,
      message: sent ? 'Email gönderildi' : 'Email gönderilemedi',
      templateType: 'escrow_approved'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Email gönderme hatası'
    });
  }
};

/**
 * Escrow Reddedildi Emaili
 * POST /api/email/escrow-rejected
 */
export const handleEscrowRejectedEmail: RequestHandler = async (req, res) => {
  try {
    const { userEmail, userName, amount, reason } = req.body;

    const template = emailTemplates.escrow_rejected(userName, amount, reason);
    template.to = userEmail;

    const sent = await sendEmail(template);

    res.json({
      success: sent,
      message: sent ? 'Email gönderildi' : 'Email gönderilemedi',
      templateType: 'escrow_rejected'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Email gönderme hatası'
    });
  }
};

/**
 * Escrow Teslim Edildi Emaili
 * POST /api/email/escrow-delivered
 */
export const handleEscrowDeliveredEmail: RequestHandler = async (req, res) => {
  try {
    const { userEmail, userName, downloadLink } = req.body;

    const template = emailTemplates.escrow_delivered(userName, downloadLink);
    template.to = userEmail;

    const sent = await sendEmail(template);

    res.json({
      success: sent,
      message: sent ? 'Email gönderildi' : 'Email gönderilemedi',
      templateType: 'escrow_delivered'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Email gönderme hatası'
    });
  }
};

/**
 * Ödeme Alındı Emaili
 * POST /api/email/payment-received
 */
export const handlePaymentReceivedEmail: RequestHandler = async (req, res) => {
  try {
    const { userEmail, userName, amount, transactionId } = req.body;

    const template = emailTemplates.payment_received(userName, amount, transactionId);
    template.to = userEmail;

    const sent = await sendEmail(template);

    res.json({
      success: sent,
      message: sent ? 'Email gönderildi' : 'Email gönderilemedi',
      templateType: 'payment_received'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Email gönderme hatası'
    });
  }
};

/**
 * Para İadesi Emaili
 * POST /api/email/refund-processed
 */
export const handleRefundProcessedEmail: RequestHandler = async (req, res) => {
  try {
    const { userEmail, userName, amount } = req.body;

    const template = emailTemplates.refund_processed(userName, amount);
    template.to = userEmail;

    const sent = await sendEmail(template);

    res.json({
      success: sent,
      message: sent ? 'Email gönderildi' : 'Email gönderilemedi',
      templateType: 'refund_processed'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Email gönderme hatası'
    });
  }
};

/**
 * Email loglarını al
 * GET /api/email/logs
 */
export const handleGetEmailLogs: RequestHandler = (req, res) => {
  const { limit = '100' } = req.query;

  const limited = emailLogs.slice(-parseInt(limit as string)).reverse();

  res.json({
    success: true,
    total: emailLogs.length,
    logs: limited
  });
};
