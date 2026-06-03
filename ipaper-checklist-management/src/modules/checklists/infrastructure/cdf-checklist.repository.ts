import {
  CHECKLIST_INSTANCE_SPACE,
  CHECKLIST_ITEM_VIEW,
  CHECKLIST_VIEW,
  OBSERVATION_VIEW,
} from '../../../core/dm/apm-dm.constants';
import {
  MEASUREMENT_TREND_VIEW,
  ROUTE_KPI_SNAPSHOT_VIEW,
} from '../../../core/dm/ip-dm.constants';
import type { CdfReadClient } from '../../../core/sdk/cdf-client';
import { cdfTaskRunner } from '../../../shared/utils/semaphore';
import { buildChecklistAlerts, sortAlertsByPriority } from '../domain/alert.rules';
import type { OperationalAlert } from '../domain/alert.model';
import {
  ANALYTICS_TASK_RESULT_MAX_PAGES,
  ANALYTICS_TASK_RESULT_PAGE_SIZE,
  DEFAULT_CHECKLIST_LIST_LIMIT,
  DEFAULT_TABLE_PAGE_SIZE,
  GRUPO1_CDF_FULL_SCAN_MAX_PAGES,
  GRUPO1_CDF_FULL_SCAN_PAGE_SIZE,
  type ChecklistKpiSummary,
  type ChecklistSummary,
} from '../domain/checklist-kpi.model';
import { filterChecklistsByTemplate, summarizeChecklistKpis } from '../domain/checklist-kpi.rules';
import type { ChecklistRepository } from '../domain/checklist.repository';
import type { PagedResult } from '../domain/pagination.model';
import type { AnalyticsPeriod } from '../domain/task-result.model';
import {
  filterTaskResultsByPeriod,
  summarizeTaskResults,
} from '../domain/task-result.rules';
import type { MeasurementTrendPoint, TimeSeriesKpiPoint } from '../domain/time-series-trend.model';
import type { TaskResultItem, TaskResultSummary } from '../domain/task-result.model';

import { listAllViewNodes, listChecklistItemsWithNotes, listViewNodesPage } from './cdf-list-nodes';
import type { ChecklistInstanceDto, ChecklistItemInstanceDto } from './dto/checklist-instance.dto';
import { readChecklistItemNote, toChecklistSummary, toNotOkChecklistIds } from './mappers/checklist.mapper';
import { toTaskResultItems } from './mappers/checklist-item.mapper';
import {
  toMeasurementTrendPoint,
  toTimeSeriesKpiPoint,
} from './mappers/measurement-trend.mapper';
import { toCriticalObservationAlerts } from './mappers/observation.mapper';

const ALERT_CHECKLIST_MAX_PAGES = 3;

const ROUTE_KPI_SNAPSHOT_MAX_PAGES = 6;

const grupo1List = { instanceSpace: CHECKLIST_INSTANCE_SPACE } as const;

function aggregateRouteKpiByPeriod(points: readonly TimeSeriesKpiPoint[]): TimeSeriesKpiPoint[] {
  const byPeriod = new Map<
    string,
    { weightedNotOk: number; totalChecklists: number; weight: number }
  >();

  for (const point of points) {
    const bucket = byPeriod.get(point.period) ?? {
      weightedNotOk: 0,
      totalChecklists: 0,
      weight: 0,
    };
    const weight = Math.max(point.totalChecklists, 1);
    bucket.weightedNotOk += point.notOkRate * weight;
    bucket.weight += weight;
    bucket.totalChecklists += point.totalChecklists;
    byPeriod.set(point.period, bucket);
  }

  return [...byPeriod.entries()]
    .map(([period, agg]) => ({
      period,
      notOkRate: agg.weight > 0 ? Math.round(agg.weightedNotOk / agg.weight) : 0,
      totalChecklists: agg.totalChecklists,
    }))
    .sort((a, b) => a.period.localeCompare(b.period));
}

export class CdfChecklistRepository implements ChecklistRepository {
  constructor(private readonly client: CdfReadClient) {}

  fetchNotOkChecklistIds(): Promise<Set<string>> {
    return cdfTaskRunner.schedule(() => this.loadNotOkChecklistIds(), { key: 'not-ok-ids' });
  }

  private async loadNotOkChecklistIds(
    pageSize = GRUPO1_CDF_FULL_SCAN_PAGE_SIZE,
    maxPages: number | undefined = GRUPO1_CDF_FULL_SCAN_MAX_PAGES,
  ): Promise<Set<string>> {
    const itemNodes = await listChecklistItemsWithNotes(
      this.client,
      CHECKLIST_ITEM_VIEW,
      readChecklistItemNote,
      pageSize,
      maxPages,
      grupo1List,
    );
    return toNotOkChecklistIds(itemNodes as ChecklistItemInstanceDto[]);
  }

  private mapChecklistPage(
    nodes: ChecklistInstanceDto[],
    notOkIds: Set<string>,
  ): ChecklistSummary[] {
    return nodes.map((node) => toChecklistSummary(node, notOkIds.has(node.externalId)));
  }

