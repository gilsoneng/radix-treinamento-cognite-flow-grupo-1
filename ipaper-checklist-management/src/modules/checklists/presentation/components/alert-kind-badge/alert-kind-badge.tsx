import type { CSSProperties } from 'react';

import type { AlertKind } from '../../../domain/alert.model';
import { themeForAlertKind } from '../../theme/checklist-status-theme';

const KIND_LABELS: Record<AlertKind, string> = {
  overdue: 'Overdue',
  'due-soon': 'Due soon',
  'critical-observation': 'Critical',
  'not-ok': 'Not OK',
  completed: 'Completed',
};

export type AlertKindBadgeProps = {
  kind: AlertKind;
};

export function AlertKindBadge({ kind }: AlertKindBadgeProps) {
  const theme = themeForAlertKind(kind);

  return (
    <span
      className="ip-status-pill ip-status-pill--compact"
      style={
        {
          '--ip-status-color': theme.color,
          '--ip-status-bg': theme.background,
          '--ip-status-border': theme.border,
        } as CSSProperties
      }
    >
      <span className="ip-status-pill__dot" aria-hidden />
      {KIND_LABELS[kind]}
    </span>
  );
}
