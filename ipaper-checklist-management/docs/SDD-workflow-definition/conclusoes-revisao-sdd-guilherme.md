# Conclusões da revisão SDD — Guilherme

> Documento de síntese para o **conciliador do grupo** usar no prompt final de avaliação da proposta Spec Driven Development (`docs/SDD-workflow-definition/proposta-spec-driven-development.md`).
>
> **Autor da revisão:** Guilherme  
> **Data:** 2026-06-02  
> **Objeto:** `ipaper-checklist-management` — proposta SDD (João Hermida, rascunho)

---

## Veredito em uma linha

**Recomendar adoção do SDD com emendas obrigatórias (P0) antes de promover o documento a fonte de verdade do time.** A proposta é tecnicamente sólida e complementa bem `AGENTS.md` e o fluxo Flows; ainda não está pronta para norma sem fechar decisões abertas, corrigir o spec gate e alinhar convenções com o ecossistema Cognite.

---

## Posição do revisor

| Aspecto | Avaliação |
| --- | --- |
| Direção geral | **A favor** — modelo híbrido macro + feature é adequado ao estágio do projeto |
| Maturidade do documento | **Rascunho forte** — falta normatividade (DoR/DoD, hierarquia, bypasses, templates) |
| Prontidão para implementar | **Condicional** — corrigir P0; piloto `001` com gate em modo warn |
| Risco principal | Burocracia + gate incorreto no CI + conflito `spec/` vs `specs/` com skills Flows |

---

## Pontos fortes (manter na proposta)

1. **Não substitui o que existe** — preserva `SPEC.md`, `AGENTS.md` e CI atual; adiciona camada por feature.
2. **Gates objetivos** — 7 etapas com critérios de fechamento e `progress.md` versionado respondem à lacuna de rastreabilidade requisito → teste.
3. **Alinhamento com engenharia** — referências `§2…§6` do `AGENTS.md` evitam padrões duplicados; SDD amarra processo ao código.
4. **Integração Flows** — mapeamento com `flows-app-brief`, code/design review e submit evita dois processos paralelos.
5. **Spec gate pragmático** — script Node sem dependências novas; modo informativo → bloqueante é adoção sensata.
6. **Seção 9** — decisões em aberto listadas explicitamente; base boa para conciliação do grupo.

---

## Bloqueadores (P0) — exigir antes de aprovar como processo oficial

### 1. Bug no script do spec gate (Check 3)

O exemplo em `proposta-spec-driven-development.md` usa paths `ipaper-checklist-management/src/` e `ipaper-checklist-management/spec/`, mas o CI executa na **raiz do app**. Paths corretos: `src/` e `spec/`. Sem correção, o gate de rastreabilidade **não funciona** no pipeline real.

### 2. Unificar convenção de pasta: `spec/` vs `specs/`

- A proposta prefere `spec/`.
- `flows-app-brief` e Spec Kit usam `specs/<NNN>-<feature>/`.
- **Decisão necessária do grupo:** uma pasta única + atualização de skills **ou** alias documentado. Inconsistência quebra pre-scan do coach de certificação.

### 3. Hierarquia de documentos (fonte de verdade)

Falta ordem de precedência em conflito. Proposta do revisor:

1. `CONSTITUTION.md` — processo e DoR/DoD  
2. `SPEC.md` — produto, escopo global, CDF  
3. `spec|specs/NNN/spec.md` — escopo da feature  
4. `plan.md` — decisão técnica subordinada ao spec da feature  
5. `AGENTS.md` — padrões de implementação (referenciado, não duplicado em texto longo)

### 4. DoR e DoD com conteúdo, não só menção

O `CONSTITUTION.md` é citado mas critérios não estão definidos. Mínimo para norma:

- **DoR:** FR numerados, SC mensuráveis, sem clarificações bloqueantes, plano revisado.  
- **DoD:** matriz FR→teste `passing`, macro atualizado, reviews Flows sem Must Fix, spec gate verde.

### 5. Política de bypass (chore, fix, deps, docs-only)

Sem isenções documentadas, o Check 3 gera atrito em PRs de manutenção. O grupo deve definir: feature `000-chore`, lista de paths isentos (`docs/`, `.github/`, só `AGENTS.md`), ou tier **S** de processo.

### 6. `SPEC.md` macro ainda vazio

O SDD pressupõe macro na etapa 7 Done, mas o `SPEC.md` atual só tem placeholders. **Pré-requisito:** popular macro (ou feature `001` como espelho) antes de exigir Done em features.

---

## Melhorias recomendadas (P1)

