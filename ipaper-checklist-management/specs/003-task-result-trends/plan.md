# Plan — Task Result Trends & Analytics

> **ID:** 003-task-result-trends  
> **Protótipo:** `prototype/fieldops-insights/src/routes/task-results.tsx`, `kpis.tsx`

---

## Visão técnica

```
AppShell (001)
  ├── task-results → TaskResultsView
  │     └── useTaskResultsViewModel
  │           └── TaskResultService.aggregate(period)
  │                 ├── byChecklist, byArea
  │                 └── recurringNotOk(threshold)
  └── kpis → TimeSeriesKpisView
        └── useTimeSeriesKpisViewModel
              └── TaskResultService.buildTimeSeries(range)
```

Reutiliza task results normalizados expostos por `ChecklistService` / tipos de 002.

---

## Mapeamento FR → módulo

| FR | Módulo `src/` | Padrão |
| --- | --- | --- |
| FR-001, FR-002 | `services/taskResult/TaskResultService.ts` | §4 |
| FR-009 | `services/taskResult/recurringNotOk.ts` | util + service |
| FR-006, FR-007 | `services/taskResult/timeSeries.ts` | util puro |
| FR-003…FR-005 | `views/analytics/TaskResultsView.tsx` | §5 + charts |
| FR-006…FR-008 | `views/analytics/TimeSeriesKpisView.tsx` | §2 range host-sync |
| FR-010 | estados em ambas views | skill `design` |

---

## Estado e host-sync

| Estado | Tipo | Justificativa |
| --- | --- | --- |
| `analyticsRange` | host-synced | FR-008 — 7d/30d/month/custom |
| `customRangeFrom/To` | host-synced | quando range = Custom |
| chart hover/tooltip | local-only | transient |

---

## Interfaces

```typescript
export interface TaskResultService {
  aggregate(period: DateRange): Promise<TaskResultAggregate>;
  aggregateByChecklist(period: DateRange): Promise<DimensionCount[]>;
  aggregateByArea(period: DateRange): Promise<DimensionCount[]>;
  findRecurringNotOk(period: DateRange, threshold: number): Promise<RecurringNotOk[]>;
  buildTimeSeries(range: TimeSeriesRange): Promise<TimeSeriesPoint[]>;
}
```

---

## Trade-offs

- **Charts v1:** usar primitivo Aura para barras/linhas se disponível; senão wrapper fino sobre lib aprovada pelo flows-design-review (ADR em research.md). Protótipo usa Recharts — **não** importar no app Flows sem decisão.
- **Agregação client-side:** aceitável v1 com volume mock; otimizar com CDF aggregation v2.
- **Custom range v1:** stub com fixed 14d se date picker Aura atrasar.

---

## Riscos

- Performance com muitos task results — limitar período default 30d.
- Dependência forte de 002 — contrato `TaskResult` tipado compartilhado em `src/types/`.
