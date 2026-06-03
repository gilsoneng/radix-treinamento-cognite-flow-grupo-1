# Research — Checklist KPIs

> **ID:** 003-checklist-kpis
> Registra: decisões arquiteturais (ADRs) e clarificações resolvidas.
> Formato ADR: Contexto → Decisão → Consequência.

---

## ADR-001 — Cálculo de KPIs no cliente vs agregação no CDF

**Contexto:** A view `Checklist v7` não expõe um endpoint de agregação direto. Para exibir KPIs (total, concluídos, pendentes, em atraso) precisamos ou buscar todos os registros e calcular no cliente, ou usar `instances.aggregate` se disponível.

**Decisão:** Buscar checklists paginados (loop com `cursor`, limite ≤ 100 por chamada conforme skill `dm-limits-and-best-practices`) e calcular KPIs no mapper/ViewModel. Revisitar para Alternativa B (`instances.aggregate`) se o volume ultrapassar 500 registros.

**Consequência:** Implementação mais simples e testável; pode ser lenta para volumes grandes. Limite de chamadas controlado pela política de retry de `core/query`.

---

## Clarificações resolvidas

<!-- Preencher ao resolver as perguntas abertas de spec.md -->

## Clarificações resolvidas

- [x] `Checklist.status` no seed: `created` \| `started` \| `completed` — 2026-06-03
- [x] Not OK derivado de `ChecklistItem.note` (itens NotOk no seed) — 2026-06-03
- [ ] Filtro por rota: `Template.externalId` via `Checklist.sourceId` quando UI de filtro for adicionada
