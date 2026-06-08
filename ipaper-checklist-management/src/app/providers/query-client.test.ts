import { describe, expect, it } from 'vitest';

import { createQueryClient } from './query-client';

describe('createQueryClient', () => {
  it('applies the shared retry policy to query defaults', () => {
    const client = createQueryClient();
    const defaults = client.getDefaultOptions().queries;

    expect(typeof defaults?.retry).toBe('function');
    const retry = defaults?.retry;
    if (typeof retry === 'function') {
      expect(retry(0, new Error('boom'))).toBe(true);
      const unauthorized = Object.assign(new Error('unauthorized'), { status: 401 });
      expect(retry(0, unauthorized)).toBe(false);
      expect(retry(3, new Error('boom'))).toBe(false);
    }
  });
});
