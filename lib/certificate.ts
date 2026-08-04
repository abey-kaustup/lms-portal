import crypto from 'crypto';

/**
 * Production-Grade Certificate Security Utility
 *
 * Provides cryptographically secure random certificate generation,
 * format validation, and enumeration protection.
 */

/**
 * Generates a cryptographically secure, high-entropy certificate number.
 * Format: CERT-2026-F81D93A8E41B4C56 (16 hex characters = 64-bit entropy)
 * Non-predictable, collision-resistant, and cryptographically secure.
 */
export function generateSecureCertificateNumber(year: number = new Date().getFullYear()): string {
  const randomHex = crypto.randomBytes(8).toString('hex').toUpperCase();
  return `CERT-${year}-${randomHex}`;
}

/**
 * Validates certificate number format before executing database queries.
 * Rejects malformed or suspicious input strings immediately.
 * Supports new high-entropy format and provides backward compatibility for legacy certificates.
 */
export function isValidCertificateFormat(certNumber: string): boolean {
  if (!certNumber || typeof certNumber !== 'string') return false;
  const clean = certNumber.trim();
  if (clean.length < 6 || clean.length > 64) return false;

  // New High-Entropy Secure Format: CERT-YYYY-HEX16 or CERT-IND-YYYY-HEX16
  const securePattern = /^CERT-(?:IND-)?\d{4}-[A-F0-9]{16,32}$/i;
  if (securePattern.test(clean)) return true;

  // Legacy Format Support (Backward Compatibility for existing certificates)
  const legacyPattern = /^[A-Z0-9\-_]{6,64}$/i;
  return legacyPattern.test(clean);
}
