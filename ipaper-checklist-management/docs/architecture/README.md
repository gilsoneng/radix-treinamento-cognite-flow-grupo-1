# Arquitetura de Software — ipaper-checklist-management (Cognite Flows)

> Referência **durável e transversal** da arquitetura deste app. Não é um spec de
> feature: as features (em `specs/<NNN>-<slug>/`) **consomem** estas regras, não as
> redefinem. Estilo arquitetural: **DDD + Clean Architecture + SOLID**, adaptado à
> stack do Cognite Flows.

---

## 1. Para que serve este pacote

| Documento | O que define |
| --- | --- |
| [`README.md`](README.md) (este) | Princípios, regra de ouro, diagrama de dependências, glossário |
| [`folder-structure.md`](folder-structure.md) | Estrutura de pastas completa de `src/`, anotada |
| [`layers.md`](layers.md) | Responsabilidades por camada + tabela de regras de import |
| [`adr/`](adr/) | Architecture Decision Records (decisões e seu "porquê") |

Leia também, como **fonte de verdade de padrões de código**: [`../../AGENTS.md`](../../AGENTS.md).
A arquitetura aqui descreve **onde** o código mora e **como** as dependências fluem; o
`AGENTS.md` descreve **como** escrever cada peça (DI, ViewModel, test-first, TypeScript).

---

## 2. Contexto de stack

Este app roda **embarcado no host Fusion** e é a única fronteira de UI sobre o CDF.

| Camada técnica | Tecnologia | Papel arquitetural |
| --- | --- | --- |
| UI framework | **React 18 + TypeScript + Vite** | Camada de apresentação |
| Fundação de UI | **`@cognite/aura`** | Biblioteca de primitivos + tema base — a **fundação** sobre a qual construímos |
| Design system (próprio) | **IP Design System** | Tokens de marca IP, tema e componentes IP **construídos sobre o Aura** (contrato em [`../design/`](../design/)) |
| Host integration | **`@cognite/app-sdk`** | Auth (`CogniteSdkProvider`), navegação, estado host-synced |
| Acesso a dados | **`@cognite/sdk`** | Único caminho para o CDF/Data Models (DMS) |
| Estado de servidor | **`@tanstack/react-query`** | Cache, dedup, retry/backoff |
| Testes | **Vitest + Testing Library** | Gate de cobertura ≥ 80% (certificação Flows) |

Implicação central: **o "backend" é o CDF**. Não há API REST própria. "DTOs" são
instâncias de _views_ DMS; "repositórios" leem/escrevem via `@cognite/sdk`.

---

## 3. Princípios (norte arquitetural)

1. **Módulos por bounded context, não por tela.** Um módulo representa uma capacidade
   de negócio estável (`modules/<bounded-context>/`), não o layout de uma página.
2. **Domínio primeiro.** Modelos, contratos de repositório, value objects e regras
   client-side definem o vocabulário do módulo, em **TypeScript puro**.
3. **Infraestrutura é detalhe.** O `@cognite/sdk`, instâncias DMS, mappers e caches
   ficam atrás de contratos de domínio.
4. **Apresentação é a fronteira de entrada (inbound).** Páginas, componentes,
   ViewModels e estado de UI vivem em `presentation/`.
5. **DTOs não vazam para a UI.** Instâncias DMS são mapeadas para modelos de domínio/view
   em `infrastructure/mappers` **antes** de a apresentação enxergá-las.
6. **Páginas finas.** Componentes só renderizam; a lógica vive em `use<X>ViewModel`
   (`AGENTS.md` §5).
7. **Domínio frontend é client-side.** Não duplicar invariantes do CDF que devem
   permanecer autoritativas no servidor; o domínio aqui é vocabulário de UI + regras leves.
8. **Fronteiras explícitas.** Um módulo não importa internals de outro; composição
   cross-context vive em uma página/ViewModel pai ou numa pequena camada de integração.
9. **`core/` é só infraestrutura técnica global.** SDK, políticas de query, errors,
   boundaries — nada de modelo de negócio.
10. **IP Design System sobre Aura.** Possuímos um design system próprio (o **IP Design
    System**, contrato em [`../design/`](../design/)), implementado **sobre** o
    `@cognite/aura`: tokens de marca, tema e componentes IP vivem em `design-system/`.
    Regra: usar componentes Aura quando cobrem a necessidade; criar um componente no
    `design-system/` quando o Aura **não** cobre (ex.: KPI card com drill-down, sidebar
    expansível, gráficos uPlot) ou quando a marca IP exige composição/tema consistente.
    Não recriar primitivos que o Aura já oferece nem copiar widgets Angular verbatim
    (ver [`../Design.md`](../Design.md)).
