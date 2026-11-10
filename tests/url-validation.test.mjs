import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizePublicURL, sameWebsite } from '../lib/url-validation.ts';

test('accepts and normalizes regular public domains', () => {
  assert.equal(normalizePublicURL('example.com')?.hostname, 'example.com');
  assert.equal(normalizePublicURL(' https://www.example.com/blog ')?.hostname, 'www.example.com');
});
test('rejects local, private and malformed input in the browser preflight', () => {
  for (const input of ['localhost', 'http://127.0.0.1', 'http://192.168.0.1', 'http://[::1]', 'file:///etc/passwd', 'ftp://example.com', 'http://user:pass@example.com', 'no spaces allowed.com', 'site.local', '', 'https://example.com?x=1']) {
    assert.equal(normalizePublicURL(input), null, input);
  }
});
test('recognizes same domain with or without www', () => {
  assert.equal(sameWebsite(new URL('https://www.example.com'), new URL('https://example.com/pricing')), true);
  assert.equal(sameWebsite(new URL('https://example.com'), new URL('https://competitor.com')), false);
});
