import { Card, CardContent } from '@cognite/aura/components';

import { EmptyState } from '../../../../../design-system/layout/states/empty-state';
import { ErrorState } from '../../../../../design-system/layout/states/error-state';
import { LoadingState } from '../../../../../design-system/layout/states/loading-state';
import type { ChecklistKpiBucket } from '../../../domain/checklist-kpi.model';
import { KpiCard } from '../../components/kpi-card/kpi-card';
import { OverviewOperationalToolbar } from '../../components/overview-operational-toolbar/overview-operational-toolbar';
import { OverviewAlertsPanel } from '../../components/overview-alerts-panel/overview-alerts-panel';
import { useOverviewKpisViewModel } from '../../view-models/use-overview-kpis.view-model';

const KPI_BUCKETS: ChecklistKpiBucket[] = ['todo', 'ongoing', 'done', 'overdue', 'notok'];

export function OverviewPage() {
  const vm = useOverviewKpisViewModel();

  if (vm.isLoading) {
    return <LoadingState message="Loading checklist KPIs from CDF..." />;
  }

  if (vm.isError) {
    return (
      <ErrorState
        message="Failed to load checklist KPIs"
        onRetry={vm.refresh}
      />
    );
  }

  if (vm.total === 0) {
    return (
      <EmptyState
        title="No checklists in CDF"
        description="Seed or sync ApmAppData Checklist instances in cdf_apm to populate this overview."
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent>
          {vm.selection ? (
            <OverviewOperationalToolbar
              catalog={vm.catalog}
              selection={vm.selection}
              onSelect={vm.setOperationalFilter}
              onStepDay={vm.stepDay}
              onStepShift={vm.stepShift}
              canStepDayOlder={vm.canStepDayOlder}
              canStepDayNewer={vm.canStepDayNewer}
            />
          ) : (
            <p className="m-0 text-center text-sm text-muted-foreground">
              Date and shift filters will appear when checklist data includes operational periods.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {KPI_BUCKETS.map((bucket) => (
          <KpiCard
            key={bucket}
            bucket={bucket}
            value={vm.counts[bucket]}
            insight={vm.insights[bucket]}
            onSelect={vm.navigateToChecklists}
          />
        ))}
      </div>

      <OverviewAlertsPanel selection={vm.selection} />
    </div>
  );
}
