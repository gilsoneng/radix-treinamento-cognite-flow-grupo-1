import type { OperationalShiftContext } from './inspection-shift.model';
import type { ChecklistKpiInsights } from './kpi-insight.model';
import type { OperationalKpiCatalog, OperationalKpiSelection } from './operational-catalog.model';

export type ChecklistKpiBucket = 'todo' | 'ongoing' | 'done' | 'overdue' | 'notok';

export type ChecklistKpiCounts = Record<ChecklistKpiBucket, number>;

export type ChecklistSummary = {
  readonly space: string;
  readonly externalId: string;
  readonly title: string;
  readonly status: string;
  readonly endTime: string | null;
  readonly templateExternalId: string | null;
  readonly hasNotOk: boolean;
};

export type ChecklistKpiSummary = {
  readonly counts: ChecklistKpiCounts;
  readonly total: number;
  readonly insights: ChecklistKpiInsights;
  readonly shiftContext: OperationalShiftContext | null;
  readonly catalog: OperationalKpiCatalog;
  readonly selection: OperationalKpiSelection | null;
};

export const EMPTY_KPI_COUNTS: ChecklistKpiCounts = {
  todo: 0,
  ongoing: 0,
  done: 0,
  overdue: 0,
  notok: 0,
};

/** CDF `instances.list` page size. */
export const DEFAULT_CHECKLIST_LIST_LIMIT = 50;

/** Max pages when aggregating KPIs / alerts (bounded scan). */
export const MAX_CHECKLIST_LIST_PAGES = 5;

/** Max pages when scanning ChecklistItem notes for Not OK (was unbounded). */
export const NOT_OK_ITEM_SCAN_MAX_PAGES = 3;

/** Unbounded pagination for KPI aggregation (full dataset scan). */
export const KPI_SUMMARY_MAX_PAGES: number | undefined = undefined;

/** UI table page size (one CDF list request per table page). */
export const DEFAULT_TABLE_PAGE_SIZE = 25;
