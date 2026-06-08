export const IP_DM_SPACE = 'ip_checklist_dm';

export const MEASUREMENT_TREND_VIEW = {
  space: IP_DM_SPACE,
  externalId: 'MeasurementTrend',
  version: 'v1',
} as const;

export const ROUTE_KPI_SNAPSHOT_VIEW = {
  space: IP_DM_SPACE,
  externalId: 'RouteKpiSnapshot',
  version: 'v1',
} as const;

export const CHECKLIST_KPI_VIEW = {
  space: IP_DM_SPACE,
  externalId: 'ChecklistKpi',
  version: 'v1',
} as const;