  async listSummariesPage(
    notOkIds: Set<string>,
    cursor?: string,
    limit = DEFAULT_TABLE_PAGE_SIZE,
  ): Promise<PagedResult<ChecklistSummary>> {
    return cdfTaskRunner.schedule(async () => {
      const { items, nextCursor } = await listViewNodesPage(
        this.client,
        CHECKLIST_VIEW,
        limit,
        cursor,
        grupo1List,
      );

      return {
        items: this.mapChecklistPage(items as ChecklistInstanceDto[], notOkIds),
        nextCursor,
        hasMore: Boolean(nextCursor),
      };
    });
  }

  async computeKpiSummary(templateExternalId?: string): Promise<ChecklistKpiSummary> {
    return cdfTaskRunner.schedule(async () => {
      const notOkIds = await this.fetchNotOkChecklistIds();
      const checklistNodes = await listAllViewNodes(
        this.client,
        CHECKLIST_VIEW,
        GRUPO1_CDF_FULL_SCAN_PAGE_SIZE,
        GRUPO1_CDF_FULL_SCAN_MAX_PAGES,
        grupo1List,
      );

      const summaries = this.mapChecklistPage(checklistNodes as ChecklistInstanceDto[], notOkIds);
      const filtered = filterChecklistsByTemplate(summaries, templateExternalId);
      const counts = summarizeChecklistKpis(filtered);

      return {
        counts,
        total: filtered.length,
      };
    });
  }

  async listTaskResultsPage(
    cursor?: string,
    limit = DEFAULT_TABLE_PAGE_SIZE,
  ): Promise<PagedResult<TaskResultItem>> {
    return cdfTaskRunner.schedule(async () => {
      const { items, nextCursor } = await listViewNodesPage(
        this.client,
        CHECKLIST_ITEM_VIEW,
        limit,
        cursor,
        grupo1List,
      );

      return {
        items: toTaskResultItems(items as ChecklistItemInstanceDto[]),
        nextCursor,
        hasMore: Boolean(nextCursor),
      };
    });
  }

  fetchTaskResultsSample(
    pageSize = ANALYTICS_TASK_RESULT_PAGE_SIZE,
    maxPages: number | undefined = ANALYTICS_TASK_RESULT_MAX_PAGES,
  ): Promise<TaskResultItem[]> {
    return cdfTaskRunner.schedule(async () => {
      const nodes = await listAllViewNodes(
        this.client,
        CHECKLIST_ITEM_VIEW,
        pageSize,
        maxPages,
        grupo1List,
      );

      return toTaskResultItems(nodes as ChecklistItemInstanceDto[]);
    });
  }

  listMeasurementTrends(limit = 40): Promise<MeasurementTrendPoint[]> {
    return cdfTaskRunner.schedule(async () => {
      const nodes = await listAllViewNodes(
        this.client,
        MEASUREMENT_TREND_VIEW,
        limit,
        2,
        grupo1List,
      );
      return nodes.map(toMeasurementTrendPoint);
    });
  }

  listRouteKpiSnapshots(limit = 50): Promise<TimeSeriesKpiPoint[]> {
    return cdfTaskRunner.schedule(async () => {
      const nodes = await listAllViewNodes(
        this.client,
        ROUTE_KPI_SNAPSHOT_VIEW,
        limit,
        ROUTE_KPI_SNAPSHOT_MAX_PAGES,
        grupo1List,
      );
      return aggregateRouteKpiByPeriod(nodes.map(toTimeSeriesKpiPoint));
    });
  }

  async summarizeTaskResults(
    period: AnalyticsPeriod = 'all',
    items?: readonly TaskResultItem[],
  ): Promise<TaskResultSummary> {
    const source =
      items ??
      (
        await this.listTaskResultsPage(undefined, DEFAULT_CHECKLIST_LIST_LIMIT)
      ).items;
    const filtered = filterTaskResultsByPeriod(source, period);
    return summarizeTaskResults(filtered);
  }

  listOperationalAlerts(): Promise<OperationalAlert[]> {
    return cdfTaskRunner.schedule(async () => {
      const [checklistNodes, notOkIds, observationNodes] = await Promise.all([
        listAllViewNodes(
          this.client,
          CHECKLIST_VIEW,
          DEFAULT_CHECKLIST_LIST_LIMIT,
          ALERT_CHECKLIST_MAX_PAGES,
          grupo1List,
        ),
        this.fetchNotOkChecklistIds(),
        listAllViewNodes(this.client, OBSERVATION_VIEW, 50, 2, grupo1List),
      ]);

      const checklists = this.mapChecklistPage(
        checklistNodes as ChecklistInstanceDto[],
        notOkIds,
      );
      const checklistAlerts = buildChecklistAlerts(checklists);
      const observationAlerts = toCriticalObservationAlerts(observationNodes);
      return sortAlertsByPriority([...checklistAlerts, ...observationAlerts]);
    });
  }
}
