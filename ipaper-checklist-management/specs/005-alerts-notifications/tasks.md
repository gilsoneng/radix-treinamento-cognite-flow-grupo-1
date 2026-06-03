# Tasks — Alerts & Notifications

> **ID:** 004-alerts-notifications
> Ordem: **Test-First** — testes de integração → testes unitários → código fonte. (AGENTS.md §6)
> Formato: `- [ ] Tn — FR-### — descrição — teste: caminho/do/teste.test.tsx`

---

## Tarefas

- [ ] T1 — FR-001 — Criar teste unitário das regras de alerta (`isOverdue`, `isDueSoon`) com datas mockadas — teste: `src/modules/checklists/domain/rules/alert.rules.test.ts`
- [ ] T2 — FR-001 — Implementar `alert.rules.ts` com funções puras de cálculo de prazo para passar T1
- [ ] T3 — FR-002 — Criar teste unitário do mapper `ObservationMapper.toDomain` com fixture DMS — teste: `src/modules/checklists/infrastructure/mappers/observation.mapper.test.ts`
- [ ] T4 — FR-002 — Implementar `ObservationDto`, `ObservationMapper` e `listCriticalObservations` para passar T3
- [ ] T5 — FR-003 — Criar teste de integração do `useAlertsPanelViewModel` com repositório mockado — teste: `src/modules/checklists/presentation/alerts-panel/useAlertsPanelViewModel.test.ts`
- [ ] T6 — FR-003 — Implementar `useAlertsPanelViewModel` combinando alertas de prazo + observações críticas
- [ ] T7 — FR-003 — Criar teste de componente `AlertsPanel` (lista ordenada por severidade) — teste: `src/modules/checklists/presentation/alerts-panel/AlertsPanel.test.tsx`
- [ ] T8 — FR-003 — Implementar `AlertsPanel` com lista priorizada usando `@cognite/aura/components`
- [ ] T9 — FR-004 — Criar teste do Context de alertas (badge counter atualiza) — teste: `src/modules/checklists/presentation/alerts-panel/alerts.context.test.tsx`
- [ ] T10 — FR-004 — Implementar `AlertsContext` e integrar badge no shell da aplicação
- [ ] T11 — FR-005 — Criar teste do polling (`refetchInterval` configurado) — teste: `src/modules/checklists/infrastructure/queries/observation.queries.test.ts`
- [ ] T12 — FR-005 — Implementar `refetchInterval` configurável na query de observações

---

## Notas

- T1 e T2 são puramente de domínio (TS puro, sem React, sem SDK) — devem ser rápidos de implementar.
- T3 depende da clarificação dos campos de `Observation v5` (ver `research.md`).
- T9 e T10 exigem coordenação com o shell — revisar `design-system/layout/` antes de implementar.
- Garantir que o polling (T11/T12) respeite o `retry-policy.ts` de `core/query` para não causar 429.
