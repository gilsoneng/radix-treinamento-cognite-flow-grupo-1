import type { InstanceNodeDto } from '../../../../core/sdk/cdf-client';

export type ChecklistInstanceDto = InstanceNodeDto;

export type ChecklistItemInstanceDto = InstanceNodeDto;

export type ChecklistPropertiesDto = {
  title?: unknown;
  status?: unknown;
  endTime?: unknown;
  sourceId?: unknown;
};

export type ChecklistItemPropertiesDto = {
  title?: unknown;
  status?: unknown;
  note?: unknown;
  endTime?: unknown;
};
