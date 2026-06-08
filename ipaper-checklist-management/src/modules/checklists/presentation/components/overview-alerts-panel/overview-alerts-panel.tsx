import {
  Card,
  CardContent,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@cognite/aura/components';
import { useEffect, useMemo, useState } from 'react';

import { IpDataTable, type IpDataTableColumn } from '../../../../../design-system/components/ip-data-table/ip-data-table';
import { LoadingState } from '../../../../../design-system/layout/states/loading-state';
import { useAppNavigation } from '../../../../../app/host/use-app-navigation';
import type { AlertKind, OperationalAlert } from '../../../domain/alert.model';
import { filterOperationalAlerts } from '../../../domain/alert.rules';
import type { OperationalKpiSelection } from '../../../domain/operational-catalog.model';
import { shiftLabel } from '../../../domain/inspection-shift.rules';
import { useOperationalAlertsQuery } from '../../../infrastructure/queries/use-checklist-data-queries';
import { AlertKindBadge } from '../alert-kind-badge/alert-kind-badge';
import { StatusBadge } from '../status-badge/status-badge';

const KIND_LABELS: Record<AlertKind, string> = {
  overdue: 'Overdue',
  'due-soon': 'Due soon',
  'critical-observation': 'Critical observation',
  'not-ok': 'Not OK',
  completed: 'Completed',
};

const ALERT_COLUMNS: IpDataTableColumn<OperationalAlert>[] = [
  {
    id: 'title',
    header: 'Alert',
    sortValue: (row) => row.title,
    cell: (row) => (
      <div>
        <div className="font-medium">{row.title}</div>
        <p className="m-0 mt-1 text-xs text-muted-foreground">{row.description}</p>
      </div>
    ),
  },
  {
    id: 'kind',
    header: 'Type',
    sortValue: (row) => row.kind,
    cell: (row) => <AlertKindBadge kind={row.kind} />,
  },
  {
    id: 'priority',
    header: 'Priority',
    sortValue: (row) => row.priority,
    cell: (row) => (
      <StatusBadge
        status={row.priority === 'urgent' ? 'notok' : row.priority === 'high' ? 'overdue' : 'ongoing'}
        label={row.priority}
      />
    ),
  },
];

export type OverviewAlertsPanelProps = {
  selection: OperationalKpiSelection | null;
};

export function OverviewAlertsPanel({ selection }: OverviewAlertsPanelProps) {
  const { navigate } = useAppNavigation();
  const query = useOperationalAlertsQuery();
  const [scope, setScope] = useState<'shift' | 'all'>('shift');

  useEffect(() => {
    if (!selection && scope === 'shift') {
      setScope('all');
    }
  }, [selection, scope]);

  const allAlerts = query.data ?? [];

  const displayedAlerts = useMemo(
    () =>
      filterOperationalAlerts(allAlerts, selection, scope === 'shift' && selection !== null),
    [allAlerts, selection, scope],
  );

  if (query.isPending) {
    return (
      <Card>
        <CardContent>
          <LoadingState message="Loading critical alerts from CDF..." />
        </CardContent>
      </Card>
    );
  }

  if (allAlerts.length === 0) {
    return null;
  }

  const scopeLabel =
    scope === 'all' && selection
      ? 'All periods'
      : selection
        ? `${shiftLabel(selection.shiftCode)} · ${selection.operationalDay}`
        : 'All periods';

  return (
    <Card>
      <CardContent>
        <IpDataTable
          title="Critical alerts"
          rows={displayedAlerts}
          columns={ALERT_COLUMNS}
          getRowKey={(row) => row.id}
          searchFilter={(row, q) =>
            `${row.title} ${row.description} ${KIND_LABELS[row.kind]}`
              .toLowerCase()
              .includes(q.toLowerCase())
          }
          searchPlaceholder="Search alerts..."
          pageSizeOptions={[5, 10, 25, 50]}
          emptyMessage={
            scope === 'shift' && selection
              ? `No alerts for ${scopeLabel}. Try "All periods" or another day/shift.`
              : 'No alerts match your search.'
          }
          toolbar={
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={scope}
                onValueChange={(value) => {
                  if (value === 'shift' || value === 'all') {
                    setScope(value);
                  }
                }}
              >
                <SelectTrigger className="h-9 w-44" aria-label="Alert period scope">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="shift" disabled={!selection}>
                    Selected day & shift
                  </SelectItem>
                  <SelectItem value="all">All periods</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-xs text-muted-foreground">
                Showing {displayedAlerts.length} of {allAlerts.length}
                {scope === 'shift' && selection ? ` · ${scopeLabel}` : ''}
              </span>
              <button
                type="button"
                className="ml-auto text-sm text-link-foreground underline-offset-2 hover:underline"
                onClick={() => navigate('alerts')}
              >
                Alerts page
              </button>
            </div>
          }
        />
      </CardContent>
    </Card>
  );
}
