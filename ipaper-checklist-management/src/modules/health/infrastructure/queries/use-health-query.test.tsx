import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import type { CoreAsset } from '../../domain/core-asset.model';
import type { CoreAssetRepository } from '../../domain/core-asset.repository';
import { MockCoreAssetRepository } from '../core-asset.mock-repository';

import { UseHealthQueryContext, useHealthQuery } from './use-health-query';

function makeWrapper(repository: CoreAssetRepository) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <UseHealthQueryContext.Provider value={{ useCoreAssetRepository: () => repository }}>
          {children}
        </UseHealthQueryContext.Provider>
      </QueryClientProvider>
    );
  };
}

describe('useHealthQuery', () => {
  it('resolves with assets from the injected repository', async () => {
    const assets: CoreAsset[] = [
      { space: 's', externalId: 'a-1', name: 'Pump', description: 'Desc' },
    ];
    const { result } = renderHook(() => useHealthQuery(), {
      wrapper: makeWrapper(new MockCoreAssetRepository(assets)),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(assets);
  });
});
