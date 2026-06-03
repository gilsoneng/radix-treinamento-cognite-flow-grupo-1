import type { ConnectToHostAppResult, HostAppAPI } from '@cognite/app-sdk';
import { CogniteClient } from '@cognite/sdk';
import { QueryClientProvider } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps, ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import App from './App';
import { createQueryClient } from './app/providers/query-client';
import { makeChecklistKpiSummary } from './__mocks__/checklist-kpi-summary.factory';
import type { ChecklistKpiSummary } from './modules/checklists/domain/checklist-kpi.model';
import type { ChecklistSummary } from './modules/checklists/domain/checklist-kpi.model';
import type { OperationalAlert } from './modules/checklists/domain/alert.model';
import type { ChecklistRepository } from './modules/checklists/domain/checklist.repository';
import { UseChecklistDataQueriesContext } from './modules/checklists/infrastructure/queries/use-checklist-data-queries';
import { UseOverviewKpisViewModelContext } from './modules/checklists/presentation/view-models/use-overview-kpis.view-model';
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

function makeConnectedDeps(initialState?: string): AppDeps {
  return {
    connectToHostApp: vi.fn<AppDeps['connectToHostApp']>(() =>
      Promise.resolve({ api: makeApi(), initialState }),
    ),
    createClient: vi.fn<AppDeps['createClient']>((config) => new CogniteClient(config)),
  };
}

function makeFailingDeps(): AppDeps {
  return {
    connectToHostApp: vi.fn<AppDeps['connectToHostApp']>(() => Promise.reject(new Error('host failed'))),
    createClient: vi.fn<AppDeps['createClient']>((config) => new CogniteClient(config)),
  };
}

function fakeKpiQuery(): UseQueryResult<ChecklistKpiSummary> {
  return {
    isPending: false,
    isError: false,
    data: makeChecklistKpiSummary({
      total: 5,
      counts: { todo: 1, ongoing: 1, done: 2, overdue: 0, notok: 1 },
    }),
    refetch: vi.fn(),
  } as Partial<UseQueryResult<ChecklistKpiSummary>> as UseQueryResult<ChecklistKpiSummary>;
}

function fakeHealthQuery(assets: CoreAsset[]): UseQueryResult<CoreAsset[]> {
  return {
    isPending: false,
    isError: false,
    data: assets,
    refetch: vi.fn(),
  } as Partial<UseQueryResult<CoreAsset[]>> as UseQueryResult<CoreAsset[]>;
}

function makeStubRepository(): ChecklistRepository {
  return {
    fetchNotOkChecklistIds: vi.fn(() => Promise.resolve(new Set<string>())),
    computeKpiSummary: vi.fn(() =>
      Promise.resolve({
        total: 0,
        counts: { todo: 0, ongoing: 0, done: 0, overdue: 0, notok: 0 },
      }),
    ),
    listSummariesPage: vi.fn(() =>
      Promise.resolve({ items: [] as ChecklistSummary[], hasMore: false }),
    ),
    listTaskResultsPage: vi.fn(() => Promise.resolve({ items: [], hasMore: false })),
    fetchTaskResultsSample: vi.fn(() => Promise.resolve([])),
    listMeasurementTrends: vi.fn(() => Promise.resolve([])),
    listRouteKpiSnapshots: vi.fn(() => Promise.resolve([])),
    summarizeTaskResults: vi.fn(() => Promise.resolve({ ok: 0, nok: 0, observation: 0 })),
    listOperationalAlerts: vi.fn(() => Promise.resolve([] as OperationalAlert[])),
  };
}

function renderConnected(initialState?: string) {
  const assets: CoreAsset[] = [
    {
      space: 'asset-space',
      externalId: 'asset-1',
      name: 'Pump A',
      description: 'Main feed pump',
    },
  ];
  const queryClient = createQueryClient();
  const useChecklistRepository = () => makeStubRepository();
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <UseChecklistDataQueriesContext.Provider value={{ useChecklistRepository }}>
        <UseOverviewKpisViewModelContext.Provider
          value={{
            useChecklistKpiQuery: () => fakeKpiQuery(),
            useAppNavigation: () => ({ setPage: vi.fn() }),
          }}
        >
          <UseHealthViewModelContext.Provider value={{ useHealthQuery: () => fakeHealthQuery(assets) }}>
            {children}
          </UseHealthViewModelContext.Provider>
        </UseOverviewKpisViewModelContext.Provider>
      </UseChecklistDataQueriesContext.Provider>
    </QueryClientProvider>
  );
  return render(<App deps={makeConnectedDeps(initialState)} />, { wrapper: Wrapper });
}

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state', () => {
    render(<App deps={makeLoadingDeps()} />);
    expect(screen.getByText('Loading project...')).toBeInTheDocument();
  });

  it('renders error when host connection fails', async () => {
    render(<App deps={makeFailingDeps()} />);
    await waitFor(() =>
      expect(screen.getByText('Failed to connect to Fusion host')).toBeInTheDocument(),
    );
  });

  it('renders the FieldOps shell with overview KPI cards by default', async () => {
    renderConnected();
    await waitFor(() =>
      expect(screen.getByRole('img', { name: 'International Paper' })).toBeInTheDocument(),
    );
    expect(screen.getByRole('heading', { name: 'OVERVIEW' })).toBeInTheDocument();
    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('Not OK')).toBeInTheDocument();
  });

  it('renders Core assets on Settings after navigation', async () => {
    const user = userEvent.setup();
    renderConnected();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Settings' }));
    await waitFor(() => expect(screen.getByText('Cognite Core assets')).toBeInTheDocument());
    expect(screen.getByText('Pump A')).toBeInTheDocument();
    expect(screen.getByText('asset-1')).toBeInTheDocument();
  });
});
