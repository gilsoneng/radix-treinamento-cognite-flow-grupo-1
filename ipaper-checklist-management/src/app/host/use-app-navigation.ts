import { useCallback } from 'react';

import type { AnalyticsTab, AppPage } from '../routing/app-view.types';

import { useAppNavigationContext } from './app-navigation.context';

export type AppNavigationViewModel = {
  readonly page: AppPage;
  readonly analyticsTab: AnalyticsTab;
  readonly navigate: (page: AppPage, options?: { analyticsTab?: AnalyticsTab }) => void;
  readonly setAnalyticsTab: (tab: AnalyticsTab) => void;
};

export function useAppNavigation(): AppNavigationViewModel {
  const { state, setPage, setAnalyticsTab } = useAppNavigationContext();

  const navigate = useCallback(
    (page: AppPage, options?: { analyticsTab?: AnalyticsTab }) => setPage(page, options),
    [setPage],
  );

  return {
    page: state.page,
    analyticsTab: state.analyticsTab ?? 'trends',
    navigate,
    setAnalyticsTab,
  };
}
