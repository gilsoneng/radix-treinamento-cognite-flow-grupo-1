import { describe, expect, it } from 'vitest';

import {
  categorizeTaskResult,
  summarizeTaskResults,
  taskResultExecutionDate,
} from './task-result.rules';
import type { TaskResultItem } from './task-result.model';

describe(categorizeTaskResult.name, () => {
  it('classifies items with notes as nok', () => {
    expect(categorizeTaskResult('Anomaly', 'completed')).toBe('nok');
  });

  it('classifies completed items without notes as ok', () => {
    expect(categorizeTaskResult('', 'completed')).toBe('ok');
  });
});

describe(taskResultExecutionDate.name, () => {
  it('parses date from checklist item external id when endTime is missing', () => {
    const date = taskResultExecutionDate({
      space: 'flows_radix_checklist_group1',
      externalId: 'CKM_CITEM_GR1_ROUTE1-2025-01-02-D-PUMP-A',
      title: 'Pump',
      status: 'completed',
      note: null,
      endTime: null,
      checklistExternalId: null,
      category: 'ok',
    });
    expect(date?.toISOString().slice(0, 10)).toBe('2025-01-02');
  });
});

describe(summarizeTaskResults.name, () => {
  it('counts categories', () => {
    const items: TaskResultItem[] = [
      {
        space: 'cdf_apm',
        externalId: 'a',
        title: 'A',
        status: 'completed',
        note: null,
        endTime: null,
        checklistExternalId: null,
        category: 'ok',
      },
      {
        space: 'cdf_apm',
        externalId: 'b',
        title: 'B',
        status: 'completed',
        note: 'fail',
        endTime: null,
        checklistExternalId: null,
        category: 'nok',
      },
    ];
    expect(summarizeTaskResults(items)).toEqual({ ok: 1, nok: 1, observation: 0 });
  });
});
