import { Card, CardContent } from '@cognite/aura/components';

import type { ChecklistKpiBucket } from '../../../domain/checklist-kpi.model';
import { CHECKLIST_KPI_STATUS_THEME } from '../../theme/checklist-status-theme';

export type KpiCardProps = {
  bucket: ChecklistKpiBucket;
  value: number;
  percentage: string;
  onSelect?: () => void;
};

export function KpiCard({ bucket, value, percentage, onSelect }: KpiCardProps) {
  const label = CHECKLIST_KPI_STATUS_THEME[bucket].label;

  return (
    <Card className="ip-kpi-card">
      <CardContent>
        <button
          type="button"
          className="ip-kpi-card__button flex w-full flex-col items-start gap-2 text-left"
          onClick={onSelect}
          aria-label={`${label}: ${value} checklists, ${percentage} of total`}
        >
          <span
            className="ip-kpi-card__accent h-1 w-10 rounded-full"
            style={{ backgroundColor: CHECKLIST_KPI_STATUS_THEME[bucket].color }}
            aria-hidden
          />
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {label}
          </span>
          <span className="text-3xl font-semibold tabular-nums text-foreground">{value}</span>
          <span className="text-sm text-muted-foreground">{percentage} of total</span>
        </button>
      </CardContent>
    </Card>
  );
}
