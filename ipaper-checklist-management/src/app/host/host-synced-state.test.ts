import { describe, expect, it } from 'vitest';

import { DEFAULT_APP_STATE } from '../routing/app-view.types';

import { parseAppState, serializeAppState } from './host-synced-state';

describe('parseAppState', () => {
  it('returns default when input is undefined', () => {
    expect(parseAppState(undefined)).toEqual(DEFAULT_APP_STATE);
  });

  it('parses a valid page from JSON', () => {
    expect(parseAppState(JSON.stringify({ page: 'checklists' }))).toEqual({ page: 'checklists' });
  });

  it('parses checklistId when present', () => {
    expect(parseAppState(JSON.stringify({ page: 'checklists', checklistId: 'cl-1' }))).toEqual({
      page: 'checklists',
      checklistId: 'cl-1',
    });
  });

  it('falls back to overview for invalid page', () => {
    expect(parseAppState(JSON.stringify({ page: 'unknown' }))).toEqual({
      page: 'overview',
      checklistId: undefined,
      analyticsTab: undefined,
    });
  });

  it('migrates legacy task-results page to analytics results tab', () => {
    expect(parseAppState(JSON.stringify({ page: 'task-results' }))).toEqual({
      page: 'analytics',
      analyticsTab: 'results',
    });
  });

  it('migrates legacy kpis page to analytics trends tab', () => {
    expect(parseAppState(JSON.stringify({ page: 'kpis' }))).toEqual({
      page: 'analytics',
      analyticsTab: 'trends',
    });
  });
});

describe('serializeAppState', () => {
  it('serializes state to JSON', () => {
    expect(serializeAppState({ page: 'overview' })).toBe('{"page":"overview"}');
  });
});
