import type { UseQueryResult } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import type { CoreAsset } from '../../domain/core-asset.model';

import { UseHealthViewModelContext, useHealthViewModel } from './use-health.view-model';

function fakeQuery(overrides: Partial<UseQueryResult<CoreAsset[]>>): UseQueryResult<CoreAsset[]> {
  return {
    isPending: false,
    isError: false,
    data: undefined,
    refetch: vi.fn(),
    ...overrides,
  } as Partial<UseQueryResult<CoreAsset[]>> as UseQueryResult<CoreAsset[]>;
}

function makeWrapper(query: UseQueryResult<CoreAsset[]>) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <UseHealthViewModelContext.Provider value={{ useHealthQuery: () => query }}>
        {children}
      </UseHealthViewModelContext.Provider>
    );
  };
}

describe('useHealthViewModel', () => {
  it('exposes loading state', () => {
    const { result } = renderHook(() => useHealthViewModel(), { wrapper: makeWrapper(fakeQuery({ isPending: true })) });
    expect(result.current.isLoading).toBe(true);
    expect(result.current.assets).toEqual([]);
  });

  it('exposes assets from the query', () => {
    const assets: CoreAsset[] = [
      { space: 's', externalId: 'a-1', name: 'Pump', description: 'Desc' },
    ];
    const { result } = renderHook(() => useHealthViewModel(), { wrapper: makeWrapper(fakeQuery({ data: assets })) });

    expect(result.current.assets).toEqual(assets);
  });

  it('exposes error state and a working refresh', () => {
    const refetch = vi.fn();
    const { result } = renderHook(() => useHealthViewModel(), {
      wrapper: makeWrapper(fakeQuery({ isError: true, refetch })),
    });

    expect(result.current.isError).toBe(true);
    result.current.refresh();
    expect(refetch).toHaveBeenCalledOnce();
  });
});
