/**
 * GÖREV 9: Luhn Algorithm
 * - Kredi kartı numarası doğrulaması
 * - Checksum hesaplama
 * - Kart tipi tespiti
 */

/**
 * Luhn algoritması - Kredi kartı doğrulaması
 * @param cardNumber Kredi kartı numarası (boşluk ve çizgi olmadan)
 * @returns Geçerli ise true, değilse false
 */
export function validateLuhn(cardNumber: string): boolean {
  // Sadece rakamları al
  const cleaned = cardNumber.replace(/\D/g, "");

  // 13-19 karakter arasında olmalı
  if (cleaned.length < 13 || cleaned.length > 19) {
    return false;
  }

  let sum = 0;
  let isEven = false;

  // Sağdan sola doğru işle
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);

    // Her ikinci digit'i (sağdan başlayarak) 2 ile çarp
    if (isEven) {
      digit *= 2;
      // Sonuç 9'dan büyükse, rakamları topla (örneğin 16 -> 1+6=7)
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  // Toplam 10'a bölünebiliyorsa geçerli
  return sum % 10 === 0;
}

/**
 * Kredi kartı tipini tespit et
 */
export function detectCardType(cardNumber: string): CardType {
  const cleaned = cardNumber.replace(/\D/g, "");

  if (!cleaned) {
    return "unknown";
  }

  // Visa: 4 ile başlar
  if (/^4/.test(cleaned)) {
    return "visa";
  }

  // Mastercard: 51-55 veya 2221-2720 arasında başlar
  if (/^(5[1-5]|2[2-7])/.test(cleaned)) {
    return "mastercard";
  }

  // American Express: 34 veya 37 ile başlar
  if (/^3[47]/.test(cleaned)) {
    return "amex";
  }

  // Diners Club: 36, 38 veya 300-305 ile başlar
  if (/^(36|38|30[0-5])/.test(cleaned)) {
    return "diners";
  }

  // Discover: 6011, 622126-622925, 644-649 veya 65 ile başlar
  if (/^(6011|622[1-9]|64[4-9]|65)/.test(cleaned)) {
    return "discover";
  }

  // JCB: 3528-3589 arasında başlar
  if (/^35[2-8][0-9]/.test(cleaned)) {
    return "jcb";
  }

  // Maestro: 50, 56-69 arasında başlar
  if (/^(50|5[6-9]|6[0-9])/.test(cleaned)) {
    return "maestro";
  }

  // Türk kartları: 6304 (Denizbank), 6703, 6704 (Garanti), vb.
  if (/^630[4]/.test(cleaned)) {
    return "denizbank";
  }

  if (/^670[34]/.test(cleaned)) {
    return "garanti";
  }

  if (/^627593/.test(cleaned)) {
    return "ziraatbank";
  }

  return "unknown";
}

/**
 * Kredi kartı bilgilerini doğrula (numara + CVV + tarih)
 */
