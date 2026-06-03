import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@cognite/aura/components';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

import type { OperationalKpiCatalog, OperationalKpiSelection } from '../../../domain/operational-catalog.model';
import { shiftLabel } from '../../../domain/inspection-shift.rules';
import type { OverviewShiftCode } from '../../../../../app/routing/app-view.types';

export type OverviewOperationalToolbarProps = {
  catalog: OperationalKpiCatalog;
  selection: OperationalKpiSelection;
  onSelect: (day: string, shiftCode: OverviewShiftCode) => void;
  onStepDay: (direction: 'older' | 'newer') => void;
  onStepShift: (direction: 'previous' | 'next') => void;
  canStepDayOlder: boolean;
  canStepDayNewer: boolean;
};

export function OverviewOperationalToolbar({
  catalog,
  selection,
  onSelect,
  onStepDay,
  onStepShift,
  canStepDayOlder,
  canStepDayNewer,
}: OverviewOperationalToolbarProps) {
  const shiftsForDay = catalog.shiftsByDay[selection.operationalDay] ?? [];

  return (
    <section
      aria-labelledby="overview-period-heading"
      className="flex flex-col gap-4 py-1"
    >
      <div className="text-left">
        <h2
          id="overview-period-heading"
          className="m-0 text-base font-semibold text-[var(--ip-teal)]"
        >
          PERIOD & SHIFT
        </h2>
        <p className="m-0 mt-1 text-sm text-[var(--ip-teal-dark)]">
          Choose date and shift to update KPIs and alerts on this page.
        </p>
      </div>

      <div className="flex flex-wrap items-end justify-center gap-6">
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">Date</span>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-label="Previous day"
              disabled={!canStepDayOlder}
              onClick={() => onStepDay('older')}
            >
              <IconChevronLeft className="h-4 w-4" aria-hidden />
            </Button>
            <Select
              value={selection.operationalDay}
              onValueChange={(day) => {
                const codes = catalog.shiftsByDay[day] ?? [];
                const shift = codes.includes(selection.shiftCode)
                  ? selection.shiftCode
                  : (codes[0] ?? 'D');
                onSelect(day, shift);
              }}
            >
              <SelectTrigger className="h-9 w-36" aria-label="Operational day">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {catalog.days.map((day) => (
                  <SelectItem key={day} value={day}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-label="Next day"
              disabled={!canStepDayNewer}
              onClick={() => onStepDay('newer')}
            >
              <IconChevronRight className="h-4 w-4" aria-hidden />
            </Button>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">Shift</span>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-label="Previous shift"
              onClick={() => onStepShift('previous')}
            >
              <IconChevronLeft className="h-4 w-4" aria-hidden />
            </Button>
            <Select
              value={selection.shiftCode}
              onValueChange={(shift) => onSelect(selection.operationalDay, shift as OverviewShiftCode)}
            >
              <SelectTrigger className="h-9 w-40" aria-label="Shift">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {shiftsForDay.map((code) => (
                  <SelectItem key={code} value={code}>
                    {shiftLabel(code)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-label="Next shift"
              onClick={() => onStepShift('next')}
            >
              <IconChevronRight className="h-4 w-4" aria-hidden />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
