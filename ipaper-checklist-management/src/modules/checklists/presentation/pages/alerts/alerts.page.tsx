import { IpDataTable, type IpDataTableColumn } from '../../../../../design-system/components/ip-data-table/ip-data-table';
import { EmptyState } from '../../../../../design-system/layout/states/empty-state';
import { ErrorState } from '../../../../../design-system/layout/states/error-state';
import { LoadingState } from '../../../../../design-system/layout/states/loading-state';
import type { AlertKind, OperationalAlert } from '../../../domain/alert.model';
import { useOperationalAlertsQuery } from '../../../infrastructure/queries/use-checklist-data-queries';
import { AlertKindBadge } from '../../components/alert-kind-badge/alert-kind-badge';
import { StatusBadge } from '../../components/status-badge/status-badge';

const KIND_LABELS: Record<AlertKind, string> = {
  overdue: 'Overdue',
  'due-soon': 'Due soon',
  'critical-observation': 'Critical observation',
  'not-ok': 'Not OK',
  completed: 'Completed',
};

const COLUMNS: IpDataTableColumn<OperationalAlert>[] = [
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

export function AlertsPage() {
  const query = useOperationalAlertsQuery();

  if (query.isPending) {
    return <LoadingState message="Loading operational alerts..." />;
  }

  if (query.isError) {
    return <ErrorState message="Failed to load alerts" onRetry={() => void query.refetch()} />;
  }

  const alerts = query.data ?? [];

  if (alerts.length === 0) {
    return (
      <EmptyState
        title="No active alerts"
        description="All checklists are on track and no critical observations were found."
      />
    );
  }

  return (
    <IpDataTable
      title="Operational alerts"
      rows={alerts}
      columns={COLUMNS}
      getRowKey={(row) => row.id}
      searchFilter={(row, q) =>
        `${row.title} ${row.description} ${KIND_LABELS[row.kind]}`.toLowerCase().includes(q.toLowerCase())
      }
      searchPlaceholder="Search alerts..."
      pageSizeOptions={[10, 25, 50]}
    />
  );
}
