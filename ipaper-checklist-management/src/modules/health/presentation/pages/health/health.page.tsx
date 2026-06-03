import { EmptyState } from '../../../../../design-system/layout/states/empty-state';
import { ErrorState } from '../../../../../design-system/layout/states/error-state';
import { LoadingState } from '../../../../../design-system/layout/states/loading-state';
import { CoreAssetList } from '../../components/core-asset-list/core-asset-list';
import { useHealthViewModel } from '../../view-models/use-health.view-model';


export function HealthPage() {
  const vm = useHealthViewModel();

  if (vm.isLoading) {
    return <LoadingState message="Loading Core assets..." />;
  }

  if (vm.isError) {
    return <ErrorState message="Failed to load Core assets" onRetry={vm.refresh} />;
  }

  if (vm.assets.length === 0) {
    return <EmptyState title="No assets found" description="No CogniteAsset instances were returned from CDF." />;
  }

  return <CoreAssetList assets={vm.assets} />;
}
