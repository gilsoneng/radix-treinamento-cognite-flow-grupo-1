import { describe, expect, it } from 'vitest';

import type { ChecklistSummary } from './checklist-kpi.model';
import { filterChecklistsByTemplate, summarizeChecklistKpis } from './checklist-kpi.rules';

function makeChecklist(overrides: Partial<ChecklistSummary>): ChecklistSummary {
  return {
    space: 'cdf_apm',
    externalId: 'chk-1',
    title: 'Test',
    status: 'created',
    endTime: null,
    templateExternalId: null,
    hasNotOk: false,
    ...overrides,
  };
}

describe(summarizeChecklistKpis.name, () => {
  it('counts todo, ongoing, done, overdue, and notok buckets', () => {
    const now = new Date('2026-06-03T12:00:00.000Z');
    const counts = summarizeChecklistKpis(
      [
        makeChecklist({ status: 'created' }),
        makeChecklist({ status: 'started' }),
        makeChecklist({ status: 'completed' }),
        makeChecklist({ status: 'started', endTime: '2026-06-01T08:00:00.000Z' }),
        makeChecklist({ status: 'completed', hasNotOk: true }),
      ],
      now,
    );

    expect(counts).toEqual({
      todo: 1,
      ongoing: 1,
      done: 1,
      overdue: 1,
      notok: 1,
    });
  });
});

describe(filterChecklistsByTemplate.name, () => {
  it('returns all checklists when template filter is undefined', () => {
    const checklists = [
      makeChecklist({ templateExternalId: 'tmpl-a' }),
      makeChecklist({ externalId: 'chk-2', templateExternalId: 'tmpl-b' }),
    ];
    expect(filterChecklistsByTemplate(checklists, undefined)).toHaveLength(2);
  });

  it('filters by template external id', () => {
    const checklists = [
      makeChecklist({ templateExternalId: 'tmpl-a' }),
      makeChecklist({ externalId: 'chk-2', templateExternalId: 'tmpl-b' }),
    ];
    const filtered = filterChecklistsByTemplate(checklists, 'tmpl-a');
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.externalId).toBe('chk-1');
  });
});
