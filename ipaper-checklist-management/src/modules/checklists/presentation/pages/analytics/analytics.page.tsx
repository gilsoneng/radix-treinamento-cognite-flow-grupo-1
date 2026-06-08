import { useRouteKpiSnapshotsQuery, useMeasurementTrendsQuery } from '../../../infrastructure/queries/use-checklist-data-queries';
import { EmptyState } from '../../../../../design-system/layout/states/empty-state';
import { ErrorState } from '../../../../../design-system/layout/states/error-state';
import { LoadingState } from '../../../../../design-system/layout/states/loading-state';
import { TimeSeriesCharts } from '../../components/analytics-charts/time-series-charts';

export function AnalyticsPage() {
  const trendsQuery = useRouteKpiSnapshotsQuery({ enabled: true });
  const measurementQuery = useMeasurementTrendsQuery({ enabled: true });

  const isLoading = trendsQuery.isPending || measurementQuery.isPending;
  const isError = trendsQuery.isError || measurementQuery.isError;

  if (isLoading) {
    return <LoadingState message="Loading analytics from CDF..." />;
  }

  if (isError) {
    const failedQuery = trendsQuery.isError ? trendsQuery : measurementQuery;
    return (
      <ErrorState
        message={`Failed to load analytics: ${formatQueryError(failedQuery.error)}`}
        onRetry={() => {
          void trendsQuery.refetch();
          void measurementQuery.refetch();
        }}
      />
    );
  }

  const hasTrendData =
    (trendsQuery.data?.length ?? 0) > 0 || (measurementQuery.data?.length ?? 0) > 0;

  if (!hasTrendData) {
    return (
      <EmptyState
        title="No time-series KPI data"
        description='Run seed ingest for IP schema and KPIs (`npm run seed:ingest:ip-schema` then `npm run seed:ingest:kpis`), then hard-refresh.'
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="m-0 text-xs text-muted-foreground">
        CDF: {measurementQuery.data?.length ?? 0} measurement trends,{' '}
        {trendsQuery.data?.length ?? 0} route KPI periods.
      </p>
      <TimeSeriesCharts
        routeSnapshots={trendsQuery.data ?? []}
        measurementTrends={measurementQuery.data ?? []}
      />
    </div>
  );
}

function formatQueryError(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message: unknown }).message;
    if (typeof message === 'string' && message.trim().length > 0) {
      return message;
    }
  }
  return 'CDF request failed. Check auth, project, and seed ingest.';
}
