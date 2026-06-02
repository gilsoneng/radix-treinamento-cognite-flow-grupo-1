# Tasks — Task Result Trends & Analytics

> **ID:** 003-task-result-trends  
> **Epic owner:** Caio  
> **Issues GitHub:** [`docs/requirements/TASKS-DIVISION.md`](../../docs/requirements/TASKS-DIVISION.md#epic-003--task-result-dashboards)  
> **Protótipo:** `prototype/fieldops-insights/src/routes/task-results.tsx`, `kpis.tsx`

---

## Distribuição do time

| Dev | Tarefas | Foco |
| --- | --- | --- |
| **Guilherme** | T1–T2, T5–T6 | TaskResultService, agregação temporal |
| **João** | T3–T4, T7–T8 | Recurring Not OK, dashboard Task Results |
| **Caio** | T9–T11 | Time-Series KPIs, seletor período, estados |

---

## Tarefas

### Camada de dados — @Guilherme

- [ ] T1 — @Guilherme — FR-001, FR-002 — Teste unitário: `TaskResultService.aggregate` retorna ok, notOk, rate — teste: `src/services/taskResult/TaskResultService.test.ts`
- [ ] T2 — @Guilherme — FR-001, FR-002 — Implementar `TaskResultService` + dimensões (by checklist, by area) — teste: T1
- [ ] T5 — @Guilherme — FR-006, FR-007 — Teste unitário: `buildTimeSeries` filtra por range — teste: `src/services/taskResult/timeSeries.test.ts`
- [ ] T6 — @Guilherme — FR-006, FR-007 — Implementar agregação temporal — teste: T5

### Recurring Not OK — @João

- [ ] T3 — @João — FR-009 — Teste unitário: `findRecurringNotOk` com threshold — teste: `src/services/taskResult/recurringNotOk.test.ts`
- [ ] T4 — @João — FR-009 — Implementar `findRecurringNotOk` — teste: T3

### Task Results dashboard — @João

- [ ] T7 — @João — FR-003, FR-004, FR-005 — Teste integração: dashboard renderiza KPIs e 3+ gráficos — teste: `src/views/analytics/TaskResultsView.test.tsx`
- [ ] T8 — @João — FR-003, FR-004, FR-005 — Implementar `useTaskResultsViewModel` + view Aura — teste: T7

### Time-Series KPIs — @Caio

- [ ] T9 — @Caio — FR-006, FR-007, FR-008 — Teste integração: seletor de período altera dados exibidos — teste: `src/views/analytics/TimeSeriesKpisView.test.tsx`
- [ ] T10 — @Caio — FR-006, FR-007, FR-008 — Implementar `useTimeSeriesKpisViewModel` + host-sync range — teste: T9

### Estados — @Caio

- [ ] T11 — @Caio — FR-010 — Teste loading/error/empty em Task Results e Time-Series — testes: T7, T9

---

## Notas

- Depende de T4 (002) ChecklistService — Guilherme.
- Charts: ver ADR-001 em `research.md`; João (T7–T8) e Caio (T9–T10) alinham componente antes de implementar.
