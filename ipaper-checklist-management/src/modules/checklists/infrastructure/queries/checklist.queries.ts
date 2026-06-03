import type { ChecklistKpiSummary } from '../../domain/checklist-kpi.model';
import type { ChecklistRepository } from '../../domain/checklist.repository';

export const checklistQueryKeys = {
  kpiSummary: (templateExternalId?: string) =>
    ['checklists', 'kpi-summary', templateExternalId ?? 'all'] as const,
};

export function checklistKpiSummaryQueryFn(
  repository: ChecklistRepository,
  templateExternalId?: string,
) {
  return (): Promise<ChecklistKpiSummary> => repository.computeKpiSummary(templateExternalId);
}
