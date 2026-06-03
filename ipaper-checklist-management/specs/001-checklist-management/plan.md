# Plan — App Foundation & Fusion Shell

> **ID:** 001-checklist-management  
> **Protótipo:** `prototype/fieldops-insights/src/components/app-sidebar.tsx`, `__root.tsx`

---

## Visão técnica (alvo)

```
App (root)
  └── CogniteSdkProvider (FR-001…FR-004)
        └── HostAppProvider (FR-011 — api + initialState)
              └── AppShell (FR-005…FR-009)
                    ├── AppSidebar — nav Overview | Checklists | Task Results | KPIs | Alerts | Settings
                    └── AppOutlet — view por page (host-synced FR-010)
                          ├── overview → (002) OverviewView
                          ├── checklists → (002) ChecklistListView
                          ├── task-results → (003) TaskResultsView
                          ├── kpis → (003) TimeSeriesKpisView
                          ├── alerts → (004) AlertsView
                          └── settings → PlaceholderView
```

**Estado v1 (host-synced):**

```typescript
type AppPage =
  | 'overview'
  | 'checklists'
  | 'checklist-detail' // id em sub-campo opcional
  | 'task-results'
  | 'kpis'
  | 'alerts'
  | 'settings';

type AppState = {
  page: AppPage;
  checklistId?: string;
};
```

Filtros de lista (002) estendem `AppState` ou storage separado — ver spec 002.

---

## Mapeamento FR → módulo

| FR | Módulo `src/` | Padrão |
| --- | --- | --- |
| FR-001…FR-004 | `App.tsx` / `src/lib/App.tsx` | AGENTS.md §8, §6 (deps) |
| FR-005…FR-009 | `src/shell/AppShell.tsx`, `AppSidebar.tsx` | §1 Aura, `docs/Design.md` |
| FR-010 | `src/shell/useAppNavigation.ts` + storage | AGENTS.md §2, §5 |
| FR-011 | `src/context/HostAppContext.tsx` | AGENTS.md §3 |
| FR-012 | `src/views/placeholders/*.tsx` | — |
| FR-013 | Remover welcome de `AppContent` | — |

---

## Transição scaffold → shell

| Fase | UI home | Testes |
| --- | --- | --- |
| Atual | Welcome Flows checklist | `App.test.tsx` splash tests |
| Pós T11 | AppShell + Overview placeholder | Atualizar/remover splash tests |

---

## Trade-offs

- **Enum `page` vs react-router:** host-sync mais simples com JSON flat; router interno pode vir em v2 se deep links complexos forem necessários.
- **Sidebar só desktop (md+):** alinhado protótipo; topbar mobile em feature futura.

---

## Riscos

- Duplicata `App.tsx` (raiz vs `src/lib/`) — consolidar em um caminho durante T8.
- Placeholders devem ser substituíveis sem alterar shell quando 002–004 entrarem.
