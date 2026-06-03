import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { createContext, useContext, useMemo } from 'react';

import { useAppNavigationContext } from '../../../../app/host/app-navigation.context';
import { buildTaskResultAnalytics } from '../../domain/task-result-analytics.rules';
import { useCdfClient } from '../../../../core/sdk/cdf-client';
import { DEFAULT_TABLE_PAGE_SIZE } from '../../domain/checklist-kpi.model';
import type { OperationalAlert } from '../../domain/alert.model';
import { loadNotificationSettings } from '../notification-settings.storage';
import type { ChecklistKpiSummary, ChecklistSummary } from '../../domain/checklist-kpi.model';
import type { OperationalKpiSelection } from '../../domain/operational-catalog.model';
import type { ChecklistRepository } from '../../domain/checklist.repository';
import type { PagedResult } from '../../domain/pagination.model';
import type { TaskResultAnalyticsBundle } from '../../domain/task-result-analytics.model';
import type { AnalyticsPeriod } from '../../domain/task-result.model';
import type { MeasurementTrendPoint, TimeSeriesKpiPoint } from '../../domain/time-series-trend.model';
import type { TaskResultItem } from '../../domain/task-result.model';
import { CdfChecklistRepository } from '../cdf-checklist.repository';

import {
  checklistDataQueryKeys,
  checklistKpiSummaryQueryFn,
  fetchNotOkIdsQueryFn,
  listAlertsQueryFn,
  listSummariesPageQueryFn,
  listTaskResultsPageQueryFn,
  measurementTrendsQueryFn,
  routeKpiSnapshotsQueryFn,
  taskAnalyticsItemsQueryFn,
} from './checklist-data.queries';

function useDefaultChecklistRepository(): ChecklistRepository {
  const client = useCdfClient();
  return useMemo(() => new CdfChecklistRepository(client), [client]);
}

const defaultDeps = { useChecklistRepository: useDefaultChecklistRepository };
export type UseChecklistDataQueriesContextType = typeof defaultDeps;
export const UseChecklistDataQueriesContext =
  createContext<UseChecklistDataQueriesContextType>(defaultDeps);

function useOverviewKpiSelectionFromHost(): OperationalKpiSelection | undefined {
  const { state } = useAppNavigationContext();
  if (state.overviewOperationalDay && state.overviewShiftCode) {
    return {
      operationalDay: state.overviewOperationalDay,
      shiftCode: state.overviewShiftCode,
    };
  }
  return undefined;
}

export function useChecklistKpiQuery(
  templateExternalId?: string,
): UseQueryResult<ChecklistKpiSummary> {
  const { useChecklistRepository } = useContext(UseChecklistDataQueriesContext);
  const repository = useChecklistRepository();
  const selection = useOverviewKpiSelectionFromHost();

  return useQuery({
    queryKey: checklistDataQueryKeys.kpiSummary(templateExternalId, selection),
    queryFn: checklistKpiSummaryQueryFn(repository, templateExternalId, selection),
    staleTime: 300_000,
    refetchOnWindowFocus: false,
  });
}

export function useNotOkChecklistIdsQuery(): UseQueryResult<Set<string>> {
  const { useChecklistRepository } = useContext(UseChecklistDataQueriesContext);
  const repository = useChecklistRepository();
  return useQuery({
    queryKey: checklistDataQueryKeys.notOkIds,
    queryFn: fetchNotOkIdsQueryFn(repository),
    staleTime: 300_000,
    refetchOnWindowFocus: false,
  });
}

export function useChecklistSummariesPageQuery(
  notOkIds: Set<string> | undefined,
  cursor?: string,
  pageSize = DEFAULT_TABLE_PAGE_SIZE,
): UseQueryResult<PagedResult<ChecklistSummary>> {
  const { useChecklistRepository } = useContext(UseChecklistDataQueriesContext);
  const repository = useChecklistRepository();
  return useQuery({
    queryKey: checklistDataQueryKeys.summariesPage(cursor, pageSize),
    queryFn: listSummariesPageQueryFn(repository, notOkIds ?? new Set(), cursor, pageSize),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    enabled: notOkIds !== undefined,
  });
}

export function useTaskResultsPageQuery(
  cursor?: string,
  pageSize = DEFAULT_TABLE_PAGE_SIZE,
  options?: { enabled?: boolean },
): UseQueryResult<PagedResult<TaskResultItem>> {
  const { useChecklistRepository } = useContext(UseChecklistDataQueriesContext);
  const repository = useChecklistRepository();
  return useQuery({
    queryKey: checklistDataQueryKeys.taskResultsPage(cursor, pageSize),
    queryFn: listTaskResultsPageQueryFn(repository, cursor, pageSize),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    enabled: options?.enabled ?? true,
  });
}

export function useTaskResultAnalyticsQuery(
  period: AnalyticsPeriod,
  options?: { enabled?: boolean },
): UseQueryResult<TaskResultAnalyticsBundle> {
  const { useChecklistRepository } = useContext(UseChecklistDataQueriesContext);
  const repository = useChecklistRepository();
  const enabled = options?.enabled ?? true;

  const itemsQuery = useQuery({
    queryKey: checklistDataQueryKeys.taskAnalyticsItems,
    queryFn: taskAnalyticsItemsQueryFn(repository),
    staleTime: 300_000,
    refetchOnWindowFocus: false,
    enabled,
  });

  const bundle = useMemo(
    () =>
      itemsQuery.data !== undefined
        ? buildTaskResultAnalytics(itemsQuery.data, period)
        : undefined,
    [itemsQuery.data, period],
  );

  return {
    ...itemsQuery,
    data: bundle,
  } as UseQueryResult<TaskResultAnalyticsBundle>;
}

export function useMeasurementTrendsQuery(
  options?: { enabled?: boolean },
): UseQueryResult<MeasurementTrendPoint[]> {
  const { useChecklistRepository } = useContext(UseChecklistDataQueriesContext);
  const repository = useChecklistRepository();
  return useQuery({
    queryKey: checklistDataQueryKeys.measurementTrends,
    queryFn: measurementTrendsQueryFn(repository),
    staleTime: 120_000,
    refetchOnWindowFocus: false,
    enabled: options?.enabled ?? true,
  });
}

export function useRouteKpiSnapshotsQuery(
  options?: { enabled?: boolean },
): UseQueryResult<TimeSeriesKpiPoint[]> {
  const { useChecklistRepository } = useContext(UseChecklistDataQueriesContext);
  const repository = useChecklistRepository();
  return useQuery({
    queryKey: checklistDataQueryKeys.routeKpiSnapshots,
    queryFn: routeKpiSnapshotsQueryFn(repository),
    staleTime: 120_000,
    refetchOnWindowFocus: false,
    enabled: options?.enabled ?? true,
  });
}

export function useOperationalAlertsQuery(): UseQueryResult<OperationalAlert[]> {
  const { useChecklistRepository } = useContext(UseChecklistDataQueriesContext);
  const repository = useChecklistRepository();
  return useQuery({
    queryKey: checklistDataQueryKeys.alerts,
    queryFn: listAlertsQueryFn(repository),
    staleTime: 60_000,
    refetchInterval: loadNotificationSettings().pollingIntervalMs,
    refetchOnWindowFocus: false,
  });
}
