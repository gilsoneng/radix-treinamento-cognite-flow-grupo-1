import type { ReactNode } from 'react';
import { useCallback, useMemo, useState } from 'react';

import type { AnalyticsTab, AppPage, AppState } from '../routing/app-view.types';

import { AppNavigationContext } from './app-navigation.context';
import { useHostAppContext } from './host-app.context';
import { serializeAppState } from './host-synced-state';

export type AppNavigationProviderProps = {
  children: ReactNode;
  initialAppState: AppState;
};

export function AppNavigationProvider({ children, initialAppState }: AppNavigationProviderProps) {
  const { api } = useHostAppContext();
  const [state, setState] = useState<AppState>(initialAppState);

  const pushState = useCallback(
    (next: AppState) => {
      setState(next);
      if (api) {
        void api.syncInternalState(serializeAppState(next));
      }
    },
    [api],
  );

  const setPage = useCallback(
    (page: AppPage, options?: { analyticsTab?: AnalyticsTab; checklistId?: string }) => {
      const next: AppState = {
        page,
        checklistId: options?.checklistId,
        analyticsTab: page === 'analytics' ? options?.analyticsTab ?? state.analyticsTab ?? 'results' : undefined,
      };
      pushState(next);
    },
    [pushState, state.analyticsTab],
  );

  const setAnalyticsTab = useCallback(
    (tab: AnalyticsTab) => {
      if (state.page !== 'analytics') {
        return;
      }
      pushState({ ...state, analyticsTab: tab });
    },
    [pushState, state],
  );

  const value = useMemo(
    () => ({ state, setPage, setAnalyticsTab }),
    [setAnalyticsTab, setPage, state],
  );

  return <AppNavigationContext.Provider value={value}>{children}</AppNavigationContext.Provider>;
}
