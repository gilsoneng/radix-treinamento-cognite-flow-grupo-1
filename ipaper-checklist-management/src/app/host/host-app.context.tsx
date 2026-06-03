import type { HostAppAPI } from '@cognite/app-sdk';
import { createContext, useContext } from 'react';

export type HostAppContextValue = {
  readonly api: HostAppAPI | null;
  readonly initialState: string | undefined;
  readonly isReady: boolean;
};

export const defaultHostAppContextValue: HostAppContextValue = {
  api: null,
  initialState: undefined,
  isReady: false,
};

export const HostAppContext = createContext<HostAppContextValue>(defaultHostAppContextValue);

export function useHostAppContext(): HostAppContextValue {
  return useContext(HostAppContext);
}
