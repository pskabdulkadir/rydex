/**
 * Payment Validation Library
 * Kredi kartı ve ödeme bilgisi doğrulaması
 */

/**
 * Luhn Algoritması - Kredi kartı numarasını doğrulama
 * https://en.wikipedia.org/wiki/Luhn_algorithm
 */
export function validateCardNumber(cardNumber: string): boolean {
  // Boşlukları ve tire işaretlerini kaldır
  const cleaned = cardNumber.replace(/\s/g, '').replace(/-/g, '');

  // Sadece rakam olması gerekli
  if (!/^\d+$/.test(cleaned)) {
    return false;
  }

  // Minimum 13, maksimum 19 hane (standart kredi kartları 16 haneli)
  if (cleaned.length < 13 || cleaned.length > 19) {
    return false;
  }

  // Luhn algoritması uygulanıyor
  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
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

  return sum % 10 === 0;
}

/**
 * Kart türünü tanı
 */
export function getCardType(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\s/g, '').replace(/-/g, '');

  if (/^4[0-9]{12}(?:[0-9]{3})?$/.test(cleaned)) {
    return 'Visa';
  } else if (/^5[1-5][0-9]{14}$/.test(cleaned)) {
    return 'Mastercard';
  } else if (/^3[47][0-9]{13}$/.test(cleaned)) {
    return 'American Express';
  } else if (/^6(?:011|5[0-9]{2})[0-9]{12}$/.test(cleaned)) {
    return 'Discover';
  } else if (/^(?:2131|1800|35\d{3})\d{11}$/.test(cleaned)) {
    return 'JCB';
  }

  return 'Bilinmeyen';
}

/**
 * Kart numarasını maskeleyerek göster
 * Örn: 4532 **** **** 9010
 */
export function maskCardNumber(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\s/g, '').replace(/-/g, '');

  if (cleaned.length < 8) {
    return cleaned;
  }

  const first4 = cleaned.substring(0, 4);
  const last4 = cleaned.substring(cleaned.length - 4);

  return `${first4} **** **** ${last4}`;
}

/**
 * CVV Doğrulama
 * Visa/Mastercard/Discover: 3 hane
 * American Express: 4 hane
 */
export function validateCVV(cvv: string, cardType: string): boolean {
  const cleaned = cvv.replace(/\s/g, '');

  if (!/^\d+$/.test(cleaned)) {
    return false;
  }

  if (cardType === 'American Express') {
    return cleaned.length === 4;
  } else {
    return cleaned.length === 3;
  }
}

/**
 * Geçerlilik Tarihi Doğrulama
 * Format: MM/YY veya MM/YYYY
 */
export function validateExpiryDate(expiryDate: string): boolean {
  const parts = expiryDate.split('/');

  if (parts.length !== 2) {
    return false;
  }

  const month = parseInt(parts[0], 10);
  const year = parseInt(parts[1], 10);

  // Ay kontrolü (1-12)
  if (month < 1 || month > 12) {
    return false;
  }

  // Yıl kontrolü (2 veya 4 haneli)
  let fullYear = year;
  if (year < 100) {
    fullYear = 2000 + year;
  }

  // Bugün ve ilerisi olmalı
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;

  if (fullYear < currentYear) {
    return false;
  }

  if (fullYear === currentYear && month < currentMonth) {
    return false;
  }

  return true;
}

/**
 * Tam Kredi Kartı Doğrulama
 */
export interface CardValidationResult {
  valid: boolean;
  cardNumber: boolean;
  cardName: boolean;
  expiryDate: boolean;
  cvv: boolean;
  errors: string[];
}

export function validateCreditCard(
  cardNumber: string,
  cardName: string,
  expiryDate: string,
  cvv: string
): CardValidationResult {
  const errors: string[] = [];

  // Kart numarası doğrulama
  const cardNumberValid = validateCardNumber(cardNumber);
  if (!cardNumberValid) {
    errors.push('Geçersiz kart numarası');
  }

  // Kart sahibinin adı doğrulama
  const cardNameValid = cardName.trim().length >= 3;
  if (!cardNameValid) {
    errors.push('Kart sahibinin adı en az 3 karakter olmalıdır');
  }

  // Geçerlilik tarihi doğrulama
  const expiryValid = validateExpiryDate(expiryDate);
  if (!expiryValid) {
    errors.push('Geçersiz geçerlilik tarihi (MM/YY formatında girin)');
  }

  // CVV doğrulama
  const cardType = getCardType(cardNumber);
  const cvvValid = validateCVV(cvv, cardType);
  if (!cvvValid) {
    const cvvLength = cardType === 'American Express' ? '4' : '3';
    errors.push(`CVV ${cvvLength} haneli olmalıdır`);
  }

  return {
    valid: cardNumberValid && cardNameValid && expiryValid && cvvValid,
    cardNumber: cardNumberValid,
    cardName: cardNameValid,
    expiryDate: expiryValid,
    cvv: cvvValid,
    errors
  };
}

/**
 * IBAN Doğrulama
 */
export function validateIBAN(iban: string): boolean {
  // Boşlukları kaldır ve uppercase yap
  const cleaned = iban.replace(/\s/g, '').toUpperCase();

  // Minimum 15, maksimum 34 karakter
  if (cleaned.length < 15 || cleaned.length > 34) {
    return false;
  }

  // IBAN format kontrolü (2 harf + 2 hane + geri kalanı)
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(cleaned)) {
    return false;
  }

  // Check digit doğrulama (IBAN mod-97)
  const rearranged = cleaned.substring(4) + cleaned.substring(0, 4);
  const numeric = rearranged.replace(/[A-Z]/g, (char) => {
    return (char.charCodeAt(0) - 55).toString();
  });

  // BigInt ile mod-97 hesaplama
  try {
    const mod = BigInt(numeric) % BigInt(97);
    return mod === BigInt(1);
  } catch {
    return false;
  }
}

/**
 * Email Doğrulama
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Tam Banka Transferi Doğrulama
 */
export interface BankTransferValidationResult {
  valid: boolean;
  iban: boolean;
  accountHolder: boolean;
  errors: string[];
}

export function validateBankTransfer(
  iban: string,
  accountHolder: string
): BankTransferValidationResult {
  const errors: string[] = [];

  const ibanValid = validateIBAN(iban);
  if (!ibanValid) {
    errors.push('Geçersiz IBAN formatı');
  }

  const accountHolderValid = accountHolder.trim().length >= 3;
  if (!accountHolderValid) {
    errors.push('Hesap sahibinin adı en az 3 karakter olmalıdır');
  }

  return {
    valid: ibanValid && accountHolderValid,
    iban: ibanValid,
    accountHolder: accountHolderValid,
    errors
  };
}
