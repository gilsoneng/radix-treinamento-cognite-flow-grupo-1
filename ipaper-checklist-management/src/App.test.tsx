import type { ConnectToHostAppResult, HostAppAPI } from '@cognite/app-sdk';
import { CogniteClient } from '@cognite/sdk';
import type { UseQueryResult } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import type { ComponentProps, ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import App from './App';
import type { CoreAsset } from './modules/health/domain/core-asset.model';
import { UseHealthViewModelContext } from './modules/health/presentation/view-models/use-health.view-model';

type AppDeps = NonNullable<ComponentProps<typeof App>['deps']>;

function makeApi(): HostAppAPI {
  return {
    getProject: vi.fn<HostAppAPI['getProject']>(() => Promise.resolve('radix-dev')),
    getBaseUrl: vi.fn<HostAppAPI['getBaseUrl']>(() => Promise.resolve('https://cognite.test')),
    getAccessToken: vi.fn<HostAppAPI['getAccessToken']>(() => Promise.resolve('test-token')),
    getAppId: vi.fn<HostAppAPI['getAppId']>(() => Promise.resolve('test-app-id')),
    syncInternalState: vi.fn<HostAppAPI['syncInternalState']>(() => Promise.resolve(true)),
    navigateInternal: vi.fn<HostAppAPI['navigateInternal']>(() => Promise.resolve(true)),
    navigateExternal: vi.fn<HostAppAPI['navigateExternal']>(() => Promise.resolve(true)),
    registerAgentServer: vi.fn<HostAppAPI['registerAgentServer']>(() => Promise.resolve()),
    unregisterAgentServer: vi.fn<HostAppAPI['unregisterAgentServer']>(() => Promise.resolve()),
    sendAgentLayoutMode: vi.fn<HostAppAPI['sendAgentLayoutMode']>(() => Promise.resolve()),
    sendAgentMessage: vi.fn<HostAppAPI['sendAgentMessage']>(() => Promise.resolve()),
  };
}

function makeLoadingDeps(): AppDeps {
  return {
    connectToHostApp: vi.fn<AppDeps['connectToHostApp']>(() => new Promise<ConnectToHostAppResult>(() => undefined)),
    createClient: vi.fn<AppDeps['createClient']>((config) => new CogniteClient(config)),
  };
}

function makeConnectedDeps(): AppDeps {
  return {
    connectToHostApp: vi.fn<AppDeps['connectToHostApp']>(() => Promise.resolve({ api: makeApi() })),
    createClient: vi.fn<AppDeps['createClient']>((config) => new CogniteClient(config)),
  };
}

function fakeHealthQuery(assets: CoreAsset[]): UseQueryResult<CoreAsset[]> {
  return {
    isPending: false,
    isError: false,
    data: assets,
    refetch: vi.fn(),
  } as Partial<UseQueryResult<CoreAsset[]>> as UseQueryResult<CoreAsset[]>;
}

function renderConnected() {
  const assets: CoreAsset[] = [
    {
      space: 'asset-space',
      externalId: 'asset-1',
      name: 'Pump A',
      description: 'Main feed pump',
    },
  ];
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <UseHealthViewModelContext.Provider value={{ useHealthQuery: () => fakeHealthQuery(assets) }}>
      {children}
    </UseHealthViewModelContext.Provider>
  );
  return render(<App deps={makeConnectedDeps()} />, { wrapper: Wrapper });
}

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state', () => {
    render(<App deps={makeLoadingDeps()} />);
    expect(screen.getByText('Loading project...')).toBeInTheDocument();
  });

  it('renders the IP page shell with app name and page title', async () => {
    renderConnected();
    await waitFor(() => expect(screen.getByText('Ipaper Checklist Management')).toBeInTheDocument());
    expect(screen.getByRole('heading', { name: 'Core Assets' })).toBeInTheDocument();
  });

  it('renders the health module slice with Core assets', async () => {
    renderConnected();
    await waitFor(() => expect(screen.getByText('Cognite Core assets')).toBeInTheDocument());
    expect(screen.getByText('Pump A')).toBeInTheDocument();
    expect(screen.getByText('asset-1')).toBeInTheDocument();
  });
});
