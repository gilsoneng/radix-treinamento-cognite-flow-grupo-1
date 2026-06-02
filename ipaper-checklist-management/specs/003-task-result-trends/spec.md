# Feature Spec — Task Result Trends & Analytics

> **ID:** 003-task-result-trends  
> **Rigor:** completo  
> **Owner:** Caio (epic) · time-grupo-1  
> **Criado em:** 2026-06-02  
> **Application Requirements:** AR-201 … AR-205  
> **Protótipo Lovable:** [`docs/prototype/LOVABLE-PROTOTYPE.md`](../../docs/prototype/LOVABLE-PROTOTYPE.md) — rotas `/task-results`, `/kpis`  
> **Depende de:** `002-checklist-kpis` (task results disponíveis)

---

## User Stories

- US-001: Como **engenheiro de processo (P-03)**, quero ver proporção OK vs Not OK em dashboards, para avaliar qualidade das inspeções.
- US-002: Como **engenheiro**, quero quebrar Not OK por checklist, área e asset, para priorizar melhorias.
- US-003: Como **supervisor**, quero gráficos temporais de OK/Not OK e taxa de falha, para detectar degradação ao longo do tempo.
- US-004: Como **técnico**, quero identificar tasks com Not OK recorrente, para abrir ordem de serviço preventiva.
- US-005: Como **analista**, quero selecionar período (7d, 30d, mês), para comparar turnos e campanhas.

---

## Acceptance Scenarios

- **US-001:** Dado task results no período, quando abro Task Results, então vejo KPI cards: total, OK, Not OK, Not OK rate (%).
- **US-002:** Dado Not OK distribuídos, quando visualizo gráficos, então vejo barras por checklist e por área ordenadas por volume.
- **US-003:** Dado série temporal de 14 dias, quando abro Time-Series KPIs com "7 days", então gráficos refletem apenas dados da janela selecionada.
- **US-004:** Dado histórico de falhas, quando consulto "Most frequent Not OK tasks", então lista exibe task, checklist, asset, occurrences.
- **US-005:** Dado período alterado, quando seleciono "30 days", então todos os gráficos da página KPIs recalculam sem reload completo do app.

---

## Functional Requirements

- FR-001: O sistema DEVE agregar contagem de tasks **OK** e **Not OK** para um período configurável.
- FR-002: O sistema DEVE calcular **Not OK rate** como `notOk / (ok + notOk) * 100` arredondado.
- FR-003: O sistema DEVE exibir dashboard **Task Results** com KPI cards e gráfico OK vs Not OK over time.
- FR-004: O sistema DEVE exibir gráficos **Not OK by checklist** e **Not OK by area**.
- FR-005: O sistema DEVE exibir tabela/gráfico de **recurring Not OK tasks** (top N por occurrences).
- FR-006: O sistema DEVE exibir página **Time-Series KPIs** com seletor de período: Today, 7 days, 30 days, Month, Custom.
- FR-007: O sistema DEVE plotar séries temporais: completion volume, Not OK %, overdue count, stacked OK/Not OK.
- FR-008: O sistema DEVE persistir período selecionado via host-synced state quando aplicável.
- FR-009: O sistema DEVE identificar tasks Not OK recorrentes com threshold configurável (default: ≥ 3 em 24h — alinhado protótipo).
- FR-010: O sistema DEVE exibir loading, erro e vazio em ambas as views analíticas.

---

## Success Criteria

- SC-001: Not OK rate exibido bate com agregação manual em amostra de 100 tasks (±1%).
- SC-002: Mudança de período atualiza gráficos em < 2s com dados mock/CDF.
- SC-003: Recurring list inclui task com ≥ threshold occurrences no período.
- SC-004: FR-001–FR-010 com testes `passing`.

---

## Clarifications

- [ ] Biblioteca de charts: Aura nativo vs Recharts — decidir em `plan.md` (protótipo usa Recharts)
- [x] Período Custom abre date range picker — comportamento protótipo `/kpis`. — 2026-06-02
- [ ] Granularidade temporal (hora vs dia) para "Today" — definir com API InField

---

## Assumptions

- [Task results já normalizados pelo ChecklistService de 002]
- [Custom date range v1 pode ser stub até API suportar]

---

## Data Models & CDF Integration

### Existing views

- Task result view (mesma de 002)
- Time aggregation pode ser client-side v1; server-side v2

### New views

Opcional: materialized view para recurring Not OK (performance).

### Spaces

Mesmo space operacional IP/InField de 002.

---

## Relates to

Relates to SPEC.md: pilares 3.2 Task Result Dashboards (AR-201–AR-205).
