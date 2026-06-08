import type { ChecklistSummary } from './checklist-kpi.model';
import { parseChecklistShift } from './checklist-shift.rules';
import type { InspectionShiftCode } from './inspection-shift.model';
import { shiftCodeFromHour } from './inspection-shift.rules';
import type { OperationalKpiCatalog, OperationalKpiSelection } from './operational-catalog.model';

const SHIFT_ORDER: InspectionShiftCode[] = ['D', 'A', 'N'];

function sortShifts(codes: readonly InspectionShiftCode[]): InspectionShiftCode[] {
  return SHIFT_ORDER.filter((code) => codes.includes(code));
}

export function buildOperationalCatalog(
  checklists: readonly ChecklistSummary[],
): OperationalKpiCatalog {
  const shiftsByDay = new Map<string, Set<InspectionShiftCode>>();

  for (const checklist of checklists) {
    const parsed = parseChecklistShift(checklist.externalId);
    if (!parsed) {
      continue;
    }
    const existing = shiftsByDay.get(parsed.dateIso) ?? new Set<InspectionShiftCode>();
    existing.add(parsed.code);
    shiftsByDay.set(parsed.dateIso, existing);
  }

  const days = [...shiftsByDay.keys()].sort((a, b) => b.localeCompare(a));
  const record: Record<string, readonly InspectionShiftCode[]> = {};

  for (const day of days) {
    const codes = shiftsByDay.get(day);
    if (codes) {
      record[day] = sortShifts([...codes]);
    }
  }

  return { days, shiftsByDay: record };
}

function pickDefaultShift(
  codes: readonly InspectionShiftCode[],
  now: Date,
): InspectionShiftCode {
  const clock = shiftCodeFromHour(now.getHours());
  if (codes.includes(clock)) {
    return clock;
  }
  return codes[0] ?? 'D';
}

export function defaultOperationalSelection(
  catalog: OperationalKpiCatalog,
  now: Date = new Date(),
): OperationalKpiSelection | null {
  const operationalDay = catalog.days[0];
  if (!operationalDay) {
    return null;
  }
  const codes = catalog.shiftsByDay[operationalDay] ?? [];
  if (codes.length === 0) {
    return null;
  }
  return {
    operationalDay,
    shiftCode: pickDefaultShift(codes, now),
  };
}

export function isOperationalSelectionValid(
  catalog: OperationalKpiCatalog,
  selection: OperationalKpiSelection,
): boolean {
  const codes = catalog.shiftsByDay[selection.operationalDay];
  return catalog.days.includes(selection.operationalDay) && codes?.includes(selection.shiftCode) === true;
}

export function resolveOperationalSelection(
  catalog: OperationalKpiCatalog,
  requested: OperationalKpiSelection | undefined,
  now: Date = new Date(),
): OperationalKpiSelection | null {
  if (requested && isOperationalSelectionValid(catalog, requested)) {
    return requested;
  }
  return defaultOperationalSelection(catalog, now);
}

export function stepOperationalDay(
  catalog: OperationalKpiCatalog,
  current: OperationalKpiSelection,
  direction: 'older' | 'newer',
): OperationalKpiSelection | null {
  const index = catalog.days.indexOf(current.operationalDay);
  if (index < 0) {
    return null;
  }
  const nextIndex = direction === 'older' ? index + 1 : index - 1;
  const nextDay = catalog.days[nextIndex];
  if (!nextDay) {
    return null;
  }
  const codes = catalog.shiftsByDay[nextDay] ?? [];
  const shiftCode = codes.includes(current.shiftCode)
    ? current.shiftCode
    : pickDefaultShift(codes, new Date());
  return { operationalDay: nextDay, shiftCode };
}

export function stepOperationalShift(
  catalog: OperationalKpiCatalog,
  current: OperationalKpiSelection,
  direction: 'previous' | 'next',
): OperationalKpiSelection | null {
  const codes = catalog.shiftsByDay[current.operationalDay];
  if (!codes || codes.length === 0) {
    return null;
  }
  const index = codes.indexOf(current.shiftCode);
  if (index < 0) {
    return null;
  }
  const offset = direction === 'next' ? 1 : -1;
  const nextIndex = (index + offset + codes.length) % codes.length;
  const shiftCode = codes[nextIndex];
  if (!shiftCode) {
    return null;
  }
  return { operationalDay: current.operationalDay, shiftCode };
}
