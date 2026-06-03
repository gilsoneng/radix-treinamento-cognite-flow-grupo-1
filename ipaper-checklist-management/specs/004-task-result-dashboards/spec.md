# Feature Spec — Task Result Dashboards

> **ID:** 003-task-result-dashboards
> **Rigor:** completo
> **Owner:** time-grupo-1
> **Criado em:** 2026-06-02

---

## User Stories

- US-001: Como supervisor, quero visualizar um dashboard com os resultados das tarefas de inspeção (itens OK, NOK, com observação), para que eu avalie a qualidade das execuções por rota.
- US-002: Como inspetor, quero ver o histórico de resultados dos checklist items de uma rota específica, para que eu compare execuções anteriores.
- US-003: Como supervisor, quero filtrar o dashboard por período (data de execução), para que eu analise tendências ao longo do tempo.

---

## Acceptance Scenarios

- **US-001:** Dado que existem ChecklistItems com resultados no CDF, quando acesso o dashboard, então vejo uma tabela/lista com itens agrupados por status (OK, NOK, Com Observação).
- **US-002:** Dado que seleciono uma rota/template, quando o dashboard carrega, então exibe somente os resultados daquela rota.
- **US-003:** Dado que seleciono um intervalo de datas, quando aplico o filtro, então o dashboard exibe apenas resultados com data de execução dentro do período.

---

## Functional Requirements

- FR-001: O sistema DEVE buscar instâncias de `cdf_apm.ChecklistItem:v7` com seus campos de resultado.
- FR-002: O sistema DEVE exibir resultados agrupados por status (ao menos OK / NOK / Com Observação).
- FR-003: O sistema DEVE permitir filtrar por template/rota via `Checklist → Template`.
- FR-004: O sistema DEVE permitir filtrar por período usando o campo de data de execução do ChecklistItem.
- FR-005: O sistema DEVE exibir loading e erro conforme padrão `design-system/layout/states/`.
- FR-006: O sistema DEVE paginar resultados (≤ 100 por chamada) respeitando limites CDF.

---

## Success Criteria

- SC-001: Dashboard carrega em ≤ 4 s para até 500 ChecklistItems.
- SC-002: Filtros de rota e período funcionam de forma combinada.
- SC-003: Paginação não causa 429 no CDF (ver skill `dm-limits-and-best-practices`).

---

## Clarifications

- [ ] Quais campos de resultado existem em `ChecklistItem v7`? (ex.: `status`, `value`, `comment`) — verificar `docs/datamodel.md`.
- [ ] O campo de data de execução é `completedAt` ou `updatedTime`?

---

## Assumptions

- [Somente leitura — sem edição de resultados nesta feature]
- [Visualização em lista/tabela; gráficos de tendência são escopo futuro]

---

## Data Models & CDF Integration

### Existing views

- `cdf_apm.ChecklistItem:v7` — resultado, status, referência ao Checklist
- `cdf_apm.Checklist:v7` — vínculo ao Template, datas
- `cdf_apm.Template:v8` — agrupamento/filtro por rota

### New views

Nenhuma — feature apenas lê views existentes.

### Spaces

- `cdf_apm` — space do data model `ApmAppData v13`

---

## Relates to

Relates to SPEC.md: seção "Data Models & CDF Integration" — views `ChecklistItem v7`, `Checklist v7`, `Template v8`.
