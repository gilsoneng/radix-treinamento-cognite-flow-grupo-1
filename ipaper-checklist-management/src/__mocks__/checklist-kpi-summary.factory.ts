import type { ChecklistKpiSummary } from '../modules/checklists/domain/checklist-kpi.model';
import { EMPTY_KPI_COUNTS } from '../modules/checklists/domain/checklist-kpi.model';
import { buildChecklistKpiInsights } from '../modules/checklists/domain/kpi-insight.rules';

const EMPTY_CATALOG = { days: [] as string[], shiftsByDay: {} };

export function makeChecklistKpiSummary(
  overrides?: Partial<ChecklistKpiSummary>,
): ChecklistKpiSummary {
  const counts = overrides?.counts ?? {
    todo: 1,
    ongoing: 1,
    done: 2,
    overdue: 0,
    notok: 0,
  };

  return {
    counts,
    total: overrides?.total ?? 4,
    insights:
      overrides?.insights ??
      buildChecklistKpiInsights(counts, EMPTY_KPI_COUNTS, false),
    shiftContext: overrides?.shiftContext ?? null,
    catalog: overrides?.catalog ?? EMPTY_CATALOG,
    selection: overrides?.selection ?? null,
    ...overrides,
  };
}
