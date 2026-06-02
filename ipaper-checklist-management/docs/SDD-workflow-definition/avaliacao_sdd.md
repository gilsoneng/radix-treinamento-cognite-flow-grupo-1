# Avaliação e adoção SDD — `ipaper-checklist-management`

> Documento operacional para humanos e **agentes de código**. Contém decisões e ações por fase: **0** (decisões), **1** (governança), **2** (estrutura `specs/`), **3** (gate CI + scripts), **4** (piloto e strict).
> Proposta de referência: [`proposta-spec-driven-development.md`](proposta-spec-driven-development.md).

**Última atualização:** 2026-06-02  
**Status:** Fases **0-2 implementadas** no repo (governança, `specs/`, `001` baseline). Fase 3 (scripts + CI gate) a implementar sob demanda. Fase 4 (piloto) após Fase 3.

---

## Como usar este arquivo (agentes)

1. Leia a seção relevante **antes** de alterar comportamento em `src/`.
2. Execute as ações na ordem listadas (Verificar → Criar/Atualizar → Validar).
3. Não invente caminhos alternativos (`spec/` em vez de `specs/`, gate strict no dia 1, etc.) salvo instrução explícita do usuário.
4. Em dúvida sobre rigor (completo vs leve), classifique o PR conforme a tabela em **Níveis de rigor** e peça confirmação se impacto for ambíguo.

---

## 1. Pasta de specs por feature

### Definição

- Pasta oficial: **`ipaper-checklist-management/specs/`** (mesmo nível que `SPEC.md`, `src/`, `AGENTS.md`).
- Convenção de feature: `specs/<NNN>-<slug>/` onde `NNN` = três dígitos (`001`, `002`, …) e `slug` = kebab-case minúsculo (`checklist-management`).
- **Não usar** `spec/` — incompatível com Cognite Flows, spec-kit e skill `flows-app-brief` (que lê `specs/<NNN>/spec.md`).
- Spec macro do produto permanece em **`SPEC.md`** na raiz do app (não mover para `specs/`).

### Ação do agente

| Passo | Ação |
| --- | --- |
| 1 | **Verificar** se existe o diretório `specs/` na raiz do app (`ipaper-checklist-management/specs/`). |
| 2 | Se **não existir**, **criar** `specs/` e, na primeira implementação SDD, também `specs/README.md`, `specs/CONSTITUTION.md`, `specs/_templates/` (ver seção 8). |
| 3 | **Verificar** se a feature solicitada já tem pasta `specs/<NNN>-<slug>/` (listar diretórios que casam com `/^\d{3}-[a-z0-9-]+$/`). |
| 4 | Se for **nova feature**, alocar o próximo `NNN` sequencial (maior existente + 1, ou `001` se vazio) e **criar** a pasta com os artefatos exigidos pelo nível de rigor (seção 3). |
| 5 | Ao referenciar specs em commits/PR, usar caminho `specs/<NNN>-<slug>/` no título ou corpo (ex.: `feat(checklist): FR-002 filter panel (specs/002-filter-panel)`). |
| 6 | **Nunca** criar duplicata em `spec/` ou na raiz do monorepo sem alinhamento explícito do time. |

---

## 2. Gate CI (dois níveis)

### Definição

| Modo | Variável / script | Comportamento |
| --- | --- | --- |
| **Informativo (padrão)** | `SPEC_GATE_MODE=warn` ou `npm run spec:check` | Lista violações; **não falha** o CI (exit 0). Adoção: primeiras 1–2 sprints após introdução do gate. |
| **Bloqueante (strict)** | `npm run spec:check:strict` ou CI com label PR **`sdd-strict`** | Violações → exit 1. **Não** é padrão no CI; ver §37 e Fase 4. |

**Escopo do gate:** mudanças em `src/` (`.ts`, `.tsx`) exigem referência em `specs/`; validações de artefatos e rastreabilidade FR conforme modo.

**Fora do escopo do gate (passa sem spec de feature):** apenas `docs/`, `*.md` na raiz, CI, deps, `references/`, arquivos de review `reviews/`, config sem mudança de comportamento em `src/`.

### Ação do agente

| Passo | Ação |
| --- | --- |
| 1 | Antes de abrir PR com mudança em `src/`, **verificar** se existe pasta/arquivos em `specs/` para a feature (ver seção 1). |
| 2 | Se `scripts/spec-check.mjs` existir, rodar `npm run spec:check` localmente e corrigir avisos. |
| 3 | Ao configurar CI (quando implementado), **garantir** passo após `build` com `SPEC_GATE_MODE=warn` por padrão; documentar no PR como ativar `strict`. |
| 4 | **Não** alterar o CI para `strict` sem instrução explícita do usuário/time. |
| 5 | Se o gate ainda não existir no repo, tratar as regras deste arquivo como **checklist manual** até Fase 3 da implementação. |

---

## 3. Etapas do ciclo (7 completas / 3 leves)

### Definição — fluxo completo (7 etapas)

Usar para features com impacto em **comportamento**, **CDF/DMS**, **UX visível**, **dados** ou **arquitetura**.

| # | Etapa | Artefato principal | Gate (fechar etapa) |
| --- | --- | --- | --- |
| 1 | Specify | `spec.md` | Sem placeholders `<!-- -->`; todo `FR-###` testável |
| 2 | Clarify | `research.md` | Sem perguntas bloqueantes abertas |
| 3 | Plan | `plan.md` | Cada `FR` mapeado a componente/serviço |
| 4 | Tasks | `tasks.md` | Cada tarefa cita `FR-###` e prevê teste |
| 5 | Implement | código + testes | `lint`, `test`, `build` verdes; sem `any`/`as` (AGENTS.md §7) |
| 6 | Validate | testes + reviews | Matriz FR→teste; `flows-code-review` e `flows-design-review` quando aplicável |
| 7 | Done | `SPEC.md` + índice | `SPEC.md` macro e `specs/README.md` atualizados; PR Conventional referencia feature |

### Definição — fluxo leve (3 etapas)

Usar para mudanças **pequenas** em `src/`: bugfix, copy, estilo sem nova regra de negócio, refactor interno sem novo FR.

| # | Etapa leve | Equivalente | Artefatos mínimos |
| --- | --- | --- | --- |
| L1 | Specify | Etapas 1–2 | `spec.md` (delta: FR ou nota de escopo) + linha em `progress.md` |
| L2 | Tasks | Etapa 4 | `tasks.md` (1–3 tarefas) **ou** seção “Tasks” dentro de `spec.md` |
| L3 | Implement | Etapas 5–7 | Código + teste; atualizar matriz FR→teste em `progress.md` |

**Não exigir** `plan.md` nem `research.md` no fluxo leve, salvo decisão técnica não trivial (nesse caso, promover para fluxo completo).

### Ação do agente

| Passo | Ação |
| --- | --- |
| 1 | Classificar o trabalho: **completo** ou **leve** (tabela abaixo). |
| 2 | **Verificar** `specs/<NNN>-<slug>/progress.md` (criar se não existir no fluxo leve). |
| 3 | Atualizar checklist de etapas em `progress.md` (`done` / `in-progress` / `not-started`) com data e, se houver, link do PR. |
| 4 | No fluxo completo, **não** pular para Implement sem `spec.md` estável e `tasks.md` com FRs citados. |
| 5 | Ao fechar etapa 7, **atualizar** `SPEC.md` se comportamento visível ou modelo CDF mudou (AGENTS.md §0). |

**Classificação rápida**

| Situação | Rigor |
| --- | --- |
| Nova tela, fluxo, integração CDF, permissão, contrato de API | Completo |
| Bug com regressão test | Leve (ou Completo se mudar contrato) |
| Só CSS/copy/aria sem novo FR | Leve; pode usar exceção (seção 4) |
| Spike/exploração | Exceção documentada |

---

