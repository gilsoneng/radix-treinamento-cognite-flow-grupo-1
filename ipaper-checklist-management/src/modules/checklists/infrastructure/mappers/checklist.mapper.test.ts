import { describe, expect, it } from 'vitest';

import type { ChecklistInstanceDto, ChecklistItemInstanceDto } from '../dto/checklist-instance.dto';

import { checklistIdFromCitemExternalId } from './checklist-id.parser';
import { toChecklistSummary, toNotOkChecklistIds } from './checklist.mapper';

describe(checklistIdFromCitemExternalId.name, () => {
  it('derives checklist id from seeded citem external id', () => {
    expect(
      checklistIdFromCitemExternalId('CKM_CITEM_GR1_ALINE-ROUTE1-2025-06-01-A-PUMP-A-MOTOR-TEMP'),
    ).toBe('CKM_CHK_GR1_ALINE-ROUTE1-2025-06-01-A');
  });
});

describe(toChecklistSummary.name, () => {
  it('maps checklist DMS properties to domain summary', () => {
    const node: ChecklistInstanceDto = {
      space: 'cdf_apm',
      externalId: 'CKM_CHK_GR1_ALINE-ROUTE1-2025-06-01-A',
      instanceType: 'node',
      properties: {
        cdf_apm: {
          'Checklist/v7': {
            title: 'Line A — Shift A',
            status: 'started',
            endTime: '2026-06-03T10:00:00.000Z',
            sourceId: 'CKM_TMPL_GR1_ALINE-ROUTE1',
          },
        },
      },
    };

    expect(toChecklistSummary(node, false)).toEqual({
      space: 'cdf_apm',
      externalId: 'CKM_CHK_GR1_ALINE-ROUTE1-2025-06-01-A',
      title: 'Line A — Shift A',
      status: 'started',
      endTime: '2026-06-03T10:00:00.000Z',
      templateExternalId: 'CKM_TMPL_GR1_ALINE-ROUTE1',
      hasNotOk: false,
    });
  });
});

describe(toNotOkChecklistIds.name, () => {
  it('collects checklist ids for items with notes', () => {
    const items: ChecklistItemInstanceDto[] = [
      {
        space: 'cdf_apm',
        externalId: 'CKM_CITEM_GR1_ALINE-ROUTE1-2025-06-01-A-PUMP-A-MOTOR-TEMP',
        instanceType: 'node',
        properties: {
          cdf_apm: {
            'ChecklistItem/v7': { note: 'Anomaly detected' },
          },
        },
      },
    ];

    expect(toNotOkChecklistIds(items)).toEqual(
      new Set(['CKM_CHK_GR1_ALINE-ROUTE1-2025-06-01-A']),
    );
  });
});
