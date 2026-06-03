import { describe, expect, it } from 'vitest';

import type { ChecklistSummary } from './checklist-kpi.model';
import {
  filterChecklistsByShiftRef,
  parseChecklistShift,
  parseOperationalShiftFromExternalId,
} from './checklist-shift.rules';

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

describe(parseChecklistShift.name, () => {
  it('parses date and shift code from checklist externalId', () => {
    expect(parseChecklistShift('CKM_CHK_GR1_ROUTE1-2025-06-01-D')).toEqual({
      dateIso: '2025-06-01',
      code: 'D',
    });
  });
});

describe(parseOperationalShiftFromExternalId.name, () => {
  it('parses shift from observation externalId', () => {
    expect(parseOperationalShiftFromExternalId('CKM_OBS_GR1_ROUTE1-2025-03-15-D-7F-SCRAPER')).toEqual({
      dateIso: '2025-03-15',
      code: 'D',
    });
  });
});

describe(filterChecklistsByShiftRef.name, () => {
  it('filters checklists for a shift reference', () => {
    const items = [
      summary('CKM_CHK_GR1_ROUTE1-2025-06-01-D'),
      summary('CKM_CHK_GR1_ROUTE1-2025-06-01-A'),
    ];
    const filtered = filterChecklistsByShiftRef(items, { dateIso: '2025-06-01', code: 'A' });
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.externalId).toContain('-A');
  });
});
