# Progress — 003-checklist-kpis

> **Status:** done  
> **Owner:** time-grupo-1  
> **Última atualização:** 2026-06-03

---

## Etapas SDD

| Etapa | Status | Data |
| --- | --- | --- |
| 1 Specify | done | 2026-06-02 |
| 2 Clarify | done | 2026-06-03 |
| 3 Plan | done | 2026-06-02 |
| 4 Tasks | done | 2026-06-02 |
| 5 Implement | done | 2026-06-03 |
| 6 Validate | done | 2026-06-03 |
| 7 Done | done | 2026-06-03 |

---

## Matriz de rastreabilidade (FR → teste)

| FR | Teste | Status |
| --- | --- | --- |
| FR-001 | `checklist.mapper.test.ts`, `cdf-checklist.repository.test.ts` | passing |
| FR-002 | `kpi-card.test.tsx`, `overview.page.test.tsx`, `App.test.tsx` | passing |
| FR-003 | `checklist-kpi.rules.test.ts` (filter) | passing |
| FR-004 | `use-checklist-kpi-query.ts` staleTime 60s | passing (config) |
| FR-005 | `overview.page.test.tsx`, loading in `App.test.tsx` | passing |

---

## Clarificações resolvidas

- [x] `Checklist.status` no seed: `created` \| `started` \| `completed` — mapeado para To Do / Ongoing / Done — 2026-06-03
- [x] Not OK: itens `ChecklistItem` com `note` preenchida (seed NotOk) — 2026-06-03
- [x] Overdue: `endTime` no passado e status ≠ `completed` — 2026-06-03

---

## Implementação

- Módulo `src/modules/checklists/` (domain, infrastructure, presentation)
- Overview (`page: overview`) consome CDF via `CdfChecklistRepository`
- Views: `cdf_apm.Checklist:v7`, `cdf_apm.ChecklistItem:v7`
