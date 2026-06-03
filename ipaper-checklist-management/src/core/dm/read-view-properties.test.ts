import { describe, expect, it } from 'vitest';

import { CHECKLIST_ITEM_VIEW } from './apm-dm.constants';
import { MEASUREMENT_TREND_VIEW } from './ip-dm.constants';
import { readViewProperties } from './read-view-properties';

describe(readViewProperties.name, () => {
  it('reads properties from view space (cdf_apm)', () => {
    const props = readViewProperties<{ status: string }>(
      {
        space: 'flows_radix_checklist_group1',
        properties: {
          cdf_apm: {
            'ChecklistItem/v7': { status: 'completed', note: null },
          },
        },
      },
      CHECKLIST_ITEM_VIEW,
    );
    expect(props.status).toBe('completed');
  });

  it('reads properties from instance space (flows_radix_checklist_group1)', () => {
    const props = readViewProperties<{ note: string }>(
      {
        space: 'flows_radix_checklist_group1',
        properties: {
          flows_radix_checklist_group1: {
            'ChecklistItem/v7': { note: 'Anomaly detected', status: 'completed' },
          },
        },
      },
      CHECKLIST_ITEM_VIEW,
    );
    expect(props.note).toBe('Anomaly detected');
  });

  it('reads MeasurementTrend numeric properties from instance space', () => {
    const props = readViewProperties<{
      lastValue: number;
      avg30dValue: number;
    }>(
      {
        space: 'flows_radix_checklist_group1',
        properties: {
          flows_radix_checklist_group1: {
            'MeasurementTrend/v1': {
              lastValue: 220.77,
              avg30dValue: 200.04,
              maxValue: 263.3,
            },
          },
        },
      },
      MEASUREMENT_TREND_VIEW,
    );
    expect(props.lastValue).toBe(220.77);
    expect(props.avg30dValue).toBe(200.04);
  });
});
