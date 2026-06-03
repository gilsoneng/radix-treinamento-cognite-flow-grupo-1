import type { InspectionShiftCode } from './inspection-shift.model';

export type OperationalKpiSelection = {
  readonly operationalDay: string;
  readonly shiftCode: InspectionShiftCode;
};

export type OperationalKpiCatalog = {
  readonly days: readonly string[];
  readonly shiftsByDay: Readonly<Record<string, readonly InspectionShiftCode[]>>;
};
