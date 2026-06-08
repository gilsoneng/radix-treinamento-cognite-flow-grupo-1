import { describe, expect, it } from 'vitest';

import type { TaskResultItem } from './task-result.model';
import { buildTaskResultAnalytics, buildTaskResultTrendSeries } from './task-result-analytics.rules';

const sample: TaskResultItem[] = [
  {
    space: 'cdf_apm',
    externalId: 'a',
    title: 'Pump temp',
    status: 'completed',
    note: 'bad',
    endTime: '2025-06-01',
    checklistExternalId: 'CKM_CHK_GR1_ROUTE1-2025-06-01-D',
    category: 'nok',
  },
  {
    space: 'cdf_apm',
    externalId: 'b',
    title: 'Pump temp',
    status: 'completed',
    note: '',
    endTime: '2025-06-02',
    checklistExternalId: 'CKM_CHK_GR1_ROUTE1-2025-06-02-D',
    category: 'ok',
  },
];

describe(buildTaskResultTrendSeries.name, () => {
  it('aggregates ok and nok by date', () => {
    const trend = buildTaskResultTrendSeries(sample, 'all');
    expect(trend).toHaveLength(2);
    expect(trend[0]?.notok).toBe(1);
    expect(trend[1]?.ok).toBe(1);
  });
});

describe(buildTaskResultAnalytics.name, () => {
  it('builds summary and recurring rows', () => {
    const bundle = buildTaskResultAnalytics(sample, 'all');
    expect(bundle.summary.nok).toBe(1);
    expect(bundle.recurringNotOk[0]?.occurrences).toBe(1);
  });
});
