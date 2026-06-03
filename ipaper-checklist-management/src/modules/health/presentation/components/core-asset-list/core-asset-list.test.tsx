import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CoreAssetList } from './core-asset-list';

describe('CoreAssetList', () => {
  it('renders asset rows with key properties', () => {
    render(
      <CoreAssetList
        assets={[
          {
            space: 'asset-space',
            externalId: 'asset-1',
            name: 'Pump A',
            description: 'Main feed pump',
          },
        ]}
      />,
    );

    expect(screen.getByText('Cognite Core assets')).toBeInTheDocument();
    expect(screen.getByText('asset-1')).toBeInTheDocument();
    expect(screen.getByText('Pump A')).toBeInTheDocument();
    expect(screen.getByText('Main feed pump')).toBeInTheDocument();
    expect(screen.getByText('asset-space')).toBeInTheDocument();
    expect(screen.queryByText('Source')).not.toBeInTheDocument();
  });
});
