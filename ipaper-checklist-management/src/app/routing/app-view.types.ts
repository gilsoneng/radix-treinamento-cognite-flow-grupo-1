export const APP_PAGES = [
  'overview',
  'checklists',
  'analytics',
  'alerts',
  'settings',
] as const;

export type AppPage = (typeof APP_PAGES)[number];

export type AnalyticsTab = 'results' | 'trends';

export type OverviewShiftCode = 'D' | 'A' | 'N';

export type AppState = {
  page: AppPage;
  checklistId?: string;
  analyticsTab?: AnalyticsTab;
  /** Overview KPI filter — host-synced (YYYY-MM-DD from CDF checklist externalIds). */
  overviewOperationalDay?: string;
  overviewShiftCode?: OverviewShiftCode;
};

export const DEFAULT_APP_STATE: AppState = { page: 'overview', analyticsTab: 'results' };

const APP_PAGE_SET = new Set<string>(APP_PAGES);

export function isAppPage(value: string): value is AppPage {
  return APP_PAGE_SET.has(value);
}

export function isAnalyticsTab(value: string): value is AnalyticsTab {
  return value === 'results' || value === 'trends';
}

export function isOverviewShiftCode(value: string): value is OverviewShiftCode {
  return value === 'D' || value === 'A' || value === 'N';
}

export type AppNavItem = {
  page: AppPage;
  label: string;
};

/** Consolidated: Task Results + Time-Series KPIs → Analytics (spec 004). */
export const APP_NAV_ITEMS: readonly AppNavItem[] = [
  { page: 'overview', label: 'Overview' },
  { page: 'checklists', label: 'Checklists' },
  { page: 'analytics', label: 'Analytics' },
  { page: 'alerts', label: 'Alerts' },
  { page: 'settings', label: 'Settings' },
];

export const APP_PAGE_TITLES: Record<AppPage, string> = {
  overview: 'Overview',
  checklists: 'Checklists',
  analytics: 'Analytics',
  alerts: 'Alerts',
  settings: 'Settings',
};
