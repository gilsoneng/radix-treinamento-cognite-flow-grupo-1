import { createContext, useCallback, useContext, useMemo } from 'react';

import { useAppNavigationContext } from '../../../../app/host/app-navigation.context';
import type { ChecklistKpiBucket, ChecklistKpiCounts } from '../../domain/checklist-kpi.model';
import { EMPTY_KPI_COUNTS } from '../../domain/checklist-kpi.model';
import { useChecklistKpiQuery } from '../../infrastructure/queries/use-checklist-kpi-query';

const KPI_BUCKETS: ChecklistKpiBucket[] = ['todo', 'ongoing', 'done', 'overdue', 'notok'];

export type OverviewKpisViewModel = {
  readonly counts: ChecklistKpiCounts;
  readonly total: number;
  readonly percentages: Record<ChecklistKpiBucket, string>;
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly refresh: () => void;
  readonly navigateToChecklists: () => void;
};

export type UseOverviewKpisViewModelDeps = {
  useChecklistKpiQuery: typeof useChecklistKpiQuery;
  useAppNavigation: () => { setPage: (page: 'checklists') => void };
};

function defaultUseAppNavigation() {
  const { setPage } = useAppNavigationContext();
  return { setPage };
}

const defaultDeps: UseOverviewKpisViewModelDeps = {
  useChecklistKpiQuery,
  useAppNavigation: defaultUseAppNavigation,
};

export const UseOverviewKpisViewModelContext =
  createContext<UseOverviewKpisViewModelDeps>(defaultDeps);

function formatPercentage(value: number, total: number): string {
  if (total === 0) {
    return '0%';
  }
  return `${Math.round((value / total) * 100)}%`;
}

export function useOverviewKpisViewModel(): OverviewKpisViewModel {
  const { useChecklistKpiQuery: useQuery, useAppNavigation } = useContext(
    UseOverviewKpisViewModelContext,
  );
  const query = useQuery();
  const { setPage } = useAppNavigation();

  const counts = query.data?.counts ?? EMPTY_KPI_COUNTS;
  const total = query.data?.total ?? 0;

  const percentages = useMemo(() => {
    const result = {} as Record<ChecklistKpiBucket, string>;
    for (const bucket of KPI_BUCKETS) {
      result[bucket] = formatPercentage(counts[bucket], total);
    }
    return result;
  }, [counts, total]);

  const navigateToChecklists = useCallback(() => {
    setPage('checklists');
  }, [setPage]);

  return {
    counts,
    total,
    percentages,
    isLoading: query.isPending,
    isError: query.isError,
    refresh: () => {
      void query.refetch();
    },
    navigateToChecklists,
  };
}
