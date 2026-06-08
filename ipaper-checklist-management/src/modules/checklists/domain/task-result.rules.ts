import type { AnalyticsPeriod } from './task-result.model';
import type { ChecklistSummary } from './checklist-kpi.model';
import type { TaskResultCategory, TaskResultItem, TaskResultSummary } from './task-result.model';

export function categorizeTaskResult(note: string | null, status: string): TaskResultCategory {
  if ((note ?? '').trim().length > 0) {
    return 'nok';
  }
  const normalized = status.trim().toLowerCase();
  if (
    normalized === 'not ok' ||
    normalized === 'not_ok' ||
    normalized === 'notok' ||
    normalized === 'failed'
  ) {
    return 'nok';
  }
  if (normalized === 'completed' || normalized === 'done') {
    return 'ok';
  }
  return 'observation';
}

/** Execution date from endTime or embedded date in ChecklistItem externalId. */
export function taskResultExecutionDate(item: TaskResultItem): Date | null {
  if (item.endTime) {
    const fromEnd = new Date(item.endTime);
    if (!Number.isNaN(fromEnd.getTime())) {
      return fromEnd;
    }
  }
  const match = /\d{4}-\d{2}-\d{2}/.exec(item.externalId);
  if (!match) {
    return null;
  }
  const fromId = new Date(match[0]);
  return Number.isNaN(fromId.getTime()) ? null : fromId;
}

function periodAnchorDate(items: readonly TaskResultItem[], now: Date): Date {
  const dates = items
    .map(taskResultExecutionDate)
    .filter((value): value is Date => value !== null);
  if (dates.length === 0) {
    return now;
  }
  return new Date(Math.max(...dates.map((d) => d.getTime())));
}

export function summarizeTaskResults(items: readonly TaskResultItem[]): TaskResultSummary {
  const summary: TaskResultSummary = { ok: 0, nok: 0, observation: 0 };
  for (const item of items) {
    summary[item.category] += 1;
  }
  return summary;
}

export function filterTaskResultsByPeriod(
  items: readonly TaskResultItem[],
  period: AnalyticsPeriod,
  now: Date = new Date(),
): TaskResultItem[] {
  if (period === 'all') {
    return [...items];
  }
  const days = period === '7d' ? 7 : 30;
  const anchor = periodAnchorDate(items, now);
  const cutoff = new Date(anchor);
  cutoff.setDate(cutoff.getDate() - days);

  return items.filter((item) => {
    const executionDate = taskResultExecutionDate(item);
    if (!executionDate) {
      return true;
    }
    return executionDate >= cutoff;
  });
}

export function filterChecklistsByPeriod(
  checklists: readonly ChecklistSummary[],
  period: AnalyticsPeriod,
  now: Date = new Date(),
): ChecklistSummary[] {
  if (period === 'all') {
    return [...checklists];
  }
  const days = period === '7d' ? 7 : 30;
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - days);

  return checklists.filter((checklist) => {
    const ref = checklist.endTime ?? checklist.title;
    const match = /\d{4}-\d{2}-\d{2}/.exec(ref);
    if (!match) {
      return true;
    }
    const date = new Date(match[0]);
    return !Number.isNaN(date.getTime()) && date >= cutoff;
  });
}
