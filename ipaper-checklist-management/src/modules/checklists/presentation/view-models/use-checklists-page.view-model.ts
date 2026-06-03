import { createContext, useCallback, useContext, useEffect } from 'react';

import { useAppNavigationContext } from '../../../../app/host/app-navigation.context';
import type { OverviewShiftCode } from '../../../../app/routing/app-view.types';
import type { ChecklistSummary } from '../../domain/checklist-kpi.model';
import type { OperationalKpiCatalog, OperationalKpiSelection } from '../../domain/operational-catalog.model';
import {
  stepOperationalDay,
  stepOperationalShift,
} from '../../domain/operational-catalog.rules';
import { useChecklistKpiQuery } from '../../infrastructure/queries/use-checklist-kpi-query';

const EMPTY_CATALOG: OperationalKpiCatalog = { days: [], shiftsByDay: {} };

export type ChecklistsPageViewModel = {
  readonly summaries: readonly ChecklistSummary[];
  readonly catalog: OperationalKpiCatalog;
  readonly selection: OperationalKpiSelection | null;
  readonly canStepDayOlder: boolean;
  readonly canStepDayNewer: boolean;
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly refresh: () => void;
  readonly setOperationalFilter: (day: string, shiftCode: OverviewShiftCode) => void;
  readonly stepDay: (direction: 'older' | 'newer') => void;
  readonly stepShift: (direction: 'previous' | 'next') => void;
};

export type UseChecklistsPageViewModelDeps = {
  useChecklistKpiQuery: typeof useChecklistKpiQuery;
  useAppNavigation: () => {
    state: { overviewOperationalDay?: string; overviewShiftCode?: OverviewShiftCode };
    setOverviewOperationalFilter: (day: string, shiftCode: OverviewShiftCode) => void;
  };
};

function defaultUseAppNavigation() {
  const { state, setOverviewOperationalFilter } = useAppNavigationContext();
  return { state, setOverviewOperationalFilter };
}

const defaultDeps: UseChecklistsPageViewModelDeps = {
  useChecklistKpiQuery,
  useAppNavigation: defaultUseAppNavigation,
};

export const UseChecklistsPageViewModelContext =
  createContext<UseChecklistsPageViewModelDeps>(defaultDeps);

function canStepDay(
  catalog: OperationalKpiCatalog,
  selection: OperationalKpiSelection,
  direction: 'older' | 'newer',
): boolean {
  return stepOperationalDay(catalog, selection, direction) !== null;
}

export function useChecklistsPageViewModel(): ChecklistsPageViewModel {
  const { useChecklistKpiQuery: useQuery, useAppNavigation } = useContext(
    UseChecklistsPageViewModelContext,
  );
  const query = useQuery();
  const { state, setOverviewOperationalFilter } = useAppNavigation();

  const catalog = query.data?.catalog ?? EMPTY_CATALOG;
  const selection = query.data?.selection ?? null;
  const summaries = query.data?.scopedSummaries ?? [];

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

  return {
    summaries,
    catalog,
    selection,
    canStepDayOlder,
    canStepDayNewer,
    isLoading: query.isPending,
    isError: query.isError,
    refresh: () => {
      void query.refetch();
    },
    setOperationalFilter,
    stepDay,
    stepShift,
  };
}
