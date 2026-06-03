import type { ChecklistKpiSummary, ChecklistSummary } from './checklist-kpi.model';
import type { OperationalKpiSelection } from './operational-catalog.model';
import type { OperationalAlert } from './alert.model';
import type { PagedResult } from './pagination.model';
import type { MeasurementTrendPoint, TimeSeriesKpiPoint } from './time-series-trend.model';
import type { AnalyticsPeriod } from './task-result.model';
import type { TaskResultItem, TaskResultSummary } from './task-result.model';

export interface ChecklistRepository {
  /** Bounded scan of ChecklistItem notes (cached by react-query). */
  fetchNotOkChecklistIds(): Promise<Set<string>>;
  /** Bounded aggregate for Overview KPI cards (does not scan entire CDF). */
  computeKpiSummary(
    templateExternalId?: string,
    selection?: OperationalKpiSelection,
  ): Promise<ChecklistKpiSummary>;
  listSummariesPage(
    notOkIds: Set<string>,
    cursor?: string,
    limit?: number,
  ): Promise<PagedResult<ChecklistSummary>>;
  listTaskResultsPage(cursor?: string, limit?: number): Promise<PagedResult<TaskResultItem>>;
  /** Paginated full scan of grupo-1 ChecklistItems (250 per CDF page by default). */
  fetchTaskResultsSample(pageSize?: number, maxPages?: number): Promise<TaskResultItem[]>;
  listMeasurementTrends(limit?: number): Promise<MeasurementTrendPoint[]>;
  listRouteKpiSnapshots(limit?: number): Promise<TimeSeriesKpiPoint[]>;
  summarizeTaskResults(period?: AnalyticsPeriod, items?: readonly TaskResultItem[]): Promise<TaskResultSummary>;
  listOperationalAlerts(): Promise<OperationalAlert[]>;
}
