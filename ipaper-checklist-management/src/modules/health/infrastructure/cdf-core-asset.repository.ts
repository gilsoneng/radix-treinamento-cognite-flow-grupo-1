import { COGNITE_ASSET_VIEW } from '../../../core/dm/core-dm.constants';
import type { CdfReadClient } from '../../../core/sdk/cdf-client';
import { cdfTaskRunner } from '../../../shared/utils/semaphore';
import { DEFAULT_ASSET_SAMPLE_SIZE, type CoreAsset } from '../domain/core-asset.model';
import type { CoreAssetRepository } from '../domain/core-asset.repository';

import { toCoreAssets } from './mappers/asset.mapper';


export class CdfCoreAssetRepository implements CoreAssetRepository {
  constructor(private readonly client: CdfReadClient) {}

  listSample(limit = DEFAULT_ASSET_SAMPLE_SIZE): Promise<CoreAsset[]> {
    return cdfTaskRunner.schedule(async () => {
      const response = await this.client.instances.list({
        instanceType: 'node',
        sources: [
          {
            source: {
              type: 'view',
              space: COGNITE_ASSET_VIEW.space,
              externalId: COGNITE_ASSET_VIEW.externalId,
              version: COGNITE_ASSET_VIEW.version,
            },
          },
        ],
        limit,
      });

      return toCoreAssets(response.items);
    });
  }
}
