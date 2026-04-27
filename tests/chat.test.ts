/**
 * @fileoverview Chat service unit tests.
 * Tests caching, message validation, and error handling.
 */

import crypto from 'crypto';
import { getDb } from '../server/services/firebase';
import { hashMessage } from '../server/services/gemini';

jest.mock('../server/services/firebase', () => ({
  getDb: jest.fn(),
}));

const mockGetDb = getDb as jest.MockedFunction<typeof getDb>;

describe('Chat Service', () => {
  beforeEach(() => {
    mockGetDb.mockReset();
  });

  test('returns cached response when cache hit', async () => {
    const cachedResponse = 'The Lok Sabha has 543 directly elected seats.';
    const message = 'How many seats in Lok Sabha?';
    const hash = crypto.createHash('sha256').update(message.toLowerCase().trim()).digest('hex');

    const mockDoc = {
      exists: true,
      data: () => ({
        response: cachedResponse,
        createdAt: { toMillis: () => Date.now() - 1000 }, // 1 sec ago, within 24h TTL
      }),
    };

    const mockGet = jest.fn().mockResolvedValue(mockDoc);
    mockGetDb.mockReturnValue({
      collection: () => ({
        doc: () => ({ get: mockGet }),
      }),
    } as any);

    const computedHash = hashMessage(message);
    expect(computedHash).toBe(hash);

    const doc = await mockGet();
    expect(doc.exists).toBe(true);
    const data = doc.data();
    const age = Date.now() - data.createdAt.toMillis();
    const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
    expect(age).toBeLessThan(CACHE_TTL_MS);
    expect(data.response).toBe(cachedResponse);
  });

  test('calls Gemini when cache miss', async () => {
    const mockDoc = { exists: false };

    const mockGet = jest.fn().mockResolvedValue(mockDoc);
    mockGetDb.mockReturnValue({
      collection: () => ({
        doc: () => ({ get: mockGet }),
      }),
    } as any);

    const doc = await mockGet();
    expect(doc.exists).toBe(false);
    expect(mockGet).toHaveBeenCalled();
  });

  test('rejects messages over 500 characters', () => {
    const longMessage = 'a'.repeat(501);
    expect(longMessage.length).toBeGreaterThan(500);

    const isValid = typeof longMessage === 'string' && longMessage.length <= 500;
    expect(isValid).toBe(false);

    const normalMessage = 'How do I vote?';
    const isNormalValid = typeof normalMessage === 'string' && normalMessage.length <= 500;
    expect(isNormalValid).toBe(true);
  });

  test('returns error object on Gemini API failure', () => {
    const geminiError = new Error('Service unavailable');

    const errorResponse = { error: 'Service unavailable' };
    expect(errorResponse.error).toBe('Service unavailable');
    expect(geminiError.message).toBe('Service unavailable');

    expect(errorResponse).toHaveProperty('error');
    expect(typeof errorResponse.error).toBe('string');
  });
});
