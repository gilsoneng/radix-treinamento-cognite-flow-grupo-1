# Feature Spec — Task Result Dashboards & Time-Series KPIs

> **ID:** 004-task-result-dashboards
> **Rigor:** completo
> **Owner:** time-grupo-1
> **Criado em:** 2026-06-02
> **Atualizado em:** 2026-06-03

---

## User Stories

- US-001: Como supervisor, quero gráficos de resultados (OK / Not OK / observação) alinhados ao protótipo Lovable, para comparar qualidade por checklist, área e tarefa recorrente.
- US-002: Como engenheiro de processo, quero séries temporais de KPIs com período selecionável (7d / 30d / 90d / all), para acompanhar tendências de task results.
- US-003: Como supervisor, quero tabelas modernas com busca, ordenação, filtros e paginação client-side, para explorar amostras de task results sem sobrecarregar o CDF.

---

## Acceptance Scenarios

- **US-001:** Dado task results no CDF, quando abro Analytics → Results, então vejo KPIs resumidos e até quatro gráficos de barras (Not OK por checklist, por área/rota, tendência diária, % Not OK).
- **US-002:** Dado `MeasurementTrend` / `RouteKpiSnapshot` no DM `ip_checklist_dm`, quando abro Analytics → Trends, então vejo gráficos de linha/área com seletor de período.
- **US-003:** Dado uma amostra paginada de task results, quando uso busca ou ordenação na tabela, então a UI filtra/ordena localmente sem novas chamadas CDF até mudar de página CDF.

---

## Functional Requirements

- FR-001: O sistema DEVE buscar amostra de `ChecklistItem` com resultados via `fetchTaskResultsSample` (limite de páginas documentado).
- FR-002: O sistema DEVE agregar a amostra em `buildTaskResultAnalytics` (trend, top Not OK, recurring Not OK).
- FR-003: O sistema DEVE renderizar gráficos Recharts na aba **Results** (`TaskResultsCharts`).
- FR-004: O sistema DEVE buscar `MeasurementTrend` e `RouteKpiSnapshot` do DM IP para a aba **Trends** (`TimeSeriesCharts`).
- FR-005: O sistema DEVE permitir filtro de período (`7d` | `30d` | `90d` | `all`) em analytics e trends.
- FR-006: O sistema DEVE usar `IpDataTable` (Aura Table) com sort, search, page size e estados loading/erro/vazio.
- FR-007: O sistema DEVE exibir aviso quando os gráficos usam amostra limitada (não dataset completo do tenant).

---

## Success Criteria

- SC-001: Analytics carrega em ≤ 6 s com amostra padrão (5 páginas CDF).
- SC-002: Gráficos refletem a mesma amostra exibida nas tabelas da mesma aba.
- SC-003: Paginação CDF + client-side não dispara 429 (respeita `dm-limits-and-best-practices`).

---

## Implementation map

| Artefato | Caminho |
| --- | --- |
| Regras de agregação | `src/modules/checklists/domain/task-result-analytics.rules.ts` |
| Página Analytics | `src/modules/checklists/presentation/pages/analytics/analytics.page.tsx` |
| Gráficos Results | `src/modules/checklists/presentation/components/analytics-charts/task-results-charts.tsx` |
| Gráficos Trends | `src/modules/checklists/presentation/components/analytics-charts/time-series-charts.tsx` |
| Tabela Aura | `src/design-system/components/ip-data-table/ip-data-table.tsx` |
| Queries | `useTaskResultAnalyticsQuery`, `useMeasurementTrendsQuery`, `useRouteKpiSnapshotsQuery` |

---

## Relates to

Relates to SPEC.md FR-P03, FR-P04 e protótipo `prototype/fieldops-insights/src/routes/task-results.tsx`, `kpis.tsx`.
