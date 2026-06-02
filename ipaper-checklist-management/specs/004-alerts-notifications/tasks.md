# Tasks — Alerts & Notifications

> **ID:** 004-alerts-notifications  
> **Epic owner:** Caio  
> **Issues GitHub:** [`docs/requirements/TASKS-DIVISION.md`](../../docs/requirements/TASKS-DIVISION.md#epic-004--alerts--notifications)  
> **Protótipo:** `prototype/fieldops-insights/src/routes/alerts.tsx`, `mock-data.ts` → `ALERT_RULES`

---

## Distribuição do time

| Dev | Tarefas | Foco |
| --- | --- | --- |
| **Guilherme** | T3–T4, T11 | Engine evaluateRules, pipeline integração |
| **João** | T1–T2, T5–T6 | Modelo AlertRule, CRUD service, tabela UI |
| **Caio** | T7–T10 | Wizard multi-step, dispatcher, adaptadores |

---

## Tarefas

### Modelo e serviço — @João + @Guilherme

- [ ] T1 — @João — FR-001, FR-002 — Teste unitário: validação de `AlertRule` (Zod) — teste: `src/services/alerts/AlertRule.test.ts`
- [ ] T2 — @João — FR-001 — Implementar tipos + `AlertRuleService` CRUD — teste: `src/services/alerts/AlertRuleService.test.ts`
- [ ] T3 — @Guilherme — FR-006, FR-007, FR-008 — Teste unitário: `evaluateRules(event)` retorna matches corretos — teste: `src/services/alerts/evaluateRules.test.ts`
- [ ] T4 — @Guilherme — FR-006, FR-007, FR-008 — Implementar engine de avaliação + update lastTriggered — teste: T3

### UI gestão de regras — @João + @Caio

- [ ] T5 — @João — FR-003, FR-010 — Teste integração: tabela lista regras do service — teste: `src/views/alerts/AlertsView.test.tsx`
- [ ] T6 — @João — FR-003 — Implementar `useAlertsViewModel` + tabela Aura — teste: T5
- [ ] T7 — @Caio — FR-004, FR-005 — Teste integração: wizard cria regra; toggle active/inactive — teste: `src/views/alerts/AlertRuleWizard.test.tsx`
- [ ] T8 — @Caio — FR-004, FR-005 — Implementar wizard multi-step + edit/delete — teste: T7

### Dispatcher — @Caio + @Guilherme

- [ ] T9 — @Caio — FR-009 — Teste unitário: `NotificationDispatcher` chama adaptador correto por channel — teste: `src/services/alerts/NotificationDispatcher.test.ts`
- [ ] T10 — @Caio — FR-009 — Implementar dispatcher + adaptadores stub (email/teams/sms) — teste: T9
- [ ] T11 — @Guilherme — FR-006 — Teste integração: evento Not OK → evaluate → dispatch — teste: `src/services/alerts/alertPipeline.integration.test.ts`

---

## Notas

- Wire eventos com hooks/commands de 002 (Guilherme ChecklistService).
- João entrega T2 antes de T5; Caio wizard (T7–T8) após tabela (T6).
