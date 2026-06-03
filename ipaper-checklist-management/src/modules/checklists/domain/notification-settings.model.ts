export type NotificationTrigger =
  | 'checklist-not-ok'
  | 'checklist-completed'
  | 'checklist-overdue'
  | 'checklist-due-soon'
  | 'critical-observation';

export type NotificationFormat = 'banner' | 'badge' | 'toast';

export type NotificationRule = {
  readonly id: NotificationTrigger;
  readonly enabled: boolean;
  readonly format: NotificationFormat;
  readonly label: string;
  readonly description: string;
};

export type NotificationSettings = {
  readonly rules: readonly NotificationRule[];
  readonly pollingIntervalMs: number;
};

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  pollingIntervalMs: 120_000,
  rules: [
    {
      id: 'checklist-not-ok',
      enabled: true,
      format: 'banner',
      label: 'Checklist Not OK',
      description: 'When a checklist has at least one Not OK task result.',
    },
    {
      id: 'checklist-completed',
      enabled: false,
      format: 'badge',
      label: 'Checklist completed',
      description: 'When a checklist transitions to completed status (sidebar badge only by default).',
    },
    {
      id: 'checklist-overdue',
      enabled: true,
      format: 'banner',
      label: 'Overdue checklist',
      description: 'When end time has passed and status is not completed.',
    },
    {
      id: 'checklist-due-soon',
      enabled: false,
      format: 'badge',
      label: 'Due within 24h',
      description: 'Reminder for checklists due in the next 24 hours.',
    },
    {
      id: 'critical-observation',
      enabled: true,
      format: 'banner',
      label: 'Critical observation',
      description: 'When a critical Observation is present in CDF.',
    },
  ],
};
