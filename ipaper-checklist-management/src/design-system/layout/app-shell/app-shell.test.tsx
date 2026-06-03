import type { HostAppAPI } from '@cognite/app-sdk';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { QueryClientProvider } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import { createQueryClient } from '../../../app/providers/query-client';
import { AppNavigationProvider } from '../../../app/host/app-navigation.provider';
import { HostAppContext } from '../../../app/host/host-app.context';
import { AppView } from '../../../app/routing/app-view';
import { DEFAULT_APP_STATE } from '../../../app/routing/app-view.types';
import type { ChecklistKpiSummary } from '../../../modules/checklists/domain/checklist-kpi.model';
import type { ChecklistSummary } from '../../../modules/checklists/domain/checklist-kpi.model';
import type { OperationalAlert } from '../../../modules/checklists/domain/alert.model';
import type { ChecklistRepository } from '../../../modules/checklists/domain/checklist.repository';
import { UseChecklistDataQueriesContext } from '../../../modules/checklists/infrastructure/queries/use-checklist-data-queries';
import { UseOverviewKpisViewModelContext } from '../../../modules/checklists/presentation/view-models/use-overview-kpis.view-model';

import { AppShell } from './app-shell';

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

function fakeKpiQuery(): UseQueryResult<ChecklistKpiSummary> {
  return {
    isPending: false,
    isError: false,
    data: {
      total: 4,
      counts: { todo: 1, ongoing: 1, done: 1, overdue: 0, notok: 1 },
    },
    refetch: vi.fn(),
  } as Partial<UseQueryResult<ChecklistKpiSummary>> as UseQueryResult<ChecklistKpiSummary>;
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

function renderShell() {
  const api = makeApi();
  const queryClient = createQueryClient();
  const useChecklistRepository = () => makeStubRepository();
  return render(
    <QueryClientProvider client={queryClient}>
      <UseChecklistDataQueriesContext.Provider value={{ useChecklistRepository }}>
        <UseOverviewKpisViewModelContext.Provider
          value={{
            useChecklistKpiQuery: () => fakeKpiQuery(),
            useAppNavigation: () => ({ setPage: vi.fn() }),
          }}
        >
          <HostAppContext.Provider value={{ api, initialState: undefined, isReady: true }}>
            <AppNavigationProvider initialAppState={DEFAULT_APP_STATE}>
              <AppShell>
                <AppView />
              </AppShell>
            </AppNavigationProvider>
          </HostAppContext.Provider>
        </UseOverviewKpisViewModelContext.Provider>
      </UseChecklistDataQueriesContext.Provider>
    </QueryClientProvider>,
  );
}

describe('AppShell', () => {
  it('renders five navigation items', () => {
    renderShell();
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Overview' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Checklists' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Analytics' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Alerts' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument();
  });

  it('highlights the active navigation item', () => {
    renderShell();
    expect(screen.getByRole('button', { name: 'Overview' })).toHaveAttribute('aria-current', 'page');
  });

  it('shows InField branding in the sidebar', () => {
    renderShell();
    expect(screen.getByText('InField')).toBeInTheDocument();
    expect(screen.getByText('Checklist Intelligence')).toBeInTheDocument();
    expect(screen.getByText('International Paper')).toBeInTheDocument();
  });

  it('switches to checklists view when Checklists nav is clicked', async () => {
    const user = userEvent.setup();
    renderShell();
    await user.click(screen.getByRole('button', { name: 'Checklists' }));
    expect(screen.getByRole('button', { name: 'Checklists' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByText(/no checklists found/i)).toBeInTheDocument();
  });

  it('does not show welcome scaffold copy', () => {
    renderShell();
    expect(screen.queryByText('Plan')).not.toBeInTheDocument();
    expect(screen.queryByText('Explore')).not.toBeInTheDocument();
    expect(screen.queryByText('Deploy')).not.toBeInTheDocument();
  });
});
