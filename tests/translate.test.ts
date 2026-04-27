/**
 * @fileoverview Translation service unit tests.
 * Mocks the Google Cloud Translation API.
 */

import { translateTexts } from '../server/services/translate';
import nodeFetch from 'node-fetch';

jest.mock('node-fetch');
const fetchMock = nodeFetch as jest.MockedFunction<typeof nodeFetch>;

describe('Translation Service', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv, GOOGLE_TRANSLATE_API_KEY: 'test-key' };
    fetchMock.mockReset();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  test('translate service called with correct targetLang', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          translations: [{ translatedText: 'नमस्ते' }],
        },
      }),
    } as any);

    await translateTexts(['Hello'], 'hi');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const callBody = JSON.parse(fetchMock.mock.calls[0][1]!.body as string);
    expect(callBody.target).toBe('hi');
    expect(callBody.q).toEqual(['Hello']);
  });

  test('returns array of same length as input', async () => {
    const inputs = ['Hello', 'World', 'Test'];
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          translations: inputs.map((t) => ({ translatedText: `translated_${t}` })),
        },
      }),
    } as any);

    const result = await translateTexts(inputs, 'hi');
    expect(result).toHaveLength(inputs.length);
  });

  test('rejects invalid targetLang values', async () => {
    await expect(translateTexts(['Hello'], 'fr')).rejects.toThrow('Invalid target language');
    await expect(translateTexts(['Hello'], 'de')).rejects.toThrow('Invalid target language');
  });
});
