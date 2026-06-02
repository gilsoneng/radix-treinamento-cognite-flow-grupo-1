import { Badge } from '@cognite/aura/components';

import type { CoreAsset } from '../../../domain/core-asset.model';

export interface CoreAssetListProps {
  assets: CoreAsset[];
}


export function CoreAssetList({ assets }: CoreAssetListProps) {
  return (
    <section className="ip-data-panel" aria-labelledby="core-assets-title">
      <div className="ip-data-panel__header">
        <h2 id="core-assets-title" className="ip-data-panel__title">
          Cognite Core assets
        </h2>
        <p className="ip-data-panel__description">
          Sample of {assets.length} CogniteAsset instances from the Core Data Model.
        </p>
      </div>
      <div className="ip-data-panel__body">
        <table className="ip-data-table">
          <thead>
            <tr>
              <th>External ID</th>
              <th>Name</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset) => (
              <tr key={`${asset.space}:${asset.externalId}`}>
                <td>
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">{asset.externalId}</span>
                    <Badge variant="mountain" background>
                      {asset.space}
                    </Badge>
                  </div>
                </td>
                <td>{asset.name || '—'}</td>
                <td className="text-muted-foreground">{asset.description || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
