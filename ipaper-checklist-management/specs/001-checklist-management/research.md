# Research — App Foundation & Fusion Shell

> **ID:** 001-checklist-management

---

## ADR-001 — Adoção SDD no projeto

**Contexto:** Padrões em `AGENTS.md`, specs por feature em `specs/`.

**Decisão:** SDD com `specs/<NNN>-<slug>/`, gate warn, feature `001` como **foundation** (não apenas scaffold dev).

**Consequência:** 001 bloqueia 002–004; shell e host-sync implementados uma vez.

---

## ADR-002 — `specs/` (plural)

**Decisão:** Compatível com Cognite Flows / Spec Kit / `flows-app-brief`.

---

## ADR-003 — Gate CI warn vs strict

**Decisão:** Warn padrão; strict via label `sdd-strict`.

---

## ADR-004 — Flags `.mjs` para strict (sem cross-env)

**Decisão:** `node scripts/spec-check.mjs --strict`.

---

## ADR-005 — 001 como foundation, não welcome permanente

**Contexto:** Scaffold Flows (Plan/Explore/Deploy) útil para onboarding dev, mas não atende use case IP InField.

**Decisão:** Reframing 001 para **App Foundation & Fusion Shell**. Welcome removido quando FR-005 done (FR-013). Protótipo Lovable define shell de produção.

**Consequência:** Testes do splash atualizados/removidos em T11. Sidebar + host-sync são DoR para 002.

---

## ADR-006 — Navegação host-synced (enum `page`)

**Contexto:** AGENTS.md §2 exige sync para view/filtros. Protótipo usa TanStack Router; Flows app usa host URL state.

**Decisão:** v1 com `AppState.page` enum serializado em `syncInternalState`. Filtros de 002 adicionam campos ao mesmo JSON.

**Consequência:** Sem react-router no app Flows v1; deep link checklist via `checklistId` no state.

---

## Clarificações resolvidas

- [x] 001 bloqueia 002–004 — sim, shell primeiro. — 2026-06-02
- [x] Protótipo é referência UX, Aura é implementação — `docs/prototype/LOVABLE-PROTOTYPE.md`. — 2026-06-02
- [x] Auth via CogniteSdkProvider only — AGENTS.md §8. — 2026-06-02
