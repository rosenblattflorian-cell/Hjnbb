import crypto from 'node:crypto';

export const DEFAULT_TTL_SECONDS = 60 * 60;

export function generateToken(size = 32): string {
  return crypto.randomBytes(size).toString('base64url');
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function assertNotExpired(expiresAtMs: number, nowMs = Date.now()): void {
  if (expiresAtMs <= nowMs) {
    throw new Error('Signature request has expired');
  }
}

export function parsePngDataUrl(signatureDataUrl: string): Buffer {
  const match = signatureDataUrl.match(/^data:image\/png;base64,(.+)$/);
  if (!match) {
    throw new Error('Invalid signature image format');
  }
  return Buffer.from(match[1], 'base64');
}
