import test from 'node:test';
import assert from 'node:assert/strict';
import { hashToken, assertNotExpired } from './helpers.mjs';

test('hashToken is stable', () => {
  assert.equal(hashToken('abc123'), hashToken('abc123'));
});

test('assertNotExpired throws for expired timestamp', () => {
  assert.throws(() => assertNotExpired(1000, 1001), /expired/i);
});
