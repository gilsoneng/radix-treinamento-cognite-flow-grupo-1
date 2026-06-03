import { describe, expect, it } from 'vitest';

import type { ChecklistSummary } from './checklist-kpi.model';
import {
  buildOperationalCatalog,
  defaultOperationalSelection,
  stepOperationalDay,
  stepOperationalShift,
} from './operational-catalog.rules';

function summary(externalId: string): ChecklistSummary {
  return {
    space: 'flows_radix_checklist_group1',
    externalId,
    title: 'Test',
    status: 'created',
    endTime: null,
    templateExternalId: null,
    hasNotOk: false,
  };
}

describe(buildOperationalCatalog.name, () => {
  it('collects days and shifts from checklist externalIds', () => {
    const catalog = buildOperationalCatalog([
      summary('CKM_CHK_GR1_ROUTE1-2025-01-10-D'),
      summary('CKM_CHK_GR1_ROUTE1-2025-01-11-A'),
      summary('CKM_CHK_GR1_ROUTE1-2025-01-11-D'),
    ]);
    expect(catalog.days).toEqual(['2025-01-11', '2025-01-10']);
    expect(catalog.shiftsByDay['2025-01-11']).toEqual(['D', 'A']);
  });
});

describe(stepOperationalDay.name, () => {
  it('steps to older day', () => {
    const catalog = buildOperationalCatalog([
      summary('CKM_CHK_GR1_ROUTE1-2025-01-10-D'),
      summary('CKM_CHK_GR1_ROUTE1-2025-01-11-D'),
    ]);
    const current = defaultOperationalSelection(catalog, new Date('2025-01-11T15:00:00.000Z'));
    expect(current).not.toBeNull();
    if (!current) {
      return;
    }
    const older = stepOperationalDay(catalog, current, 'older');
    expect(older?.operationalDay).toBe('2025-01-10');
  });
});

describe(stepOperationalShift.name, () => {
  it('cycles shifts on the same day', () => {
    const catalog = buildOperationalCatalog([
      summary('CKM_CHK_GR1_ROUTE1-2025-01-11-D'),
      summary('CKM_CHK_GR1_ROUTE1-2025-01-11-A'),
    ]);
    const selection = { operationalDay: '2025-01-11', shiftCode: 'D' as const };
    expect(stepOperationalShift(catalog, selection, 'next')?.shiftCode).toBe('A');
  });
});
