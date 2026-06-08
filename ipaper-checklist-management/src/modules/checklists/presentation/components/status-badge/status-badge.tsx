import type { CSSProperties } from 'react';

import type { ChecklistSummary } from '../../../domain/checklist-kpi.model';
import {
  themeForChecklistStatus,
  themeForChecklistSummary,
} from '../../theme/checklist-status-theme';

export type StatusBadgeProps = {
  status: string;
  hasNotOk?: boolean;
  endTime?: string | null;
  summary?: ChecklistSummary;
  label?: string;
};

export function StatusBadge({ status, hasNotOk, endTime, summary, label }: StatusBadgeProps) {
  const theme = summary
    ? themeForChecklistSummary(summary)
    : themeForChecklistStatus(status, { hasNotOk, endTime });

  return (
    <span
      className="ip-status-pill"
      style={
        {
          '--ip-status-color': theme.color,
          '--ip-status-bg': theme.background,
          '--ip-status-border': theme.border,
        } as CSSProperties
      }
    >
      <span className="ip-status-pill__dot" aria-hidden />
      {label ?? theme.label}
    </span>
  );
}
