/**
 * Production-Grade Centralized Environment Configuration & Validation Utility
 *
 * Enforces fail-fast validation for critical secrets at startup.
 * Prevents repeated process.env lookups and eliminates silent fallback vulnerabilities.
 */

function getValidatedJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();

  if (!secret) {
    throw new Error(
      'CRITICAL SECURITY FATAL ERROR: JWT_SECRET environment variable is required. ' +
      'Application startup halted to prevent security vulnerability. ' +
      'Please configure a strong JWT_SECRET in your environment or .env file.'
    );
  }

  if (secret.length < 16) {
    throw new Error(
      'CRITICAL SECURITY FATAL ERROR: JWT_SECRET environment variable must be at least 16 characters long for cryptographic security.'
    );
  }

  return secret;
}

// Single source of truth for validated JWT Secret & encoded Uint8Array key
export const JWT_SECRET = getValidatedJwtSecret();
export const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);
