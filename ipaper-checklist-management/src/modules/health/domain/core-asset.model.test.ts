import { describe, expect, it } from 'vitest';

import { DEFAULT_ASSET_SAMPLE_SIZE } from './core-asset.model';

describe('DEFAULT_ASSET_SAMPLE_SIZE', () => {
  it('requests five assets for the smoke-test slice', () => {
    expect(DEFAULT_ASSET_SAMPLE_SIZE).toBe(5);
  });
});