## 4. Exceções (sem feature spec completa)

### Definição

Permitido **sem** nova pasta `specs/NNN-*` apenas quando:

- Mudança **não** altera arquivos em `src/`, **ou**
- É chore/documentação/CI/deps, **ou**
- Spike com prazo acordado: registrar em `specs/README.md` ou issue com label `sdd-exception` e motivo.

### Ação do agente

| Passo | Ação |
| --- | --- |
| 1 | Se tocar `src/` sem spec, **parar** e perguntar ao usuário ou criar entrada mínima (fluxo leve). |
| 2 | Se exceção aprovada, **documentar** uma linha em `specs/README.md` (tabela “Exceções”) com PR, motivo e data. |
| 3 | **Não** silenciar falha do gate strict sem exceção registrada. |

---

## 5. Matriz FR → teste

### Definição

- Em `progress.md`, seção **Matriz de rastreabilidade (FR → teste)**.
- Formato por linha: `FR-### -> caminho/do/teste.test.tsx — passing|failing|pending`.
- Cada `FR-###` em `spec.md` deve ter **pelo menos** um teste associado antes de `status: done` na feature.
- Em modo **strict**, CI/gate valida presença da matriz quando `progress.md` indica `done`.

### Ação do agente

| Passo | Ação |
| --- | --- |
| 1 | Ao implementar FR, **criar/atualizar** teste primeiro (AGENTS.md §6 Test-First). |
| 2 | **Atualizar** a matriz no mesmo PR que entrega o código. |
| 3 | **Verificar** que o identificador no nome ou corpo do teste referencia o FR quando possível (ex. `describe('FR-001: ...')`). |
| 4 | Antes de marcar feature `done`, **verificar** que não há linha `FR-###` sem teste ou com `pending` sem justificativa em `research.md`. |

---

## 6. Adoção

### Definição

| Escopo | Regra |
| --- | --- |
| Features **novas** (a partir da adoção SDD) | Fluxo conforme rigor (completo ou leve); pasta em `specs/`. |
| Código **legado** (antes do SDD) | Uma feature retroativa **`specs/001-checklist-management/`** documenta o estado atual / épico baseline; não reescrever todo o passado em múltiplas pastas. |
| Certificação Flows | `App-Brief.md`, `reviews/code-review`, `reviews/design-review` **permanecem** obrigatórios para submit; SDD não substitui esses artefatos (ver seção 7). |

### Ação do agente

| Passo | Ação |
| --- | --- |
| 1 | Para trabalho novo, **criar** nova pasta `specs/00N-*` em vez de só editar `001` indefinidamente. |
| 2 | Para entender o app, **ler** `specs/001-checklist-management/spec.md` (quando existir) e `SPEC.md`. |
| 3 | Antes de `flows-external-app-submit`, **verificar** gates de certificação (seção 7), independente do SDD. |

---

## 7. Certificação Flows vs SDD (sem duplicar)

### Definição

| Artefato | Pergunta que responde | Agente deve |
| --- | --- | --- |
| `App-Brief.md` | Para quem é o app, problema, sucesso | Ler antes de features; não copiar texto integral para cada `spec.md` |
| `SPEC.md` | Visão macro, CDF global, FRs de produto | Sincronizar quando comportamento visível mudar |
| `specs/NNN/spec.md` | O quê/por quê **desta entrega** | Criar/atualizar por feature |
| `specs/NNN/plan.md` | Como técnico da feature | Só fluxo completo |
| `reviews/code-review/` | Qualidade código (12 critérios, 80% coverage) | Rodar skill `flows-code-review`; Must Fix = 0 |
| `reviews/design-review/` | UX (10 perguntas, média ≥ 3.8) | Rodar skill `flows-design-review` após code review |
| `progress.md` | Status etapas + matriz FR→teste | Manter por feature; não repetir relatório de review |

### Ação do agente

| Passo | Ação |
| --- | --- |
| 1 | **Não** colar relatórios de review dentro de `spec.md`; linkar PR/commit em `progress.md`. |
| 2 | Na etapa 6 (Validate), **executar** ou lembrar o usuário de executar skills de review conforme escopo da mudança. |
| 3 | Em `plan.md`, **referenciar** seções do `AGENTS.md` (§2 host-sync, §3 DI, §5 ViewModel, §6 Test-First) em vez de reescrever padrões. |

---

## 8. Estrutura alvo em `specs/` (quando implementar Fase 2)

### Definição

```
specs/
  README.md              # índice + exceções + decisão specs/
  CONSTITUTION.md        # DoR/DoD + princípios (aponta AGENTS.md)
  _templates/
    spec.md
    plan.md
    tasks.md
    research.md
    progress.md
  001-checklist-management/
    spec.md
    plan.md
    tasks.md
    research.md
    progress.md
```

### Ação do agente

| Passo | Ação |
| --- | --- |
| 1 | Se o usuário pedir “implementar SDD” ou “Fase 2”, **verificar** árvore acima. |
| 2 | **Criar** faltantes a partir de `_templates/` (copiar e substituir `<NNN>`, `<slug>`, placeholders). |
| 3 | Preencher `001-checklist-management` com estado real do app (não deixar só template vazio). |
| 4 | Scripts `spec:check` / `spec:check:strict` / `spec:new` — ver **Fase 3** (§32–38); na Fase 2 usar cópia manual de `_templates/`. |

---

## 9. Markdownlint

### Definição

- **Adiado** — não adicionar `markdownlint` nem gate de markdown no CI até decisão futura do time.
- Agentes podem corrigir formatação óbvia manualmente, sem nova devDependency.

### Ação do agente

| Passo | Ação |
| --- | --- |
| 1 | **Não** instalar `markdownlint` nem criar workflow só para MD salvo pedido explícito. |
| 2 | Manter tabelas e listas legíveis em specs por convenção, não por linter. |

---

## 10. Artefatos por feature (referência rápida)

| Arquivo | Fluxo completo | Fluxo leve |
| --- | --- | --- |
| `spec.md` | Obrigatório | Obrigatório |
| `plan.md` | Obrigatório | Opcional |
| `tasks.md` | Obrigatório | Obrigatório (ou seção em spec.md) |
| `research.md` | Obrigatório | Opcional |
| `progress.md` | Obrigatório | Obrigatório |

### Ação do agente

Antes de merge: **listar** arquivos em `specs/<NNN>-<slug>/` e confirmar conjunto mínimo da coluna correta na tabela acima.

---

## 11. Checklist de PR (agente / humano)

Copiar no corpo do PR quando houver mudança em `src/`:

- [ ] Feature: `specs/<NNN>-<slug>/`
- [ ] Rigor: completo / leve / exceção (motivo: ___)
- [ ] `spec.md` sem placeholders; FRs testáveis
- [ ] `tasks.md` (ou seção) cita FRs deste PR
- [ ] Matriz FR→teste atualizada em `progress.md`
- [ ] `npm test` + `npm run lint` + `npm run build` verdes
- [ ] `SPEC.md` atualizado se comportamento visível ou CDF mudou
- [ ] Gate: `npm run spec:check` (warn) sem surpresas

---

## Decisões Fase 0 (registro)

| Tema | Decisão |
| --- | --- |
| Pasta | `ipaper-checklist-management/specs/` |
| Gate CI | Dois níveis: **warn** (padrão) → **strict** (após piloto) |
| Etapas | 7 (completo) + 3 (leve), conforme seção 3 |
| Matriz FR→teste | Obrigatória para feature `done`; validada em strict |
| Adoção | Novas features em `specs/`; legado em `001-checklist-management` |
| Markdownlint | Adiar |

---

# Fase 1 — Governança e documentação

Objetivo: tornar o SDD **encontrável**, **sem duplicar** certificação Flows, e **ligado** a `AGENTS.md` / `SPEC.md` / skills. A Fase 1 **não** exige pasta `specs/` preenchida nem CI gate (isso é Fase 2–3).