export function validateCreditCard(cardData: {
  cardNumber: string;
  cvv: string;
  expiryMonth: string | number;
  expiryYear: string | number;
  cardholderName?: string;
}): CardValidationResult {
  const errors: string[] = [];

  // Kart numarası doğrulaması
  if (!cardData.cardNumber) {
    errors.push("Kart numarası gerekli");
  } else if (!validateLuhn(cardData.cardNumber)) {
    errors.push("Geçersiz kart numarası");
  }

  // CVV doğrulaması
  const cardType = detectCardType(cardData.cardNumber);
  const cvvLength = cardType === "amex" ? 4 : 3;

  if (!cardData.cvv) {
    errors.push("CVV gerekli");
  } else if (!/^\d{3,4}$/.test(cardData.cvv.trim())) {
    errors.push("Geçersiz CVV formatı");
  } else if (cardData.cvv.length !== cvvLength) {
    errors.push(
      `${cardType === "amex" ? "American Express" : "Diğer kartlar"} için CVV ${cvvLength} haneli olmalıdır`
    );
  }

  // Son kullanma tarihi doğrulaması
  const month = parseInt(String(cardData.expiryMonth), 10);
  const year = parseInt(String(cardData.expiryYear), 10);

  if (!cardData.expiryMonth || !cardData.expiryYear) {
    errors.push("Son kullanma tarihi gerekli");
  } else if (month < 1 || month > 12) {
    errors.push("Geçersiz ay (01-12 arasında olmalı)");
  } else if (year < 100) {
    // 2 haneli yıl girişi (ör: 25 -> 2025)
    const currentYear = new Date().getFullYear() % 100;
    if (year < currentYear) {
      errors.push("Kartı süresi dolmuş");
    }
  } else if (year >= 100) {
    // 4 haneli yıl
    const now = new Date();
    const expiryDate = new Date(year, month, 0);
    if (expiryDate < now) {
      errors.push("Kartı süresi dolmuş");
    }
  }

  // Kart sahibi adı doğrulaması (isteğe bağlı)
  if (cardData.cardholderName && cardData.cardholderName.trim().length < 3) {
    errors.push("Kart sahibi adı en az 3 karakterden oluşmalıdır");
  }

  return {
    isValid: errors.length === 0,
    errors,
    cardType,
    last4Digits: cardData.cardNumber.slice(-4),
  };
}

/**
 * Kart numarası maskele (görüntü için)
 */
export function maskCardNumber(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\D/g, "");
  if (cleaned.length < 4) {
    return "****";
  }
  const last4 = cleaned.slice(-4);
  return `**** **** **** ${last4}`;
}

/**
 * Luhn checksum'ını hesapla
 */
export function calculateLuhnChecksum(partialCardNumber: string): string {
  const cleaned = partialCardNumber.replace(/\D/g, "");

  let sum = 0;
  let isEven = (cleaned.length + 1) % 2 === 0;

  for (let i = 0; i < cleaned.length; i++) {
    let digit = parseInt(cleaned[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  // 10'a tamamlanacak rakamı bul
  const checksum = (10 - (sum % 10)) % 10;
  return checksum.toString();
}

/**
 * Kart numarası formatla (boşluklı hale getir)
 */
export function formatCardNumber(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\D/g, "");
  const groups: string[] = [];

  // Standart format: 4444 4444 4444 4444 (16 haneli)
  // Amex format: 3782 822463 10005 (15 haneli)
  let groupSize = 4;

  // Amex ise farklı format
  if (detectCardType(cardNumber) === "amex") {
    groupSize = 4; // 4-6-5 formatında
  }

  for (let i = 0; i < cleaned.length; i += groupSize) {
    groups.push(cleaned.slice(i, i + groupSize));
  }

  return groups.join(" ");
}

/**
 * Geçerli son kullanma tarihleri al (gelecek 20 yıl)
 */
export function getValidExpiryYears(startYear?: number): number[] {
  const start = startYear || new Date().getFullYear();
  const years: number[] = [];

  for (let i = 0; i < 20; i++) {
    years.push(start + i);
  }

  return years;
}

/**
 * Geçerli ayları al
 */
export function getValidExpiryMonths(): string[] {
  return Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
}

// Types
export type CardType = "visa" | "mastercard" | "amex" | "diners" | "discover" | "jcb" | "maestro" | "denizbank" | "garanti" | "ziraatbank" | "unknown";

export interface CardValidationResult {
  isValid: boolean;
  errors: string[];
  cardType: CardType;
  last4Digits: string;
}

/**
 * Test data
 */
export const TEST_CARDS = {
  // Geçerli test kartları
  visa: "4532015112830366",
  mastercard: "5425233010103442",
  amex: "374245455400126",
  discover: "6011111111111117",
  diners: "36148906568541",
  jcb: "3530111333300000",
  maestro: "6762697046930695",
  
  // Geçersiz kartlar
  invalid: "4532015112830367",
  shortNumber: "123",
};
