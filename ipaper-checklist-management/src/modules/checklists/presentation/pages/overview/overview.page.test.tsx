import { QueryClientProvider } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import type { ComponentType, ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { createQueryClient } from '../../../../../app/providers/query-client';
import { AppNavigationContext } from '../../../../../app/host/app-navigation.context';
import { DEFAULT_APP_STATE } from '../../../../../app/routing/app-view.types';
import type { ChecklistKpiSummary } from '../../../domain/checklist-kpi.model';
import type { ChecklistSummary } from '../../../domain/checklist-kpi.model';
import type { OperationalAlert } from '../../../domain/alert.model';
import type { ChecklistRepository } from '../../../domain/checklist.repository';
import { UseChecklistDataQueriesContext } from '../../../infrastructure/queries/use-checklist-data-queries';
import { UseOverviewKpisViewModelContext } from '../../view-models/use-overview-kpis.view-model';

import { OverviewPage } from './overview.page';

function fakeKpiQuery(
  overrides: Partial<UseQueryResult<ChecklistKpiSummary>>,
): UseQueryResult<ChecklistKpiSummary> {
  return {
    isPending: false,
    isError: false,
    data: {
      total: 10,
      counts: { todo: 2, ongoing: 1, done: 5, overdue: 1, notok: 1 },
    },
    refetch: vi.fn(),
    ...overrides,
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

function renderPage(query: UseQueryResult<ChecklistKpiSummary>) {
  const setPage = vi.fn();
  const setAnalyticsTab = vi.fn();
  const queryClient = createQueryClient();
  const wrapper: ComponentType<{ children: ReactNode }> = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <UseChecklistDataQueriesContext.Provider
        value={{ useChecklistRepository: () => makeStubRepository() }}
      >
        <AppNavigationContext.Provider
          value={{ state: DEFAULT_APP_STATE, setPage, setAnalyticsTab }}
        >
        <UseOverviewKpisViewModelContext.Provider
          value={{
            useChecklistKpiQuery: () => query,
            useAppNavigation: () => ({ setPage }),
          }}
        >
          {children}
        </UseOverviewKpisViewModelContext.Provider>
        </AppNavigationContext.Provider>
      </UseChecklistDataQueriesContext.Provider>
    </QueryClientProvider>
  );
  return render(<OverviewPage />, { wrapper });
}

describe(OverviewPage.name, () => {
  it('renders loading state', () => {
    renderPage(fakeKpiQuery({ isPending: true, data: undefined }));
    expect(screen.getByText(/Loading checklist KPIs/i)).toBeInTheDocument();
  });

  it('renders five KPI cards when data is available', () => {
    renderPage(fakeKpiQuery({}));
    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('Ongoing')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
    expect(screen.getByText('Overdue')).toBeInTheDocument();
    expect(screen.getByText('Not OK')).toBeInTheDocument();
  });
});
