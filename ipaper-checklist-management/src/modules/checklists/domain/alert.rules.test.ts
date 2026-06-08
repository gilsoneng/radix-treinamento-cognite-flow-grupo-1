import { describe, expect, it } from 'vitest';

import type { ChecklistSummary } from './checklist-kpi.model';
import type { OperationalAlert } from './alert.model';
import {
  buildChecklistAlerts,
  filterOperationalAlerts,
  isChecklistDueSoon,
  isChecklistOverdue,
} from './alert.rules';

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

describe(filterOperationalAlerts.name, () => {
  const alerts: OperationalAlert[] = [
    {
      id: 'notok-CKM_CHK_GR1_ROUTE1-2025-01-11-D',
      kind: 'not-ok',
      title: 'Route 1 Day',
      description: 'NOK',
      priority: 'urgent',
      checklistExternalId: 'CKM_CHK_GR1_ROUTE1-2025-01-11-D',
    },
    {
      id: 'notok-CKM_CHK_GR1_ROUTE1-2025-01-11-A',
      kind: 'not-ok',
      title: 'Route 1 Afternoon',
      description: 'NOK',
      priority: 'urgent',
      checklistExternalId: 'CKM_CHK_GR1_ROUTE1-2025-01-11-A',
    },
    {
      id: 'obs-CKM_OBS_GR1_ROUTE1-2025-01-10-N-7F-SCRAPER-001',
      kind: 'critical-observation',
      title: 'Obs',
      description: 'Critical',
      priority: 'urgent',
    },
  ];

  it('filters alerts to selected day and shift', () => {
    const filtered = filterOperationalAlerts(
      alerts,
      { operationalDay: '2025-01-11', shiftCode: 'D' },
      true,
    );
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.title).toBe('Route 1 Day');
  });

  it('returns all alerts when restrictToSelection is false', () => {
    expect(
      filterOperationalAlerts(alerts, { operationalDay: '2025-01-11', shiftCode: 'D' }, false),
    ).toHaveLength(3);
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
