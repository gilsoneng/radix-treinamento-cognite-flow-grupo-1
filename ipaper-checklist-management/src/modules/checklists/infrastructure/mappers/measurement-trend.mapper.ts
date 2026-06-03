import { MEASUREMENT_TREND_VIEW, ROUTE_KPI_SNAPSHOT_VIEW } from '../../../../core/dm/ip-dm.constants';
import { readViewProperties } from '../../../../core/dm/read-view-properties';
import type { InstanceNodeDto } from '../../../../core/sdk/cdf-client';
import type { MeasurementTrendPoint, TimeSeriesKpiPoint } from '../../domain/time-series-trend.model';

function readProps(
  node: InstanceNodeDto,
  view: { space: string; externalId: string; version: string },
): Record<string, unknown> {
  return readViewProperties<Record<string, unknown>>(node, view);
}

function readNumber(value: unknown): number | null {
  return typeof value === 'number' && !Number.isNaN(value) ? value : null;
}

export function toMeasurementTrendPoint(node: InstanceNodeDto): MeasurementTrendPoint {
  const props = readProps(node, MEASUREMENT_TREND_VIEW);
  const label = node.externalId.replace(/^CKM_MTRND_GR1_/, '').replace(/-/g, ' ');

  return {
    externalId: node.externalId,
    label: label.slice(0, 48),
    lastValue: readNumber(props.lastValue),
    avg7d: readNumber(props.avg7dValue),
    avg30d: readNumber(props.avg30dValue),
    threshold: readNumber(props.threshold),
    exceedanceCount30d: readNumber(props.exceedanceCount30d) ?? 0,
    predictedDaysToAlarm: readNumber(props.predictedDaysToAlarm),
  };
}

export function toTimeSeriesKpiPoint(node: InstanceNodeDto): TimeSeriesKpiPoint {
  const props = readProps(node, ROUTE_KPI_SNAPSHOT_VIEW);
  const period = typeof props.periodLabel === 'string' ? props.periodLabel : 'unknown';
  const avgNokRate = readNumber(props.avgNokRate) ?? 0;

  return {
    period,
    notOkRate: Math.round(avgNokRate * 100),
    totalChecklists: readNumber(props.totalChecklists) ?? 0,
  };
}
