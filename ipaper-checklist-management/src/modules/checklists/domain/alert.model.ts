export type AlertKind = 'overdue' | 'due-soon' | 'critical-observation' | 'not-ok' | 'completed';

export type OperationalAlert = {
  readonly id: string;
  readonly kind: AlertKind;
  readonly title: string;
  readonly description: string;
  readonly priority: 'urgent' | 'high' | 'medium';
  readonly checklistExternalId?: string;
};
