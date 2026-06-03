import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@cognite/aura/components';
import { useEffect, useMemo, useState } from 'react';

import { IpDataTable, type IpDataTableColumn } from '../../../../../design-system/components/ip-data-table/ip-data-table';
import { EmptyState } from '../../../../../design-system/layout/states/empty-state';
import { ErrorState } from '../../../../../design-system/layout/states/error-state';
import { LoadingState } from '../../../../../design-system/layout/states/loading-state';
import type { ChecklistSummary } from '../../../domain/checklist-kpi.model';
import {
  useChecklistSummariesPageQuery,
  useNotOkChecklistIdsQuery,
} from '../../../infrastructure/queries/use-checklist-data-queries';
import { useCursorPagination } from '../../hooks/use-cursor-pagination';
import { StatusBadge } from '../../components/status-badge/status-badge';

const COLUMNS: IpDataTableColumn<ChecklistSummary>[] = [
  {
    id: 'title',
    header: 'Checklist',
    sortValue: (row) => row.title,
    cell: (row) => (
      <div>
        <div className="font-medium">{row.title}</div>
        <div className="text-xs text-muted-foreground">{row.externalId}</div>
      </div>
    ),
  },
  {
    id: 'status',
    header: 'Status',
    sortValue: (row) => row.status,
    cell: (row) => <StatusBadge summary={row} status={row.status} hasNotOk={row.hasNotOk} endTime={row.endTime} />,
  },
  {
    id: 'endTime',
    header: 'End time',
    sortValue: (row) => row.endTime ?? '',
    cell: (row) => row.endTime ?? '—',
  },
  {
    id: 'flags',
    header: 'Flags',
    sortValue: (row) => (row.hasNotOk ? 1 : 0),
    cell: (row) =>
      row.hasNotOk ? <StatusBadge status="notok" hasNotOk /> : <span className="text-muted-foreground">—</span>,
  },
];

export function ChecklistsPage() {
  const { cursor, page, reset } = useCursorPagination();
  const notOkQuery = useNotOkChecklistIdsQuery();
  const pageQuery = useChecklistSummariesPageQuery(notOkQuery.data, cursor);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    reset();
  }, [statusFilter, reset]);

  const rows = useMemo(() => {
    const data = pageQuery.data?.items ?? [];
    if (statusFilter === 'all') {
      return data;
    }
    return data.filter((row) => row.status === statusFilter);
  }, [pageQuery.data?.items, statusFilter]);

  if (notOkQuery.isPending || pageQuery.isPending) {
    return <LoadingState message="Loading checklists from CDF..." />;
  }

  if (notOkQuery.isError || pageQuery.isError) {
    return (
      <ErrorState
        message="Failed to load checklists"
        onRetry={() => {
          void notOkQuery.refetch();
          void pageQuery.refetch();
        }}
      />
    );
  }

  if (page === 1 && rows.length === 0 && statusFilter === 'all') {
    return (
      <EmptyState
        title="No checklists found"
        description="Ingest ApmAppData checklists in cdf_apm to populate this list."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <IpDataTable
        title="Checklists"
        rows={rows}
        columns={COLUMNS}
        getRowKey={(row) => row.externalId}
        searchFilter={(row, query) =>
          `${row.title} ${row.externalId}`.toLowerCase().includes(query.toLowerCase())
        }
        searchPlaceholder="Search by title or ID..."
        toolbar={
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-40" aria-label="Filter by status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="created">To Do</SelectItem>
              <SelectItem value="started">Ongoing</SelectItem>
              <SelectItem value="completed">Done</SelectItem>
            </SelectContent>
          </Select>
        }
      />
    </div>
  );
}
