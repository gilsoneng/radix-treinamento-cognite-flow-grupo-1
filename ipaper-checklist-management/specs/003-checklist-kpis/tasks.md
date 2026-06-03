# Tasks — Checklist KPIs

> **ID:** 003-checklist-kpis  
> Ordem: **Test-First** — testes de integração → testes unitários → código fonte. (AGENTS.md §6)

---

## Tarefas

- [x] T1 — FR-001 — Teste unitário do mapper — `src/modules/checklists/infrastructure/mappers/checklist.mapper.test.ts`
- [x] T2 — FR-001 — `ChecklistMapper`, `CdfChecklistRepository` — teste: T1
- [x] T3 — FR-002 — Teste ViewModel — `use-overview-kpis.view-model.test.tsx`
- [x] T4 — FR-002 — `useOverviewKpisViewModel` — teste: T3
- [x] T5 — FR-002 — Teste componente KPI — `kpi-card.test.tsx`, `overview.page.test.tsx`
- [x] T6 — FR-002 — `KpiCard` + `OverviewPage` (5 cards Aura) — teste: T5
- [x] T7 — FR-003 — Teste filtro template — `checklist-kpi.rules.test.ts`
- [x] T8 — FR-003 — `filterChecklistsByTemplate` no domínio — teste: T7
- [x] T9 — FR-005 — Teste loading — `overview.page.test.tsx`, `App.test.tsx`
- [x] T10 — FR-005 — Loading/error/empty em `OverviewPage` — teste: T9

---

## Notas

- Filtro por template na UI (select) fica para incremento — regra de domínio pronta (FR-003).
- Template filter host-synced: extensão de `AppState` planejada em spec 004/iteração.
