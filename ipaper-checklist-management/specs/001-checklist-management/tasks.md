# Tasks — Checklist Management (scaffold Flows)

> **ID:** 001-checklist-management
> Tarefas do scaffold já concluídas. Serve como baseline e referência de padrão para features futuras (`002+`).

---

## Tarefas (scaffold — todas concluídas)

- [x] T1 — FR-004 — Teste: loading state enquanto `connectToHostApp` não resolve — teste: `src/App.test.tsx` ("renders loading state")
- [x] T2 — FR-001, FR-002, FR-003 — Teste: tela conectada exibe checklist, targets e copy — teste: `src/App.test.tsx` ("renders splash with deployment targets and checklist copy")
- [x] T3 — FR-004 — Implementar `loadingFallback` em `App.tsx` — teste: T1
- [x] T4 — FR-001 — Implementar `AppContent` com card de boas-vindas — teste: T2
- [x] T5 — FR-002 — Implementar `CHECKLIST_STEPS` (Plan/Explore/Deploy) com `Collapsible` — teste: T2
- [x] T6 — FR-003 — Implementar badge de org/project lendo `app.json` + `client.project` — teste: T2
- [x] T7 — FR-006 — Envelopar `AppContent` em `CogniteSdkProvider` com `deps` injetável — teste: T1, T2

---

## Tarefas pendentes (backlog — mover para `002+` quando priorizadas)

- [ ] TB-001 — Preencher `SPEC.md` macro com FRs de produto reais
- [ ] TB-002 — Definir primeira feature de negócio real (`002-*`) alinhada ao roadmap
- [ ] TB-003 — FR-005: adicionar teste de error state (falha de conexão Fusion)
