import { COGNITE_ASSET_VIEW } from '../../../../core/dm/core-dm.constants';
import type { CoreAsset } from '../../domain/core-asset.model';
import type { AssetInstanceDto, CogniteAssetPropertiesDto } from '../dto/asset-instance.dto';

function readAssetProperties(node: AssetInstanceDto): CogniteAssetPropertiesDto {
  const viewKey = `${COGNITE_ASSET_VIEW.externalId}/${COGNITE_ASSET_VIEW.version}`;
  const spaceProps = node.properties?.[COGNITE_ASSET_VIEW.space];
  if (!spaceProps || typeof spaceProps !== 'object') return {};

  const viewProps = spaceProps[viewKey];
  if (!viewProps || typeof viewProps !== 'object') return {};

  return viewProps as CogniteAssetPropertiesDto;
}

function readString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}


export function toCoreAsset(node: AssetInstanceDto): CoreAsset {
  const props = readAssetProperties(node);

  return {
    space: node.space,
    externalId: node.externalId,
    name: readString(props.name),
    description: readString(props.description),
  };
}


export function toCoreAssets(nodes: ReadonlyArray<AssetInstanceDto>): CoreAsset[] {
  return nodes.map(toCoreAsset);
}
