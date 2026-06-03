import { createContext, useContext } from 'react';

import type { CoreAsset } from '../../domain/core-asset.model';
import { useHealthQuery } from '../../infrastructure/queries/use-health-query';

export interface HealthViewModel {
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly assets: CoreAsset[];
  refresh(): void;
}

const defaultDeps = { useHealthQuery };
export type UseHealthViewModelContextType = typeof defaultDeps;
export const UseHealthViewModelContext = createContext<UseHealthViewModelContextType>(defaultDeps);


export function useHealthViewModel(): HealthViewModel {
  const { useHealthQuery } = useContext(UseHealthViewModelContext);
  const query = useHealthQuery();

  return {
    isLoading: query.isPending,
    isError: query.isError,
    assets: query.data ?? [],
    refresh: () => {
      void query.refetch();
    },
  };
}
