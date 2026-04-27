/**
 * @fileoverview Input sanitization unit tests.
 * Tests XSS protection, max length, and whitespace trimming.
 */

import { sanitizeString, MAX_STRING_LENGTH } from '../server/middleware/sanitize';

describe('Sanitization', () => {
  test('strips <script> tags from input', () => {
    const input = 'Hello <script>alert("xss")</script> world';
    const result = sanitizeString(input) as string;
    expect(result).not.toContain('<script>');
    expect(result).not.toContain('</script>');
    expect(result).toContain('Hello');
    expect(result).toContain('world');
  });

  test('strips <img onerror=> XSS attempts', () => {
    const input = '<img src=x onerror="alert(1)">test';
    const result = sanitizeString(input) as string;
    expect(result).not.toContain('<img');
    expect(result).not.toContain('onerror');
    expect(result).toContain('test');
  });

  test('allows normal text through unchanged', () => {
    const input = 'How do I register to vote in India?';
    const result = sanitizeString(input) as string;
    expect(result).toBe(input);
  });

  test('enforces 500 character max length', () => {
    const input = 'a'.repeat(600);
    const result = sanitizeString(input) as string;
    expect(result.length).toBe(MAX_STRING_LENGTH);
    expect(result.length).toBe(500);
  });

  test('trims leading/trailing whitespace', () => {
    const input = '   hello world   ';
    const result = sanitizeString(input) as string;
    expect(result).toBe('hello world');
  });
});
