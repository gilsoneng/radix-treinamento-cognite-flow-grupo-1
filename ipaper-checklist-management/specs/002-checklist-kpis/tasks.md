# Tasks — Checklist KPIs & Overview

> **ID:** 002-checklist-kpis  
> **Epic owner:** João  
> Ordem: **Test-First** — integração → unidade → fonte.  
> **Issues GitHub:** [`docs/requirements/TASKS-DIVISION.md`](../../docs/requirements/TASKS-DIVISION.md#epic-002--checklist-kpi-enhancements)  
> **Protótipo:** `prototype/fieldops-insights/src/routes/index.tsx`, `checklists.tsx`, `checklists.$id.tsx`

---

## Distribuição do time

| Dev | Tarefas | Foco |
| --- | --- | --- |
| **Guilherme** | T1–T4 | ChecklistService, agregação status, CDF/mock |
| **João** | T5–T7, T12–T13 | Overview, detalhe checklist |
| **Caio** | T8–T11, T14 | Lista, filtros host-sync, estados |

---

## Tarefas

### Camada de dados — @Guilherme

- [ ] T1 — @Guilherme — FR-001, FR-002 — Teste unitário: `aggregateChecklistStatus` classifica notok quando ≥1 task Not OK — teste: `src/services/checklist/aggregateChecklistStatus.test.ts`
- [ ] T2 — @Guilherme — FR-001, FR-002 — Implementar `aggregateChecklistStatus` + tipos `ChecklistStatus` — teste: T1
- [ ] T3 — @Guilherme — FR-001 — Teste unitário: `ChecklistService.list` retorna checklists parseados — teste: `src/services/checklist/ChecklistService.test.ts`
- [ ] T4 — @Guilherme — FR-001 — Implementar interface `ChecklistService` + impl CDF/mock — teste: T3

### Overview — @João

- [ ] T5 — @João — FR-003, FR-004 — Teste integração: overview renderiza 5 KPI cards com valores do service — teste: `src/views/overview/OverviewView.test.tsx`
- [ ] T6 — @João — FR-003, FR-004, FR-005 — Implementar `useOverviewViewModel` + `OverviewView` (Aura) — teste: T5
- [ ] T7 — @João — FR-005 — Teste: tabelas Latest Not OK e Overdue com link "View all" — teste: `src/views/overview/OverviewView.test.tsx`

### Lista de checklists — @Caio

- [ ] T8 — @Caio — FR-006, FR-007 — Teste integração: filtros reduzem linhas visíveis — teste: `src/views/checklists/ChecklistListView.test.tsx`
- [ ] T9 — @Caio — FR-006, FR-007 — Implementar `useChecklistListViewModel` + filtros/busca/ordenação — teste: T8
- [ ] T10 — @Caio — FR-008 — Teste: filtros restaurados de `initialState` host — teste: `src/views/checklists/ChecklistListView.test.tsx`
- [ ] T11 — @Caio — FR-008 — Wire host-sync em ViewModel (seed + syncInternalState) — teste: T10

### Detalhe — @João

- [ ] T12 — @João — FR-009 — Teste integração: detalhe exibe task results OK/Not OK — teste: `src/views/checklists/ChecklistDetailView.test.tsx`
- [ ] T13 — @João — FR-009 — Implementar `useChecklistDetailViewModel` + view — teste: T12

### Estados — @Caio

- [ ] T14 — @Caio — FR-010 — Teste: loading/error/empty em overview, list, detail — testes: T5, T8, T12

---

## Notas

- Shell: spec **`001-checklist-management`** — aguardar T8 Caio (001) antes de plugar views.
- T4 (Guilherme) bloqueia T5–T13.
- Drill-down KPI → lista: coordenar João (T6) + Caio (T11).
