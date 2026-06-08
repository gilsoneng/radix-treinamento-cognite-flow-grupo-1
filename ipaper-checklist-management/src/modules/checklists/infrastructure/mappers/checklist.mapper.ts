import { CHECKLIST_ITEM_VIEW, CHECKLIST_VIEW } from '../../../../core/dm/apm-dm.constants';
import { readViewProperties } from '../../../../core/dm/read-view-properties';
import type { ChecklistSummary } from '../../domain/checklist-kpi.model';
import type {
  ChecklistInstanceDto,
  ChecklistItemInstanceDto,
  ChecklistItemPropertiesDto,
  ChecklistPropertiesDto,
} from '../dto/checklist-instance.dto';

import { checklistIdFromCitemExternalId } from './checklist-id.parser';

function readString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

export function readChecklistItemNote(item: ChecklistItemInstanceDto): string {
  const props = readViewProperties<ChecklistItemPropertiesDto>(item, CHECKLIST_ITEM_VIEW);
  return readString(props.note);
}

function readNullableString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

export function toChecklistSummary(node: ChecklistInstanceDto, hasNotOk: boolean): ChecklistSummary {
  const props = readViewProperties<ChecklistPropertiesDto>(node, CHECKLIST_VIEW);

  return {
    space: node.space,
    externalId: node.externalId,
    title: readString(props.title),
    status: readString(props.status),
    endTime: readNullableString(props.endTime),
    templateExternalId: readNullableString(props.sourceId),
    hasNotOk,
  };
}

export function toNotOkChecklistIds(items: readonly ChecklistItemInstanceDto[]): Set<string> {
  const ids = new Set<string>();
  for (const item of items) {
    const props = readViewProperties<ChecklistItemPropertiesDto>(item, CHECKLIST_ITEM_VIEW);
    const note = readString(props.note);
    if (!note) {
      continue;
    }
    const checklistId = checklistIdFromCitemExternalId(item.externalId);
    if (checklistId) {
      ids.add(checklistId);
    }
  }
  return ids;
}
