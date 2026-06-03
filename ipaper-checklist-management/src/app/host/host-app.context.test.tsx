import type { HostAppAPI } from '@cognite/app-sdk';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { HostAppContext, useHostAppContext } from './host-app.context';

function makeApi(): HostAppAPI {
  return {
    getProject: vi.fn(() => Promise.resolve('radix-dev')),
    getBaseUrl: vi.fn(() => Promise.resolve('https://cognite.test')),
    getAccessToken: vi.fn(() => Promise.resolve('test-token')),
    getAppId: vi.fn(() => Promise.resolve('test-app-id')),
    syncInternalState: vi.fn(() => Promise.resolve(true)),
    navigateInternal: vi.fn(() => Promise.resolve(true)),
    navigateExternal: vi.fn(() => Promise.resolve(true)),
    registerAgentServer: vi.fn(() => Promise.resolve()),
    unregisterAgentServer: vi.fn(() => Promise.resolve()),
    sendAgentLayoutMode: vi.fn(() => Promise.resolve()),
    sendAgentMessage: vi.fn(() => Promise.resolve()),
  };
}

describe(useHostAppContext.name, () => {
  it('exposes api and initialState from context', () => {
    const api = makeApi();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <HostAppContext.Provider value={{ api, initialState: '{"page":"kpis"}', isReady: true }}>
        {children}
      </HostAppContext.Provider>
    );

    const { result } = renderHook(() => useHostAppContext(), { wrapper });

    expect(result.current.api).toBe(api);
    expect(result.current.initialState).toBe('{"page":"kpis"}');
    expect(result.current.isReady).toBe(true);
  });
});
