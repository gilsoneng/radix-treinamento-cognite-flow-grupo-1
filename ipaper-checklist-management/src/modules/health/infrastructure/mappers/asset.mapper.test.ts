import { describe, expect, it } from 'vitest';

import { COGNITE_ASSET_VIEW } from '../../../../core/dm/core-dm.constants';
import type { AssetInstanceDto } from '../dto/asset-instance.dto';

import { toCoreAsset, toCoreAssets } from './asset.mapper';

const VIEW_KEY = `${COGNITE_ASSET_VIEW.externalId}/${COGNITE_ASSET_VIEW.version}`;

function makeNode(overrides: Partial<AssetInstanceDto> = {}): AssetInstanceDto {
  return {
    space: 'asset-space',
    externalId: 'asset-1',
    instanceType: 'node',
    properties: {
      [COGNITE_ASSET_VIEW.space]: {
        [VIEW_KEY]: {
          name: 'Pump A',
          description: 'Main feed pump',
        },
      },
    },
    ...overrides,
  };
}

describe('toCoreAsset', () => {
  it('unwraps CogniteAsset view properties into a CoreAsset', () => {
    expect(toCoreAsset(makeNode())).toEqual({
      space: 'asset-space',
      externalId: 'asset-1',
      name: 'Pump A',
      description: 'Main feed pump',
    });
  });

  it('defaults missing properties to empty strings', () => {
    expect(
      toCoreAsset({
        space: 's',
        externalId: 'e',
        instanceType: 'node',
      }),
    ).toEqual({
      space: 's',
      externalId: 'e',
      name: '',
      description: '',
    });
  });
});

describe('toCoreAssets', () => {
  it('maps every node in the page', () => {
    const assets = toCoreAssets([makeNode(), makeNode({ externalId: 'asset-2' })]);
    expect(assets).toHaveLength(2);
    expect(assets[1]?.externalId).toBe('asset-2');
  });
});
