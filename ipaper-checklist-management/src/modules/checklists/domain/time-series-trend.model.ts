export type MeasurementTrendPoint = {
  readonly externalId: string;
  readonly label: string;
  readonly lastValue: number | null;
  readonly avg7d: number | null;
  readonly avg30d: number | null;
  readonly threshold: number | null;
  readonly exceedanceCount30d: number;
  readonly predictedDaysToAlarm: number | null;
};

export type TimeSeriesKpiPoint = {
  readonly period: string;
  readonly notOkRate: number;
  readonly totalChecklists: number;
};
