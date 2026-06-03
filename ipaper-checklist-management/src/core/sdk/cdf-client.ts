import { useCogniteSdk } from '@cognite/app-sdk/react';

export type ViewReference = {
  type: 'view';
  space: string;
  externalId: string;
  version: string;
};

export type InstancesListRequest = {
  instanceType: 'node';
  sources: Array<{ source: ViewReference }>;
  limit: number;
  cursor?: string;
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


export function useCdfClient(): CdfReadClient {
  return useCogniteSdk() as unknown as CdfReadClient;
}
