# Camadas — Responsabilidades e Regras de Import

> Detalha cada camada da estrutura em [`folder-structure.md`](folder-structure.md).
> A regra de ouro e o diagrama estão no [`README.md`](README.md). Os padrões de
> implementação (DI, ViewModel, test-first) estão em [`../../AGENTS.md`](../../AGENTS.md).

---

## 0. A regra de ouro

Dependências apontam para dentro:

```txt
presentation  ─────────────▶  domain
infrastructure ────────────▶  domain
composição (providers/routes) ─▶ presentation + infrastructure + domain
```

`domain` é o núcleo e não conhece ninguém de fora. `presentation` e `infrastructure`
dependem de `domain`, nunca o contrário. Camadas técnicas (`core`, `ui`, `shared`) não
dependem de `modules`.

---

## 1. `app/` — composição raiz

**Faz:** conectar ao host (`connectToHostApp`), montar `CogniteSdkProvider`, criar o
`QueryClient`, compor providers globais de DI, decidir a view ativa (host-synced) e
renderizar o `app-shell`.

**Não faz:** lógica de negócio, chamadas a dados de módulo, decisões de domínio.

- `app/host/` é o único dono da `HostAppAPI` e do contrato `initialState`/`syncInternalState`
  (`AGENTS.md` §2). Expõe a `api` via Context para que ViewModels leiam/escrevam estado host-synced.
- `app/routing/` faz troca de view por estado host-synced — **não** usa react-router
  (ver ADR 0001). Navegação para fora do app usa `api.navigateInternal/navigateExternal`.

---

## 2. `core/` — infraestrutura técnica global

**Permitido:** acesso injetável ao `CogniteClient` (interfaces estreitas), política de
retry/backoff com jitter para 429 (`flows-code-review` 2.5), convenção global de query
keys, tipos de erro e `ErrorBoundary`.

**Proibido:** API/repositório de módulo, estado de UI de módulo, modelos de negócio,
componentes além de integração genérica de erro.

- `core/sdk` expõe o `CogniteClient` como **dependência injetável** e define interfaces
  estreitas — consumidores dependem só do subconjunto que usam (`AGENTS.md` §3, §4).
- `core/query` centraliza a política de resiliência para que todo módulo herde o mesmo
  comportamento em 429/erros transitórios.

---

## 3. `design-system/` — IP Design System sobre o Aura

Esta é a camada onde o **IP Design System** (nosso design system próprio, contrato em
[`../design/`](../design/)) é realizado neste app Flows, **construído sobre** o
`@cognite/aura`.

**Permitido:**

- `tokens/` — mapeamento dos tokens de marca IP para CSS vars / tokens semânticos Aura
  (a fonte vive em `src/lib/styles.css`).
- `primitives/` — widgets atômicos IP que **compõem/tematizam** primitivos Aura.
- `components/` — organismos IP que o Aura não cobre prontos (ex.: KPI card com drill-down,
  empty-state, error-banner, sidebar expansível).
- `layout/` — shell IP (sidebar + header + content) e wrappers de estado (loading/erro/vazio).
- `charts/` — componentes de gráfico (uPlot/ApexCharts) quando o Aura não cobre.

**Proibido:** recriar primitivos que o Aura já oferece; copiar os widgets Angular do
catálogo IP **verbatim** (`docs/Design.md`); componentes que buscam dados, têm estado de
negócio ou mencionam um bounded context/view DMS/equipamento.

> **Hierarquia:** Aura é a **fundação** (primitivos + tema base); o `design-system/` é o
> **IP Design System** por cima (marca, tema, componentes IP). Regra de decisão
> (`AGENTS.md` §1 + skill `design`): usar o componente Aura quando ele cobre a necessidade;
> só criar no `design-system/` quando o Aura **não** cobre ou a marca IP exige composição/
> tema consistente. Se um componente é usado por um único contexto, ele fica em
> `modules/<bc>/presentation/components` até o reúso ser real, então promove-se ao
> `design-system/`.

---

## 4. `shared/` — utilitários técnicos genéricos

**Permitido:** helpers TS/browser puros, tipos compartilhados framework-agnostic, tokens
de estilo que não pertencem à API de um componente.

**Proibido:** semântica de negócio, DTOs, regras de formatação específicas de módulo. Se
um helper carrega linguagem de domínio, ele vai para `modules/<bc>/domain`.

---

## 5. `modules/<bc>/domain/` — vocabulário de negócio (TS puro)

**Permitido:** modelos de domínio voltados à UI, interfaces de repositório, value objects
leves, regras puras client-side, enums/config de conceitos, formatação com significado de
domínio.

**Proibido:** componentes React; serviços que chamam HTTP/SDK direto; DTOs; imports de
config de ambiente; reimplementar invariantes de agregados que devem ser autoritativos no
servidor (CDF).

> O `domain` é testável sem React e sem rede. É o coração da regra de ouro.

---

## 6. `modules/<bc>/infrastructure/` — adapters dirigidos (driven)

