# ADR 0001 — Adaptar a arquitetura DDD/Clean (base Angular) para React + Cognite Flows

- **Status:** Aceito
- **Data:** 2026-06-02
- **Decisores:** time-grupo-1 (papel: arquiteto)
- **Contexto SDD:** decisão durável e transversal; documentada em `docs/architecture/`,
  não em um spec de feature.

---

## Contexto

Recebemos como base inicial uma proposta de arquitetura **DDD + Clean Architecture +
SOLID** escrita para **Angular** (standalone components, signals, RxJS, `app.routes.ts`,
uma pasta `design-system/` própria, adapters de API REST com DTOs). O objetivo é construir
o app **sobre o Cognite Flows**, cuja stack e diretrizes são diferentes:

- React 18 + TypeScript + Vite + Vitest.
- `@cognite/aura` já fornece o design system.
- `@cognite/app-sdk` integra ao host Fusion (auth, navegação, estado host-synced).
- `@cognite/sdk` é o único caminho para o CDF/Data Models (DMS) — não há API REST própria.
- `@tanstack/react-query` para estado de servidor.
- Diretrizes obrigatórias em `AGENTS.md` (DI, ViewModel, test-first, ≥80% cobertura) e nos
  skills de certificação (`flows-code-review`, `flows-design-review`).

A filosofia da base é sólida e desejável; o vocabulário tecnológico precisa ser traduzido.

---

## Decisão

Adotar a **filosofia** da base (regra de ouro, módulos por bounded context, domínio puro,
DTOs não vazam, fronteiras explícitas) e **traduzir** as peças específicas de Angular para
os equivalentes idiomáticos do Flows.

### Decisões pontuais

1. **Design system próprio (IP) implementado SOBRE o `@cognite/aura`.** Mantemos o **IP
   Design System** (`docs/design/`) como contrato de marca; no app Flows ele vive em
   `design-system/` e é construído **sobre** o Aura (tokens + tema + componentes IP), não
   do zero. Aura é a fundação de primitivos; o `design-system/` é a camada IP por cima.
   Regra: usar componentes Aura quando cobrem a necessidade; criar no `design-system/`
   quando o Aura **não** cobre (KPI card, sidebar expansível, gráficos uPlot) ou a marca
   exige composição/tema consistente. Não copiar os widgets Angular verbatim
   (ver `docs/Design.md`).
2. **Signals/RxJS de view → react-query + estado host-synced + React state.** Estado de
   servidor é react-query; estado navegável é host-synced (`app-sdk`); estado efêmero é
   local. Decisão guiada por `AGENTS.md` §2.
3. **Facades/DI Angular → DI via React Context + ViewModel hooks.** `use<X>ViewModel`
   orquestra; componentes só renderizam; o estado vive numa storage layer (`AGENTS.md` §5).
4. **Adapters de API REST/DTO → CDF repository via `@cognite/sdk`.** "DTO" = instância de
   _view_ DMS, só em `infrastructure/dto`; mappers traduzem para o domínio. Apenas
   `infrastructure` toca o `CogniteClient` (`flows-code-review` 1.2).
5. **Navegação: `app.routes.ts` (router) → estado host-synced, sem router.** O host Fusion
   é dono da URL; trocamos de view por um campo host-synced. react-router só se surgirem
   muitas rotas deep-linkáveis independentes.
6. **react-query: infra-owned, exposto via DI.** `queryKeys`/`queryFn`/`mutationFn` em
   `infrastructure/queries` chamam o repositório; hooks de query são injetados na
   presentation via Context. Política de backoff+jitter (429) em `core/query`.
7. **Documentação: `docs/architecture/` (durável), não `specs/`.** Specs de feature
   referenciam esta arquitetura; não a redefinem. Ponteiros em `AGENTS.md` e na governança
   SDD.
8. **Bounded context inicial provisório: `checklists`.** Nome definitivo será travado ao
   preencher `SPEC.md` (seção Data Models & CDF Integration). A estrutura é estável
   independente do nome.

---

## Consequências

**Positivas**

- Aderência às diretrizes obrigatórias do Flows → caminho mais curto para certificação.
- Domínio puro e infraestrutura isolada → alta testabilidade (gate ≥80%).
- IP Design System sobre Aura → marca consistente com menos UI do zero, melhor nota em `flows-design-review` Q1.
- Fronteiras explícitas → módulos evoluem sem acoplamento cruzado.

**Custos / riscos**

- O scaffold atual (`src/lib/App.tsx`) ainda não segue a estrutura-alvo; a migração será
  feita incrementalmente por features SDD (não há big-bang).
- Regras de import dependem de disciplina até configurarmos enforcement por ESLint
  (`import/no-restricted-paths`) — item de tooling futuro.
- O domínio frontend não deve duplicar invariantes autoritativas do CDF; exige critério
  sobre o que é regra client-side vs server-side.

**Itens em aberto (a resolver em features futuras)**

- Modelagem de domínio real e nomes definitivos de bounded context (via `SPEC.md`).
- Configuração de enforcement de regras de import no ESLint.
- Eventual `modules/diagnostics` se houver tela técnica de status.

---

## Alternativas consideradas

| Alternativa | Por que não |
| --- | --- |
| Copiar os widgets Angular/Material do catálogo IP 1:1 (signals, router, Material) | Conflita com Aura, `app-sdk` e `AGENTS.md`; o IP Design System deve ser **reimplementado sobre o Aura**, não portado verbatim |
| Colocar a arquitetura em `specs/` | Arquitetura é durável e transversal, não uma feature; geraria duplicação a cada feature |
| react-query direto na presentation | Vazaria detalhes de dados/SDK para a UI e dificultaria os mocks; fere a regra de ouro |
| react-router desde já | Redundante com o estado host-synced que o host serializa na URL |
