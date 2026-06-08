import type { InstanceNodeDto } from '../sdk/cdf-client';

export function viewPropertyKey(view: { externalId: string; version: string }): string {
  return `${view.externalId}/${view.version}`;
}

const PROPERTY_FIELD_HINTS = new Set([
  'title',
  'status',
  'note',
  'endTime',
  'sourceId',
  'name',
  'description',
  'periodLabel',
  'periodType',
  'avgNokRate',
  'totalChecklists',
  'avgDurationMinutes',
  'totalObservations',
  'lastValue',
  'avg7dValue',
  'avg30dValue',
  'maxValue',
  'trendSlope',
  'threshold',
  'exceedanceCount30d',
  'predictedDaysToAlarm',
  'lastCalculatedAt',
  'assetRef',
]);

function looksLikePropertyBag(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object') {
    return false;
  }
  return Object.keys(value).some((key) => PROPERTY_FIELD_HINTS.has(key));
}

/**
 * CDF `instances.list` may return view properties under the view space (`cdf_apm`)
 * or the instance space (`flows_radix_checklist_group1`). This helper resolves both.
 */
export function readViewProperties<T extends Record<string, unknown>>(
  node: Pick<InstanceNodeDto, 'space' | 'properties'>,
  view: { space: string; externalId: string; version: string },
): T {
  if (!node.properties) {
    return {} as T;
  }

  const nestedKey = viewPropertyKey(view);
  const spacesToTry = [...new Set([view.space, node.space, ...Object.keys(node.properties)])];

  for (const space of spacesToTry) {
    const spaceProps = node.properties[space];
    if (!spaceProps || typeof spaceProps !== 'object') {
      continue;
    }

    const nested = spaceProps[nestedKey];
    if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
      return nested as T;
    }

    if (looksLikePropertyBag(spaceProps)) {
      return spaceProps as T;
    }
  }

  return {} as T;
}
