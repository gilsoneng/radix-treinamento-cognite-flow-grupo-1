import type { InspectionShiftCode } from './inspection-shift.model';
import type { ChecklistSummary } from './checklist-kpi.model';
import type { OperationalShiftRef } from './inspection-shift.model';

const SHIFT_SUFFIX_PATTERN = /-(\d{4}-\d{2}-\d{2})-([DAN])$/;
const SHIFT_TOKEN_PATTERN = /-(\d{4}-\d{2}-\d{2})-([DAN])(?=-)/;

export type ParsedChecklistShift = {
  readonly dateIso: string;
  readonly code: InspectionShiftCode;
};

function parseShiftCode(code: string): InspectionShiftCode | null {
  if (code === 'D' || code === 'A' || code === 'N') {
    return code;
  }
  return null;
}

export function parseChecklistShift(externalId: string): ParsedChecklistShift | null {
  const match = SHIFT_SUFFIX_PATTERN.exec(externalId);
  if (!match) {
    return null;
  }
  const dateIso = match[1];
  const code = parseShiftCode(match[2]);
  if (!code) {
    return null;
  }
  return { dateIso, code };
}

/** Parses shift tokens embedded in checklist / observation externalIds. */
export function parseOperationalShiftFromExternalId(
  externalId: string,
): ParsedChecklistShift | null {
  const suffix = parseChecklistShift(externalId);
  if (suffix) {
    return suffix;
  }
  const match = SHIFT_TOKEN_PATTERN.exec(externalId);
  if (!match) {
    return null;
  }
  const dateIso = match[1];
  const code = parseShiftCode(match[2]);
  if (!code) {
    return null;
  }
  return { dateIso, code };
}

export function collectOperationalDays(checklists: readonly ChecklistSummary[]): string[] {
  const dates = new Set<string>();
  for (const checklist of checklists) {
    const parsed = parseChecklistShift(checklist.externalId);
    if (parsed) {
      dates.add(parsed.dateIso);
    }
  }
  return [...dates];
}

export function filterChecklistsByShiftRef(
  checklists: readonly ChecklistSummary[],
  ref: OperationalShiftRef,
): ChecklistSummary[] {
  return checklists.filter((checklist) => {
    const parsed = parseChecklistShift(checklist.externalId);
    if (!parsed) {
      return false;
    }
    return parsed.dateIso === ref.dateIso && parsed.code === ref.code;
  });
}

export function shiftCodesOnDay(
  checklists: readonly ChecklistSummary[],
  operationalDay: string,
): InspectionShiftCode[] {
  const codes = new Set<InspectionShiftCode>();
  for (const checklist of checklists) {
    const parsed = parseChecklistShift(checklist.externalId);
    if (parsed && parsed.dateIso === operationalDay) {
      codes.add(parsed.code);
    }
  }
  return [...codes];
}
