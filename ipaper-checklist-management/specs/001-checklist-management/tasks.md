# Tasks — App Foundation & Fusion Shell

> **ID:** 001-checklist-management  
> **Epic owner:** Guilherme  
> Ordem: **Test-First** — integração → unidade → fonte.  
> **Issues GitHub:** [`docs/requirements/TASKS-DIVISION.md`](../../docs/requirements/TASKS-DIVISION.md#epic-001--app-foundation--fusion-shell)  
> **Protótipo:** `prototype/fieldops-insights/src/components/app-sidebar.tsx`, `src/routes/__root.tsx`

---

## Distribuição do time

| Dev | Tarefas | Foco |
| --- | --- | --- |
| **Guilherme** | T3–T6, T13 | HostAppContext, host-sync, reviews |
| **Caio** | T7–T10 | AppShell, sidebar Aura, tokens IP, placeholders |
| **João** | T1–T2, T11–T12 | Error bootstrap, remoção scaffold, matriz CI |

---

## Tarefas concluídas (scaffold Flows — baseline)

- [x] T0a — @time — FR-002 — Teste: loading state — teste: `src/lib/App.test.tsx` ("renders loading state")
- [x] T0b — @time — FR-001, FR-004 — Teste: splash conectado + deps injetável — teste: `src/lib/App.test.tsx` ("renders splash…")
- [x] T0c — @time — FR-002 — `loadingFallback` em App — teste: T0a
- [x] T0d — @time — FR-001 — `CogniteSdkProvider` + `AppContent` — teste: T0b
- [x] T0e — @time — FR-004 — prop `deps` em App — teste: T0b

---

## Tarefas pendentes (produto InField)

### Fusion error & auth

- [x] T1 — @João — FR-003 — Teste: error fallback quando `connectToHostApp` rejeita — teste: `src/App.test.tsx` ("renders error when host connection fails")
- [x] T2 — @João — FR-003 — Wire `errorFallback` + cenário rejeitado em deps de teste — teste: T1

### Host context

- [x] T3 — @Guilherme — FR-010, FR-011 — Teste unitário: `HostAppContext` expõe api mock — teste: `src/app/host/host-app.context.test.tsx`
- [x] T4 — @Guilherme — FR-011 — Implementar `HostAppProvider` seeding de `initialState` — teste: T3
- [x] T5 — @Guilherme — FR-010 — Teste integração: mudança de `page` chama `syncInternalState` — teste: `src/app/host/use-app-navigation.test.tsx`
- [x] T6 — @Guilherme — FR-010 — Implementar `useAppNavigation` + storage host-synced — teste: T5

### App shell

- [x] T7 — @Caio — FR-005, FR-006, FR-007 — Teste integração: sidebar renderiza 6 itens e destaca ativo — teste: `src/design-system/layout/app-shell/app-shell.test.tsx`
- [x] T8 — @Caio — FR-005, FR-006, FR-007, FR-008 — Implementar `AppShell` + `AppSidebar` (Aura, tokens IP) — teste: T7
- [x] T9 — @Caio — FR-009 — Aplicar tokens `--ip-*` / sidebar em `src/styles.css` — teste: T7
- [x] T10 — @Caio — FR-012 — Placeholder views por módulo — teste: T7

### Transição & validação

- [x] T11 — @João — FR-013 — Remover welcome scaffold; Overview placeholder vira default `page` — teste: T7 + `src/App.test.tsx`
- [x] T12 — @João — FR-001–FR-012 — Atualizar matriz em `progress.md`; `lint` + `test` + `build` verdes
- [x] T13 — @Guilherme — — `flows-code-review` + `flows-design-review` antes de marcar `done`

---

## Notas

- **Bloqueante:** 002–004 dependem de T4–T10 (shell + host context).
- Guilherme desbloqueia Caio (T6 antes de T7); Caio desbloqueia João (T10 antes de T11).