11. **DI em tudo que tem estado.** Serviços, clients e hooks de dados são injetados via
    React Context ou factory overrides (`AGENTS.md` §3) — testabilidade é requisito.
12. **Estado segue a regra do host.** O que deve sobreviver a reload/link compartilhado
    é **host-synced** (`app-sdk`); estado efêmero é local; estado de servidor é react-query
    (`AGENTS.md` §2).
13. **Test-first espelha risco.** Mappers, ViewModels/estado, componentes críticos,
    guards e regras de domínio têm teste de comportamento real (`AGENTS.md` §6).

---

## 4. A regra de ouro (dependências apontam para dentro)

```txt
presentation  ─────────────▶  domain
infrastructure ────────────▶  domain
composition (providers/routes) ─▶ presentation + infrastructure + domain
core / ui / shared ────────▶  (técnico; não dependem de modules)
```

Restrições inegociáveis:

- **`domain`** não importa React, `@cognite/sdk`, `@cognite/app-sdk`, react-query,
  config de ambiente nem browser APIs. É TS puro e testável isoladamente.
- **`infrastructure`** é o **único** lugar que toca o `CogniteClient`/DMS. Implementa
  contratos de `domain` e traduz payloads externos para modelos de domínio.
- **`presentation`** consome contratos de `domain` e hooks injetados via DI; **nunca**
  usa `HttpClient`/`CogniteClient` direto nem manipula instância DMS crua.
- **arquivos de composição** (`<bc>.providers.tsx`, `<bc>.routes.tsx`) ligam a
  implementação de infraestrutura à apresentação via Context.

---

## 5. Diagrama de dependências (visão de módulo)

```txt
            ┌─────────────────────────────────────────────┐
            │              app/  (composição raiz)         │
            │  App.tsx · host · providers · routing        │
            └───────────────┬─────────────────────────────┘
                            │ injeta
        ┌───────────────────▼───────────────────┐
        │        modules/<bounded-context>/      │
        │                                        │
        │   presentation ───▶ domain ◀─── infrastructure
        │   (React/VM)        (TS puro)     (Cognite SDK / DMS)
        │        ▲                               │
        └────────┼───────────────────────────────┼──────────┘
                 │ usa Aura/UI                    │ usa
     ┌──────────┴────────┐               ┌───────▼────────┐
     │ design-system/    │               │ core/ (sdk,    │
     │  (IP sobre Aura)  │               │ query, errors) │
     │ shared/           │               └────────────────┘
     └───────────────────┘
```

- A apresentação fala com o domínio (contratos) e com `design-system/`/`shared/`.
- A infraestrutura implementa o domínio e usa `core/sdk` + `core/query`.
- Os módulos **nunca** importam internals uns dos outros.

---

## 6. Glossário (ubiquitous language técnico)

| Termo | Significado neste repo |
| --- | --- |
| **Bounded context / módulo** | Capacidade de negócio durável em `modules/<bc>/`. Fronteira de propriedade. |
| **Repository (domínio)** | Interface em `domain/*.repository.ts`; abstrai como os dados são lidos/escritos. |
| **CDF repository (infra)** | Implementação do contrato via `@cognite/sdk` em `infrastructure/`. |
| **DTO** | Forma crua de uma instância de _view_ DMS. Só existe em `infrastructure/dto`. |
| **Mapper** | Tradutor DMS ↔ modelo de domínio/view, em `infrastructure/mappers`. |
| **ViewModel** | Hook `use<X>ViewModel` que orquestra domínio + estado e expõe dados prontos. |
| **Estado host-synced** | Estado serializado na URL pelo host Fusion via `syncInternalState`/`initialState`. |
| **Storage layer** | Onde o estado realmente vive (Context/store); o ViewModel é stateless. |

---

## 7. Status

- **Fase:** exemplo de implementação da estrutura-alvo (treinamento / validação arquitetural).
- **Exemplo em código:** módulo `health` — smoke test listando `CogniteAsset` via Core DM; **não** faz parte da entrega da spec `001-checklist-management`.
- **Bounded context de produto (futuro):** checklist / inspeções — nome e views DMS a definir em `002+` e `SPEC.md`.
- **Código atual:** `src/` segue domain / infrastructure / presentation em `modules/health/`; shell IP em `design-system/layout/page-shell/`; composição em `App.tsx` + `app/providers/`.
- **Ainda planejado (não implementado):** `app/host/` (host-synced), `app/routing/`, sidebar IP, módulos de negócio checklist.
