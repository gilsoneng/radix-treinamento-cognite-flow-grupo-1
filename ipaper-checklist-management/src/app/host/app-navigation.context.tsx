import { createContext, useContext } from 'react';

import type { AnalyticsTab, AppPage, AppState } from '../routing/app-view.types';

export type AppNavigationContextValue = {
  readonly state: AppState;
  readonly setPage: (page: AppPage, options?: { analyticsTab?: AnalyticsTab; checklistId?: string }) => void;
  readonly setAnalyticsTab: (tab: AnalyticsTab) => void;
};

export const AppNavigationContext = createContext<AppNavigationContextValue | null>(null);

export function useAppNavigationContext(): AppNavigationContextValue {
  const value = useContext(AppNavigationContext);
  if (!value) {
    throw new Error('useAppNavigationContext must be used within AppNavigationProvider');
  }
  return value;
}
