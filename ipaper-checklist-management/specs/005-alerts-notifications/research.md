# Research — Alerts & Notifications

> **ID:** 004-alerts-notifications
> Registra: decisões arquiteturais (ADRs) e clarificações resolvidas.
> Formato ADR: Contexto → Decisão → Consequência.

---

## ADR-001 — Cálculo de alertas no cliente vs serviço dedicado

**Contexto:** Alertas precisam combinar dados de `Checklist.dueDate` (prazo) e `Observation.severity` (criticidade). O CDF não tem um serviço nativo de alertas/notificações push para apps web.

**Decisão:** Calcular alertas inteiramente no cliente: buscar `Checklist` e `Observation` via react-query com `refetchInterval` de 60 s (mínimo seguro para não causar 429). Regras de cálculo (`isOverdue`, `isDueSoon`) ficam em `domain/rules/alert.rules.ts` como funções puras testáveis.

**Consequência:** Sem dependência de serviço externo; alertas têm latência de até 60 s. Para tempo real seria necessário WebSocket/SSE — fora do escopo desta fase.

---

## ADR-002 — Context global de alertas para o badge do shell

**Contexto:** O badge de contador de alertas precisa estar visível no shell (fora do módulo `checklists`). Isso cria uma necessidade de comunicação cross-feature.

**Decisão:** Criar `AlertsContext` no nível de composição da aplicação (`app/providers/`), alimentado pelo ViewModel de alertas via Provider. O shell consome o Context sem conhecer o módulo `checklists`. Módulo não é importado diretamente pelo shell.

**Consequência:** Fronteira de módulo preservada; o Context é o contrato público. Se a feature de alertas crescer, o Context pode ser promovido para um módulo próprio.

---

## Clarificações resolvidas

<!-- Preencher ao resolver as perguntas abertas de spec.md -->

## Clarificações em aberto

- [ ] Quais campos de severidade existem em `Observation v5`? (`severity`, `priority`, `type`?) — verificar via MCP `cdf_get_view` para `cdf_apm/Observation/v5`.
- [ ] O polling deve ter intervalo fixo (60 s) ou configurável via `app.json`?
- [ ] `Observation v5` tem relacionamento direto com `Checklist` ou apenas com `ChecklistItem`?
