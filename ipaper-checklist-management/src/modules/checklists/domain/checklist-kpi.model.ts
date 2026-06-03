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
  /** Checklists in the current operational day/shift scope (for list views). */
  readonly scopedSummaries: readonly ChecklistSummary[];
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

/** Max pages when scanning ChecklistItem notes for Not OK in bounded paths (alerts). */
export const NOT_OK_ITEM_SCAN_MAX_PAGES = 3;

/** UI table page size (one CDF list request per table page). */
export const DEFAULT_TABLE_PAGE_SIZE = 25;

/**
 * Full-scan page size for `flows_radix_checklist_group1` (Overview KPIs + Analytics task results).
 * Each CDF `instances.list` request returns up to this many nodes; pagination continues via cursor.
 */
export const GRUPO1_CDF_FULL_SCAN_PAGE_SIZE = 250;

/** `undefined` = paginate every batch until CDF returns no `nextCursor`. */
export const GRUPO1_CDF_FULL_SCAN_MAX_PAGES: number | undefined = undefined;

/** @deprecated Use {@link GRUPO1_CDF_FULL_SCAN_PAGE_SIZE} */
export const ANALYTICS_TASK_RESULT_PAGE_SIZE = GRUPO1_CDF_FULL_SCAN_PAGE_SIZE;

/** @deprecated Use {@link GRUPO1_CDF_FULL_SCAN_MAX_PAGES} */
export const ANALYTICS_TASK_RESULT_MAX_PAGES = GRUPO1_CDF_FULL_SCAN_MAX_PAGES;

/** @deprecated Use {@link GRUPO1_CDF_FULL_SCAN_MAX_PAGES} */
export const KPI_SUMMARY_MAX_PAGES = GRUPO1_CDF_FULL_SCAN_MAX_PAGES;
