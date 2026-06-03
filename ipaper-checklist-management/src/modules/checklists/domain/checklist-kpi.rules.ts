import type { ChecklistKpiBucket, ChecklistKpiCounts, ChecklistSummary } from './checklist-kpi.model';

function isOverdue(checklist: ChecklistSummary, now: Date): boolean {
  if (checklist.status === 'completed') {
    return false;
  }
  if (!checklist.endTime) {
    return false;
  }
  const end = new Date(checklist.endTime);
  return !Number.isNaN(end.getTime()) && end.getTime() < now.getTime();
}

export function resolveChecklistKpiBucket(
  checklist: ChecklistSummary,
  now: Date = new Date(),
): ChecklistKpiBucket {
  return bucketForChecklist(checklist, now);
}

function bucketForChecklist(checklist: ChecklistSummary, now: Date): ChecklistKpiBucket {
  if (checklist.hasNotOk) {
    return 'notok';
  }
  if (isOverdue(checklist, now)) {
    return 'overdue';
  }
  if (checklist.status === 'created') {
    return 'todo';
  }
  if (checklist.status === 'started') {
    return 'ongoing';
  }
  if (checklist.status === 'completed') {
    return 'done';
  }
  return 'todo';
}

export function summarizeChecklistKpis(
  checklists: readonly ChecklistSummary[],
  now: Date = new Date(),
): ChecklistKpiCounts {
  const counts: ChecklistKpiCounts = {
    todo: 0,
    ongoing: 0,
    done: 0,
    overdue: 0,
    notok: 0,
  };

  for (const checklist of checklists) {
    counts[bucketForChecklist(checklist, now)] += 1;
  }

  return counts;
}

export function filterChecklistsByTemplate(
  checklists: readonly ChecklistSummary[],
  templateExternalId: string | undefined,
): ChecklistSummary[] {
  if (!templateExternalId) {
    return [...checklists];
  }
  return checklists.filter((checklist) => checklist.templateExternalId === templateExternalId);
}
