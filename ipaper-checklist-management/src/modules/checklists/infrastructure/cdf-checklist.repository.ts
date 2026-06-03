import { CHECKLIST_ITEM_VIEW, CHECKLIST_VIEW, OBSERVATION_VIEW } from '../../../core/dm/apm-dm.constants';
import {
  MEASUREMENT_TREND_VIEW,
  ROUTE_KPI_SNAPSHOT_VIEW,
} from '../../../core/dm/ip-dm.constants';
import type { CdfReadClient } from '../../../core/sdk/cdf-client';
import { cdfTaskRunner } from '../../../shared/utils/semaphore';
import { buildChecklistAlerts, sortAlertsByPriority } from '../domain/alert.rules';
import type { OperationalAlert } from '../domain/alert.model';
import {
  DEFAULT_CHECKLIST_LIST_LIMIT,
  DEFAULT_TABLE_PAGE_SIZE,
  KPI_SUMMARY_MAX_PAGES,
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

const ANALYTICS_TASK_RESULT_MAX_PAGES = 5;

const ALERT_CHECKLIST_MAX_PAGES = 3;

export class CdfChecklistRepository implements ChecklistRepository {
  constructor(private readonly client: CdfReadClient) {}

  fetchNotOkChecklistIds(): Promise<Set<string>> {
    return cdfTaskRunner.schedule(() => this.loadNotOkChecklistIds(), { key: 'not-ok-ids' });
  }

  private async loadNotOkChecklistIds(): Promise<Set<string>> {
    const itemNodes = await listChecklistItemsWithNotes(
      this.client,
      CHECKLIST_ITEM_VIEW,
      readChecklistItemNote,
      DEFAULT_CHECKLIST_LIST_LIMIT,
      undefined,
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
      const [checklistNodes, notOkIds] = await Promise.all([
        listAllViewNodes(
          this.client,
          CHECKLIST_VIEW,
          DEFAULT_CHECKLIST_LIST_LIMIT,
          KPI_SUMMARY_MAX_PAGES,
        ),
        this.loadNotOkChecklistIds(),
      ]);

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
      );

      return {
        items: toTaskResultItems(items as ChecklistItemInstanceDto[]),
        nextCursor,
        hasMore: Boolean(nextCursor),
      };
    });
  }

  fetchTaskResultsSample(maxPages = ANALYTICS_TASK_RESULT_MAX_PAGES): Promise<TaskResultItem[]> {
    return cdfTaskRunner.schedule(async () => {
      const [pagedNodes, notedNodes] = await Promise.all([
        listAllViewNodes(
          this.client,
          CHECKLIST_ITEM_VIEW,
          DEFAULT_CHECKLIST_LIST_LIMIT,
          maxPages,
        ),
        listChecklistItemsWithNotes(
          this.client,
          CHECKLIST_ITEM_VIEW,
          readChecklistItemNote,
          DEFAULT_CHECKLIST_LIST_LIMIT,
          maxPages,
        ),
      ]);

      const byExternalId = new Map<string, ChecklistItemInstanceDto>();
      for (const node of [...pagedNodes, ...notedNodes]) {
        byExternalId.set(node.externalId, node as ChecklistItemInstanceDto);
      }

      return toTaskResultItems([...byExternalId.values()]);
    });
  }

  listMeasurementTrends(limit = 40): Promise<MeasurementTrendPoint[]> {
    return cdfTaskRunner.schedule(async () => {
      const nodes = await listAllViewNodes(this.client, MEASUREMENT_TREND_VIEW, limit, 2);
      return nodes.map(toMeasurementTrendPoint);
    });
  }

  listRouteKpiSnapshots(limit = 24): Promise<TimeSeriesKpiPoint[]> {
    return cdfTaskRunner.schedule(async () => {
      const nodes = await listAllViewNodes(this.client, ROUTE_KPI_SNAPSHOT_VIEW, limit, 2);
      return nodes.map(toTimeSeriesKpiPoint).sort((a, b) => a.period.localeCompare(b.period));
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
        ),
        this.loadNotOkChecklistIds(),
        listAllViewNodes(this.client, OBSERVATION_VIEW, 50, 2),
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
