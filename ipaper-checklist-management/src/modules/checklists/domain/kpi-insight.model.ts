import type { ChecklistKpiBucket } from './checklist-kpi.model';

export type KpiTrafficLight = 'good' | 'watch' | 'critical' | 'neutral';

export type ChecklistKpiBucketInsight = {
  readonly delta: number | null;
  readonly trafficLight: KpiTrafficLight;
  readonly deltaLabel: string;
};

export type ChecklistKpiInsights = Record<ChecklistKpiBucket, ChecklistKpiBucketInsight>;
