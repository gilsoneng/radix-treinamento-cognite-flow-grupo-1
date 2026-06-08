import type { CSSProperties } from 'react';

import type { OperationalAlert } from '../../../domain/alert.model';
import { themeForAlertPriority } from '../../theme/checklist-status-theme';

export type PriorityBadgeProps = {
  priority: OperationalAlert['priority'];
};

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const theme = themeForAlertPriority(priority);
  const isUrgent = priority === 'urgent';

  return (
    <span
      className={`ip-status-pill ip-status-pill--compact${isUrgent ? ' ip-status-pill--urgent' : ''}`}
      style={
        {
          '--ip-status-color': theme.color,
          '--ip-status-bg': theme.background,
          '--ip-status-border': theme.border,
        } as CSSProperties
      }
    >
      <span className="ip-status-pill__dot" aria-hidden />
      {theme.label}
    </span>
  );
}
