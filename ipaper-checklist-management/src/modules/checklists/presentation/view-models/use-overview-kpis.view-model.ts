import { createContext, useCallback, useContext, useEffect, useMemo } from 'react';

import { useAppNavigationContext } from '../../../../app/host/app-navigation.context';
import type { OverviewShiftCode } from '../../../../app/routing/app-view.types';
import type { ChecklistKpiCounts } from '../../domain/checklist-kpi.model';
import { EMPTY_KPI_COUNTS } from '../../domain/checklist-kpi.model';
import type { ChecklistKpiInsights } from '../../domain/kpi-insight.model';
import { buildChecklistKpiInsights } from '../../domain/kpi-insight.rules';
import type { OperationalShiftContext } from '../../domain/inspection-shift.model';
import type { OperationalKpiCatalog, OperationalKpiSelection } from '../../domain/operational-catalog.model';
import {
  stepOperationalDay,
  stepOperationalShift,
} from '../../domain/operational-catalog.rules';
import { useChecklistKpiQuery } from '../../infrastructure/queries/use-checklist-kpi-query';

const EMPTY_CATALOG: OperationalKpiCatalog = { days: [], shiftsByDay: {} };

export type OverviewKpisViewModel = {
  readonly counts: ChecklistKpiCounts;
  readonly total: number;
  readonly insights: ChecklistKpiInsights;
  readonly shiftContext: OperationalShiftContext | null;
  readonly catalog: OperationalKpiCatalog;
  readonly selection: OperationalKpiSelection | null;
  readonly canStepDayOlder: boolean;
  readonly canStepDayNewer: boolean;
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly refresh: () => void;
  readonly navigateToChecklists: () => void;
  readonly setOperationalFilter: (day: string, shiftCode: OverviewShiftCode) => void;
  readonly stepDay: (direction: 'older' | 'newer') => void;
  readonly stepShift: (direction: 'previous' | 'next') => void;
};

export type UseOverviewKpisViewModelDeps = {
  useChecklistKpiQuery: typeof useChecklistKpiQuery;
  useAppNavigation: () => {
    state: { overviewOperationalDay?: string; overviewShiftCode?: OverviewShiftCode };
    setPage: (page: 'checklists') => void;
    setOverviewOperationalFilter: (day: string, shiftCode: OverviewShiftCode) => void;
  };
};

function defaultUseAppNavigation() {
  const { state, setPage, setOverviewOperationalFilter } = useAppNavigationContext();
  return { state, setPage, setOverviewOperationalFilter };
}

const defaultDeps: UseOverviewKpisViewModelDeps = {
  useChecklistKpiQuery,
  useAppNavigation: defaultUseAppNavigation,
};

export const UseOverviewKpisViewModelContext =
  createContext<UseOverviewKpisViewModelDeps>(defaultDeps);

function canStepDay(
  catalog: OperationalKpiCatalog,
  selection: OperationalKpiSelection,
  direction: 'older' | 'newer',
): boolean {
  return stepOperationalDay(catalog, selection, direction) !== null;
}

export function useOverviewKpisViewModel(): OverviewKpisViewModel {
  const { useChecklistKpiQuery: useQuery, useAppNavigation } = useContext(
    UseOverviewKpisViewModelContext,
  );
  const query = useQuery();
  const { state, setPage, setOverviewOperationalFilter } = useAppNavigation();

  const counts = query.data?.counts ?? EMPTY_KPI_COUNTS;
  const total = query.data?.total ?? 0;
  const catalog = query.data?.catalog ?? EMPTY_CATALOG;
  const selection = query.data?.selection ?? null;
  const insights = useMemo(
    () =>
      query.data?.insights ??
      buildChecklistKpiInsights(counts, EMPTY_KPI_COUNTS, false),
    [query.data?.insights, counts],
  );
  const shiftContext = query.data?.shiftContext ?? null;

  const canStepDayOlder = selection ? canStepDay(catalog, selection, 'older') : false;
  const canStepDayNewer = selection ? canStepDay(catalog, selection, 'newer') : false;

  useEffect(() => {
    if (!selection || state.overviewOperationalDay) {
      return;
    }
    setOverviewOperationalFilter(selection.operationalDay, selection.shiftCode);
  }, [selection, state.overviewOperationalDay, setOverviewOperationalFilter]);

  const setOperationalFilter = useCallback(
    (day: string, shiftCode: OverviewShiftCode) => {
      setOverviewOperationalFilter(day, shiftCode);
    },
    [setOverviewOperationalFilter],
  );

  const stepDay = useCallback(
    (direction: 'older' | 'newer') => {
      if (!selection) {
        return;
      }
      const next = stepOperationalDay(catalog, selection, direction);
      if (next) {
        setOverviewOperationalFilter(next.operationalDay, next.shiftCode);
      }
    },
    [catalog, selection, setOverviewOperationalFilter],
  );

  const stepShift = useCallback(
    (direction: 'previous' | 'next') => {
      if (!selection) {
        return;
      }
      const next = stepOperationalShift(catalog, selection, direction);
      if (next) {
        setOverviewOperationalFilter(next.operationalDay, next.shiftCode);
      }
    },
    [catalog, selection, setOverviewOperationalFilter],
  );

  const navigateToChecklists = useCallback(() => {
    setPage('checklists');
  }, [setPage]);

  return {
    counts,
    total,
    insights,
    shiftContext,
    catalog,
    selection,
    canStepDayOlder,
    canStepDayNewer,
    isLoading: query.isPending,
    isError: query.isError,
    refresh: () => {
      void query.refetch();
    },
    navigateToChecklists,
    setOperationalFilter,
    stepDay,
    stepShift,
  };
}
