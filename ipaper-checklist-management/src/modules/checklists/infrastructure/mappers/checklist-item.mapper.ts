import { CHECKLIST_ITEM_VIEW } from '../../../../core/dm/apm-dm.constants';
import { readViewProperties } from '../../../../core/dm/read-view-properties';
import { categorizeTaskResult } from '../../domain/task-result.rules';
import type { TaskResultItem } from '../../domain/task-result.model';
import type { ChecklistItemInstanceDto, ChecklistItemPropertiesDto } from '../dto/checklist-instance.dto';

import { checklistIdFromCitemExternalId } from './checklist-id.parser';

function readItemProperties(node: ChecklistItemInstanceDto): ChecklistItemPropertiesDto {
  return readViewProperties<ChecklistItemPropertiesDto>(node, CHECKLIST_ITEM_VIEW);
}

function readString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function readNullableString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function toTaskResultItem(node: ChecklistItemInstanceDto): TaskResultItem {
  const props = readItemProperties(node);
  const note = readNullableString(props.note);
  const status = readString(props.status);

  return {
    space: node.space,
    externalId: node.externalId,
    title: readString(props.title),
    status,
    note,
    endTime: readNullableString(props.endTime),
    checklistExternalId: checklistIdFromCitemExternalId(node.externalId) ?? null,
    category: categorizeTaskResult(note ?? '', status),
  };
}

export function toTaskResultItems(nodes: readonly ChecklistItemInstanceDto[]): TaskResultItem[] {
  return nodes.map(toTaskResultItem);
}