---

## 12. Documento `docs/SDD-workflow-definition/sdd-governance.md`

### Definição

- Criar **`docs/SDD-workflow-definition/sdd-governance.md`** como entrada **curta** para humanos: resumo de 1 página + links.
- Conteúdo canônico detalhado permanece em **`avaliacao_sdd.md`** (este arquivo) para agentes.
- `sdd-governance.md` deve conter: decisões Fase 0, tabela completo/leve/exceção, link para certificação, link para proposta, e “quando ler o quê”.
- Evitar dois documentos longos com texto duplicado — governance = índice; avaliacao_sdd = playbook.

### Ação do agente

| Passo | Ação |
| --- | --- |
| 1 | **Verificar** se `docs/SDD-workflow-definition/sdd-governance.md` existe. |
| 2 | Se **não existir** e o usuário pedir “implementar Fase 1”, **criar** o arquivo com: título, link para `../avaliacao_sdd.md`, tabela de rigor (copiar da seção 3), fluxo de certificação (diagrama ou lista da seção 18), decisões Fase 0. |
| 3 | **Não** copiar todas as 300+ linhas de `avaliacao_sdd.md` — manter governance com **≤ 120 linhas**. |
| 4 | Ao alterar regras SDD, **atualizar primeiro** `avaliacao_sdd.md`; depois ajustar o resumo em `sdd-governance.md` se o resumo estiver desatualizado. |

---

## 13. Atualizar `docs/SDD-workflow-definition/proposta-spec-driven-development.md`

### Definição

- A proposta deixa de ser “rascunho com pontos em aberto” e passa a **refletir decisões adotadas** (Fase 0).
- Substituir referências `spec/` por **`specs/`** em diagramas, tabelas e exemplos de script (`spec-check`).
- Seção 9 (“Pontos em aberto”) → renomear para **“Decisões adotadas”** com tabela alinhada à seção “Decisões Fase 0” deste arquivo.
- Adicionar nota no topo: *Implementação operacional: `avaliacao_sdd.md` + `docs/SDD-workflow-definition/sdd-governance.md`*.
- Manter a proposta como documento de **contexto e motivação**; não duplicar todas as ações de agente.

### Ação do agente

| Passo | Ação |
| --- | --- |
| 1 | **Ler** `docs/SDD-workflow-definition/proposta-spec-driven-development.md` e **buscar** `spec/` (sem ‘s’) — substituir por `specs/` onde for caminho de pasta. |
| 2 | **Atualizar** o diagrama mermaid “Depois - SDD”: nó `spec/NNN` → `specs/NNN`. |
| 3 | **Reescrever** seção 9 com decisões fechadas (pasta, gate 2 níveis, etapas, matriz, adoção, markdownlint adiado). |
| 4 | **Ajustar** exemplo `spec-check.mjs`: paths `specs/` e `src/` relativos à raiz do app (não prefixo `ipaper-checklist-management/` no diff, se CI roda dentro do app). |
| 5 | **Alterar** status do documento para: *“Aprovada para adoção — ver avaliacao_sdd.md”*. |
| 6 | **Não** remover histórico útil (gates, 7 etapas, mapeamento certificação); só alinhar nomenclatura e decisões. |

---

## 14. `AGENTS.md` — nova seção §10 (SDD workflow)

### Definição

- Inserir **`## 10. Spec Driven Development workflow`** antes da seção atual §9 Commits (renumerar Commits para **§11**).
- §10 deve ser **curto** (≤ 25 linhas) e apontar para:
  - `avaliacao_sdd.md` — regras e ações de agente;
  - `docs/SDD-workflow-definition/sdd-governance.md` — resumo humano;
  - `specs/` — toda mudança de **comportamento** em `src/` começa por feature spec (completo ou leve).
- Regras mínimas embutidas em §10:
  - Ler `SPEC.md` + spec da feature antes de implementar.
  - Test-First e matriz FR→teste não são opcionais para feature `done`.
  - Certificação (`flows-code-review`, `flows-design-review`) continua obrigatória para submit.

### Ação do agente

| Passo | Ação |
| --- | --- |
| 1 | **Verificar** se `AGENTS.md` já contém `## 10. Spec Driven Development`. |
| 2 | Se **não existir** e usuário pedir Fase 1, **inserir** §10 e **renumerar** §9 Commits → §11 (ajustar referências cruzadas se houver). |
| 3 | **Verificar** `CLAUDE.md` — deve continuar apontando para `AGENTS.md` (uma linha; sem alteração se já correto). |
| 4 | Em toda tarefa de código com mudança em `src/`, **tratar** §10 como obrigatório após implementação da Fase 1. |

---

## 15. `specs/CONSTITUTION.md` (princípios e DoR/DoD)

### Definição

- Arquivo **`specs/CONSTITUTION.md`**: princípios invioláveis citáveis em `plan.md` / reviews.
- **Não reescrever** todo `AGENTS.md` — usar referências: “conforme AGENTS.md §3 DI”, etc.
- Incluir **Definition of Ready (DoR)** antes de Implement (etapa 5):
  - `spec.md` sem placeholders; FRs numerados; clarificações bloqueantes resolvidas em `research.md` (fluxo completo).
  - `tasks.md` com ordem Test-First e FR por tarefa.
  - Se CDF: seção Data Models preenchida em `spec.md` ou em `SPEC.md` macro.
- Incluir **Definition of Done (DoD)** antes de marcar feature `done`:
  - `lint` + `test` + `build` verdes.
  - Matriz FR→teste completa em `progress.md`.
  - `SPEC.md` macro atualizado se escopo visível/CDF mudou.
  - Para release/certificação: `Must Fix open: 0` e design `Average score ≥ 3.8` (quando reviews existirem).

### Ação do agente

| Passo | Ação |
| --- | --- |
| 1 | Na Fase 2, **criar** `specs/CONSTITUTION.md` a partir desta seção se ainda não existir. |
| 2 | Em `plan.md`, **citar** DoR/DoD por checklist `[ ]` copiado do CONSTITUTION. |
| 3 | Antes de Implement, **percorrer** DoR; antes de `status: done` em `progress.md`, **percorrer** DoD. |
| 4 | **Não** adicionar regras contraditórias ao `AGENTS.md` no CONSTITUTION — em conflito, prevalece `AGENTS.md`. |

---

## 16. Sincronização `SPEC.md` (macro) ↔ `specs/<NNN>/spec.md`

### Definição

| Nível | Escopo | Quando atualizar |
| --- | --- | --- |
| `SPEC.md` | Produto inteiro, CDF global, FRs de alto nível | Feature `done` que altera comportamento visível ou modelo de dados; ou acumulado de várias features |
| `specs/NNN/spec.md` | Incremento entregável | Cada feature/PR que introduz ou altera FRs daquela entrega |

**Regra de IDs:** FRs em feature spec podem ser locais (`FR-001` na pasta 002) mas devem **mapear** para requisito macro em `SPEC.md` quando existir (nota em `spec.md`: `Relates to SPEC FR-…` ou tabela de mapeamento em `progress.md`).

**Evitar:** copiar o `SPEC.md` inteiro para cada feature; evitar FRs só no código sem spec.

### Ação do agente

| Passo | Ação |
| --- | --- |
| 1 | Ao criar feature, **ler** `SPEC.md` e **extrair** só o delta necessário para `specs/NNN/spec.md`. |
| 2 | Se novo FR macro necessário, **atualizar** `SPEC.md` na mesma PR ou na PR que fecha etapa 7. |
| 3 | **Verificar** consistência: nenhum requisito em `spec.md` da feature contradiz `SPEC.md` ou `App-Brief.md`. |
| 4 | Se `SPEC.md` ainda só com placeholders `<!-- -->`, **priorizar** preenchimento (AGENTS.md §0) antes de feature grande. |

