import type { HostAppAPI } from '@cognite/app-sdk';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { DEFAULT_APP_STATE } from '../routing/app-view.types';

import { AppNavigationProvider } from './app-navigation.provider';
import { HostAppContext } from './host-app.context';
import { useAppNavigation } from './use-app-navigation';

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

describe(useAppNavigation.name, () => {
  it('calls syncInternalState when navigating to a new page', () => {
    const api = makeApi();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <HostAppContext.Provider value={{ api, initialState: undefined, isReady: true }}>
        <AppNavigationProvider initialAppState={DEFAULT_APP_STATE}>{children}</AppNavigationProvider>
      </HostAppContext.Provider>
    );

    const { result } = renderHook(() => useAppNavigation(), { wrapper });

    act(() => {
      result.current.navigate('checklists');
    });

    expect(result.current.page).toBe('checklists');
    expect(api.syncInternalState).toHaveBeenCalledWith('{"page":"checklists"}');
  });
});
