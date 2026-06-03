import { describe, expect, it, vi } from 'vitest';

import type { CdfReadClient, InstanceNodeDto } from '../../../core/sdk/cdf-client';

import { CdfChecklistRepository } from './cdf-checklist.repository';

function makeClient(checklists: InstanceNodeDto[], items: InstanceNodeDto[]): CdfReadClient {
  let listCalls = 0;
  return {
    project: 'radix-dev',
    instances: {
      list: vi.fn(async () => {
        listCalls += 1;
        if (listCalls === 1) {
          return { items };
        }
        return { items: checklists };
      }),
    },
  };
}

describe(CdfChecklistRepository.name, () => {
  it('computes KPI summary from checklist and item instances', async () => {
    const repository = new CdfChecklistRepository(
      makeClient(
        [
          {
            space: 'cdf_apm',
            externalId: 'CKM_CHK_GR1_ALINE-ROUTE1-2025-06-01-A',
            instanceType: 'node',
            properties: {
              cdf_apm: {
                'Checklist/v7': { title: 'A', status: 'created', endTime: null },
              },
            },
          },
          {
            space: 'cdf_apm',
            externalId: 'CKM_CHK_GR1_ALINE-ROUTE1-2025-06-01-B',
            instanceType: 'node',
            properties: {
              cdf_apm: {
                'Checklist/v7': { title: 'B', status: 'completed', endTime: null },
              },
            },
          },
        ],
        [
          {
            space: 'cdf_apm',
            externalId: 'CKM_CITEM_GR1_ALINE-ROUTE1-2025-06-01-B-PUMP-A-MOTOR-TEMP',
            instanceType: 'node',
            properties: {
              cdf_apm: {
                'ChecklistItem/v7': { note: 'Not OK finding' },
              },
            },
          },
        ],
      ),
    );

    const summary = await repository.computeKpiSummary();

    expect(summary.total).toBe(2);
    expect(summary.counts.todo).toBe(1);
    expect(summary.counts.notok).toBe(1);
  });
});
