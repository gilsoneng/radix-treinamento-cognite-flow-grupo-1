import type { CoreAsset } from '../../domain/core-asset.model';
import type { CoreAssetRepository } from '../../domain/core-asset.repository';

export const healthQueryKeys = {
  all: ['health'] as const,
  assets: ['health', 'assets'] as const,
};


export function listCoreAssetsQueryFn(repository: CoreAssetRepository): () => Promise<CoreAsset[]> {
  return () => repository.listSample();
}
