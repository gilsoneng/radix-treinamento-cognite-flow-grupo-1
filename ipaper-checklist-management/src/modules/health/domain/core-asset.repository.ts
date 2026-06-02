import type { CoreAsset } from './core-asset.model';


export interface CoreAssetRepository {
  listSample(limit?: number): Promise<CoreAsset[]>;
}
