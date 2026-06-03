# Research — Checklist KPIs & Overview

> **ID:** 002-checklist-kpis

---

## ADR-001 — Classificação de status `notok`

**Contexto:** AR-102 exige Not OK quando ≥1 task Not OK; InField pode expor status derivado ou raw task list.

**Decisão:** Calcular `notok` no app via `aggregateChecklistStatus` quando API não enviar status agregado. Precedência: overdue > notok > ongoing > todo > done (documentar ordem em testes).

**Consequência:** Lógica testável em unit test; consistente com protótipo mock.

---

## ADR-002 — Filtros host-synced em storage dedicado

**Contexto:** AGENTS.md §2 — filtros devem sobreviver reload.

**Decisão:** `ChecklistListStorage` no mesmo JSON de `AppState` sob chave `checklistFilters`, gerenciado pelo ViewModel da lista.

**Consequência:** Overview drill-down escreve em storage compartilhado antes de navegar para `checklists`.

---

## ADR-003 — Dados mock alinhados ao protótipo

**Contexto:** CDF views pendentes.

**Decisão:** v1 usa factories espelhando `prototype/fieldops-insights/src/lib/mock-data.ts` (AREAS, TEAMS, 48 checklists).

**Consequência:** UX validável antes de integração Cognite; trocar impl sem mudar ViewModels.

---

## Clarificações resolvidas

- [x] Layout overview/lista — protótipo Lovable, implementação Aura. — 2026-06-02
- [x] Shell/navegação — spec 001, não duplicar aqui. — 2026-06-02

## Clarificações em aberto

- [ ] CDF view exata para checklist instance (`<space>.<view>:<version>`)
- [ ] Regra InField para `overdue` (due date field name)
- [ ] Critical alerts na overview — placeholder até 004 ou feed compartilhado