| # | Melhoria | Motivo |
| --- | --- | --- |
| 1 | Gate valida só features **alteradas no PR** (ou `status != done`) | Evita bloqueio por features antigas incompletas |
| 2 | `CONSTITUTION.md` referencia `AGENTS.md`, não duplica regras de código | Reduz drift entre dois “manuais” |
| 3 | Tier **S / M / L** de processo (7 etapas só em L) | Evita abandono informal do SDD em entregas pequenas |
| 4 | Relação explícita `App-Brief.md` ↔ SDD | Certificação exige brief na raiz; hoje não está no fluxo SDD |
| 5 | CI: `fetch-depth: 0` + fetch da base para `git diff` | Necessário para Check 3 em PRs |
| 6 | Publicar `_templates/` com seções CDF, NFR, fora de escopo | Templates são estrutura; conteúdo mínimo é norma |
| 7 | Seção SDD no `AGENTS.md` + PR template | Entregável 8 da proposta — essencial para agentes e humanos |
| 8 | Ligar `progress.md` a `reviews/code-review/` na Validate | Reviews Flows e `spec/` hoje são paralelos |

---

## Evoluções desejáveis (P2)

- Gate automático da matriz FR→teste em `progress.md` (etapas 6–7 ou `status: done`).
- PR body ou commit com `Spec-Ref: NNN-slug` (Check 3 mais forte que “qualquer mudança em spec/”).
- `markdownlint` nas specs (item 5 da seção 9 da proposta).
- Instrução em `CLAUDE.md`: ler `spec/README.md` + feature ativa antes de implementar.

---

## Decisões para o conciliador fechar com o grupo

Registrar resposta explícita (sim/não + detalhe) para cada item:

| # | Tema | Opção A | Opção B | Recomendação do revisor |
| --- | --- | --- | --- | --- |
| 1 | Spec gate inicial | Bloqueante desde o dia 1 | Warn 2–4 semanas, depois bloqueante | **B** |
| 2 | Pasta de specs | `spec/` | `specs/` (Spec Kit + skills) | **`specs/`** ou alias; priorizar compatibilidade Flows |
| 3 | Número de etapas | Manter 7 | Simplificar (ex.: 4–5) ou tier S/M/L | **Tier S/M/L** |
| 4 | Matriz FR→teste no CI | Não (manual) | Sim quando Done/Validate | **Sim em fase 2**; manual no piloto |
| 5 | Adoção retroativa | Só features novas | Baseline `001` + macro | **Baseline `001`** |
| 6 | Localização `spec/` | Dentro de `ipaper-checklist-management/` | Raiz do monorepo | **Dentro do app** (CI já assume isso) |

---

## Critérios sugeridos para o prompt final de avaliação do SDD

O conciliador pode usar este checklist ao consolidar o veredito do grupo:

### Aprovação plena

- [ ] P0 resolvido ou com plano datado na mesma sprint  
- [ ] Decisões da tabela acima registradas no documento final (não só na discussão)  
- [ ] Piloto `001` acordado como referência viva  
- [ ] Gate em modo warn com data para bloqueante  

### Aprovação condicional

- [ ] Adotar estrutura `spec/` + templates, **sem** spec gate bloqueante até correção de paths  
- [ ] Atualizar proposta com hierarquia e DoR/DoD antes de marcar “processo oficial”  

### Não aprovar (ou adiar)

- [ ] Grupo não aceita overhead de 5 artefatos × 7 etapas sem tier S/M/L  
- [ ] Não há acordo `spec` vs `specs`  
- [ ] Macro `SPEC.md` permanece vazio e ninguém assume ownership de preenchê-lo  

---

## Síntese para colar no prompt do conciliador

```
Revisão técnica (Guilherme) da proposta SDD ipaper-checklist-management:

VEREDITO: Adotar SDD com emendas P0. Proposta alinhada a AGENTS.md e certificação Flows; 
ainda é rascunho, não fonte de verdade até correções.

MANTER: modelo híbrido SPEC.md + spec por feature; gates; progress.md + FR→teste; 
integração flows-app-brief/reviews; spec gate sem deps novas.

BLOQUEAR APROVAÇÃO SE: paths errados no spec-check (src/ vs ipaper-checklist-management/src/); 
conflito spec/ vs specs/ sem decisão; sem DoR/DoD; sem bypass chore/fix; SPEC.md macro vazio.

DECIDIR NO GRUPO: gate warn vs block; spec vs specs; 7 etapas vs tier S/M/L; 
matriz FR no CI; adoção retroativa via 001.

PRÓXIMO PASSO: fechar seção 9 → emendar proposta → PR processo → PR feature 001 piloto.
```

---

## Referências

- Proposta avaliada: `docs/SDD-workflow-definition/proposta-spec-driven-development.md`
- Padrões de engenharia: `AGENTS.md`
- Spec macro (estado atual): `SPEC.md` (placeholders)
- CI atual: `.github/workflows/ci.yml` (sem spec gate)
- Skill com expectativa `specs/`: `.agents/skills/flows-app-brief/SKILL.md`

---

*Documento gerado para conciliação do grupo. Não substitui votação do time; consolida a posição técnica do revisor Guilherme para a avaliação final do SDD.*

