# Research — Checklist KPIs

> **ID:** 002-checklist-kpis
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

## Clarificações em aberto

- [ ] Quais valores de `Checklist.status` existem no ambiente `cdf_apm`? (verificar via MCP `cdf_list_instances` ou com o time de dados)
- [ ] O filtro por rota deve usar `Schedule.externalId` ou `Template.externalId`?
