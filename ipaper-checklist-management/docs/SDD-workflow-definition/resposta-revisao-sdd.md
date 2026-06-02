# Resposta à revisão SDD — autor x revisor

> Documento de conciliação. Confronta, item a item, a revisão do **Guilherme**
> (`docs/conclusoes-revisao-sdd-guilherme.md`) com a posição do **autor da proposta**
> (`docs/SDD-workflow-definition/proposta-spec-driven-development.md`).
>
> **Importante:** este documento **não altera** a proposta original. Serve para o
> conciliador do grupo fechar as decisões e, só depois, emendar a proposta.

- **Autor da resposta:** time Grupo 1 (autoria da proposta)
- **Revisão avaliada:** Guilherme — 2026-06-02
- **Revisão do Caio:** ainda não localizada no git (nenhuma branch local/remota contém). Pendente de incorporação quando subir.
- **Data:** 2026-06-02

---

## Veredito do autor sobre a revisão

A revisão do Guilherme é **aceita como guia de emendas**. Concordamos com a recomendação central: **adotar o SDD com emendas, rodar o piloto `001` e iniciar o spec gate em modo warn**. Os 6 bloqueadores P0 se resumem, na prática, a **3 correções técnicas** e **3 de normatividade** — todas viáveis sem redesenhar a proposta.

Legenda das respostas: **Aceito** | **Aceito parcial** | **Discordo** | **Decisão do grupo**.

---

## P0 — Bloqueadores

### P0.1 — Bug de paths no spec gate (Check 3)

- **Revisor:** o script usa `ipaper-checklist-management/src/` e `ipaper-checklist-management/spec/`, mas o CI roda na raiz do app; o correto é `src/` e `spec/`.
- **Resposta: Aceito (procede 100%).** O repositório git **é** a pasta `ipaper-checklist-management` (o `.github/workflows/` está dentro dela), então o pipeline executa na raiz do app. Os prefixos do exemplo estão errados.
- **Ação:** corrigir os prefixos no `spec-check.mjs` para `src/` e `specs/` (ver P0.2) e revisar a regex de paths. Bloqueador real para o Check 3 funcionar.

### P0.2 — Convenção de pasta: `spec/` vs `specs/`

- **Revisor:** Spec Kit e a skill `flows-app-brief` esperam `specs/<NNN>-<feature>/`; usar `spec/` quebra o pre-scan do coach de certificação.
- **Resposta: Aceito (abrimos mão da preferência original).** A compatibilidade com o ecossistema Flows vale mais que a estética do nome no singular.
- **Ação:** padronizar em **`specs/`** (plural). Impacta **todos** os exemplos da proposta (paths, script, regex, diagramas) — não é só renomear a pasta.
- **Ressalva do autor:** se o grupo insistir em `spec/`, exigir alias documentado e patch nas skills — custo maior e contínuo.

### P0.3 — Hierarquia de fonte de verdade

- **Revisor:** falta ordem de precedência em conflito (CONSTITUTION → SPEC.md → spec da feature → plan → AGENTS).
- **Resposta: Aceito.** A ordem estava implícita; torná-la explícita é melhoria barata e correta.
- **Ação:** adicionar seção "Hierarquia de documentos" na proposta com exatamente essa ordem.

### P0.4 — DoR e DoD com conteúdo

- **Revisor:** o `CONSTITUTION.md` é citado mas os critérios não estão definidos.
- **Resposta: Aceito.** Estava como "a definir"; os critérios sugeridos são adequados.
- **Ação:** fixar no documento:
  - **DoR:** FR numerados, SC mensuráveis, sem clarificações bloqueantes, plano revisado.
  - **DoD:** matriz FR→teste `passing`, macro atualizado, reviews Flows sem Must Fix, spec gate verde.

### P0.5 — Política de bypass (chore/fix/docs-only)

- **Revisor:** sem isenções, o Check 3 gera atrito em PRs de manutenção.
- **Resposta: Aceito (item importante).**
- **Ação:** documentar isenções — paths isentos (`docs/`, `.github/`, alterações só em `AGENTS.md`) + convenção `000-chore` para manutenção sem novo FR. Implementar como allowlist no `spec-check.mjs`.

### P0.6 — `SPEC.md` macro ainda vazio

- **Revisor:** o SDD pressupõe macro na etapa 7 (Done), mas o `SPEC.md` só tem placeholders.
- **Resposta: Aceito parcial.** É pré-requisito para exigir *Done*, não para iniciar o piloto.
- **Ação:** popular o macro (ou usar a feature `001` como espelho do macro) **antes** de tornar o gate de Done obrigatório. Não bloqueia começar Specify/Plan.

