# Feature Spec — Operational Dashboard

> **ID:** 007-operational-dashboard
> **Rigor:** completo
> **Owner:** time-grupo-1
> **Criado em:** 2026-06-03

---

## User Stories

- US-001: Como **supervisor de turno**, quero ver os 5 KPIs de checklist com delta vs turno anterior e semáforo, para agir antes que problemas escalem.
- US-002: Como **supervisor**, quero um heat calendar de NOK rate por rota/dia, para detectar clusters de falha.
- US-003: Como **engenheiro de processo**, quero comparar turnos (Day / Afternoon / Night) em radar, para ver se um turno é sistematicamente pior.
- US-004: Como **técnico de manutenção**, quero treemap de saúde de equipamentos e countdown preditivo, para priorizar intervenções.
- US-005: Como **supervisor**, quero Route DNA strip e Sankey de observações, para ver padrões recorrentes e fluxo de anomalias.

---

## Acceptance Scenarios

- **US-001:** Dado checklists no CDF, quando abro Overview, então vejo 5 cards (To Do, Ongoing, Done, Overdue, Not OK) com valor, delta vs turno anterior e indicador semafórico (Aura Card/Badge).
- **US-001:** Dado Overdue com valor > 0 e delta positivo, quando o card renderiza, então o semáforo é crítico (vermelho).
- **US-002:** Dado instâncias `ChecklistKpi` com `nokRate` e `route`, quando abro Overview, então vejo heat calendar (última semana em destaque).
- **US-003:** Dado `ChecklistKpi` agrupado por `shift`, quando abro Overview, então vejo radar com 5 eixos e 3 séries de turno.

---

## Functional Requirements

### Fase A — Overview KPIs (prioridade)

- FR-001: O sistema DEVE exibir 5 KPI cards alinhados a FR-P01 (`todo`, `ongoing`, `done`, `overdue`, `notok`) usando `@cognite/aura` (`Card`, `Badge`).
- FR-002: O sistema DEVE calcular `delta` por bucket como diferença entre contagens do turno operacional atual e do turno anterior (regras puras em `domain/`).
- FR-003: O sistema DEVE atribuir semáforo `good` | `watch` | `critical` | `neutral` por bucket via regras de domínio documentadas em `research.md`.
- FR-004: O sistema DEVE exibir delta com seta/cópia acessível (ex.: `▼ 3 vs previous shift`) sem porcentagem genérica como única métrica secundária.
- FR-005: O sistema DEVE manter agregação de status a partir de `cdf_apm.Checklist:v7` (complementar a views IP; não expor DTO DMS na presentation).
- FR-006: O sistema DEVE usar tokens `--ip-*` / semânticos Aura para cores de semáforo (`styles.css`), sem hex solto em TSX.

### Fase B — Overview visualizações

- FR-010: O sistema DEVE ler `ip_checklist_dm/ChecklistKpi:v1` para heat calendar (`nokRate` × `date` × `route`).
- FR-011: O sistema DEVE agregar `ChecklistKpi` por `shift` para radar de turnos (5 métricas).
- FR-012: O sistema DEVE listar top 5 `MeasurementTrend` por `predictedDaysToAlarm` ascendente na Overview.

### Fase C — Telas Equipamentos e Observações

- FR-020: O sistema DEVE exibir treemap `EquipmentHealthIndex.healthScore` com drill-down para trends.
- FR-021: O sistema DEVE exibir Route DNA strip a partir de `ChecklistItem` ordenado por `order`.
- FR-022: O sistema DEVE exibir Sankey de `Observation` (`categoryRef`, `severityRef`, status).
- FR-023: O sistema DEVE integrar painel Atlas via `@cognite/app-sdk` (skill `integrate-fusion-agent`) — opcional nesta fase.

---

## Success Criteria

- SC-001: KPI cards carregam em ≤ 3 s com delta e semáforo visíveis.
- SC-002: Cobertura de testes ≥ 80% nos novos módulos de domain e componentes alterados.
- SC-003: UI usa Aura; layout/cores seguem `docs/Design.md`.

---

## Data Models & CDF Integration

### Existing views

- `cdf_apm.Checklist:v7` — status operacional (5 buckets)
- `ip_checklist_dm.ChecklistKpi:v1` — `nokRate`, `route`, `shift`, `date`, métricas de turno
- `ip_checklist_dm.EquipmentHealthIndex:v1` — `healthScore`, `assetRef`
- `ip_checklist_dm.MeasurementTrend:v1` — `predictedDaysToAlarm`, `trendSlope`, `lastValue`, `threshold`
- `ip_checklist_dm.InspectionShift:v1` — Day / Afternoon / Night
- `cdf_apm.ChecklistItem:v7`, `cdf_apm.Observation:v5` — DNA strip, Sankey

### Spaces

- `cdf_apm`, `flows_radix_checklist_group1`, `ip_checklist_dm`

---

## Relates to

Relates to SPEC.md FR-P01, FR-P06; estende `specs/003-checklist-kpis` e `specs/004-task-result-dashboards`.
