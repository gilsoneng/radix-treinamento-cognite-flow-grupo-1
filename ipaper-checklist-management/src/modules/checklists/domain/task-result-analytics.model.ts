export type TaskResultTrendPoint = {
  readonly date: string;
  readonly ok: number;
  readonly notok: number;
  readonly observation: number;
  readonly pctNotOk: number;
};

export type NamedCount = {
  readonly name: string;
  readonly count: number;
};

export type RecurringNotOkRow = {
  readonly task: string;
  readonly checklist: string;
  readonly occurrences: number;
  readonly lastSeen: string;
};

import type { TaskResultItem } from './task-result.model';

export type TaskResultAnalyticsBundle = {
  readonly trend: readonly TaskResultTrendPoint[];
  readonly notOkByChecklist: readonly NamedCount[];
  readonly notOkByArea: readonly NamedCount[];
  readonly recurringNotOk: readonly RecurringNotOkRow[];
  readonly items: readonly TaskResultItem[];
  readonly summary: { readonly ok: number; readonly nok: number; readonly observation: number };
};
