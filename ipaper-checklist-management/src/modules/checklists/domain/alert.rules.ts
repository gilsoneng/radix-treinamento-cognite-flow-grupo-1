import type { ChecklistSummary } from './checklist-kpi.model';
import type { AlertKind, OperationalAlert } from './alert.model';

const MS_PER_HOUR = 60 * 60 * 1000;

export function isChecklistOverdue(checklist: ChecklistSummary, now: Date): boolean {
  if (checklist.status === 'completed') {
    return false;
  }
  if (!checklist.endTime) {
    return false;
  }
  const end = new Date(checklist.endTime);
  return !Number.isNaN(end.getTime()) && end.getTime() < now.getTime();
}

export function isChecklistDueSoon(checklist: ChecklistSummary, now: Date, withinHours = 24): boolean {
  if (checklist.status === 'completed' || isChecklistOverdue(checklist, now)) {
    return false;
  }
  if (!checklist.endTime) {
    return false;
  }
  const end = new Date(checklist.endTime);
  if (Number.isNaN(end.getTime())) {
    return false;
  }
  const delta = end.getTime() - now.getTime();
  return delta > 0 && delta <= withinHours * MS_PER_HOUR;
}

function alertPriority(kind: AlertKind): OperationalAlert['priority'] {
  if (kind === 'critical-observation' || kind === 'overdue') {
    return 'urgent';
  }
  return 'high';
}

export function buildChecklistAlerts(
  checklists: readonly ChecklistSummary[],
  now: Date = new Date(),
): OperationalAlert[] {
  const alerts: OperationalAlert[] = [];

  for (const checklist of checklists) {
    if (checklist.hasNotOk) {
      alerts.push({
        id: `notok-${checklist.externalId}`,
        kind: 'not-ok',
        title: checklist.title,
        description: 'Checklist contains at least one Not OK task result.',
        priority: 'urgent',
        checklistExternalId: checklist.externalId,
      });
    }
    if (checklist.status === 'completed') {
      alerts.push({
        id: `completed-${checklist.externalId}`,
        kind: 'completed',
        title: checklist.title,
        description: 'Checklist marked as completed.',
        priority: 'medium',
        checklistExternalId: checklist.externalId,
      });
    }
    if (isChecklistOverdue(checklist, now)) {
      alerts.push({
        id: `overdue-${checklist.externalId}`,
        kind: 'overdue',
        title: checklist.title,
        description: 'Checklist is past scheduled end time.',
        priority: alertPriority('overdue'),
        checklistExternalId: checklist.externalId,
      });
      continue;
    }
    if (isChecklistDueSoon(checklist, now)) {
      alerts.push({
        id: `due-${checklist.externalId}`,
        kind: 'due-soon',
        title: checklist.title,
        description: 'Due within the next 24 hours.',
        priority: alertPriority('due-soon'),
        checklistExternalId: checklist.externalId,
      });
    }
  }

  return alerts;
}

export function sortAlertsByPriority(alerts: readonly OperationalAlert[]): OperationalAlert[] {
  const order: Record<OperationalAlert['priority'], number> = {
    urgent: 0,
    high: 1,
    medium: 2,
  };
  return [...alerts].sort((a, b) => order[a.priority] - order[b.priority]);
}
