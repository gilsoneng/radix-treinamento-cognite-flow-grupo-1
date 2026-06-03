import type { UseQueryResult } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import type { ComponentType, ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { AppNavigationContext } from '../../../../app/host/app-navigation.context';
import { DEFAULT_APP_STATE } from '../../../../app/routing/app-view.types';
import type { ChecklistKpiSummary } from '../../domain/checklist-kpi.model';

import {
  UseOverviewKpisViewModelContext,
  useOverviewKpisViewModel,
} from './use-overview-kpis.view-model';

function fakeKpiQuery(
  overrides: Partial<UseQueryResult<ChecklistKpiSummary>>,
): UseQueryResult<ChecklistKpiSummary> {
  return {
    isPending: false,
    isError: false,
    data: {
      total: 10,
      counts: { todo: 2, ongoing: 3, done: 4, overdue: 1, notok: 0 },
    },
    refetch: vi.fn(),
    ...overrides,
  } as Partial<UseQueryResult<ChecklistKpiSummary>> as UseQueryResult<ChecklistKpiSummary>;
}

describe(useOverviewKpisViewModel.name, () => {
  it('derives percentages from KPI counts', () => {
    const setPage = vi.fn();
    const setAnalyticsTab = vi.fn();
    const wrapper: ComponentType<{ children: ReactNode }> = ({ children }) => (
      <AppNavigationContext.Provider value={{ state: DEFAULT_APP_STATE, setPage, setAnalyticsTab }}>
        <UseOverviewKpisViewModelContext.Provider
          value={{
            useChecklistKpiQuery: () => fakeKpiQuery({}),
            useAppNavigation: () => ({ setPage }),
          }}
        >
          {children}
        </UseOverviewKpisViewModelContext.Provider>
      </AppNavigationContext.Provider>
    );

    const { result } = renderHook(() => useOverviewKpisViewModel(), { wrapper });

    expect(result.current.total).toBe(10);
    expect(result.current.percentages.done).toBe('40%');
    expect(result.current.isLoading).toBe(false);
  });
});
