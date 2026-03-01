import { describe, expect, it } from 'vitest';
import { assertNotExpired, hashToken } from './helpers.js';

describe('hashToken', () => {
  it('is stable for the same token', () => {
    expect(hashToken('abc123')).toBe(hashToken('abc123'));
  });
});

describe('assertNotExpired', () => {
  it('throws when timestamp is expired', () => {
    expect(() => assertNotExpired(1000, 1001)).toThrow(/expired/i);
  });
});
