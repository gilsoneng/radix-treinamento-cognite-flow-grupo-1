# Tasks — Checklist KPIs

> **ID:** 002-checklist-kpis
> Ordem: **Test-First** — testes de integração → testes unitários → código fonte. (AGENTS.md §6)
> Formato: `- [ ] Tn — FR-### — descrição — teste: caminho/do/teste.test.tsx`

---

## Tarefas

- [ ] T1 — FR-001 — Criar teste unitário do mapper `ChecklistMapper.toDomain` com fixture DMS — teste: `src/modules/checklists/infrastructure/mappers/checklist.mapper.test.ts`
- [ ] T2 — FR-001 — Implementar `ChecklistDto`, `ChecklistMapper` e `CdfChecklistRepository` para passar T1
- [ ] T3 — FR-002 — Criar teste de integração do `useKpiDashboardViewModel` com repositório mockado — teste: `src/modules/checklists/presentation/kpi-dashboard/useKpiDashboardViewModel.test.ts`
- [ ] T4 — FR-002 — Implementar `useKpiDashboardViewModel` calculando total/concluídos/pendentes/em atraso
- [ ] T5 — FR-002 — Criar teste de componente `KpiDashboard` (4 cards renderizados) — teste: `src/modules/checklists/presentation/kpi-dashboard/KpiDashboard.test.tsx`
- [ ] T6 — FR-002 — Implementar `KpiDashboard` com 4 KPI cards usando `@cognite/aura/components`
- [ ] T7 — FR-003 — Criar teste de filtro por template no ViewModel — teste: `useKpiDashboardViewModel.test.ts`
- [ ] T8 — FR-003 — Implementar filtro por `templateId` no ViewModel + estado host-synced
- [ ] T9 — FR-005 — Criar teste de estado de loading e erro no `KpiDashboard` — teste: `KpiDashboard.test.tsx`
- [ ] T10 — FR-005 — Implementar loading/error states com componentes de `design-system/layout/states/`

---

## Notas

- T1 deve ser criado antes de T2 (test-first).
- T3 depende de T2 (precisa do repositório implementado para criar o mock tipado).
- T7 e T9 podem ser adicionados ao arquivo de teste existente de T3/T5 respectivamente.
- Esclarecer valores de `Checklist.status` antes de T1 (ver clarificações em `spec.md`).
