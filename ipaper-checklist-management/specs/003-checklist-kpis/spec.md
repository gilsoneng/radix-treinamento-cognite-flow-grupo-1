# Feature Spec — Checklist KPIs

> **ID:** 003-checklist-kpis
> **Rigor:** completo
> **Owner:** time-grupo-1
> **Criado em:** 2026-06-02

---

## User Stories

- US-001: Como inspetor, quero ver KPIs de progresso dos meus checklists (total, concluídos, pendentes, em atraso), para que eu avalie a situação das inspeções sem abrir cada item.
- US-002: Como supervisor, quero ver a taxa de conclusão dos checklists por rota/template, para que eu identifique gargalos e priorize ações.
- US-003: Como inspetor, quero que os KPIs sejam atualizados em tempo real ao navegar entre checklists, para que os números reflitam o estado atual.

---

## Acceptance Scenarios

- **US-001:** Dado que existem checklists no CDF, quando a tela de KPIs carrega, então exibe cards com Total, Concluídos, Pendentes e Em Atraso.
- **US-002:** Dado que existem múltiplos templates/rotas, quando seleciono um filtro, então os KPIs refletem apenas os checklists daquele template/rota.
- **US-003:** Dado que a tela de KPIs está aberta, quando um checklist muda de status no CDF, então os cards são atualizados na próxima consulta (react-query refetch).

---

## Functional Requirements

- FR-001: O sistema DEVE buscar instâncias de `cdf_apm.Checklist:v7` e calcular contagens por status.
- FR-002: O sistema DEVE exibir 5 KPI cards: To Do, Ongoing, Done, Overdue, Not OK (alinhado ao protótipo e FR-P01).
- FR-003: O sistema DEVE permitir filtrar KPIs por `templateId` (relacionamento `Checklist → Template`).
- FR-004: O sistema DEVE usar react-query com staleTime adequado para não exceder limites de API CDF.
- FR-005: O sistema DEVE exibir estado de loading enquanto busca dados e estado de erro em caso de falha.

---

## Success Criteria

- SC-001: KPI cards carregam em ≤ 3 s para até 200 checklists.
- SC-002: Filtro por template reduz corretamente os KPIs exibidos.
- SC-003: Estado de loading e erro visíveis conforme AGENTS.md §5.

---

## Clarifications

- [ ] Quais valores de `Checklist.status` existem no ambiente? Verificar via MCP ou `docs/datamodel.md`.
- [ ] O filtro por rota deve usar `Schedule` ou `Template`? A esclarecer antes do Plan.

---

## Assumptions

- [Dados lidos somente do CDF; sem writes nesta feature]
- [Escopo: todos os checklists visíveis ao usuário autenticado — não filtrado por assignee nesta fase]

---

## Data Models & CDF Integration

### Existing views

- `cdf_apm.Checklist:v7` — status, title, assignedTo, dueDate
- `cdf_apm.Template:v8` — externalId, title (para agrupamento/filtro)
- `cdf_apm.ChecklistItem:v7` — para contagem de itens por checklist (opcional nesta fase)

### New views

Nenhuma — feature apenas lê views existentes.

### Spaces

- `cdf_apm` — space do data model `ApmAppData v13`

---

## Relates to

Relates to SPEC.md: seção "Data Models & CDF Integration" — views `Checklist v7`, `Template v8`.
