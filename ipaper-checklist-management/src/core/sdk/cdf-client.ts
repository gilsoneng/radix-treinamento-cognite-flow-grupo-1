import { useCogniteSdk } from '@cognite/app-sdk/react';
import type { CogniteClient } from '@cognite/sdk';

export type ViewReference = {
  type: 'view';
  space: string;
  externalId: string;
  version: string;
};

export type InstancesListFilter = {
  equals: {
    property: string[];
    value: string;
  };
};

export type InstancesListRequest = {
  instanceType: 'node';
  sources: Array<{ source: ViewReference }>;
  limit: number;
  cursor?: string;
  filter?: InstancesListFilter;
};

export type InstanceNodeDto = {
  space: string;
  externalId: string;
  instanceType: 'node';
  properties?: Record<string, Record<string, unknown>>;
};

export type InstancesListResponse = {
  items: InstanceNodeDto[];
  nextCursor?: string;
};

export interface CdfReadClient {
  readonly project: string;
  readonly instances: {
    list(request: InstancesListRequest): Promise<InstancesListResponse>;
  };
}

function toCdfReadClient(sdk: CogniteClient): CdfReadClient {
  return {
    get project() {
      return sdk.project;
    },
    instances: {
      list: async (request) => {
        const response = await sdk.instances.list({
          instanceType: request.instanceType,
          sources: request.sources.map((entry) => ({
            source: {
              type: 'view' as const,
              space: entry.source.space,
              externalId: entry.source.externalId,
              version: entry.source.version,
            },
          })),
          limit: request.limit,
          cursor: request.cursor,
          ...(request.filter ? { filter: request.filter } : {}),
        });
        return {
          items: response.items as InstanceNodeDto[],
          nextCursor: response.nextCursor,
        };
      },
    },
  };
}

export function useCdfClient(): CdfReadClient {
  return toCdfReadClient(useCogniteSdk() as CogniteClient);
}
