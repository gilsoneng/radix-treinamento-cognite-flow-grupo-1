# Plan — Alerts & Notifications

> **ID:** 004-alerts-notifications  
> **Protótipo:** `prototype/fieldops-insights/src/routes/alerts.tsx`

---

## Visão técnica

```
ChecklistService / event bus (002)
        │
        ▼
  evaluateRules(AlertEvent)
        │
        ├── AlertRuleService.listActive()
        └── NotificationDispatcher.dispatch(rule, payload)
                  ├── EmailAdapter (stub)
                  ├── TeamsAdapter (stub)
                  └── SmsAdapter (stub)

AlertsView ← useAlertsViewModel ← AlertRuleService (CRUD)
AlertRuleWizard (multi-step)
```

---

## Mapeamento FR → módulo

| FR | Módulo `src/` | Padrão |
| --- | --- | --- |
| FR-001, FR-002 | `services/alerts/AlertRule.ts`, `AlertRuleService.ts` | §4 + Zod |
| FR-006…FR-008 | `services/alerts/evaluateRules.ts`, `alertPipeline.ts` | §4 |
| FR-009 | `services/alerts/NotificationDispatcher.ts`, `adapters/*` | §3 DI |
| FR-003 | `views/alerts/AlertsView.tsx` | §5 |
| FR-004, FR-005 | `views/alerts/AlertRuleWizard.tsx` | §5 + Aura forms |
| FR-010 | estados CRUD/list | skill `design` |

---

## Estado e host-sync

| Estado | Tipo | Justificativa |
| --- | --- | --- |
| `page = alerts` | host-synced | 001 |
| wizard step / draft form | local-only | FR-004 — mid-flight |
| modal open | local-only | transient |

---

## Interfaces

```typescript
export interface AlertRuleService {
  list(): Promise<AlertRule[]>;
  create(rule: AlertRuleInput): Promise<AlertRule>;
  update(id: string, patch: Partial<AlertRuleInput>): Promise<AlertRule>;
  delete(id: string): Promise<void>;
  setActive(id: string, active: boolean): Promise<AlertRule>;
}

export interface NotificationAdapter {
  send(payload: NotificationPayload): Promise<void>;
}
```

Persistência v1: in-memory ou localStorage mock; CDF custom view v2.

---

## Trade-offs

- **Dispatcher stub v1:** log + toast dev — AR-301 atendido em lógica, integração real em issue futura.
- **Event source:** polling checklist changes v1; webhook InField v2.
- **Wizard 4 steps:** alinhado protótipo TRIGGERS constant.

---

## Riscos

- Permissões CRUD indefinidas — assumir usuário autenticado Fusion v1.
- Race condition lastTriggered — serializar updates por ruleId.
