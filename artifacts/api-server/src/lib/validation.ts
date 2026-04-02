// IMEI and serial number validation

export function validateImei(imei: string): { valid: boolean; error?: string } {
  const cleaned = imei.replace(/[\s\-]/g, "");
  if (!/^\d{15,16}$/.test(cleaned)) {
    return { valid: false, error: "IMEI must be 15 or 16 digits" };
  }

  // Luhn check for 15-digit IMEIs
  if (cleaned.length === 15) {
    let sum = 0;
    for (let i = 0; i < 15; i++) {
      let digit = parseInt(cleaned[i], 10);
      if (i % 2 === 1) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
    }
    if (sum % 10 !== 0) {
      return { valid: false, error: "IMEI failed Luhn checksum validation" };
    }
  }

  return { valid: true };
}

export function validateSerial(serial: string): { valid: boolean; error?: string } {
  const cleaned = serial.trim();
  if (cleaned.length < 8 || cleaned.length > 14) {
    return { valid: false, error: "Serial number must be between 8 and 14 characters" };
  }
  if (!/^[A-Za-z0-9]+$/.test(cleaned)) {
    return { valid: false, error: "Serial number must be alphanumeric" };
  }
  return { valid: true };
}

export function validateEmail(email: string): { valid: boolean; error?: string } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: "Invalid email address" };
  }
  if (email.length > 254) {
    return { valid: false, error: "Email address too long" };
  }
  return { valid: true };
}
