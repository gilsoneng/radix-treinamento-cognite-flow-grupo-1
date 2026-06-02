# Estrutura de Pastas — `src/`

> Tradução da arquitetura DDD/Clean (base Angular) para **React + Cognite Flows**.
> A fronteira de propriedade é `modules/<bounded-context>/`; `domain`,
> `infrastructure` e `presentation` são as camadas internas dessa fronteira.
> Regras de import e responsabilidades detalhadas: [`layers.md`](layers.md).

---

## 1. Árvore-alvo

```txt
src/
  main.tsx                      # bootstrap (ReactDOM.createRoot)
  App.tsx                       # composição raiz: CogniteSdkProvider + Host + Shell

  app/                          # composição / wiring de nível de aplicação
    host/
      host-app.context.tsx      # Context com a HostAppAPI (connectToHostApp)
      host-app.provider.tsx     # conecta ao host, expõe api + initialState
      host-synced-state.ts      # helpers de leitura/escrita do estado host-synced
    providers/
      app-providers.tsx         # compõe react-query, host, DI globais, tema
      query-client.ts           # instância do QueryClient
    config/
      app-config.ts             # acesso tipado a app.json (org/project/deployments)
    routing/
      app-view.tsx              # troca de view via estado host-synced (sem router)
      app-view.types.ts         # union dos views navegáveis

  core/                         # técnico transversal, injetável — sem negócio
    sdk/
      cognite-sdk.context.tsx   # re-exporta useCogniteSdk como dependência injetável
      cognite-client.types.ts   # interfaces ESTREITAS sobre o CogniteClient
    query/
      retry-policy.ts           # backoff exponencial + jitter; respeita Retry-After (429)
      query-keys.ts             # convenção global de chaves (namespacing por módulo)
    errors/
      app-error.ts              # tipos de erro de domínio/infra
      error-boundary.tsx        # ErrorBoundary global

  design-system/                # IP Design System implementado SOBRE o @cognite/aura
    tokens/                     # mapeamento IP -> CSS vars / tokens semânticos Aura (styles.css)
    primitives/                 # widgets atômicos IP que compõem/tematizam Aura
    components/                 # organismos IP: kpi-card, empty-state, error-banner...
    layout/
      app-shell.tsx             # shell IP: sidebar + header + content
      states/
        loading-state.tsx       # loading padronizado (compõe Loader do Aura)
        error-state.tsx         # erro padronizado (compõe Alert do Aura)
        empty-state.tsx         # estado vazio padrão
    charts/                     # gráficos (uPlot/ApexCharts) quando o Aura não cobre
    formatting/                 # formatadores de apresentação SEM semântica de domínio

  shared/                       # utilitários e tipos técnicos genéricos
    utils/                      # helpers TS/browser puros
    types/                      # tipos compartilhados framework-agnostic

  modules/
    <bounded-context>/          # ex.: checklists
      domain/
        <concept>.model.ts      # modelo de domínio frontend (vocabulário de UI)
        <concept>.repository.ts # INTERFACE do repositório (contrato)
        value-objects/          # VOs leves (ex.: ChecklistId, Status)
        rules/                  # regras puras client-side
        <concept>.format.ts     # formatação COM significado de domínio

      infrastructure/
        dto/
          <concept>.dto.ts      # forma crua da instância de view DMS
        mappers/
          <concept>.mapper.ts   # DMS <-> modelo de domínio (+ parsing defensivo)
        <concept>.cdf-repository.ts   # implementa o contrato via @cognite/sdk
        <concept>.mock-repository.ts  # implementação fake p/ dev e testes
        queries/
          <concept>.queries.ts  # queryKeys + queryFn/mutationFn (chamam o repositório)
          use-<concept>-query.ts# hook react-query injetável (exposto à presentation)

      presentation/
        view-models/
          use-<concept>.view-model.ts   # orquestra domínio + estado; expõe dados prontos
        state/
          <concept>-ui.state.tsx        # storage layer (Context/store); estado host-synced
        components/
          <component>/                  # componente específico do módulo (render-only)
            <component>.tsx
            <component>.test.tsx
        pages/
          <page>/
            <page>.page.tsx             # página (fina); liga eventos a ViewModels
            <page>.page.test.tsx

      <bc>.providers.tsx        # DI: liga cdf-repository (ou mock) ao Context do módulo
      <bc>.routes.tsx           # (opcional) registro do view no app-view

  __mocks__/                    # factories de mock reutilizáveis em testes (AGENTS.md §6)
```

---

## 2. Mapa: base Angular → React/Flows