**Permitido:** implementação dos contratos de repositório via `@cognite/sdk`; DTOs de
instância DMS; mappers DMS↔domínio (com parsing defensivo); `queries/` com `queryKeys` e
`queryFn`/`mutationFn`; mock-repository para dev/testes; caches/stores que se comportam
como adapter.

**Proibido:** estado de UI de página; lógica de componente; decisões de negócio além de
tradução/parsing; importar infraestrutura de **outro** módulo.

- É o **único** lugar que toca o `CogniteClient` e instâncias DMS (`flows-code-review` 1.2).
- react-query mora aqui (queryFns/mutationFns + hooks injetáveis) e é exposto à
  presentation via DI (ver ADR 0001 e `AGENTS.md` §3).
- Aplicar filtragem server-side, limites e paginação no request — nunca baixar tudo e
  filtrar no browser (`flows-code-review` 2.2–2.4; skill `dm-limits-and-best-practices`).
- Distinção: `*.store` de infra guarda cache/estado de adapter; estado de UI (tab,
  filtros, form) vai para `presentation/state`.

---

## 7. `modules/<bc>/presentation/` — fronteira de entrada (inbound)

**Permitido:** páginas, componentes específicos do módulo (render-only), ViewModels
(`use<X>ViewModel`), estado de UI baseado em storage layer (Context/store) e estado
host-synced, view models/mappers de view, casos de uso leves que coordenam contratos de
domínio + estado.

**Proibido:** uso direto de `CogniteClient`/HTTP; manipular DTO/instância DMS crua;
transformação pesada de payload; mutar estado de outro módulo; importar internals de
presentation/infrastructure de outro módulo.

- Componentes **só renderizam**; lógica vive no ViewModel (`AGENTS.md` §5).
- O ViewModel é **stateless**: o estado vive na storage layer; o VM compõe storage +
  comandos + derivações. Estado host-synced é responsabilidade do VM (seed do
  `initialState`, push via `syncInternalState`) — mas o dado em si fica na storage layer.

---

## 8. Arquivos de composição do módulo

- `<bc>.providers.tsx` — liga a implementação concreta (`*.cdf-repository` ou
  `*.mock-repository`) ao Context de DI do módulo. Pode importar `domain` e
  `infrastructure`; **não** importa páginas/componentes.
- `<bc>.routes.tsx` (opcional) — registra a(s) view(s) do módulo no `app-view`. Importa
  apenas `presentation` e os providers do próprio módulo.

---

## 9. Tabela de regras de import

| Camada | Pode importar de | Não pode importar de |
| --- | --- | --- |
| `app/` | React, `@cognite/app-sdk`, `core`, `ui`, providers públicos de módulo | internals de módulo (domain/infra/presentation) |
| `core/` | React, `@cognite/sdk`, `@cognite/app-sdk`, react-query, `shared` | qualquer `modules/*` |
| `design-system/` | React, `@cognite/aura`, libs UI/charts genéricas, `shared` | `modules/*`, DTOs, serviços de domínio |
| `shared/` | TS/browser puros, utilitários framework-agnostic | `modules/*`, DTOs, serviços de domínio |
| `modules/<bc>/domain` | só TypeScript puro, mesma pasta `domain` | React, `@cognite/sdk`, `@cognite/app-sdk`, react-query, env, infra, presentation |
| `modules/<bc>/infrastructure` | mesmo `domain`, `core/sdk`, `core/query`, `@cognite/sdk`, react-query | páginas/componentes, `presentation/state`, infra de outro módulo |
| `modules/<bc>/presentation` | mesmo `domain`, mesma `presentation`, hooks de query injetados, `design-system`, `shared`, `app/host` (estado host-synced) | `CogniteClient`/HTTP direto, DTOs crus, internals de outro módulo |
| `modules/<bc>/<bc>.providers.tsx` | mesmo `domain`, mesma `infrastructure` | componentes/páginas de presentation |
| `modules/<bc>/<bc>.routes.tsx` | mesma `presentation`, providers do próprio módulo | internals de outro módulo |

> Sugestão de enforcement: configurar `eslint-plugin-import` (já presente no projeto) com
> `no-restricted-imports`/`import/no-restricted-paths` para falhar build quando uma regra
> acima for violada. A definir em uma feature de tooling.

---

## 10. Como isto ajuda na certificação Flows

| Critério (`flows-code-review`) | Como a arquitetura atende |
| --- | --- |
| 1.2 CDF só via SDK | Apenas `infrastructure` toca `@cognite/sdk`; presentation isolada |
| 1.6 Padrões e testabilidade | DI via Context + ViewModel; domínio/infra mockáveis |
| 2.1 Padrões DMS | `queries/` concentra leitura; usa query/search apropriados |
| 2.2 Filtragem server-side | Filtros/limites/projeções no request, em `infrastructure` |
| 2.3 Limites e paginação | Limites explícitos nas queryFns |
| 2.5 Backoff/jitter em 429 | Política central em `core/query` herdada por todos os módulos |
| 3.1 Aura | `design-system/` implementa o IP **sobre** o Aura; sem recriar primitivos Aura |
