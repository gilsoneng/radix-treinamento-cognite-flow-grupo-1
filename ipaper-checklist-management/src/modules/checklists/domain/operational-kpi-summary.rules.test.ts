import { describe, expect, it } from 'vitest';

import type { ChecklistSummary } from './checklist-kpi.model';
import { buildOperationalKpiSummary } from './operational-kpi-summary.rules';

function summary(
  externalId: string,
  status: string,
  hasNotOk = false,
): ChecklistSummary {
  return {
    space: 'flows_radix_checklist_group1',
    externalId,
    title: 'Test',
    status,
    endTime: null,
    templateExternalId: null,
    hasNotOk,
  };
}

describe(buildOperationalKpiSummary.name, () => {
  it('computes deltas for explicit day and shift selection', () => {
    const checklists = [
      summary('CKM_CHK_GR1_ROUTE1-2025-06-02-D', 'created'),
      summary('CKM_CHK_GR1_ROUTE1-2025-06-02-D', 'completed'),
      summary('CKM_CHK_GR1_ROUTE1-2025-06-01-N', 'created'),
      summary('CKM_CHK_GR1_ROUTE1-2025-06-01-N', 'created'),
      summary('CKM_CHK_GR1_ROUTE1-2025-06-01-N', 'created'),
    ];

    const result = buildOperationalKpiSummary(checklists, undefined, {
      operationalDay: '2025-06-02',
      shiftCode: 'D',
    });

    expect(result.selection?.operationalDay).toBe('2025-06-02');
    expect(result.counts.todo).toBe(1);
    expect(result.insights.todo.delta).toBe(-2);
    expect(result.catalog.days[0]).toBe('2025-06-02');
  });
});
