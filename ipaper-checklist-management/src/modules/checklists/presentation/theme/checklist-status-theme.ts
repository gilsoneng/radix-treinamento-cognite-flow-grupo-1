import type { AlertKind, OperationalAlert } from '../../domain/alert.model';
import type { ChecklistKpiBucket } from '../../domain/checklist-kpi.model';
import type { ChecklistSummary } from '../../domain/checklist-kpi.model';
import { resolveChecklistKpiBucket } from '../../domain/checklist-kpi.rules';
import type { TaskResultCategory } from '../../domain/task-result.model';

export type StatusColorToken = {
  readonly label: string;
  readonly color: string;
  readonly background: string;
  readonly border: string;
};

/** Matches Overview KPI card accent colors (`kpi-card.tsx`). */
export const CHECKLIST_KPI_STATUS_THEME: Record<ChecklistKpiBucket, StatusColorToken> = {
  todo: {
    label: 'To Do',
    color: 'var(--ip-sky)',
    background: 'var(--info-muted-background)',
    border: 'color-mix(in srgb, var(--ip-sky) 45%, transparent)',
  },
  ongoing: {
    label: 'Ongoing',
    color: 'var(--ip-yellow)',
    background: 'var(--warning-muted-background)',
    border: 'color-mix(in srgb, var(--ip-yellow) 55%, transparent)',
  },
  done: {
    label: 'Done',
    color: 'var(--ip-clover)',
    background: 'var(--success-muted-background)',
    border: 'color-mix(in srgb, var(--ip-clover) 45%, transparent)',
  },
  overdue: {
    label: 'Overdue',
    color: 'var(--warning-foreground)',
    background: 'var(--warning-muted-background)',
    border: 'color-mix(in srgb, var(--warning-foreground) 40%, transparent)',
  },
  notok: {
    label: 'Not OK',
    color: 'var(--ip-error-foreground)',
    background: 'var(--ip-error-muted-background)',
    border: 'var(--ip-error-border)',
  },
};

/** Alert priority — urgent uses IP error tokens (strong contrast, not pastel pink). */
export const ALERT_PRIORITY_THEME: Record<OperationalAlert['priority'], StatusColorToken> = {
  urgent: {
    label: 'Urgent',
    color: 'var(--ip-error-foreground)',
    background: 'var(--ip-error-muted-background)',
    border: 'var(--ip-error-border)',
  },
  high: {
    label: 'High',
    color: 'var(--warning-foreground)',
    background: 'var(--warning-muted-background)',
    border: 'color-mix(in srgb, var(--warning-foreground) 50%, transparent)',
  },
  medium: {
    label: 'Medium',
    color: 'var(--info-foreground)',
    background: 'var(--info-muted-background)',
    border: 'color-mix(in srgb, var(--ip-sky) 45%, transparent)',
  },
};

export const ALERT_KIND_THEME: Record<AlertKind, StatusColorToken> = {
  overdue: CHECKLIST_KPI_STATUS_THEME.overdue,
  'due-soon': CHECKLIST_KPI_STATUS_THEME.ongoing,
  'not-ok': CHECKLIST_KPI_STATUS_THEME.notok,
  completed: CHECKLIST_KPI_STATUS_THEME.done,
  'critical-observation': CHECKLIST_KPI_STATUS_THEME.notok,
};

export const TASK_RESULT_CATEGORY_THEME: Record<TaskResultCategory, StatusColorToken> = {
  ok: CHECKLIST_KPI_STATUS_THEME.done,
  nok: CHECKLIST_KPI_STATUS_THEME.notok,
  observation: CHECKLIST_KPI_STATUS_THEME.ongoing,
};

const STATUS_TO_BUCKET: Record<string, ChecklistKpiBucket> = {
  created: 'todo',
  started: 'ongoing',
  completed: 'done',
  todo: 'todo',
  ongoing: 'ongoing',
  done: 'done',
  overdue: 'overdue',
  notok: 'notok',
};

export function themeForChecklistStatus(
  status: string,
  options?: { hasNotOk?: boolean; endTime?: string | null },
): StatusColorToken {
  if (options?.hasNotOk) {
    return CHECKLIST_KPI_STATUS_THEME.notok;
  }

  if (options?.endTime && status !== 'completed') {
    const end = new Date(options.endTime);
    if (!Number.isNaN(end.getTime()) && end.getTime() < Date.now()) {
      return CHECKLIST_KPI_STATUS_THEME.overdue;
    }
  }

  const bucket = STATUS_TO_BUCKET[status] ?? 'todo';
  return CHECKLIST_KPI_STATUS_THEME[bucket];
}

export function themeForChecklistSummary(summary: ChecklistSummary): StatusColorToken {
  const bucket = resolveChecklistKpiBucket(summary);
  return CHECKLIST_KPI_STATUS_THEME[bucket];
}

export function themeForAlertKind(kind: AlertKind): StatusColorToken {
  return ALERT_KIND_THEME[kind];
}

export function themeForAlertPriority(priority: OperationalAlert['priority']): StatusColorToken {
  return ALERT_PRIORITY_THEME[priority];
}
