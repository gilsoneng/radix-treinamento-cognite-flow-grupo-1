# Feature Spec — Alerts & Notifications

> **ID:** 004-alerts-notifications  
> **Rigor:** completo  
> **Owner:** Caio (epic) · time-grupo-1  
> **Criado em:** 2026-06-02  
> **Application Requirements:** AR-301 … AR-310  
> **Protótipo Lovable:** [`docs/prototype/LOVABLE-PROTOTYPE.md`](../../docs/prototype/LOVABLE-PROTOTYPE.md) — rota `/alerts`  
> **Depende de:** `002-checklist-kpis` (eventos de status/resultado)

---

## User Stories

- US-001: Como **administrador (P-04)**, quero criar regra de alerta para Not OK, para notificar automaticamente a equipe correta.
- US-002: Como **administrador**, quero alerta quando checklist é concluído, para informar supervisor de turno.
- US-003: Como **administrador**, quero definir destinatários, escopo (checklist/área) e canal, para controlar ruído de notificações.
- US-004: Como **supervisor**, quero ver quando uma regra disparou pela última vez, para validar que alertas estão ativos.
- US-005: Como **administrador**, quero ativar/desativar regra sem excluí-la, para pausar alertas temporariamente.

---

## Acceptance Scenarios

- **US-001:** Dado regra ativa com trigger "Task = Not OK" e scope "Pump Vibration Check", quando task Not OK é registrada nesse checklist, então notificação é enfileirada para destinatários configurados.
- **US-002:** Dado regra com trigger "Checklist completed", quando checklist muda para done, então notificação é disparada.
- **US-003:** Dado wizard de nova regra, quando completo 4 passos (trigger, scope, recipients, channel), então regra aparece na tabela com status active.
- **US-004:** Dado regra que disparou há 12 min, quando abro Alerts, então coluna Last triggered exibe timestamp relativo.
- **US-005:** Dado regra active, quando clico desativar, então status muda para inactive e novos eventos não disparam.

---

## Functional Requirements

- FR-001: O sistema DEVE persistir **alert rules** com: id, name, trigger, scope, recipients, channel, status, lastTriggered.
- FR-002: O sistema DEVE suportar triggers: **checklist Not OK**, **task Not OK**, **checklist completed**, **checklist overdue**, **Not OK repeats ≥ N in period**.
- FR-003: O sistema DEVE exibir tabela de regras com colunas: name, trigger, scope, recipients, channel, status, last triggered, actions.
- FR-004: O sistema DEVE fornecer fluxo **New rule** multi-step (trigger → scope → recipients → channel → review).
- FR-005: O sistema DEVE permitir **editar**, **ativar/desativar** e **excluir** regras existentes.
- FR-006: O sistema DEVE avaliar regras automaticamente quando eventos de checklist/task ocorrem (not OK, completed, overdue).
- FR-007: O sistema DEVE respeitar **scope** da regra (template de checklist, área, all).
- FR-008: O sistema DEVE atualizar `lastTriggered` ao disparar regra.
- FR-009: O sistema DEVE enviar notificação via adaptador de canal (Email, Teams, SMS — stub ou integração real).
- FR-010: O sistema DEVE exibir loading, erro e vazio na gestão de regras.

---

## Success Criteria

- SC-001: Regra Not OK dispara em < 5 min após evento (ambiente integrado).
- SC-002: Regra inactive não gera notificação em 100% dos eventos de teste.
- SC-003: Scope restrito ignora eventos fora do checklist/área configurado.
- SC-004: FR-001–FR-010 com testes `passing`.

---

## Clarifications

- [ ] Backend de entrega (SendGrid, Teams webhook, etc.) — definir em `research.md`
- [x] v1 pode usar stub de dispatcher que loga payload — integração real em issue separada. — 2026-06-02
- [ ] Permissões: quem pode CRUD regras — alinhar com roles Fusion/IP

---

## Assumptions

- [Eventos originam de ChecklistService / webhook InField futuro]
- [Critical alerts na overview (002) consome mesmo feed ou subset de 004]

---

## Data Models & CDF Integration

### Existing views

Nenhuma — regras são config do app.

### New views

- `AlertRule` — propriedades FR-001; relacionamento opcional com checklist template / area
- `AlertEvent` (log) — id, ruleId, triggeredAt, payload — opcional v1

### Spaces

- Space de configuração do app IP (a definir)

---

## Relates to

Relates to SPEC.md: pilares 3.3 Alerts & Notifications (AR-301–AR-310).
