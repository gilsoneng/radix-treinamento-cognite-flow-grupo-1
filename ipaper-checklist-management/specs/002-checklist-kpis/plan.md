# Plan — Checklist KPIs & Overview

> **ID:** 002-checklist-kpis  
> **Protótipo:** `prototype/fieldops-insights/src/routes/index.tsx`, `checklists.tsx`, `checklists.$id.tsx`

---

## Visão técnica

```
AppShell (001)
  ├── overview → OverviewView
  │     └── useOverviewViewModel
  │           ├── ChecklistService.countByStatus()
  │           ├── ChecklistService.listLatestNotOk()
  │           └── ChecklistService.listOverdue()
  ├── checklists → ChecklistListView
  │     └── useChecklistListViewModel
  │           ├── ChecklistStorage (host-synced filters)
  │           └── ChecklistService.list(filters)
  └── checklist-detail → ChecklistDetailView
        └── useChecklistDetailViewModel
              └── ChecklistService.getById(id) + taskResults
```

---

## Mapeamento FR → módulo

| FR | Módulo `src/` | Padrão |
| --- | --- | --- |
| FR-001, FR-002 | `services/checklist/aggregateChecklistStatus.ts` | util puro |
| FR-001 | `services/checklist/ChecklistService.ts` + `MockChecklistService` | §4 interface |
| FR-003…FR-005 | `views/overview/OverviewView.tsx`, `useOverviewViewModel.ts` | §5 ViewModel |
| FR-006…FR-008 | `views/checklists/ChecklistListView.tsx`, `useChecklistListViewModel.ts` | §2 host-sync |
| FR-009 | `views/checklists/ChecklistDetailView.tsx`, `useChecklistDetailViewModel.ts` | §5 |
| FR-010 | loading/error/empty em cada view | skill `design` |

---

## Estado e host-sync

| Estado | Tipo | Justificativa |
| --- | --- | --- |
| `page` | host-synced | 001 — navegação |
| `checklistId` | host-synced | detalhe compartilhável |
| `filters.status/area/asset/team/result/q` | host-synced | FR-008, reload/share |
| `filters.sortKey/sortDir` | host-synced | ordenação persistente |
| hover linha tabela | local-only | transient |

Estender `AppState` de 001 ou `ChecklistListStorage` separado serializado no mesmo JSON.

---

## Interfaces

```typescript
export interface ChecklistService {
  list(filters: ChecklistFilters): Promise<Checklist[]>;
  getById(id: string): Promise<ChecklistDetail | null>;
  countByStatus(): Promise<Record<ChecklistStatus, number>>;
  listLatestNotOk(limit: number): Promise<Checklist[]>;
  listOverdue(limit: number): Promise<Checklist[]>;
}
```

---

## Trade-offs

- **Mock v1 vs CDF:** `MockChecklistService` com dados de `prototype/.../mock-data.ts` até views InField mapeadas — swap via DI.
- **Gráficos overview:** componente Aura chart ou placeholder estático v1; detalhe em 003 para libs de chart.
- **Drill-down KPI → lista:** atualizar `AppState.page` + `filters.status` num único `syncInternalState`.

---

## Riscos

- Views CDF InField indefinidas → bloquear integração real, não UI (research.md).
- Duplicação agregação status entre overview e list → centralizar em `ChecklistService`.
