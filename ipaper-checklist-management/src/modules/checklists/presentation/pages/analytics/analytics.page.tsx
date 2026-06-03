import { Card, CardContent, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@cognite/aura/components';
import type { CSSProperties, ReactNode } from 'react';
import { useState } from 'react';

import { IpDataTable, type IpDataTableColumn } from '../../../../../design-system/components/ip-data-table/ip-data-table';
import { useAppNavigation } from '../../../../../app/host/use-app-navigation';
import { EmptyState } from '../../../../../design-system/layout/states/empty-state';
import { ErrorState } from '../../../../../design-system/layout/states/error-state';
import { LoadingState } from '../../../../../design-system/layout/states/loading-state';
import type { AnalyticsPeriod } from '../../../domain/task-result.model';
import type { TaskResultItem } from '../../../domain/task-result.model';
import type { RecurringNotOkRow } from '../../../domain/task-result-analytics.model';
import {
  useMeasurementTrendsQuery,
  useRouteKpiSnapshotsQuery,
  useTaskResultAnalyticsQuery,
} from '../../../infrastructure/queries/use-checklist-data-queries';
import { TaskResultsCharts } from '../../components/analytics-charts/task-results-charts';
import { TimeSeriesCharts } from '../../components/analytics-charts/time-series-charts';
import { StatusBadge } from '../../components/status-badge/status-badge';
import { TASK_RESULT_CATEGORY_THEME } from '../../theme/checklist-status-theme';

const TASK_COLUMNS: IpDataTableColumn<TaskResultItem>[] = [
  {
    id: 'title',
    header: 'Task',
    sortValue: (row) => row.title,
    cell: (row) => row.title,
  },
  {
    id: 'result',
    header: 'Result',
    sortValue: (row) => row.category,
    cell: (row) => (
      <StatusBadge
        status={
          row.category === 'nok' ? 'notok' : row.category === 'ok' ? 'completed' : 'started'
        }
      />
    ),
  },
  {
    id: 'status',
    header: 'Status',
    sortValue: (row) => row.status,
    cell: (row) => <StatusBadge status={row.status} />,
  },
  {
    id: 'checklist',
    header: 'Checklist',
    sortValue: (row) => row.checklistExternalId ?? '',
    cell: (row) => (
      <span className="text-xs text-muted-foreground">{row.checklistExternalId ?? '—'}</span>
    ),
  },
];

const RECURRING_COLUMNS: IpDataTableColumn<RecurringNotOkRow>[] = [
  { id: 'task', header: 'Task', sortValue: (r) => r.task, cell: (r) => r.task },
  {
    id: 'checklist',
    header: 'Checklist',
    sortValue: (r) => r.checklist,
    cell: (r) => <span className="text-muted-foreground">{r.checklist}</span>,
  },
  {
    id: 'occurrences',
    header: 'Occurrences',
    align: 'right',
    sortValue: (r) => r.occurrences,
    cell: (r) => (
      <span
        className="ip-status-pill ip-status-pill--compact tabular-nums"
        style={
          {
            '--ip-status-color': TASK_RESULT_CATEGORY_THEME.nok.color,
            '--ip-status-bg': TASK_RESULT_CATEGORY_THEME.nok.background,
            '--ip-status-border': TASK_RESULT_CATEGORY_THEME.nok.border,
          } as CSSProperties
        }
      >
        <span className="ip-status-pill__dot" aria-hidden />
        {r.occurrences}
      </span>
    ),
  },
  {
    id: 'lastSeen',
    header: 'Last seen',
    sortValue: (r) => r.lastSeen,
    cell: (r) => r.lastSeen,
  },
];

export function AnalyticsPage() {
  const { analyticsTab, setAnalyticsTab } = useAppNavigation();
  const [period, setPeriod] = useState<AnalyticsPeriod>('all');

  const analyticsQuery = useTaskResultAnalyticsQuery(period, {
    enabled: analyticsTab === 'results',
  });
  const trendsQuery = useRouteKpiSnapshotsQuery({ enabled: analyticsTab === 'trends' });
  const measurementQuery = useMeasurementTrendsQuery({ enabled: analyticsTab === 'trends' });

  const isLoading =
    analyticsTab === 'results'
      ? analyticsQuery.isPending
      : trendsQuery.isPending || measurementQuery.isPending;
  const isError =
    analyticsTab === 'results'
      ? analyticsQuery.isError
      : trendsQuery.isError || measurementQuery.isError;

  if (isLoading) {
    return <LoadingState message="Loading analytics from CDF..." />;
  }

  if (isError) {
    return (
      <ErrorState
        message="Failed to load analytics"
        onRetry={() => {
          void analyticsQuery.refetch();
          void trendsQuery.refetch();
          void measurementQuery.refetch();
        }}
      />
    );
  }

  const bundle = analyticsQuery.data;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Analytics sections">
        <TabButton active={analyticsTab === 'results'} onClick={() => setAnalyticsTab('results')}>
          Task results
        </TabButton>
        <TabButton active={analyticsTab === 'trends'} onClick={() => setAnalyticsTab('trends')}>
          Time-series KPIs
        </TabButton>
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 py-4">
          <label className="text-sm text-muted-foreground" htmlFor="analytics-period">
            Period
          </label>
          <Select
            value={period}
            onValueChange={(value) => setPeriod(value as AnalyticsPeriod)}
          >
            <SelectTrigger id="analytics-period" className="w-40" aria-label="Analytics period">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          <p className="m-0 text-xs text-muted-foreground">
            Charts use a bounded CDF sample (checklist items + Not OK scan). Use &quot;All time&quot; for seeded
            historical data; hard-refresh after ingest.
          </p>
        </CardContent>
      </Card>

      {analyticsTab === 'results' && bundle ? (
        <>
          <TaskResultsCharts data={bundle} />
          <IpDataTable
            title="Task results (sample)"
            rows={bundle.items}
            columns={TASK_COLUMNS}
            getRowKey={(row) => row.externalId}
            searchFilter={(row, query) =>
              `${row.title} ${row.checklistExternalId ?? ''}`.toLowerCase().includes(query.toLowerCase())
            }
            searchPlaceholder="Search tasks..."
          />
          <IpDataTable
            title="Recurring Not OK tasks"
            rows={bundle.recurringNotOk}
            columns={RECURRING_COLUMNS}
            getRowKey={(row) => row.task}
            searchFilter={(row, query) =>
              `${row.task} ${row.checklist}`.toLowerCase().includes(query.toLowerCase())
            }
            searchPlaceholder="Filter recurring tasks..."
            emptyMessage="No recurring Not OK patterns in the selected period."
          />
        </>
      ) : null}

      {analyticsTab === 'trends' ? (
        <TimeSeriesCharts
          routeSnapshots={trendsQuery.data ?? []}
          measurementTrends={measurementQuery.data ?? []}
        />
      ) : null}

      {analyticsTab === 'results' && !bundle ? (
        <EmptyState title="No analytics data" description="No task results found in CDF sample." />
      ) : null}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      className="ip-app-sidebar__nav-button rounded-md px-4 py-2 text-sm"
      data-active={active ? '' : undefined}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
