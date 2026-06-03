import type { OperationalAlert } from '../../domain/alert.model';
import type { ChecklistKpiSummary, ChecklistSummary } from '../../domain/checklist-kpi.model';
import type { ChecklistRepository } from '../../domain/checklist.repository';
import type { PagedResult } from '../../domain/pagination.model';
import type { MeasurementTrendPoint, TimeSeriesKpiPoint } from '../../domain/time-series-trend.model';
import type { AnalyticsPeriod } from '../../domain/task-result.model';
import type { TaskResultItem, TaskResultSummary } from '../../domain/task-result.model';

export const checklistDataQueryKeys = {
  notOkIds: ['checklists', 'not-ok-ids'] as const,
  kpiSummary: (templateExternalId?: string) =>
    ['checklists', 'kpi-summary', templateExternalId ?? 'all'] as const,
  summariesPage: (cursor: string | undefined, limit: number) =>
    ['checklists', 'summaries-page', cursor ?? 'start', limit] as const,
  taskResultsPage: (cursor: string | undefined, limit: number) =>
    ['checklists', 'task-results-page', cursor ?? 'start', limit] as const,
  taskSummary: (period: AnalyticsPeriod, cursor: string | undefined, limit: number) =>
    ['checklists', 'task-summary', period, cursor ?? 'start', limit] as const,
  alerts: ['checklists', 'alerts'] as const,
  /** Raw ChecklistItems from CDF (paginated full scan — period filter is client-side). */
  taskAnalyticsItems: ['checklists', 'task-analytics-items'] as const,
  taskAnalytics: (period: AnalyticsPeriod) => ['checklists', 'task-analytics', period] as const,
  measurementTrends: ['checklists', 'measurement-trends'] as const,
  routeKpiSnapshots: ['checklists', 'route-kpi-snapshots'] as const,
};

export function checklistKpiSummaryQueryFn(
  repository: ChecklistRepository,
  templateExternalId?: string,
) {
  return (): Promise<ChecklistKpiSummary> => repository.computeKpiSummary(templateExternalId);
}

export function fetchNotOkIdsQueryFn(repository: ChecklistRepository) {
  return (): Promise<Set<string>> => repository.fetchNotOkChecklistIds();
}

export function listSummariesPageQueryFn(
  repository: ChecklistRepository,
  notOkIds: Set<string>,
  cursor: string | undefined,
  limit: number,
) {
  return (): Promise<PagedResult<ChecklistSummary>> =>
    repository.listSummariesPage(notOkIds, cursor, limit);
}

export function listTaskResultsPageQueryFn(
  repository: ChecklistRepository,
  cursor: string | undefined,
  limit: number,
) {
  return (): Promise<PagedResult<TaskResultItem>> =>
    repository.listTaskResultsPage(cursor, limit);
}

export function taskSummaryQueryFn(
  repository: ChecklistRepository,
  period: AnalyticsPeriod,
  pageItems: readonly TaskResultItem[],
) {
  return (): Promise<TaskResultSummary> => repository.summarizeTaskResults(period, pageItems);
}

export function listAlertsQueryFn(repository: ChecklistRepository) {
  return (): Promise<OperationalAlert[]> => repository.listOperationalAlerts();
}

export function taskAnalyticsItemsQueryFn(repository: ChecklistRepository) {
  return (): Promise<TaskResultItem[]> => repository.fetchTaskResultsSample();
}

export function measurementTrendsQueryFn(repository: ChecklistRepository) {
  return (): Promise<MeasurementTrendPoint[]> => repository.listMeasurementTrends();
}

export function routeKpiSnapshotsQueryFn(repository: ChecklistRepository) {
  return (): Promise<TimeSeriesKpiPoint[]> => repository.listRouteKpiSnapshots();
}
