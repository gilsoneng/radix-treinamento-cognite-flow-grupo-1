# Research — Alerts & Notifications

> **ID:** 004-alerts-notifications

---

## ADR-001 — Persistência de regras v1

**Contexto:** CDF custom view ainda não definida.

**Decisão:** `InMemoryAlertRuleService` + optional `LocalStorageAlertRuleService` para dev; interface estável para swap CDF.

**Consequência:** Demo funcional sem backend; migrar dados em v2.

---

## ADR-002 — Notification dispatcher stub

**Contexto:** SendGrid/Teams webhook fora de escopo imediato.

**Decisão:** Adaptadores stub que `console.info` payload estruturado; testes assertam chamada com channel correto.

**Consequência:** FR-009 testável; integração real não bloqueia MVP.

---

## ADR-003 — Triggers alinhados ao briefing IP

**Contexto:** Slide exige Not OK e completed; protótipo adiciona overdue e recorrência.

**Decisão:** Implementar os cinco triggers do protótipo (`alerts.tsx` TRIGGERS) — superset do briefing.

**Consequência:** AR-302, AR-303, AR-304, AR-305 cobertos.

---

## ADR-004 — Integração com overview (002)

**Contexto:** Overview exibe "Critical alerts" no protótipo.

**Decisão:** v1 overview usa subset estático ou últimos N `AlertEvent`; feed unificado quando pipeline (T11) existir.

**Consequência:** Coordenação opcional com João (002 overview) após 004 pipeline.

---

## Clarificações resolvidas

- [x] Stub de entrega v1 — ADR-002. — 2026-06-02
- [x] Eventos originam de mudanças em 002 — hook pós-save task/checklist. — 2026-06-02

## Clarificações em aberto

- [ ] Backend real email/Teams/SMS
- [ ] Roles Fusion para CRUD de regras
- [ ] CDF space/view para AlertRule
