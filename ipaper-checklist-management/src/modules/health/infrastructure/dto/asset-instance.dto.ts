import type { InstanceNodeDto } from '../../../../core/sdk/cdf-client';


export interface CogniteAssetPropertiesDto {
  readonly name?: string;
  readonly description?: string;
  readonly source?: string;
  readonly sourceId?: string;
}


export type AssetInstanceDto = InstanceNodeDto;
