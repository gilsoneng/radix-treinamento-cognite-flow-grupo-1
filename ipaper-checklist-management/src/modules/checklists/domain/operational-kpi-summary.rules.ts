import {
  collectOperationalDays,
  filterChecklistsByShiftRef,
} from './checklist-shift.rules';
import type { ChecklistKpiSummary } from './checklist-kpi.model';
import { summarizeChecklistKpis, filterChecklistsByTemplate } from './checklist-kpi.rules';
import type { ChecklistSummary } from './checklist-kpi.model';
import { buildShiftContextForSelection } from './inspection-shift.rules';
import { buildChecklistKpiInsights } from './kpi-insight.rules';
import {
  buildOperationalCatalog,
  resolveOperationalSelection,
} from './operational-catalog.rules';
import type { OperationalKpiSelection } from './operational-catalog.model';

export function buildOperationalKpiSummary(
  checklists: readonly ChecklistSummary[],
  templateExternalId: string | undefined,
  selection?: OperationalKpiSelection,
  now: Date = new Date(),
): ChecklistKpiSummary {
  const filtered = filterChecklistsByTemplate(checklists, templateExternalId);
  const catalog = buildOperationalCatalog(filtered);
  const resolved = resolveOperationalSelection(catalog, selection, now);

  if (!resolved || catalog.days.length === 0) {
    const counts = summarizeChecklistKpis(filtered, now);
    const insights = buildChecklistKpiInsights(counts, counts, false);
    return {
      counts,
      total: filtered.length,
      insights,
      shiftContext: null,
      catalog,
      selection: null,
    };
  }

  const shiftContext = buildShiftContextForSelection(
    resolved.operationalDay,
    resolved.shiftCode,
  );

  const currentScope = filterChecklistsByShiftRef(filtered, shiftContext.current);
  const previousScope = filterChecklistsByShiftRef(filtered, shiftContext.previous);
  const hasPreviousCohort = previousScope.length > 0;

  const counts = summarizeChecklistKpis(currentScope, now);
  const shiftPreviousCounts = summarizeChecklistKpis(previousScope, now);
  const insights = buildChecklistKpiInsights(counts, shiftPreviousCounts, hasPreviousCohort);

  return {
    counts,
    total: filtered.length,
    insights,
    shiftContext,
    catalog,
    selection: resolved,
  };
}

/** @deprecated use buildOperationalCatalog — kept for tests referencing collectOperationalDays */
export function hasOperationalShiftData(checklists: readonly ChecklistSummary[]): boolean {
  return collectOperationalDays(checklists).length > 0;
}
