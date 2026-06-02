# Feature Spec — Checklist Management (scaffold Flows)

> **ID:** 001-checklist-management
> **Rigor:** completo (baseline legado)
> **Owner:** time-grupo-1
> **Criado em:** 2026-06-02

---

## User Stories

- US-001: Como desenvolvedor que acabou de criar um app Flows, quero ver um checklist de passos de deployment (Plan, Explore, Deploy), para que eu saiba exatamente o que fazer para publicar meu app.
- US-002: Como desenvolvedor, quero ver para qual org e projeto meu app será publicado, para que eu confirme o ambiente-alvo antes do deploy.
- US-003: Como desenvolvedor, quero ver um estado de carregamento enquanto o host Fusion conecta, para que eu saiba que o app está inicializando e não travado.

---

## Acceptance Scenarios

- **US-001:** Dado que o host Fusion conectou com sucesso, quando a tela carrega, então exibe o card "Welcome to Flows custom apps!" com os itens Plan, Explore e Deploy no checklist.
- **US-002:** Dado que `app.json` tem `deployments[0].org = "radix"` e o CogniteClient retorna `project = "radix-dev"`, quando a tela carrega, então exibe os badges "radix" e "radix-dev" no alerta de deployment target.
- **US-003:** Dado que `connectToHostApp` ainda não resolveu, quando a tela carrega, então exibe o card "Loading project..." com o spinner.

---

## Functional Requirements

- FR-001: O sistema DEVE exibir o card de boas-vindas com título "Welcome to Flows custom apps!" após conectar ao host Fusion.
- FR-002: O sistema DEVE exibir um checklist com os passos Plan (Step 1), Explore (Step 2) e Deploy (Step 3).
- FR-003: O sistema DEVE exibir os badges de org e projeto alvo conforme `app.json` e o projeto do `CogniteClient`.
- FR-004: O sistema DEVE exibir o estado de loading ("Loading project...") enquanto `connectToHostApp` não resolver.
- FR-005: O sistema DEVE exibir um alerta de erro ("Failed to connect to Fusion host") se `connectToHostApp` falhar.
- FR-006: O sistema DEVE usar `CogniteSdkProvider` para autenticação — nunca hardcode de token ou URL.

---

## Success Criteria

- SC-001: Usuário identifica os 3 passos de deployment em menos de 10 segundos após carregamento.
- SC-002: Badges de org/projeto exibem os valores corretos de `app.json` e do projeto CDF.
- SC-003: Loading state visível em tela enquanto a conexão Fusion não é estabelecida.

---

## Clarifications

- [x] Auth via `CogniteSdkProvider` — confirmado; não criar lógica de auth customizada. (AGENTS.md §8) — 2026-06-02
- [x] Estado host-synced — scaffold atual não tem estado persistente; qualquer estado futuro deve seguir AGENTS.md §2. — 2026-06-02

---

## Assumptions

- [Checklist Plan/Explore/Deploy é conteúdo fixo do scaffold; features de negócio reais serão em `002+`]
- [Mobile/responsivo fora do escopo desta baseline]

---

## Data Models & CDF Integration

### Existing views

Nenhuma — scaffold não lê dados CDF.

### New views

Nenhuma — scaffold não cria views CDF.

### Spaces

Nenhum no scaffold. Deploy para `project: radix-dev` via `app.json`.

---

## Relates to

Relates to SPEC.md: seção "Data Models & CDF Integration" (a preencher quando features reais forem adicionadas).
