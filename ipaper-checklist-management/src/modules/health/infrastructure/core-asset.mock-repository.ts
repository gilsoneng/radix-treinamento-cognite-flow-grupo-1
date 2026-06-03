import type { CoreAsset } from '../domain/core-asset.model';
import type { CoreAssetRepository } from '../domain/core-asset.repository';


export class MockCoreAssetRepository implements CoreAssetRepository {
  constructor(private readonly assets: CoreAsset[]) {}

  listSample(): Promise<CoreAsset[]> {
    return Promise.resolve(this.assets);
  }
}