---

## 17. `App-Brief.md` e skill `flows-app-brief`

### Definição

- **`App-Brief.md`** = valor de negócio, persona, problema, critérios de sucesso do **app** (certificação Flows).
- **`specs/NNN/spec.md`** = entrega técnica incremental; não substitui o brief.
- Skill **`flows-app-brief`** pré-lê `specs/<NNN>/spec.md` quando existe — manter estrutura compatível (User Stories, FR-###, Success Criteria, CDF).
- Ordem recomendada para app novo em produção: `flows-app-brief` → preencher `SPEC.md` macro → features em `specs/`.

### Ação do agente

| Passo | Ação |
| --- | --- |
| 1 | Antes de certificação, **verificar** `App-Brief.md` com frontmatter obrigatório (skill `flows-external-app-submit`). |
| 2 | Ao preencher `specs/NNN/spec.md`, **reutilizar** linguagem do brief (persona, success criteria) sem colar o arquivo inteiro. |
| 3 | Se `App-Brief.md` ausente e usuário quer deploy certificado, **sugerir** rodar `flows-app-brief` antes de SDD pesado. |
| 4 | **Não** duplicar campos `userRole` / `successCriteria` em cada `research.md` — linkar: “Alinhado a App-Brief.md”. |

---

## 18. Fluxo de certificação Flows (quando executar)

### Definição

Ordem oficial (skills em `.agents/skills/`):

```
flows-app-brief → build → flows-code-review → flows-design-review → flows-external-app-submit
```

| Momento SDD | Skill / artefato |
| --- | --- |
| Início do app | `flows-app-brief` → `App-Brief.md` |
| Etapa 6 Validate (feature grande ou pré-submit) | `flows-code-review` → `reviews/code-review/feedback-round-N/` |
| Após Must Fix = 0 | `flows-design-review` → `reviews/design-review/feedback-round-N/` |
| Release | `flows-external-app-submit` (exige brief + reviews commitados) |

**SDD etapa 6 ≠ substituir code/design review** — SDD garante spec e rastreabilidade; reviews garantem rubrica Cognite (80% coverage, Aura, DMS, etc.).

### Ação do agente

| Passo | Ação |
| --- | --- |
| 1 | Para PR de feature completa próxima de release, **registrar** em `progress.md` etapa 6: links/paths dos relatórios `reviews/...`. |
| 2 | **Executar** ou recomendar `flows-code-review` quando mudança toca `src/` não trivial ou antes de submit. |
| 3 | **Não** marcar etapa 6 `done` só com testes locais se o escopo exige certificação e reviews estão pendentes. |
| 4 | Em `progress.md`, usar linha: `- 6 Validate — done — <data> — reviews/code-review round N, design round M`. |

---

## 19. `progress.md` — front-matter, etapas e evidências PR/CI

### Definição

**Front-matter obrigatório** (YAML entre `---`):

```yaml
feature: 002-filter-panel
status: in-progress   # not-started | in-progress | blocked | done
owner: nome-ou-time
updated: YYYY-MM-DD
rigor: completo       # completo | leve
```

**Corpo do arquivo:**

- Checklist das 7 etapas (ou 3 se leve) com status, data, **link PR** quando existir.
- Seção **Matriz FR → teste** (seção 5).
- **Não** colar logs de CI nem relatórios inteiros de review — usar links/evidências.

**Evidências preferidas em vez de prosa longa:**

| Evidência | Onde registrar |
| --- | --- |
| PR | `progress.md` linha da etapa: `PR #N` |
| CI verde | “CI green @ commit `<sha>`” na etapa 5 ou 6 |
| Coverage | Referência ao output de `npm run test:coverage` ou code-review report |
| Review | Path `reviews/code-review/feedback-round-N/code-review-report.md` |

### Ação do agente

| Passo | Ação |
| --- | --- |
| 1 | Ao criar `progress.md`, **incluir** front-matter completo; validar `status` e `rigor` nos valores permitidos. |
| 2 | Ao abrir/fechar PR, **atualizar** etapa correspondente com link e data. |
| 3 | **Substituir** parágrafos longos por links (PR, commit, path de review) quando possível. |
| 4 | Se `status: done`, **exigir** matriz FR→teste preenchida (seção 5) antes de merge. |

---

## 20. Template de Pull Request (`.github/pull_request_template.md`)

### Definição

- Criar template na raiz do app: **`.github/pull_request_template.md`**.
- Conteúdo base: checklist da seção 11 + campo **Rigor** + campo **Feature** `specs/NNN-slug`.
- PRs só com `docs/` ou deps sem `src/` → checklist reduzida (marcar “sem mudança de comportamento”).
- Título Conventional Commit alinhado ao `AGENTS.md` §11 (após renumeração).

### Ação do agente

| Passo | Ação |
| --- | --- |
| 1 | **Verificar** se `.github/pull_request_template.md` existe. |
| 2 | Se ausente e Fase 1 implementada, **criar** com checklist da seção 11 e instrução: “Se alterou `src/`, preencha todos os itens SDD”. |
| 3 | Ao abrir PR (orientar usuário), **preencher** feature e rigor; não deixar checkboxes SDD vazios em PRs de código. |

---

## 21. Anti-padrões (o que o agente deve evitar)

### Definição

| Anti-padrão | Por que é problema | Correção |
| --- | --- | --- |
| Pasta `spec/` ou specs na raiz do monorepo | Quebra tooling Cognite | Usar `specs/` no app |
| `progress.md` só com “em andamento” sem etapas | Sem governança | Checklist de etapas + datas |
| FR sem teste em feature `done` | Rastreabilidade falsa | Matriz + Test-First |
| Copiar `code-review-report.md` em `spec.md` | Duplicação | Link em `progress.md` |
| Gate strict no primeiro dia | Fricção sem hábito | `warn` → piloto → `strict` |
| 5 arquivos vazios só para passar CI | Compliance vazio | DoR mínimo de conteúdo em `spec.md` / `tasks.md` |
| Novo FR só no código | Spec desatualizada | Atualizar `spec.md` no mesmo PR |
| Ignorar `SPEC.md` CDF | Falha em apps Flows | Preencher Data Models & CDF Integration |

### Ação do agente

| Passo | Ação |
| --- | --- |
| 1 | Antes de merge, **passar** pela tabela acima mentalmente. |
| 2 | Se detectar anti-padrão introduzido por edição anterior, **corrigir** no mesmo PR ou listar como débito em `research.md`. |
| 3 | **Alertar** o usuário se pedido violar anti-padrão (ex.: strict CI sem spec). |

---

## 22. Ordem de leitura recomendada (agente)

### Definição

Para tarefa de **implementação com mudança em `src/`**:

1. `avaliacao_sdd.md` (seções 1–7 + rigor aplicável)
2. `AGENTS.md` (§0 SPEC, §2–§7 conforme `plan.md`)
3. `SPEC.md` (macro)
4. `App-Brief.md` (se existir)
5. `specs/<NNN>-<slug>/spec.md` → `tasks.md` → `plan.md` (se completo)
6. Código existente relacionado em `src/`

Para tarefa só de **documentação SDD**: passos 1, 3, 5.

### Ação do agente

| Passo | Ação |
| --- | --- |
| 1 | **Não** gerar código de produção antes dos passos 1–5 para feature nova. |
| 2 | **Declarar** em 1–2 frases qual `NNN-slug` e rigor (completo/leve) antes de editar `src/`. |
| 3 | Se arquivos da feature não existem, **criar** estrutura mínima (Fase 2) ou pedir confirmação do slug. |

---

## 22b. Hierarquia de documentos (conflito de fonte de verdade)

### Definição

Em caso de conflito entre dois documentos, prevalece a hierarquia abaixo (maior número = menor precedência):

| Prioridade | Documento | Escopo |
| --- | --- | --- |
| 1 | `AGENTS.md` | Padrões de implementação (código, testes, TS, DI, ViewModel) |
| 2 | `specs/CONSTITUTION.md` | Processo SDD, DoR/DoD, princípios invioláveis |
| 3 | `SPEC.md` | Produto inteiro: visão, FRs macro, modelo de dados CDF |
| 4 | `specs/<NNN>/spec.md` | Escopo desta entrega: FRs locais, aceites, SC |
| 5 | `specs/<NNN>/plan.md` | Decisão técnica subordinada ao spec da feature |
| 6 | `avaliacao_sdd.md` | Playbook operacional e instruções de agente |

**Regras práticas:**
- `AGENTS.md` nunca é sobrescrito por `plan.md` ou `CONSTITUTION.md` — em conflito, o agente segue `AGENTS.md` e registra a divergência em `research.md`.
- `SPEC.md` macro nunca é contrariado por spec de feature — se houver conflito, abrir clarificação antes de implementar.
- `avaliacao_sdd.md` e `docs/SDD-workflow-definition/sdd-governance.md` são *como fazer* — não definem *o quê* construir.

### Ação do agente

| Passo | Ação |
| --- | --- |
| 1 | Ao detectar conflito entre documentos, **identificar** a camada de maior precedência e segui-la. |
| 2 | **Registrar** o conflito em `research.md` da feature como clarificação resolvida. |
| 3 | **Não** resolver conflito silenciosamente — sempre documentar a decisão. |

---

## 23. Critérios de conclusão da Fase 1 (implementação)

### Definição

Fase 1 está **implementada** quando todos existem e estão alinhados:

| # | Entregável | Critério |
| --- | --- | --- |
| 1 | `docs/SDD-workflow-definition/sdd-governance.md` | Existe, ≤ ~120 linhas, linka `avaliacao_sdd.md` |
| 2 | `docs/SDD-workflow-definition/proposta-spec-driven-development.md` | `specs/`, seção decisões, status aprovado |
| 3 | `AGENTS.md` | §10 SDD + §11 Commits |
| 4 | `avaliacao_sdd.md` | Fase 1 seções 12–23 (este bloco) |
| 5 | `.github/pull_request_template.md` | Checklist SDD (opcional recomendado: forte) |

**Fora do escopo da Fase 1:** `specs/` populado, `spec-check.mjs`, CI gate (Fases 2–3).

### Ação do agente

| Passo | Ação |
| --- | --- |
| 1 | Se usuário pedir “implementar Fase 1”, **percorrer** tabela e criar/alterar cada entregável faltante. |
| 2 | Ao finalizar, **listar** entregáveis com ✓/✗ e sugerir “Fase 2” para estrutura `specs/`. |
| 3 | **Atualizar** linha de status no topo de `avaliacao_sdd.md` para: *Fase 1 implementada* quando 1–4 estiverem ✓. |

---

## Decisões Fase 1 (registro)

| Tema | Decisão |
| --- | --- |
| Governança humana | `docs/SDD-workflow-definition/sdd-governance.md` (resumo) |
| Playbook agente | `avaliacao_sdd.md` (canônico) |
| Proposta | Atualizar paths e seção “Decisões adotadas” |
| AGENTS.md | Novo §10 SDD; Commits → §11 |
| CONSTITUTION | `specs/CONSTITUTION.md` na Fase 2, conteúdo definido na seção 15 |
| PR template | `.github/pull_request_template.md` |
| Certificação | SDD + reviews complementares, não substitutos |
| progress.md | Front-matter + links PR/CI, sem colar reviews |

---

# Fase 2 — Estrutura `specs/` e feature baseline

Objetivo: materializar a pasta **`specs/`**, templates reutilizáveis, **CONSTITUTION**, e **`001-checklist-management`** como linha de base do app. **Não** inclui CI gate nem `spec:new` (Fase 3).

**Pré-requisito:** Fase 1 implementada ou, no mínimo, `avaliacao_sdd.md` + decisões Fase 0 aceitas pelo time.

---

## 24. Árvore de diretórios `specs/` (obrigatória)

### Definição

Estrutura mínima após Fase 2:

```
specs/
  README.md
  CONSTITUTION.md
  _templates/
    spec.md
    plan.md
    tasks.md
    research.md
    progress.md
  001-checklist-management/
    spec.md
    plan.md
    tasks.md
    research.md
    progress.md
```

- `_templates/` **nunca** é numerada como feature (`001`, `002`).
- Nova feature: próximo `NNN` disponível; slug em kebab-case, descritivo do negócio (ex. `002-threshold-alerts`).

### Ação do agente

| Passo | Ação |
| --- | --- |
| 1 | **Verificar** árvore acima; listar o que falta. |
| 2 | **Criar** diretórios e arquivos ausentes na implementação Fase 2. |
| 3 | **Validar** nomes de pasta com regex `^\d{3}-[a-z0-9-]+$`; rejeitar `Spec`, `001_foo`, `1-foo`. |
| 4 | **Atualizar** tabela índice em `specs/README.md` ao criar `002+`. |

---

## 25. `specs/README.md` (índice global)

### Definição

Conteúdo obrigatório:

| Bloco | Conteúdo |
| --- | --- |
| Decisão de pasta | `specs/` adotado; link para `avaliacao_sdd.md` e `docs/SDD-workflow-definition/sdd-governance.md` |
| Índice de features | Tabela: ID, slug, status, owner, rigor (completo/leve) |
| Exceções SDD | Tabela: PR, motivo, data (seção 4) |
| Comandos | Referência a `npm run spec:check` (Fase 3) — pode ser “a configurar” até Fase 3 |

### Ação do agente

| Passo | Ação |
| --- | --- |
| 1 | **Criar** `specs/README.md` se não existir. |
| 2 | **Inserir** linha para `001-checklist-management` com status inicial `in-progress` ou `done` conforme preenchimento. |
| 3 | Ao abrir `002+`, **adicionar** linha no índice no **mesmo PR** que cria a pasta. |
| 4 | **Não** duplicar CONSTITUTION inteira no README — linkar `CONSTITUTION.md`. |

---

## 26. `specs/_templates/` (modelos)

### Definição

Cada template deve usar placeholders explícitos `{{NNN}}`, `{{slug}}`, `{{feature_title}}` para cópia manual (Fase 3 terá `spec:new`).

| Arquivo | Seções mínimas no template |
| --- | --- |
| `spec.md` | User Stories; Acceptance Scenarios (Given/When/Then); FR-###; SC-###; Clarifications; Assumptions; **Data Models & CDF Integration** (obrigatório Flows) |
| `plan.md` | Visão técnica; mapeamento FR → módulo `src/`; referências AGENTS.md §2–§7; riscos |
| `tasks.md` | Lista ordenada Test-First; cada item: `- [ ] Tn — FR-00x — descrição — teste: path ou TBD` |
| `research.md` | ADR-001 formato (Contexto / Decisão / Consequência); clarificações resolvidas |
| `progress.md` | Front-matter YAML (seção 19); checklist 7 etapas; matriz FR → teste |

Templates podem conter `<!-- TODO: ... -->` **apenas** nos templates — **proibido** em `specs/NNN/spec.md` de feature em etapa ≥ Specify fechada.

### Ação do agente

| Passo | Ação |
| --- | --- |
| 1 | **Criar** os 5 arquivos em `_templates/` com placeholders. |
| 2 | Ao iniciar feature, **copiar** os 5 arquivos para `specs/NNN-slug/` e **substituir** placeholders. |
| 3 | **Remover** todos `<!-- -->` de `spec.md` da feature antes de marcar etapa 1 `done`. |
| 4 | **Não** copiar `_templates/` diretamente para `src/` nem versionar dados sensíveis nos templates. |

---

## 27. `specs/CONSTITUTION.md` (implementação Fase 2)

### Definição

Implementar o conteúdo definido na **seção 15** (DoR / DoD + princípios). Estrutura sugerida:

1. Princípios (bullets com links `AGENTS.md` §1–§9)
2. Definition of Ready (checklist `[ ]`)
3. Definition of Done (checklist `[ ]`)
4. Rigor completo vs leve (tabela resumida da seção 3)
5. Conflitos: prevalece `AGENTS.md`

### Ação do agente

| Passo | Ação |
| --- | --- |
| 1 | **Criar** `specs/CONSTITUTION.md` na Fase 2. |
| 2 | Em cada `plan.md` de feature, **incluir** subseção “DoR / DoD” com link relativo `../CONSTITUTION.md`. |
| 3 | Antes de Implement, **marcar** DoR em `progress.md` ou no PR (checkbox). |

---

## 28. Feature `001-checklist-management` (baseline legado)

### Definição

- **Propósito:** documentar o estado atual do app (scaffold Flows, checklist Plan/Explore/Deploy, auth via `CogniteSdkProvider`) sem reescrever histórico em dezenas de pastas.
- **Status alvo após Fase 2:** `progress.md` com etapas honestas (muitas `done` para scaffold; próximas features reais em `002+`).
- **`spec.md`:** FRs do que o app **já faz** hoje (exibir checklist, loading/error auth, links docs) — não inventar features futuras aqui.
- **`plan.md`:** arquitetura atual (`App.tsx`, `app.json`, Aura, `@cognite/app-sdk`).
- **`tasks.md`:** tarefas já concluídas marcadas `[x]` + backlog opcional referenciando `SPEC.md` macro.
- **`research.md`:** ADR-001 “Adoção SDD” (contexto → decisão specs/ → consequência).
- **Não** usar `001` para toda feature nova — apenas baseline.

### Ação do agente

| Passo | Ação |
| --- | --- |
| 1 | **Ler** `src/App.tsx`, `SPEC.md`, `app.json` antes de preencher `001`. |
| 2 | **Preencher** os 5 artefatos com conteúdo real, não só templates vazios. |
| 3 | **Registrar** em `spec.md` FR-001… com texto testável; ligar a `src/App.test.tsx` na matriz. |
| 4 | Para **nova** funcionalidade de negócio, **criar** `002-*` em vez de expandir `001` indefinidamente. |

---

## 29. Convenções de conteúdo em `spec.md` (feature)

### Definição

- **FR-###:** imperativo testável — “O sistema DEVE …” / “MUST …”.
- **SC-###:** outcome mensurável visível ao usuário (tempo, taxa, não implementação).
- **CDF:** toda feature que lê/escreve CDF preenche Data Models; se global, espelhar em `SPEC.md`.
- **Clarifications:** perguntas abertas com prefixo `- [ ]` bloqueante ou `- [x]` resolvida.
- Mapeamento opcional para macro: linha `Relates to SPEC.md: FR-…` ou tabela no fim do `spec.md`.

### Ação do agente

| Passo | Ação |
| --- | --- |
| 1 | Ao adicionar FR, **verificar** que existe cenário de aceite ou teste planejado. |
| 2 | **Numerar** FR sequencialmente dentro da pasta (reiniciar em 001 por feature é aceitável; documentar mapeamento macro se confuso). |
| 3 | **Rejeitar** merge de feature `done` com FR vago (“melhorar UX”) — reescrever FR mensurável. |

---

## 30. `plan.md` e `tasks.md` (fluxo completo)

### Definição

**`plan.md` deve conter:**

- Diagrama ou lista de componentes/hooks/serviços tocados.
- Tabela | FR | Módulo `src/…` | Padrão AGENTS (§n) |
- Trade-offs (2–3 bullets) em `research.md` se decisão estrutural.

**`tasks.md` deve conter:**

- Ordem: testes → implementação (AGENTS.md §6).
- Mínimo 1 tarefa por FR entregue nesta feature.
- Formato: `- [ ] T1 — FR-001 — … — teste: src/.../X.test.tsx`

### Ação do agente

| Passo | Ação |
| --- | --- |
| 1 | **Não** iniciar código sem `tasks.md` alinhado aos FRs do PR (fluxo completo). |
| 2 | Ao concluir tarefa, **marcar** `[x]` em `tasks.md` no mesmo PR. |
| 3 | Se escopo mudar mid-flight, **atualizar** `spec.md` + `tasks.md` antes de mais código. |

---

## 31. Critérios de conclusão da Fase 2 (implementação)

### Definição

| # | Entregável | Critério |
| --- | --- | --- |
| 1 | `specs/README.md` | Índice + decisão `specs/` |
| 2 | `specs/CONSTITUTION.md` | DoR/DoD + princípios |
| 3 | `specs/_templates/*` | 5 templates com placeholders |
| 4 | `specs/001-checklist-management/*` | 5 arquivos preenchidos (não vazios) |
| 5 | `specs/README.md` | Linha 001 com status coerente |

**Fora do escopo Fase 2:** `scripts/spec-check.mjs`, `npm run spec:new`, alteração `ci.yml`.

### Ação do agente

| Passo | Ação |
| --- | --- |
| 1 | Se usuário pedir “implementar Fase 2”, **percorrer** tabela e marcar ✓/✗. |
| 2 | **Sugerir** Fase 3 após ✓ em todos os itens. |
| 3 | **Atualizar** status no topo: *Fase 2 implementada* quando concluído. |

---

## Decisões Fase 2 (registro)

| Tema | Decisão |
| --- | --- |
| Estrutura | Árvore seção 24 |
| Baseline | `001-checklist-management` documenta legado/scaffold |
| Novas features | `002+` para negócio novo |
| `spec:new` | **Fase 3** (cópia manual de `_templates/` na Fase 2) |
| Templates | Placeholders `{{NNN}}`, `{{slug}}`; sem `<!-- -->` em spec de feature fechada |

---

# Fase 3 — Spec gate, scripts e CI

Objetivo: automatizar disciplina SDD com **`scripts/spec-check.mjs`**, scripts npm, passo no **CI em modo warn**, **`npm run spec:new`**, e **strict condicional** via label de PR.

**Pré-requisito:** Fase 2 implementada (`specs/` com pelo menos `001`).

**Decisão do time (confirmada):** CI permanece **warn** por padrão; **strict** só com label `sdd-strict` (ou job/workflow manual equivalente).

---

## 32. `scripts/spec-check.mjs` — visão geral

### Definição

- Script Node **ESM**, sem dependências novas (`node:fs`, `node:path`, `node:child_process`).
- Executado na **raiz do app** (`ipaper-checklist-management/`), paths: `specs/`, `src/`.
- Variáveis:
  - `SPEC_GATE_MODE=warn|strict` (default: **warn**)
  - `SPEC_GATE_STRICT_LABEL` — opcional; em CI de PR, se label presente, tratar como strict
- Exit code: `0` em warn mesmo com erros (imprime avisos); `1` em strict se houver erros.

### Ação do agente

| Passo | Ação |
| --- | --- |
| 1 | **Criar** `scripts/spec-check.mjs` na implementação Fase 3. |
| 2 | **Testar** localmente: `npm run spec:check` e `npm run spec:check:strict`. |
| 3 | **Documentar** variáveis em `specs/README.md` e `docs/SDD-workflow-definition/sdd-governance.md`. |

---

## 33. Checks do spec gate (detalhamento)

### Definição

| ID | Check | Warn | Strict |
| --- | --- | --- | --- |
| C1 | Toda `specs/NNN-slug/` tem 5 artefatos | Aviso | Erro |
| C2 | `progress.md` front-matter (`feature`, `status`, `owner`, `updated`) | Aviso | Erro |
| C3 | `status` ∈ `not-started`, `in-progress`, `blocked`, `done` | Aviso | Erro |
| C4 | Diff toca `src/**/*.{ts,tsx}` → diff toca `specs/` | Aviso | Erro |
| C5 | `spec.md` sem blocos `<!--` | Aviso | Erro |
| C6 | `spec.md` contém pelo menos um `FR-\d{3}` | Aviso | Erro |
| C7 | Cada `FR-###` em `spec.md` aparece em `tasks.md` ou corpo de `tasks` em `spec.md` | — | Erro |
| C8 | Se `status: done` → matriz “FR → teste” com ≥1 linha por FR | — | Erro |
| C9 | Pastas em `specs/` batem regex `^\d{3}-[a-z0-9-]+$` | Aviso | Erro |

**Diff base:** `git diff --name-only ${GITHUB_BASE_REF:-HEAD~1}...HEAD` (tolerante: sem base → não aplica C4–C8 de diff).

**Monorepo:** se diff vier com prefixo `ipaper-checklist-management/`, normalizar removendo prefixo antes dos checks.

### Ação do agente

| Passo | Ação |
| --- | --- |
| 1 | **Implementar** checks C1–C9 conforme tabela. |
| 2 | Em strict, **listar** todas as falhas antes de `exit(1)`. |
| 3 | Em warn, **imprimir** `Spec gate WARN (N avisos)` e `exit(0)`. |
| 4 | **Não** duplicar gate de 80% coverage aqui — permanece em `flows-code-review`. |

---

## 34. `npm run spec:new` (scaffold — Fase 3)

### Definição

- Script: `scripts/spec-new.mjs` (ou comando em `spec-check` subcomando).
- Uso: `npm run spec:new -- 002-threshold-alerts` ou `npm run spec:new -- --slug threshold-alerts` (documentar uma forma canônica).
- Comportamento:
  1. Calcular próximo `NNN` se omitido.
  2. Criar `specs/NNN-slug/` copiando `_templates/`.
  3. Substituir `{{NNN}}`, `{{slug}}`, `{{feature_title}}`.
  4. **Não** sobrescrever pasta existente — erro e exit 1.
  5. Atualizar **automaticamente** `specs/README.md` (ou instruir agente a atualizar manualmente se script não parsear README).

### Ação do agente

| Passo | Ação |
| --- | --- |
| 1 | **Implementar** `spec:new` na Fase 3 (decisão do time). |
| 2 | Após rodar, **revisar** `spec.md` e preencher CDF + FRs antes de codar. |
| 3 | Se pasta já existe, **abortar** e usar `specs/NNN/` existente. |

---

## 35. `package.json` — scripts npm

### Definição

**Decisão (Windows/PowerShell):** usar **flags no `.mjs`** em vez de `cross-env` para não adicionar dependência extra. O script lê `process.argv` ou `process.env` conforme disponível — sem garantia de `cross-env` no CI.

```json
"spec:check": "node scripts/spec-check.mjs",
"spec:check:strict": "node scripts/spec-check.mjs --strict",
"spec:new": "node scripts/spec-new.mjs"
```

O script interpreta `--strict` via `process.argv.includes('--strict')` ou `process.env.SPEC_GATE_MODE === 'strict'`. Ambos funcionam no Windows PowerShell e no GitHub Actions Linux sem dependência adicional.

### Ação do agente

| Passo | Ação |
| --- | --- |
| 1 | **Adicionar** scripts na Fase 3; **verificar** `npm run spec:check` no Windows (PowerShell). |
| 2 | **Evitar** dependência pesada; se `cross-env`, adicionar como devDependency com justificativa. |
| 3 | Preferir **flags no .mjs** (`--strict`) se time quiser zero deps extras. |

---

## 36. CI — `.github/workflows/ci.yml`

### Definição

**Job padrão (todos os PRs):**

```yaml
- name: Checkout
  uses: actions/checkout@v6
  with:
    fetch-depth: 0        # obrigatório: sem isso git diff não consegue comparar com a base do PR

- name: Spec gate (warn)
  run: npm run spec:check
```

> **Por que `fetch-depth: 0`?** Sem ele, o Actions faz um shallow clone de 1 commit. O Check C4 (`git diff base...HEAD`) não encontra a base e silenciosamente pula a verificação de rastreabilidade. O `fetch-depth: 0` garante o histórico completo para comparação.

**Comportamento por evento:**

| Evento CI | `GITHUB_BASE_REF` | Comportamento do C4 |
| --- | --- | --- |
| `pull_request` | branch base (ex.: `main`) | `git diff origin/main...HEAD` — correto |
| `push: main` | vazio | cai em `HEAD~1` — C4 pode ser impreciso; aceitar essa limitação |

**Nota:** o spec gate é mais valioso em `pull_request`. Em `push` direto para `main` (merge), o C4 pode não capturar diferenças corretamente — comportamento conhecido e aceito; o gate warn não bloqueia nesses casos.

**Job ou step condicional strict (label `sdd-strict`):**

```yaml
- name: Spec gate (strict — só com label sdd-strict)
  if: contains(github.event.pull_request.labels.*.name, 'sdd-strict')
  run: npm run spec:check:strict
```

**Ordem no pipeline:** `lint` → `test` → `build` → **spec gate warn** → (condicional) **spec gate strict** se label.

### Ação do agente

| Passo | Ação |
| --- | --- |
| 1 | **Inserir** passo warn após `build` na Fase 3. |
| 2 | **Configurar** job/step strict condicionado a label `sdd-strict` (nome fixo documentado). |
| 3 | **Não** ativar strict global no CI sem label — decisão do time. |
| 4 | Em PR template (Fase 1), **mencionar** label `sdd-strict` para releases/features `done`. |

---

## 37. Label `sdd-strict` — política de uso

### Definição

| Quando usar label | Quando não usar |
| --- | --- |
| Feature com `progress.md` `status: done` | PR só docs/deps |
| PR de release / certificação / pré-submit | Spike com exceção documentada |
| Tech lead quer gate bloqueante neste PR | Primeiros PRs de adoção (só warn) |

Quem aplica: autor do PR ou revisor. Sem label → CI não falha em strict; avisos ainda aparecem em warn.

### Ação do agente

| Passo | Ação |
| --- | --- |
| 1 | Antes de merge de feature **done**, **recomendar** label `sdd-strict` ao usuário. |
| 2 | Se strict falhar, **corrigir** specs/tests antes de pedir remoção da label. |
| 3 | **Não** adicionar label em PR que viola exceção (seção 4) sem registrar exceção. |

---

## 38. Critérios de conclusão da Fase 3 (implementação)

### Definição

| # | Entregável | Critério |
| --- | --- | --- |
| 1 | `scripts/spec-check.mjs` | C1–C9 implementados; warn/strict |
| 2 | `scripts/spec-new.mjs` | Scaffold sem sobrescrever |
| 3 | `package.json` | `spec:check`, `spec:check:strict`, `spec:new` |
| 4 | `ci.yml` | Passo warn; strict com label `sdd-strict` |
| 5 | Docs | `specs/README` + governance mencionam comandos e label |

### Ação do agente

| Passo | Ação |
| --- | --- |
| 1 | Implementar Fase 3 e rodar CI em PR de teste. |
| 2 | **Abrir** PR tocando `src/` + `specs/` para validar C4 em warn. |
| 3 | **Atualizar** status topo: *Fase 3 implementada*. |

---

## Decisões Fase 3 (registro)

| Tema | Decisão |
| --- | --- |
| CI padrão | `warn` (não bloqueia merge) |
| Strict | Label PR `sdd-strict` (+ `spec:check:strict` local) |
| `spec:new` | Implementar na Fase 3 |
| Coverage 80% | Só `flows-code-review`, não no spec-check |
| Paths | `src/`, `specs/` relativos à raiz do app |

---

# Fase 4 — Piloto, maturidade e adoção strict

Objetivo: validar o fluxo com **001 baseline + uma feature 002+ real**, retrospectiva, e uso disciplinado da label **`sdd-strict`** antes de considerar SDD “maduro”.

**Pré-requisito:** Fases 1–3 implementadas.

**Decisão do time (confirmada):** piloto exige **`001-checklist-management` + `002-*` real** com DoD completo.

---

## 39. Escopo do piloto ponta a ponta

### Definição

| Entrega | O que provar |
| --- | --- |
| `001-checklist-management` | Baseline legado documentado; matriz FR→teste para comportamento atual |
| `002-<slug>` (negócio real) | Fluxo completo ou leve de ponta a ponta: spec → tasks → código → testes → matriz → PR com checklist |
| CI | Pelo menos 1 PR com warn limpo; 1 PR com label `sdd-strict` verde |
| Certificação (se aplicável) | Opcional no piloto; obrigatório antes de submit produção |

**Sugestão de `002`:** primeira funcionalidade acordada no `SPEC.md` macro (não o scaffold do checklist Flows).

### Ação do agente

| Passo | Ação |
| --- | --- |
| 1 | **Confirmar** com usuário o slug de `002` alinhado ao roadmap (`SPEC.md`). |
| 2 | **Executar** fluxo completo para `002` salvo classificação leve (seção 3). |
| 3 | **Não** declarar Fase 4 concluída sem `002` em `status: done` com DoD (seção 15). |

---

## 40. Roteiro do piloto (sprint 1–2)

### Definição

**Semana / sprint 1**

1. Implementar Fases 1–3 se ainda pendentes.
2. Fechar documentação `001` (matriz com `App.test.tsx`).
3. Abrir `002` via `npm run spec:new -- 002-<slug>`.
4. PRs pequenos; CI warn; corrigir avisos do spec-check.

**Sprint 2**

1. Concluir implementação `002` (etapa 5–7).
2. PR final com label `sdd-strict` + checklist seção 11 completo.
3. Retrospectiva (seção 41).
4. Atualizar `SPEC.md` macro com FRs entregues em `002`.

### Ação do agente

| Passo | Ação |
| --- | --- |
| 1 | **Propor** plano sprint 1–2 em `specs/002-*/tasks.md`. |
| 2 | **Atualizar** `progress.md` a cada PR mergeado. |
| 3 | Ao fim sprint 2, **gerar** notas de retrospectiva em `specs/002-*/research.md` ou `docs/sdd-pilot-retro.md`. |

---

## 41. Retrospectiva SDD (template)

### Definição

Ao fim do piloto, registrar (arquivo `docs/sdd-pilot-retro.md` ou seção em `research.md` da 002):

| Pergunta | Registro |
| --- | --- |
| O que funcionou? | … |
| O que virou burocracia? | … |
| Tempo médio por etapa? | … |
| Avisos mais frequentes do spec-check? | … |
| Ajustes propostos em `avaliacao_sdd.md`? | … |

### Ação do agente

| Passo | Ação |
| --- | --- |
| 1 | **Facilitar** retrospectiva com base nos dados de `progress.md` e CI. |
| 2 | Se mudança de processo, **propor** edição em `avaliacao_sdd.md` + `sdd-governance.md`. |
| 3 | **Não** ativar strict global sem decisão explícita pós-retro. |

---

## 42. Métricas de sucesso do piloto

### Definição

| Métrica | Meta |
| --- | --- |
| Features com spec completa | 001 + 002 `done` |
| PRs com `src/` sem spec | 0 após sprint 1 |
| PR `sdd-strict` verde | ≥ 1 |
| FR sem teste em feature `done` | 0 |
| Tempo para explicar “por que esta mudança” | ≤ 5 min (critério do plano) |

### Ação do agente

| Passo | Ação |
| --- | --- |
| 1 | **Medir** via `specs/README.md` + histórico PR. |
| 2 | Se meta falhar, **identificar** anti-padrão (seção 21) e ajustar treinamento/templates. |

---

## 43. Pós-piloto — política strict (sem strict global)

### Definição

- **Não** mudar CI para strict permanente (decisão atual).
- **Padrão operacional pós-piloto:**
  - Todo PR de feature `done` → label `sdd-strict` obrigatória por convenção de time.
  - PRs leves / docs → sem label.
- Opcional futuro: branch protection exigindo check strict quando label presente (config GitHub fora do repo).

### Ação do agente

| Passo | Ação |
| --- | --- |
| 1 | **Lembrar** revisor de exigir label em PRs `done`. |
| 2 | **Não** alterar `ci.yml` para strict global salvo nova decisão Fase 0. |
| 3 | Documentar convenção em `docs/SDD-workflow-definition/sdd-governance.md` após piloto. |

---

## 44. Atualização do `SPEC.md` macro pós-piloto

### Definição

Após `002` done:

- Promover FRs estáveis de `002/spec.md` para seções **Functional Requirements** e **Data Models** de `SPEC.md`.
- Remover placeholders `<!-- -->` do macro.
- Manter `specs/002` como histórico da entrega; macro = fonte agregada.

### Ação do agente

| Passo | Ação |
| --- | --- |
| 1 | **Abrir** PR dedicado ou mesmo PR final `002` atualizando `SPEC.md`. |
| 2 | **Verificar** consistência CDF entre macro e specs de feature. |
| 3 | **Oferecer** preencher `SPEC.md` se ainda vazio (AGENTS.md §0). |

---

## 45. Integração com certificação após piloto

### Definição

Para `flows-external-app-submit`:

1. `App-Brief.md` completo.
2. `flows-code-review` → `Must Fix open: 0`.
3. `flows-design-review` → `Average score ≥ 3.8`.
4. Features `001`/`002` não substituem reviews — complementam rastreabilidade.

### Ação do agente

| Passo | Ação |
| --- | --- |
| 1 | Antes de submit, **verificar** artefatos `reviews/` commitados. |
| 2 | **Vincular** em `progress.md` da feature de release os rounds de review. |
| 3 | PR de submit: label `sdd-strict` + checklist certificação. |

---

## 46. Critérios de conclusão da Fase 4 (implementação)

### Definição

| # | Critério |
| --- | --- |
| 1 | `001-checklist-management` com DoD (seção 15) atendido |
| 2 | `002-*` feature real com `status: done` e matriz FR→teste completa |
| 3 | ≥ 1 PR mergeado com label `sdd-strict` e CI verde |
| 4 | `docs/sdd-pilot-retro.md` (ou equivalente) preenchido |
| 5 | `SPEC.md` macro atualizado com escopo entregue em `002` |
| 6 | `docs/SDD-workflow-definition/sdd-governance.md` com convenção label pós-piloto |

### Ação do agente

| Passo | Ação |
| --- | --- |
| 1 | **Percorrer** tabela com usuário; marcar ✓/✗. |
| 2 | **Atualizar** status topo: *Fase 4 / piloto concluído* quando todos ✓. |
| 3 | **Propor** melhorias v2 em `avaliacao_sdd.md` com base na retro. |

---

## Decisões Fase 4 (registro)

| Tema | Decisão |
| --- | --- |
| Piloto | `001` baseline + `002+` real com DoD |
| Strict global | **Não** — label `sdd-strict` por PR |
| Retro | `docs/sdd-pilot-retro.md` recomendado |
| SPEC macro | Atualizar após `002` done |
| Maturidade | Convenção de label pós-piloto, CI warn permanente |

---

## Índice de fases (referência rápida)

| Fase | Seções | Disparo de implementação |
| --- | --- | --- |
| 0 | Decisões iniciais + §1–11 | Adotado |
| 1 | §12–23 | “implementar Fase 1” |
| 2 | §24–31 | “implementar Fase 2” |
| 3 | §32–38 | “implementar Fase 3” |
| 4 | §39–46 | “implementar Fase 4” / piloto 1–2 sprints |


