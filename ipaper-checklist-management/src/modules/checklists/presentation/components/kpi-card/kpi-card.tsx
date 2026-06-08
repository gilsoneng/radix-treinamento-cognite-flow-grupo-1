import { Badge, Card, CardContent } from '@cognite/aura/components';
import { IconArrowDown, IconArrowUp, IconMinus } from '@tabler/icons-react';

import type { ChecklistKpiBucket } from '../../../domain/checklist-kpi.model';
import type { ChecklistKpiBucketInsight, KpiTrafficLight } from '../../../domain/kpi-insight.model';
import { CHECKLIST_KPI_STATUS_THEME } from '../../theme/checklist-status-theme';

export type KpiCardProps = {
  bucket: ChecklistKpiBucket;
  value: number;
  insight: ChecklistKpiBucketInsight;
  onSelect?: () => void;
};

const TRAFFIC_BADGE_VARIANT: Record<
  KpiTrafficLight,
  'success' | 'warning' | 'error' | 'secondary'
> = {
  good: 'success',
  watch: 'warning',
  critical: 'error',
  neutral: 'secondary',
};

function DeltaIcon({ delta }: { delta: number | null }) {
  if (delta === null || delta === 0) {
    return <IconMinus className="h-3.5 w-3.5 shrink-0" aria-hidden />;
  }
  if (delta > 0) {
    return <IconArrowUp className="h-3.5 w-3.5 shrink-0" aria-hidden />;
  }
  return <IconArrowDown className="h-3.5 w-3.5 shrink-0" aria-hidden />;
}

export function KpiCard({ bucket, value, insight, onSelect }: KpiCardProps) {
  const label = CHECKLIST_KPI_STATUS_THEME[bucket].label;
  const trafficClass = `ip-kpi-card--${insight.trafficLight}`;

  return (
    <Card className={`ip-kpi-card ${trafficClass}`}>
      <CardContent>
        <button
          type="button"
          className="ip-kpi-card__button flex w-full flex-col items-start gap-2 text-left"
          onClick={onSelect}
          aria-label={`${label}: ${value}. ${insight.deltaLabel}`}
        >
          <span
            className="ip-kpi-card__accent h-1 w-10 rounded-full"
            style={{ backgroundColor: CHECKLIST_KPI_STATUS_THEME[bucket].color }}
            aria-hidden
          />
          <div className="flex w-full items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {label}
            </span>
            <Badge variant={TRAFFIC_BADGE_VARIANT[insight.trafficLight]} className="text-[10px]">
              {insight.trafficLight === 'critical' ? 'Alert' : insight.trafficLight}
            </Badge>
          </div>
          <span className="ip-kpi-card__value text-3xl font-semibold tabular-nums">{value}</span>
          <span className="ip-kpi-card__delta flex items-center gap-1 text-xs text-muted-foreground">
            <DeltaIcon delta={insight.delta} />
            <span>{insight.deltaLabel}</span>
          </span>
        </button>
      </CardContent>
    </Card>
  );
}
