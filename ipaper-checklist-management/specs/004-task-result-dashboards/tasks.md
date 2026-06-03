# Tasks — Task Result Dashboards

> **ID:** 003-task-result-dashboards
> Ordem: **Test-First** — testes de integração → testes unitários → código fonte. (AGENTS.md §6)
> Formato: `- [ ] Tn — FR-### — descrição — teste: caminho/do/teste.test.tsx`

---

## Tarefas

- [ ] T1 — FR-001 — Criar teste unitário do mapper `ChecklistItemMapper.toDomain` com fixture DMS — teste: `src/modules/checklists/infrastructure/mappers/checklist-item.mapper.test.ts`
- [ ] T2 — FR-001 — Implementar `ChecklistItemDto`, `ChecklistItemMapper` e query `listByTemplate` para passar T1
- [ ] T3 — FR-002 — Criar teste de integração do `useTaskDashboardViewModel` com repositório mockado (agrupamento por status) — teste: `src/modules/checklists/presentation/task-dashboard/useTaskDashboardViewModel.test.ts`
- [ ] T4 — FR-002 — Implementar `useTaskDashboardViewModel` com agrupamento OK/NOK/Observação
- [ ] T5 — FR-002 — Criar teste de componente `TaskDashboard` (tabela renderizada) — teste: `src/modules/checklists/presentation/task-dashboard/TaskDashboard.test.tsx`
- [ ] T6 — FR-002 — Implementar `TaskDashboard` com tabela de resultados usando `@cognite/aura/components`
- [ ] T7 — FR-003 — Criar teste de filtro por template no ViewModel — teste: `useTaskDashboardViewModel.test.ts`
- [ ] T8 — FR-003 — Implementar filtro por `templateId` no ViewModel
- [ ] T9 — FR-004 — Criar teste de filtro por período no ViewModel — teste: `useTaskDashboardViewModel.test.ts`
- [ ] T10 — FR-004 — Implementar filtro de data com estado host-synced
- [ ] T11 — FR-006 — Criar teste da queryFn paginada com cursor — teste: `checklist-item.queries.test.ts`
- [ ] T12 — FR-006 — Implementar loop de paginação com `cursor` no repositório

---

## Notas

- T1 depende da clarificação dos campos de `ChecklistItem v7` (ver `research.md`).
- T3 depende de T2 (precisa do mapper/repositório tipado para o mock).
- T7, T9 e T11 podem ser adicionados aos arquivos de teste já criados em T3/T5.
- Esta feature reutiliza a infra de 002 — verificar se `CdfChecklistRepository` já existe antes de criar nova implementação.
