import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { createContext, useContext, useMemo } from 'react';

import { useCdfClient } from '../../../../core/sdk/cdf-client';
import type { CoreAsset } from '../../domain/core-asset.model';
import type { CoreAssetRepository } from '../../domain/core-asset.repository';
import { CdfCoreAssetRepository } from '../cdf-core-asset.repository';

import { healthQueryKeys, listCoreAssetsQueryFn } from './health.queries';

function useDefaultCoreAssetRepository(): CoreAssetRepository {
  const client = useCdfClient();
  return useMemo(() => new CdfCoreAssetRepository(client), [client]);
}

const defaultDeps = { useCoreAssetRepository: useDefaultCoreAssetRepository };
export type UseHealthQueryContextType = typeof defaultDeps;
export const UseHealthQueryContext = createContext<UseHealthQueryContextType>(defaultDeps);


export function useHealthQuery(): UseQueryResult<CoreAsset[]> {
  const { useCoreAssetRepository } = useContext(UseHealthQueryContext);
  const repository = useCoreAssetRepository();
  return useQuery({
    queryKey: healthQueryKeys.assets,
    queryFn: listCoreAssetsQueryFn(repository),
    refetchOnWindowFocus: false,
  });
}
