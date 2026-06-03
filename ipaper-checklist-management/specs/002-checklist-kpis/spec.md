# Feature Spec — Checklist KPIs & Overview

> **ID:** 002-checklist-kpis  
> **Rigor:** completo  
> **Owner:** João (epic) · time-grupo-1  
> **Criado em:** 2026-06-02  
> **Application Requirements:** AR-101 … AR-107  
> **Protótipo Lovable:** [`docs/prototype/LOVABLE-PROTOTYPE.md`](../../docs/prototype/LOVABLE-PROTOTYPE.md) — rotas `/`, `/checklists`, `/checklists/:id`  
> **Depende de:** `001-checklist-management` (AppShell, host-sync, HostAppContext)

---

## User Stories

- US-001: Como **supervisor de turno (P-01)**, quero ver KPIs de status dos checklists na overview, para identificar rapidamente atrasos e falhas.
- US-002: Como **supervisor**, quero clicar em um KPI e ver a lista filtrada, para investigar sem reconfigurar filtros manualmente.
- US-003: Como **técnico (P-02)**, quero buscar checklists por nome, asset ou área, para encontrar uma inspeção específica.
- US-004: Como **técnico**, quero abrir o detalhe de um checklist e ver resultados das tasks (OK/Not OK), para decidir ação corretiva.
- US-005: Como **usuário Fusion**, quero que filtros e página ativa persistam ao recarregar ou compartilhar link, para retomar análise no mesmo contexto.

---

## Acceptance Scenarios

- **US-001:** Dado checklists em todos os status, quando abro a overview, então vejo 5 cards (To Do, Ongoing, Done, Overdue, Not OK) com contagem e percentual do total.
- **US-002:** Dado a overview carregada, quando clico no card "Not OK", então navego para a lista com filtro `status=notok` aplicado.
- **US-003:** Dado a lista de checklists, quando digito "Pump" na busca, então apenas checklists cujo nome, asset, área ou ID contém "Pump" são exibidos.
- **US-004:** Dado um checklist com tasks registradas, quando abro `/checklists/:id`, então vejo tabela com expected, actual, status e comentários por task.
- **US-005:** Dado filtros aplicados na lista, quando recarrego a página Fusion, então os mesmos filtros permanecem (host-synced state).

---

## Functional Requirements

- FR-001: O sistema DEVE agregar checklists InField/CDF em cinco status: **todo**, **ongoing**, **done**, **overdue**, **notok**.
- FR-002: O sistema DEVE classificar checklist como **notok** quando possuir **pelo menos uma** task com resultado Not OK.
- FR-003: O sistema DEVE exibir na **Overview** KPI cards para cada status com valor absoluto e percentual do total.
- FR-004: O sistema DEVE exibir na Overview gráfico de distribuição de status e resumo OK vs Not OK (últimos N dias configurável).
- FR-005: O sistema DEVE exibir na Overview tabelas resumidas: Latest Not OK, Overdue checklists (máx. 6 linhas cada, com link "View all").
- FR-006: O sistema DEVE fornecer página **Checklists** com busca textual e filtros por status, área, asset, equipe e resultado agregado.
- FR-007: O sistema DEVE permitir ordenação ascendente/descendente por colunas da tabela de checklists.
- FR-008: O sistema DEVE persistir filtros de lista e query de busca via **host-synced state** (`syncInternalState`).
- FR-009: O sistema DEVE exibir página de **detalhe** com metadados (status, team, last execution, progresso %) e lista de task results.
- FR-010: O sistema DEVE exibir estados **loading**, **erro** e **vazio** na overview, lista e detalhe.

---

## Success Criteria

- SC-001: Supervisor identifica count de Overdue e Not OK em < 30s após load (US-001).
- SC-002: Busca retorna checklist alvo em ≤ 3 keystrokes para IDs conhecidos (US-003).
- SC-003: Drill-down KPI → lista → detalhe sem perda de contexto de filtro (US-002, US-004).
- SC-004: 100% dos FR-001–FR-010 com teste associado `passing` em `progress.md`.

---

## Clarifications

- [x] Status **overdue** derivado de regra InField (due date passada, não concluído) — detalhar em `research.md` com API InField. — 2026-06-02
- [ ] CDF views exatas para checklist instance — pendente mapeamento InField DMS
- [x] Layout referência: protótipo Lovable rotas `/`, `/checklists` — traduzir para Aura. — 2026-06-02

---

## Assumptions

- [Dados mock aceitos em dev até integração CDF estar disponível]
- [Settings page fora desta feature — spec futura se necessário]
- [Critical alerts feed na overview pode reutilizar módulo 004 ou placeholder até alerts existir]

---

## Data Models & CDF Integration

### Existing views

- A definir: view InField para **checklist instance** (leitura)
- A definir: view InField para **task result** (leitura)

### New views

Nenhuma obrigatória para leitura-only v1. Config de alertas em spec 004.

### Spaces

- Space operacional IP/InField — a confirmar com time Cognite

---

## Relates to

Relates to SPEC.md: pilares 3.1 Checklist KPI Enhancements (AR-101–AR-107).
