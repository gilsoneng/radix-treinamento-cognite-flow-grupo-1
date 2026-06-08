# Feature Spec — Alerts & Notifications

> **ID:** 005-alerts-notifications
> **Rigor:** completo
> **Owner:** time-grupo-1
> **Criado em:** 2026-06-02
> **Atualizado em:** 2026-06-03

---

## User Stories

- US-001: Como supervisor, quero configurar regras automáticas (Not OK, completed, overdue, due-soon, critical observation) com formato (banner / badge / toast), para controlar como sou notificado.
- US-002: Como inspetor, quero ver banners no topo do app quando regras ativas disparam, para não perder alertas ao navegar.
- US-003: Como supervisor, quero um painel de alertas com tabela pesquisável e ordenável, para priorizar ações corretivas.

---

## Acceptance Scenarios

- **US-001:** Dado Settings → Notification rules, quando desativo uma regra e salvo, então a preferência persiste em `localStorage` (`ip-notification-settings-v1`).
- **US-002:** Dado alerta operacional `not-ok` com regra `checklist-not-ok` habilitada e formato `banner`, quando carrego qualquer página, então `NotificationRuntime` exibe Banner Aura no shell.
- **US-003:** Dado múltiplos alertas, quando abro Alerts, então `IpDataTable` lista com busca, sort por tipo/prioridade e paginação client-side.

---

## Functional Requirements

- FR-001: O sistema DEVE calcular alertas de prazo (`overdue`, `due-soon`) a partir de `Checklist.endTime` e status.
- FR-002: O sistema DEVE incluir alertas `not-ok` e `completed` derivados de `hasNotOk` e `status === completed`.
- FR-003: O sistema DEVE buscar observações críticas no CDF para alertas `critical-observation`.
- FR-004: O sistema DEVE exibir contador de alertas no sidebar (`app-sidebar.tsx`).
- FR-005: O sistema DEVE usar `pollingIntervalMs` das notification settings no `refetchInterval` de `useOperationalAlertsQuery`.
- FR-006: O sistema DEVE permitir configurar triggers e formatos em `NotificationSettingsPanel` (Settings).
- FR-007: O sistema DEVE mapear alertas → regras em `NotificationRuntime` (banner para regras com `format: banner`).
- FR-008: O sistema DEVE usar `IpDataTable` na página Alerts com estados loading/erro/vazio.

---

## Success Criteria

- SC-001: Regras Not OK e completed aparecem no painel quando dados CDF correspondem.
- SC-002: Settings persiste após reload da aba.
- SC-003: Polling respeita intervalo salvo (default 120 s).

---

## Implementation map

| Artefato | Caminho |
| --- | --- |
| Modelo / defaults | `src/modules/checklists/domain/notification-settings.model.ts` |
| Persistência | `src/modules/checklists/infrastructure/notification-settings.storage.ts` |
| UI config | `src/modules/checklists/presentation/components/notification-settings-panel/` |
| Runtime | `src/modules/checklists/presentation/components/notification-runtime/` |
| Regras | `src/modules/checklists/domain/alert.rules.ts` |
| Página Alerts | `src/modules/checklists/presentation/pages/alerts/alerts.page.tsx` |

---

## Assumptions

- Notificações push (web push) e e-mail ficam fora de escopo; apenas UI in-app.
- Toast format reservado para evolução (runtime hoje prioriza banner).
- Alertas calculados no cliente; sem serviço de notificações dedicado no CDF.

---

## Relates to

Relates to SPEC.md FR-P05 e protótipo `prototype/fieldops-insights/`.
