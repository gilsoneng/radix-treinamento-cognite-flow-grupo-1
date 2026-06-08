import type { ChecklistKpiBucket, ChecklistKpiCounts } from './checklist-kpi.model';
import type { ChecklistKpiInsights, KpiTrafficLight } from './kpi-insight.model';

const KPI_BUCKETS: ChecklistKpiBucket[] = ['todo', 'ongoing', 'done', 'overdue', 'notok'];

export function computeBucketDeltas(
  current: ChecklistKpiCounts,
  previous: ChecklistKpiCounts,
  hasPreviousCohort: boolean,
): Record<ChecklistKpiBucket, number | null> {
  const deltas = {} as Record<ChecklistKpiBucket, number | null>;
  for (const bucket of KPI_BUCKETS) {
    deltas[bucket] = hasPreviousCohort ? current[bucket] - previous[bucket] : null;
  }
  return deltas;
}

export function resolveKpiTrafficLight(
  bucket: ChecklistKpiBucket,
  value: number,
  delta: number | null,
): KpiTrafficLight {
  if (delta === null) {
    return 'neutral';
  }

  if (bucket === 'overdue' || bucket === 'notok') {
    if (value > 0 && delta > 0) {
      return 'critical';
    }
    if (value > 0) {
      return 'watch';
    }
    return 'good';
  }

  if (bucket === 'done') {
    if (delta > 0) {
      return 'good';
    }
    if (delta < 0) {
      return 'watch';
    }
    return 'neutral';
  }

  if (delta > 0) {
    return 'watch';
  }
  if (delta < 0) {
    return 'good';
  }
  return 'neutral';
}

export function formatKpiDeltaLabel(delta: number | null): string {
  if (delta === null) {
    return 'No prior shift data';
  }
  if (delta === 0) {
    return 'No change vs previous shift';
  }
  const magnitude = Math.abs(delta);
  const arrow = delta > 0 ? '▲' : '▼';
  return `${arrow} ${magnitude} vs previous shift`;
}

export function buildChecklistKpiInsights(
  counts: ChecklistKpiCounts,
  previousCounts: ChecklistKpiCounts,
  hasPreviousCohort: boolean,
): ChecklistKpiInsights {
  const deltas = computeBucketDeltas(counts, previousCounts, hasPreviousCohort);
  const insights = {} as ChecklistKpiInsights;

  for (const bucket of KPI_BUCKETS) {
    const delta = deltas[bucket];
    insights[bucket] = {
      delta,
      trafficLight: resolveKpiTrafficLight(bucket, counts[bucket], delta),
      deltaLabel: formatKpiDeltaLabel(delta),
    };
  }

  return insights;
}
