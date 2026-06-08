import type { AnalyticsPeriod } from './task-result.model';
import type { TaskResultItem } from './task-result.model';
import { filterTaskResultsByPeriod, taskResultExecutionDate } from './task-result.rules';
import type {
  NamedCount,
  RecurringNotOkRow,
  TaskResultAnalyticsBundle,
  TaskResultTrendPoint,
} from './task-result-analytics.model';

function routeFromChecklistId(checklistId: string | null): string {
  if (!checklistId) {
    return 'Unknown';
  }
  const match = /ROUTE\d+/i.exec(checklistId);
  return match ? match[0].toUpperCase() : 'Other';
}

function dateKeyFromItem(item: TaskResultItem): string {
  const execution = taskResultExecutionDate(item);
  if (execution) {
    return execution.toISOString().slice(0, 10);
  }
  return 'unknown';
}

export function buildTaskResultTrendSeries(
  items: readonly TaskResultItem[],
  period: AnalyticsPeriod,
  now: Date = new Date(),
): TaskResultTrendPoint[] {
  const filtered = filterTaskResultsByPeriod(items, period, now);
  const byDate = new Map<string, { ok: number; notok: number; observation: number }>();

  for (const item of filtered) {
    const key = dateKeyFromItem(item);
    const bucket = byDate.get(key) ?? { ok: 0, notok: 0, observation: 0 };
    if (item.category === 'nok') {
      bucket.notok += 1;
    } else {
      bucket[item.category] += 1;
    }
    byDate.set(key, bucket);
  }

  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, counts]) => {
      const total = counts.ok + counts.notok + counts.observation;
      const pctNotOk = total > 0 ? Math.round((counts.notok / total) * 100) : 0;
      return { date, ...counts, pctNotOk };
    });
}

function topNamedCounts(
  items: readonly TaskResultItem[],
  nameFor: (item: TaskResultItem) => string,
  limit = 8,
): NamedCount[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    if (item.category !== 'nok') {
      continue;
    }
    const name = nameFor(item);
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function buildRecurringNotOkRows(
  items: readonly TaskResultItem[],
  period: AnalyticsPeriod,
  limit = 12,
): RecurringNotOkRow[] {
  const filtered = filterTaskResultsByPeriod(
    items.filter((i) => i.category === 'nok'),
    period,
  );
  const byTask = new Map<string, { checklist: string; count: number; lastSeen: string }>();

  for (const item of filtered) {
    const key = item.title || item.externalId;
    const existing = byTask.get(key);
    const date = dateKeyFromItem(item);
    if (!existing) {
      byTask.set(key, {
        checklist: item.checklistExternalId ?? '—',
        count: 1,
        lastSeen: date,
      });
    } else {
      existing.count += 1;
      if (date > existing.lastSeen) {
        existing.lastSeen = date;
      }
    }
  }

  return [...byTask.entries()]
    .map(([task, meta]) => ({
      task,
      checklist: meta.checklist,
      occurrences: meta.count,
      lastSeen: meta.lastSeen,
    }))
    .sort((a, b) => b.occurrences - a.occurrences)
    .slice(0, limit);
}

export function buildTaskResultAnalytics(
  items: readonly TaskResultItem[],
  period: AnalyticsPeriod,
): TaskResultAnalyticsBundle {
  const filtered = filterTaskResultsByPeriod(items, period);
  const summary = { ok: 0, nok: 0 as number, observation: 0 };
  for (const item of filtered) {
    if (item.category === 'nok') {
      summary.nok += 1;
    } else {
      summary[item.category] += 1;
    }
  }

  return {
    trend: buildTaskResultTrendSeries(items, period),
    notOkByChecklist: topNamedCounts(filtered, (item) => item.checklistExternalId ?? 'Unknown'),
    notOkByArea: topNamedCounts(filtered, (item) => routeFromChecklistId(item.checklistExternalId)),
    recurringNotOk: buildRecurringNotOkRows(items, period),
    items: filtered,
    summary,
  };
}