| Pasta na base Angular | Equivalente aqui | Observação |
| --- | --- | --- |
| `app.config.ts` / `app.routes.ts` | `app/providers/` + `app/routing/` | Sem router pesado; view via host-synced |
| `core/auth`, `core/http/interceptors` | `app/host/` + `core/sdk` | Auth via `CogniteSdkProvider`; HTTP só via SDK |
| `core/config` | `app/config/app-config.ts` | Acesso tipado a `app.json` |
| `design-system/` (widgets/components/layouts) | `design-system/` (sobre Aura) | DS **próprio (IP)** mantido; implementado **sobre** o Aura, sem recriar primitivos nem copiar widgets Angular |
| `layout/` | `design-system/layout/` | Shell IP + estados (loading/erro/vazio) |
| `shared/` | `shared/` | Igual: utils/types genéricos |
| `modules/<bc>/domain` | `modules/<bc>/domain` | Igual em espírito; TS puro |
| `modules/<bc>/infrastructure` (`*.api.ts`, DTOs) | `modules/<bc>/infrastructure` (CDF repo, DMS dto, mappers, queries) | "API" = `@cognite/sdk`; react-query mora aqui |
| `modules/<bc>/presentation` (facades, signals) | `modules/<bc>/presentation` (ViewModels, state) | Facade → ViewModel; signals → react-query + host-synced + state |
| `diagnostics/health` | _opcional_ `modules/diagnostics` ou status no shell | Só se houver tela técnica |

---

## 3. Convenções de nomenclatura

- Arquivos React: `kebab-case` para pastas; sufixos explícitos de papel:
  `*.page.tsx`, `*.view-model.ts`, `*.repository.ts`, `*.cdf-repository.ts`,
  `*.mapper.ts`, `*.dto.ts`, `*.queries.ts`, `*.context.tsx`, `*.provider.tsx`.
- Teste ao lado do arquivo: `*.test.ts(x)` (Vitest), conforme `AGENTS.md` §6.
- Nada de `widget`, `dashboard`, `charts`, `cognite`, `api` como **nome de módulo** —
  são telas/infra; viram páginas/componentes/queries **dentro** de um bounded context.

---

## 4. Estado: onde cada coisa vive

| Tipo de estado | Onde | Tecnologia |
| --- | --- | --- |
| Dados de servidor (listas, detalhes do CDF) | `infrastructure/queries` → consumido na presentation | react-query |
| Estado navegável (view ativa, filtros, tab, recurso selecionado) | `presentation/state` (storage) + `app/host` | **host-synced** (`app-sdk`) |
| Estado efêmero (input em digitação, hover, toast) | `presentation/state` | React state local |
| Config do app (org/project/deployments) | `app/config` | `app.json` tipado |

Regra prática (`AGENTS.md` §2): _"o usuário esperaria que isto sobrevivesse a um reload
ou a um link compartilhado?"_ Se sim → host-synced.

---

## 5. Domain discovery — a preencher com `SPEC.md`

O nome `<bounded-context>` é **template**. O primeiro contexto provisório é `checklists`.
Antes de criar o módulo real, preencher em `SPEC.md` e no `spec.md` da feature:

- **Linguagem ubíqua:** o que é "checklist", "item", "execução/preenchimento",
  "inspeção", "responsável", "status".
- **Mapeamento CDF:** quais _views_ e _spaces_ DMS cada conceito usa
  (seção "Data Models & CDF Integration" do `SPEC.md`).
- **Bounded contexts candidatos:** ex. `checklists` (definição/template) vs
  `inspections` (execução em campo) — só viram módulos separados se forem
  capacidades independentes com casos de uso próprios.

Enquanto o domínio de checklist não está formalizado, este documento descreve a **forma**, não o
conteúdo completo de produto. A estrutura é estável independente do nome final.

---

## 6. Estado atual da implementação (exemplo arquitetural)

Árvore **existente** hoje como **prova de conceito** da estrutura-alvo (branch de arquitetura; spec `001` inalterada):

```txt
src/
  main.tsx
  App.tsx
  styles.css

  app/
    config/app-config.ts
    providers/app-providers.tsx
    providers/query-client.ts

  core/
    dm/core-dm.constants.ts
    query/retry-policy.ts
    sdk/cdf-client.ts

  design-system/
    assets/ip-brand.ts
    components/ip-hero-banner/
    components/ip-spinner/
    components/powered-by-radix/
    layout/app-footer/
    layout/page-shell/
    layout/states/

  modules/health/
    domain/core-asset.model.ts
    domain/core-asset.repository.ts
    infrastructure/cdf-core-asset.repository.ts
    infrastructure/core-asset.mock-repository.ts
    infrastructure/dto/asset-instance.dto.ts
    infrastructure/mappers/asset.mapper.ts
    infrastructure/queries/
    presentation/components/core-asset-list/
    presentation/pages/health/
    presentation/view-models/
    health.providers.tsx

  shared/utils/semaphore.ts
  shared/utils/cn.ts
  types/
```

**Ainda não criado:** `app/host/`, `app/routing/`, `core/errors/`, `design-system/tokens/` (tokens vivem em `styles.css`), sidebar, charts, módulos checklist.
