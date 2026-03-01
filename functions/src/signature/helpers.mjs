import crypto from 'node:crypto';

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function assertNotExpired(expiresAtMs, nowMs = Date.now()) {
  if (expiresAtMs <= nowMs) {
    throw new Error('Signature request has expired');
  }
}