---

## P1 — Melhorias recomendadas

| # | Revisor | Resposta | Ação |
| --- | --- | --- | --- |
| 1 | Gate valida só features alteradas no PR (ou `status != done`) | **Aceito** | Complemento natural do Check 3; evita travar por features antigas |
| 2 | `CONSTITUTION.md` referencia `AGENTS.md`, não duplica | **Aceito** | Já era a intenção; deixar explícito para evitar drift |
| 3 | Tier S/M/L (7 etapas só em L) | **Aceito (forte)** | 5 artefatos × 7 etapas em tudo gera abandono; tier por tamanho é mais realista. Requer definir critério objetivo de cada tier |
| 4 | Relação `App-Brief.md` ↔ SDD | **Aceito** | Mapear o brief de certificação ao início do fluxo SDD |
| 5 | CI `fetch-depth: 0` + fetch da base | **Aceito** | Sem isso o `git diff` do Check 3 nem roda no Actions |
| 6 | Publicar `_templates/` com CDF/NFR/fora de escopo | **Aceito** | Conteúdo mínimo dos templates é norma |
| 7 | Seção SDD no `AGENTS.md` + PR template | **Aceito** | Já é o entregável 8 da proposta |
| 8 | Ligar `progress.md` a `reviews/code-review/` na Validate | **Aceito parcial** | Bom, mas implementar na fase 2 para não inflar o piloto |

### Nota do autor sobre P1.3 (tier S/M/L)

Apoiamos, mas a classificação precisa de critério objetivo, senão vira subjetiva e burla o gate. Proposta inicial:

- **S** — bugfix/docs/chore sem novo FR (bypass do gate pesado; `000-chore`).
- **M** — 1–2 FR, sem novo modelo de dados CDF (artefatos enxutos).
- **L** — feature com novo FR relevante e/ou novo modelo de dados CDF (7 etapas completas).

---

## P2 — Evoluções desejáveis

| Item | Resposta |
| --- | --- |
| Gate automático da matriz FR→teste | **Aceito para fase 2** (manual no piloto) |
| `Spec-Ref: NNN-slug` em commit/PR body | **Aceito para fase 2** (Check 3 mais forte) |
| `markdownlint` nas specs | **Aceito para fase 2** (nova devDependency) |
| Instrução em `CLAUDE.md` para ler `specs/README.md` + feature ativa | **Aceito** (barato e útil para agentes) |

---

## Decisões para o conciliador fechar

Resposta recomendada pelo autor para cada decisão aberta do revisor:

| # | Tema | Recomendação do revisor | Posição do autor |
| --- | --- | --- | --- |
| 1 | Spec gate inicial | Warn 2–4 semanas → bloqueante | **Concordo** (warn primeiro) |
| 2 | Pasta de specs | `specs/` ou alias | **Concordo: `specs/`** |
| 3 | Número de etapas | Tier S/M/L | **Concordo**, com critérios objetivos de tier |
| 4 | Matriz FR→teste no CI | Sim em fase 2; manual no piloto | **Concordo** |
| 5 | Adoção retroativa | Baseline `001` + macro | **Concordo** |
| 6 | Localização `specs/` | Dentro de `ipaper-checklist-management/` | **Concordo** (CI já assume isso) |

---

## Pontos em que o autor pondera (não são discordâncias plenas)

1. **`specs/` não é só renomear** — impacta script, regex e todos os exemplos da proposta; tratar como tarefa de revisão completa do `spec-check.mjs`.
2. **Tier S/M/L exige régua objetiva** — sem critério claro, a classificação é manipulável.
3. **"Não aprovar por overhead"** — o tier S/M/L já mitiga; o autor classifica como risco gerenciável, não como motivo de reprovação.

---

## Saldo da conciliação

- **P0 aceitos:** 6/6 (1 parcial — P0.6).
- **P1 aceitos:** 8/8 (1 parcial — P1.8, fase 2).
- **Discordâncias plenas:** nenhuma.
- **Pendência externa:** revisão do **Caio** ainda não localizada no git.

### Sequência sugerida (após fechar com o grupo)

1. Registrar as decisões da tabela acima no documento final.
2. Incorporar o Caio quando a avaliação dele subir.
3. Emendar `docs/SDD-workflow-definition/proposta-spec-driven-development.md` com P0/P1 aceitos.
4. PR de processo (estrutura `specs/` + templates + CONSTITUTION + gate em warn).
5. PR da feature `001` como piloto/baseline.

---

*Documento de conciliação autor x revisor. Não substitui a votação do time nem altera a proposta original; consolida as respostas para a decisão final do grupo.*

