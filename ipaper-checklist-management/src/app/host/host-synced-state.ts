import {
  DEFAULT_APP_STATE,
  isAnalyticsTab,
  isAppPage,
  type AnalyticsTab,
  type AppState,
} from '../routing/app-view.types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readOptionalString(record: Record<string, unknown>, key: string): string | undefined {
  if (!(key in record)) {
    return undefined;
  }
  const value = record[key];
  return typeof value === 'string' ? value : undefined;
}

function migrateLegacyPage(page: string): { page: AppState['page']; analyticsTab?: AnalyticsTab } {
  if (page === 'task-results') {
    return { page: 'analytics', analyticsTab: 'results' };
  }
  if (page === 'kpis') {
    return { page: 'analytics', analyticsTab: 'trends' };
  }
  if (isAppPage(page)) {
    return { page };
  }
  return { page: 'overview' };
}

export function parseAppState(raw: string | undefined): AppState {
  if (!raw) {
    return DEFAULT_APP_STATE;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || !('page' in parsed)) {
      return DEFAULT_APP_STATE;
    }
    const pageValue = parsed.page;
    if (typeof pageValue !== 'string') {
      return DEFAULT_APP_STATE;
    }

    const migrated = migrateLegacyPage(pageValue);
    const analyticsTabRaw = readOptionalString(parsed, 'analyticsTab');
    const analyticsTab =
      analyticsTabRaw && isAnalyticsTab(analyticsTabRaw) ? analyticsTabRaw : migrated.analyticsTab;

    return {
      page: migrated.page,
      checklistId: readOptionalString(parsed, 'checklistId'),
      analyticsTab: migrated.page === 'analytics' ? analyticsTab ?? 'results' : undefined,
    };
  } catch {
    return DEFAULT_APP_STATE;
  }
}

export function serializeAppState(state: AppState): string {
  return JSON.stringify(state);
}
