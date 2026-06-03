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

- [ ] T1 — @João — FR-003 — Teste: error fallback quando `connectToHostApp` rejeita — teste: `src/lib/App.test.tsx` ("renders error when host connection fails")
- [ ] T2 — @João — FR-003 — Wire `errorFallback` + cenário rejeitado em deps de teste — teste: T1

### Host context

- [ ] T3 — @Guilherme — FR-010, FR-011 — Teste unitário: `HostAppContext` expõe api mock — teste: `src/context/HostAppContext.test.tsx`
- [ ] T4 — @Guilherme — FR-011 — Implementar `HostAppProvider` seeding de `initialState` — teste: T3
- [ ] T5 — @Guilherme — FR-010 — Teste integração: mudança de `page` chama `syncInternalState` — teste: `src/shell/useAppNavigation.test.tsx`
- [ ] T6 — @Guilherme — FR-010 — Implementar `useAppNavigation` + storage host-synced — teste: T5

### App shell

- [ ] T7 — @Caio — FR-005, FR-006, FR-007 — Teste integração: sidebar renderiza 6 itens e destaca ativo — teste: `src/shell/AppShell.test.tsx`
- [ ] T8 — @Caio — FR-005, FR-006, FR-007, FR-008 — Implementar `AppShell` + `AppSidebar` (Aura, tokens IP) — teste: T7
- [ ] T9 — @Caio — FR-009 — Aplicar tokens `--ip-*` / sidebar em `src/lib/styles.css` — teste: `AppShell.test.tsx`
- [ ] T10 — @Caio — FR-012 — Placeholder views por módulo — teste: `src/shell/AppShell.test.tsx`

### Transição & validação

- [ ] T11 — @João — FR-013 — Remover welcome scaffold; Overview placeholder vira default `page` — teste: T7 (+ atualizar T0b)
- [ ] T12 — @João — FR-001–FR-012 — Atualizar matriz em `progress.md`; `lint` + `test` + `build` verdes
- [ ] T13 — @Guilherme — — `flows-code-review` + `flows-design-review` antes de marcar `done`

---

## Notas

- **Bloqueante:** 002–004 dependem de T4–T10 (shell + host context).
- Guilherme desbloqueia Caio (T6 antes de T7); Caio desbloqueia João (T10 antes de T11).
