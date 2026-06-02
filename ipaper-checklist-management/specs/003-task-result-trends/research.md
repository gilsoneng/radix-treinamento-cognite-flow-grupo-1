# Research — Task Result Trends & Analytics

> **ID:** 003-task-result-trends

---

## ADR-001 — Biblioteca de gráficos

**Contexto:** Protótipo Lovable usa Recharts; Flows exige Aura + flows-design-review.

**Decisão:** Priorizar componentes Aura para KPI cards e tabelas; para barras/linhas empilhadas, avaliar Storybook Aura chart APIs na etapa Plan. Se gap, propor wrapper documentado em PR — **não** copiar Recharts do protótipo sem aprovação.

**Consequência:** T7–T10 podem usar chart placeholder até componente Aura confirmado; FRs de dados implementam-se independente do chart.

---

## ADR-002 — Agregação temporal client-side v1

**Contexto:** API InField pode não expor séries pré-agregadas.

**Decisão:** `buildTimeSeries` agrega em memória a partir de lista de task results filtrada por `DateRange`.

**Consequência:** Simples para treinamento; revisitar se latência > 2s (SC-002).

---

## ADR-003 — Recurring Not OK threshold

**Contexto:** Protótipo usa ≥3 repetições / 24h.

**Decisão:** Default `threshold = 3`, `windowHours = 24`, configurável via constante até UI de admin existir.

**Consequência:** Alinhado a AR-305 e regra mock `R-102`.

---

## Clarificações resolvidas

- [x] Custom range — date range picker quando Aura disponível; senão stub. — 2026-06-02
- [x] Task results vêm de 002 — reutilizar tipos, não novo fetch paralelo. — 2026-06-02

## Clarificações em aberto

- [ ] Granularidade "Today" (hora vs shift)
- [ ] Componente Aura exato para stacked bar chart
