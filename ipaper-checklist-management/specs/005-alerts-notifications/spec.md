# Feature Spec — Alerts & Notifications

> **ID:** 004-alerts-notifications
> **Rigor:** completo
> **Owner:** time-grupo-1
> **Criado em:** 2026-06-02

---

## User Stories

- US-001: Como inspetor, quero receber uma notificação visual quando um checklist estiver próximo do prazo (dueDate ≤ 24 h), para que eu priorize as inspeções urgentes.
- US-002: Como supervisor, quero ver um painel de alertas com checklists vencidos e observações críticas registradas, para que eu tome ações corretivas rapidamente.
- US-003: Como inspetor, quero que alertas sejam exibidos como badges/banners persistentes na interface, para que eu não perca informações críticas ao navegar.

---

## Acceptance Scenarios

- **US-001:** Dado que um Checklist tem `dueDate` dentro de 24 h e status não concluído, quando acesso o app, então um badge de alerta aparece no item correspondente.
- **US-002:** Dado que existem checklists vencidos ou com Observations críticas, quando acesso o painel de alertas, então vejo uma lista priorizada por severidade.
- **US-003:** Dado que há alertas ativos, quando navego entre views do app, então o contador de alertas permanece visível no shell/topbar.

---

## Functional Requirements

- FR-001: O sistema DEVE calcular alertas de prazo a partir de `Checklist.dueDate` comparado ao tempo atual.
- FR-002: O sistema DEVE buscar `cdf_apm.Observation:v5` para identificar observações com severidade crítica.
- FR-003: O sistema DEVE exibir um painel de alertas listando checklists vencidos e observações críticas, ordenados por urgência.
- FR-004: O sistema DEVE exibir o contador de alertas ativos no shell da aplicação (badge persistente).
- FR-005: O sistema DEVE atualizar alertas via react-query refetch periódico (polling) com intervalo configurável.
- FR-006: O sistema DEVE exibir loading e erro conforme padrão `design-system/layout/states/`.

---

## Success Criteria

- SC-001: Alertas de prazo aparecem corretamente para checklists com `dueDate` ≤ 24 h.
- SC-002: Painel de alertas carrega em ≤ 3 s.
- SC-003: Badge de contador visível no shell ao existir ao menos 1 alerta ativo.

---

## Clarifications

- [ ] Quais campos de severidade existem em `Observation v5`? — verificar `docs/datamodel.md`.
- [ ] O polling de alertas deve ser automático ou manual (pull-to-refresh)?
- [ ] Existe um campo `priority` ou `severity` em `Observation v5`?

---

## Assumptions

- [Somente leitura — sem criação de alertas nesta feature]
- [Notificações push (web push API) fora do escopo desta fase]
- [Alertas calculados no cliente a partir dos dados CDF; não há serviço de alertas dedicado]

---

## Data Models & CDF Integration

### Existing views

- `cdf_apm.Checklist:v7` — `dueDate`, `status` (para cálculo de prazo e vencimento)
- `cdf_apm.Observation:v5` — severidade/prioridade, referência ao ChecklistItem

### New views

Nenhuma — feature apenas lê views existentes.

### Spaces

- `cdf_apm` — space do data model `ApmAppData v13`

---

## Relates to

Relates to SPEC.md: seção "Data Models & CDF Integration" — views `Checklist v7`, `Observation v5`.
