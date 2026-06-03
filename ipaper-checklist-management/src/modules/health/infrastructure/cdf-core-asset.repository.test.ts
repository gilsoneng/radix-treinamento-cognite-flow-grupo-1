import { describe, expect, it, vi } from 'vitest';

import { COGNITE_ASSET_VIEW } from '../../../core/dm/core-dm.constants';
import type { CdfReadClient, InstanceNodeDto } from '../../../core/sdk/cdf-client';

import { CdfCoreAssetRepository } from './cdf-core-asset.repository';

function makeClient(items: InstanceNodeDto[]) {
  const list = vi.fn(() => Promise.resolve({ items }));
  const client: CdfReadClient = {
    project: 'radix-dev',
    instances: { list: list as unknown as CdfReadClient['instances']['list'] },
  };
  return { client, list };
}

describe('CdfCoreAssetRepository', () => {
  it('lists CogniteAsset nodes via DMS and maps them to domain assets', async () => {
    const viewKey = `${COGNITE_ASSET_VIEW.externalId}/${COGNITE_ASSET_VIEW.version}`;
    const { client, list } = makeClient([
      {
        space: 'asset-space',
        externalId: 'asset-1',
        instanceType: 'node',
        properties: {
          [COGNITE_ASSET_VIEW.space]: {
            [viewKey]: { name: 'Pump A', description: 'Feed pump' },
          },
        },
      },
    ]);

    const repository = new CdfCoreAssetRepository(client);
    const assets = await repository.listSample(5);

    expect(list).toHaveBeenCalledWith({
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
      limit: 5,
    });
    expect(assets).toEqual([
      {
        space: 'asset-space',
        externalId: 'asset-1',
        name: 'Pump A',
        description: 'Feed pump',
      },
    ]);
  });
});
