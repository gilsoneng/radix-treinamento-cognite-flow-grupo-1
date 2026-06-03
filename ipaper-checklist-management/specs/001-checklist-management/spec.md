# Feature Spec — App Foundation & Fusion Shell

> **ID:** 001-checklist-management  
> **Rigor:** completo  
> **Owner:** Guilherme (epic) · time-grupo-1  
> **Criado em:** 2026-06-02 · **Atualizado:** 2026-06-02  
> **Application Requirements:** NFR-001 … NFR-003, AR-001 … AR-006 ([`docs/requirements/APPLICATION-REQUIREMENTS.md`](../../docs/requirements/APPLICATION-REQUIREMENTS.md))  
> **Protótipo Lovable:** [`docs/prototype/LOVABLE-PROTOTYPE.md`](../../docs/prototype/LOVABLE-PROTOTYPE.md) — shell em `src/components/app-sidebar.tsx` (protótipo)  
> **Bloqueia:** `002-checklist-kpis`, `003-task-result-trends`, `004-alerts-notifications`

---

## User Stories

- US-001: Como **usuário Fusion**, quero que o app conecte ao host e autentique via CDF, para acessar dados InField sem login separado.
- US-002: Como **usuário**, quero ver loading e erro claros na inicialização, para saber se o app está carregando ou falhou.
- US-003: Como **operador IP**, quero navegar entre Overview, Checklists, Analytics e Alerts por menu lateral, para acessar módulos sem sair do app.
- US-004: Como **usuário**, quero que a página ativa persista ao recarregar ou compartilhar link Fusion, para retomar no mesmo módulo.
- US-005: Como **desenvolvedor**, quero `HostAppAPI` injetável via contexto, para ViewModels sincronizarem estado sem acoplamento.
- US-006: Como **usuário IP**, quero chrome visual alinhado à marca (sidebar teal, hierarquia industrial), para reconhecer o produto InField Intelligence.

---

## Acceptance Scenarios

- **US-001:** Dado Fusion host disponível, quando o app inicia, então `CogniteSdkProvider` resolve e `useCogniteSdk()` retorna client com projeto CDF.
- **US-002:** Dado `connectToHostApp` pendente, quando renderizo, então exibo "Loading project..."; dado falha, então exibo "Failed to connect to Fusion host".
- **US-003:** Dado app carregado, quando clico "Checklists" na sidebar, então o outlet principal exibe o módulo Checklists (ou placeholder até 002).
- **US-004:** Dado página `overview` ativa, quando recarrego via Fusion, então `initialState` restaura `page: 'overview'`.
- **US-005:** Dado ViewModel que chama `syncInternalState`, quando estado muda, então mock/API recebe JSON serializado com nova página.
- **US-006:** Dado shell renderizado, quando inspeciono sidebar, então usa tokens `--ip-teal-sidebar` / Aura conforme `docs/Design.md`.

---

## Functional Requirements

### Fusion & auth (baseline — parcialmente implementado)

- FR-001: O sistema DEVE conectar ao host Fusion via `connectToHostApp` e autenticar com `CogniteSdkProvider` — sem hardcode de token ou URL.
- FR-002: O sistema DEVE exibir estado de **loading** ("Loading project...") enquanto a conexão Fusion/CDF não resolver.
- FR-003: O sistema DEVE exibir estado de **erro** ("Failed to connect to Fusion host") quando `connectToHostApp` ou init do SDK falhar.
- FR-004: O sistema DEVE expor `deps` injetáveis em `App` para testes (`connectToHostApp`, `createClient`).

### Shell produto InField (pendente — substitui welcome scaffold)

- FR-005: O sistema DEVE renderizar **app shell** com sidebar e área de conteúdo (`<Outlet />` / roteamento interno por view).
- FR-006: O sistema DEVE listar na sidebar os módulos: Overview, Checklists, Task Results, Time-Series KPIs, Alerts, Settings — alinhado ao protótipo.
- FR-007: O sistema DEVE destacar item de navegação ativo conforme view corrente.
- FR-008: O sistema DEVE exibir branding IP no shell (título "InField", subtítulo "Checklist Intelligence", contexto mill/shift quando disponível).
- FR-009: O sistema DEVE aplicar tokens de marca IP (`docs/Design.md`) no chrome — sidebar, cores de status preparadas para 002+.

### Host-sync & arquitetura

- FR-010: O sistema DEVE manter estado host-synced mínimo `{ page: AppPage }` via `syncInternalState` / `initialState` (AGENTS.md §2).
- FR-011: O sistema DEVE prover **HostAppContext** (ou equivalente) com `api: HostAppAPI` para ViewModels e storage layers.
- FR-012: O sistema DEVE renderizar **placeholders** ou rotas vazias para módulos ainda não implementados (002–004), com copy "Coming soon" ou redirect para overview.

### Legado scaffold (transição)

- FR-013: O welcome scaffold Flows (Plan/Explore/Deploy) DEVE ser **removido ou isolado** quando FR-005 estiver done — não coexistir como home de produção.

---

## Success Criteria

- SC-001: App inicia no Fusion em < 5s com loading visível (ambiente dev).
- SC-002: Navegação sidebar troca view sem reload do host Fusion.
- SC-003: Reload Fusion restaura mesma `page` em 100% dos testes de integração.
- SC-004: FR-001–FR-012 com matriz FR→teste `passing` antes de `status: done`.
- SC-005: Features 002–004 plugam-se no shell sem reimplementar auth ou sidebar.

---

## Clarifications

- [x] Auth exclusivamente via `CogniteSdkProvider` (AGENTS.md §8) — 2026-06-02
- [x] Roteamento interno: state-driven (`page` enum) vs router library — preferir enum + host-sync v1; avaliar router em `plan.md` se complexidade crescer. — 2026-06-02
- [ ] Settings: placeholder v1 ou omitir da sidebar até spec dedicada
- [x] Protótipo sidebar: `prototype/fieldops-insights/src/components/app-sidebar.tsx` — traduzir para Aura, não copiar shadcn. — 2026-06-02

---

## Assumptions

- [Scaffold welcome (`App.tsx` atual) é stepping stone até FR-005; removido em T10 de `tasks.md`]
- [Mobile: sidebar colapsável fora de escopo v1 — `hidden md:flex` como protótipo]
- [Settings permanece placeholder até feature futura]

---

## Data Models & CDF Integration

### Existing views

Nenhuma — foundation não lê entidades de negócio.

### New views

Nenhuma.

### Spaces

Deploy via `app.json` (`project: radix-dev`). Sem space CDF próprio.

---

## Relates to

Relates to SPEC.md: plataforma Flows + shell InField Intelligence.  
Relates to APPLICATION-REQUIREMENTS.md: §3.0 App Foundation (AR-001 … AR-006), NFR-001 … NFR-003.
