import type {
  InspectionShiftCode,
  OperationalShiftContext,
  OperationalShiftRef,
} from './inspection-shift.model';

const SHIFT_LABELS: Record<InspectionShiftCode, string> = {
  D: 'Day Shift',
  A: 'Afternoon Shift',
  N: 'Night Shift',
};

export function shiftCodeFromHour(hour: number): InspectionShiftCode {
  if (hour >= 6 && hour < 14) {
    return 'D';
  }
  if (hour >= 14 && hour < 22) {
    return 'A';
  }
  return 'N';
}

export function previousShiftRef(ref: OperationalShiftRef): OperationalShiftRef {
  if (ref.code === 'D') {
    return { dateIso: addDays(ref.dateIso, -1), code: 'N' };
  }
  if (ref.code === 'A') {
    return { dateIso: ref.dateIso, code: 'D' };
  }
  return { dateIso: ref.dateIso, code: 'A' };
}

function addDays(dateIso: string, offset: number): string {
  const date = new Date(`${dateIso}T12:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

export function pickLatestOperationalDay(dates: readonly string[]): string | null {
  let latest: string | null = null;
  for (const dateIso of dates) {
    if (!latest || dateIso.localeCompare(latest) > 0) {
      latest = dateIso;
    }
  }
  return latest;
}

export function buildOperationalShiftContext(
  operationalDay: string,
  shiftCodesOnDay: readonly InspectionShiftCode[],
  now: Date = new Date(),
): OperationalShiftContext {
  const clockCode = shiftCodeFromHour(now.getHours());
  const currentCode = shiftCodesOnDay.includes(clockCode)
    ? clockCode
    : pickDominantShiftCode(shiftCodesOnDay);

  return buildShiftContextForSelection(operationalDay, currentCode);
}

export function buildShiftContextForSelection(
  operationalDay: string,
  shiftCode: InspectionShiftCode,
): OperationalShiftContext {
  const current: OperationalShiftRef = { dateIso: operationalDay, code: shiftCode };
  const previous = previousShiftRef(current);

  return {
    operationalDay,
    current,
    previous,
    currentLabel: SHIFT_LABELS[current.code],
    previousLabel: SHIFT_LABELS[previous.code],
  };
}

function pickDominantShiftCode(codes: readonly InspectionShiftCode[]): InspectionShiftCode {
  const counts: Record<InspectionShiftCode, number> = { D: 0, A: 0, N: 0 };
  for (const code of codes) {
    counts[code] += 1;
  }
  if (counts.D >= counts.A && counts.D >= counts.N) {
    return 'D';
  }
  if (counts.A >= counts.N) {
    return 'A';
  }
  return 'N';
}

export function shiftLabel(code: InspectionShiftCode): string {
  return SHIFT_LABELS[code];
}
