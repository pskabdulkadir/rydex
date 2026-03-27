import { RequestHandler } from "express";
import {
  validateLuhn,
  detectCardType,
  validateCreditCard,
  maskCardNumber,
  calculateLuhnChecksum,
  formatCardNumber,
  CardValidationResult,
} from "@shared/luhn-validator";

/**
 * Luhn algoritmasını kontrol et
 */
export const handleValidateLuhn: RequestHandler = async (req, res) => {
  try {
    const { cardNumber } = req.body as { cardNumber: string };

    if (!cardNumber) {
      return res.status(400).json({
        success: false,
        error: "Kart numarası gerekli",
      });
    }

    const isValid = validateLuhn(cardNumber);

    res.json({
      success: true,
      cardNumber: maskCardNumber(cardNumber),
      isValid,
      message: isValid
        ? "Kart numarası geçerli"
        : "Kart numarası geçersiz (Luhn kontrolü başarısız)",
    });
  } catch (error) {
    console.error("Luhn doğrulama hatası:", error);
    res.status(500).json({
      success: false,
      error: "Kart doğrulama sırasında hata oluştu",
    });
  }
};

/**
 * Kredi kartı türünü tespit et
 */
export const handleDetectCardType: RequestHandler = async (req, res) => {
  try {
    const { cardNumber } = req.body as { cardNumber: string };

    if (!cardNumber) {
      return res.status(400).json({
        success: false,
        error: "Kart numarası gerekli",
      });
    }

    const cardType = detectCardType(cardNumber);
    const cardTypeNames: Record<string, string> = {
      visa: "Visa",
      mastercard: "Mastercard",
      amex: "American Express",
      diners: "Diners Club",
      discover: "Discover",
      jcb: "JCB",
      maestro: "Maestro",
      denizbank: "Denizbank",
      garanti: "Garanti Bankası",
      ziraatbank: "Ziraat Bankası",
      unknown: "Bilinmeyen",
    };

    res.json({
      success: true,
      cardType,
      cardTypeName: cardTypeNames[cardType] || "Bilinmeyen",
      cardNumber: maskCardNumber(cardNumber),
    });
  } catch (error) {
    console.error("Kart türü tespiti hatası:", error);
    res.status(500).json({
      success: false,
      error: "Kart türü tespit sırasında hata oluştu",
    });
  }
};

/**
 * Tam kredi kartı doğrulaması
 */
export const handleValidateCreditCard: RequestHandler = async (req, res) => {
  try {
    const {
      cardNumber,
      cvv,
      expiryMonth,
      expiryYear,
      cardholderName,
    } = req.body as {
      cardNumber: string;
      cvv: string;
      expiryMonth: string | number;
      expiryYear: string | number;
      cardholderName?: string;
    };

    if (!cardNumber || !cvv || !expiryMonth || !expiryYear) {
      return res.status(400).json({
        success: false,
        error: "Tüm kredi kartı bilgileri gerekli",
      });
    }

    const result = validateCreditCard({
      cardNumber,
      cvv,
      expiryMonth,
      expiryYear,
      cardholderName,
    });

    res.json({
      success: result.isValid,
      isValid: result.isValid,
      cardType: result.cardType,
      maskedCardNumber: maskCardNumber(cardNumber),
      last4Digits: result.last4Digits,
      errors: result.errors.length > 0 ? result.errors : undefined,
      message: result.isValid
        ? "Kredi kartı bilgileri geçerli"
        : "Kredi kartı doğrulama başarısız",
    });

    // Geçerli kartlar için detaylı log
    if (result.isValid) {
      console.log(
        `✅ Kredi kartı doğrulaması başarılı (${result.cardType}): ****${result.last4Digits}`
      );
    } else {
      console.log(
        `❌ Kredi kartı doğrulama başarısız: ${result.errors.join(", ")}`
      );
    }
  } catch (error) {
    console.error("Kredi kartı doğrulama hatası:", error);
    res.status(500).json({
      success: false,
      error: "Kredi kartı doğrulama sırasında hata oluştu",
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Kart numarası maskele
 */
export const handleMaskCardNumber: RequestHandler = async (req, res) => {
  try {
    const { cardNumber } = req.body as { cardNumber: string };

    if (!cardNumber) {
      return res.status(400).json({
        success: false,
        error: "Kart numarası gerekli",
      });
    }

    const masked = maskCardNumber(cardNumber);

    res.json({
      success: true,
      masked,
      original: cardNumber,
    });
  } catch (error) {
    console.error("Kart maskeleme hatası:", error);
    res.status(500).json({
      success: false,
      error: "Kart maskeleme sırasında hata oluştu",
    });
  }
};

/**
 * Luhn checksum'ını hesapla
 */
export const handleCalculateChecksum: RequestHandler = async (req, res) => {
  try {
    const { cardNumber } = req.body as { cardNumber: string };

    if (!cardNumber) {
      return res.status(400).json({
        success: false,
        error: "Kart numarası gerekli",
      });
    }

    const checksum = calculateLuhnChecksum(cardNumber);
    const completeCardNumber = cardNumber.trim() + checksum;

    res.json({
      success: true,
      checksum,
      completeCardNumber,
      isValidAfter: validateLuhn(completeCardNumber),
    });
  } catch (error) {
    console.error("Checksum hesaplama hatası:", error);
    res.status(500).json({
      success: false,
      error: "Checksum hesaplama sırasında hata oluştu",
    });
  }
};

/**
 * Kart numarası formatla
 */
export const handleFormatCardNumber: RequestHandler = async (req, res) => {
  try {
    const { cardNumber } = req.body as { cardNumber: string };

    if (!cardNumber) {
      return res.status(400).json({
        success: false,
        error: "Kart numarası gerekli",
      });
    }

    const formatted = formatCardNumber(cardNumber);

    res.json({
      success: true,
      formatted,
      original: cardNumber,
    });
  } catch (error) {
    console.error("Kart formatı hatası:", error);
    res.status(500).json({
      success: false,
      error: "Kart formatı sırasında hata oluştu",
    });
  }
};

/**
 * Test kartları kontrol et
 */
export const handleGetTestCards: RequestHandler = async (req, res) => {
  const testCards = {
    visa: "4532015112830366",
    mastercard: "5425233010103442",
    amex: "374245455400126",
    discover: "6011111111111117",
    diners: "36148906568541",
    jcb: "3530111333300000",
    maestro: "6762697046930695",
  };

  const results: Record<
    string,
    {
      cardNumber: string;
      masked: string;
      type: string;
      valid: boolean;
    }
  > = {};

  for (const [name, cardNumber] of Object.entries(testCards)) {
    results[name] = {
      cardNumber,
      masked: maskCardNumber(cardNumber),
      type: detectCardType(cardNumber),
      valid: validateLuhn(cardNumber),
    };
  }

  res.json({
    success: true,
    message: "Test kartları (Luhn algoritması ile doğrulanmış)",
    cards: results,
  });
};
