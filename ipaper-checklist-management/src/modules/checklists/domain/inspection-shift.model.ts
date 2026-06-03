export type InspectionShiftCode = 'D' | 'A' | 'N';

export type OperationalShiftRef = {
  readonly dateIso: string;
  readonly code: InspectionShiftCode;
};

export type OperationalShiftContext = {
  readonly operationalDay: string;
  readonly current: OperationalShiftRef;
  readonly previous: OperationalShiftRef;
  readonly currentLabel: string;
  readonly previousLabel: string;
};
