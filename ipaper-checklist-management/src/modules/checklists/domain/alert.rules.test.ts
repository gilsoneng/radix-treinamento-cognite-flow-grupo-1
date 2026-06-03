import { describe, expect, it } from 'vitest';

import type { ChecklistSummary } from './checklist-kpi.model';
import { buildChecklistAlerts, isChecklistDueSoon, isChecklistOverdue } from './alert.rules';

function makeChecklist(overrides: Partial<ChecklistSummary>): ChecklistSummary {
  return {
    space: 'cdf_apm',
    externalId: 'chk-1',
    title: 'Route A',
    status: 'started',
    endTime: null,
    templateExternalId: null,
    hasNotOk: false,
    ...overrides,
  };
}

describe(isChecklistOverdue.name, () => {
  it('detects overdue checklists', () => {
    const now = new Date('2026-06-03T12:00:00.000Z');
    const checklist = makeChecklist({ endTime: '2026-06-01T08:00:00.000Z', status: 'started' });
    expect(isChecklistOverdue(checklist, now)).toBe(true);
  });
});

describe(buildChecklistAlerts.name, () => {
  it('creates overdue and due-soon alerts', () => {
    const now = new Date('2026-06-03T12:00:00.000Z');
    const alerts = buildChecklistAlerts(
      [
        makeChecklist({ externalId: 'a', endTime: '2026-06-01T08:00:00.000Z' }),
        makeChecklist({
          externalId: 'b',
          endTime: '2026-06-04T08:00:00.000Z',
          status: 'created',
        }),
      ],
      now,
    );
    expect(alerts.some((a) => a.kind === 'overdue')).toBe(true);
    expect(alerts.some((a) => a.kind === 'due-soon')).toBe(true);
  });

  it('creates not-ok and completed alerts', () => {
    const now = new Date('2026-06-03T12:00:00.000Z');
    const alerts = buildChecklistAlerts(
      [
        makeChecklist({ externalId: 'nok', hasNotOk: true }),
        makeChecklist({ externalId: 'done', status: 'completed' }),
      ],
      now,
    );
    expect(alerts.some((a) => a.kind === 'not-ok')).toBe(true);
    expect(alerts.some((a) => a.kind === 'completed')).toBe(true);
  });
});

describe(isChecklistDueSoon.name, () => {
  it('returns false for completed checklists', () => {
    const now = new Date('2026-06-03T12:00:00.000Z');
    expect(isChecklistDueSoon(makeChecklist({ status: 'completed', endTime: '2026-06-04T08:00:00.000Z' }), now)).toBe(
      false,
    );
  });
});
