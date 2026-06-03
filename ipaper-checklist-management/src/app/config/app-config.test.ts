import { describe, expect, it } from 'vitest';

import { getAppConfig } from './app-config';

describe('getAppConfig', () => {
  it('exposes name and externalId from app.json', () => {
    const config = getAppConfig();
    expect(config.name).toBe('Ipaper Checklist Management');
    expect(config.externalId).toBe('ipaper-checklist-management');
  });

  it('exposes the first deployment target', () => {
    const config = getAppConfig();
    expect(config.deployment).toEqual({ org: 'radix', project: 'radix-dev' });
  });
});
