# docs/SDD-workflow-definition/ — Documentação do processo SDD

> Registro completo do desenvolvimento e adoção do **Spec Driven Development (SDD)**
> no `ipaper-checklist-management`. Inclui a proposta original, revisões do time,
> decisões adotadas e o playbook operacional.

---

## Estrutura e ordem de leitura

```
docs/SDD-workflow-definition/
  README.md                              ← você está aqui
  proposta-spec-driven-development.md    ← 1. origem: proposta inicial
  conclusoes-revisao-sdd-guilherme.md    ← 2. revisão técnica (Guilherme)
  avaliacao_sdd.md                       ← 3. avaliação/conciliação (Caio) — playbook canônico
  resposta-revisao-sdd.md                ← 4. resposta do autor às revisões
  sdd-governance.md                      ← 5. resumo operacional para o time
```

---

## 1. `proposta-spec-driven-development.md`

**O quê:** Proposta original de adoção do SDD, escrita para avaliação do time.
**Quem criou:** João (autor da proposta) — 2026-06-02
**Status:** Aprovada para adoção. Seção 9 atualizada com decisões fechadas.
**Para quem:** Contexto e motivação. Útil para entender o "por quê" do SDD.

Cobre:
- Comparação antes/depois
- Modelo híbrido `SPEC.md` macro + `specs/` por feature
- Os 5 artefatos de cada feature
- As 7 etapas do ciclo e seus gates
- Spec gate (conceito e exemplos)
- Decisões adotadas pelo time (seção 9)

---

## 2. `conclusoes-revisao-sdd-guilherme.md`

**O quê:** Revisão técnica da proposta pelo Guilherme.
**Quem criou:** Guilherme — 2026-06-02
**Para quem:** Conciliador do grupo e autor da proposta.

Identifica 6 bloqueadores P0 (caminhos errados no gate, `spec/` vs `specs/`, DoR/DoD, bypass, hierarquia), 8 melhorias P1 e 4 evoluções P2. Encerra com tabela de decisões para o grupo fechar.

---

## 3. `avaliacao_sdd.md`

**O quê:** Documento operacional completo — conciliação de todas as revisões + playbook de implementação em 4 fases.
**Quem criou:** Caio — 2026-06-02
**Status:** Fases 0–2 implementadas no repo. Fase 3 implementada (scripts + CI). Fase 4 (piloto) a iniciar.
**Para quem:** Agentes de código e engenheiros implementando o SDD. É a fonte de verdade operacional.

Estrutura:
| Fase | Seções | Conteúdo |
| --- | --- | --- |
| 0 | §1–11 | Decisões fundamentais (pasta, gate, etapas, adoção) |
| 1 | §12–23 | Governança: `AGENTS.md §10`, `sdd-governance.md`, PR template, proposta atualizada |
| 2 | §24–31 | Estrutura `specs/`: templates, CONSTITUTION, feature `001` baseline |
| 3 | §32–38 | Scripts CI: `spec-check.mjs`, `spec-new.mjs`, `ci.yml` |
| 4 | §39–46 | Piloto ponta a ponta: `001` + `002+` real, retrospectiva, maturidade |

---

## 4. `resposta-revisao-sdd.md`

**O quê:** Resposta item a item do autor da proposta às revisões de Guilherme e Caio.
**Quem criou:** João (autor) — 2026-06-02
**Para quem:** Registro histórico da conciliação. Útil para entender decisões que "vieram de revisão".

Não altera a proposta — documenta o raciocínio de cada aceitação/discordância.

---

## 5. `sdd-governance.md`

**O quê:** Resumo operacional de 1 página para humanos.
**Status:** Referência rápida — atualizar quando decisões da Fase 0 mudarem.
**Para quem:** Qualquer membro do time que precisa de uma visão rápida sem ler o playbook completo.

Cobre: decisões adotadas, tabela completo/leve/exceção, hierarquia de documentos, fluxo de certificação, label `sdd-strict`, comandos e onde ler o quê.

---

## Artefatos implementados fora de `docs/`

| Artefato | Localização | Fase |
| --- | --- | --- |
| `specs/README.md` | Índice de features + exceções | 2 |
| `specs/CONSTITUTION.md` | DoR, DoD, princípios | 2 |
| `specs/_templates/` | 5 modelos reutilizáveis | 2 |
| `specs/001-checklist-management/` | Feature baseline (5 artefatos) | 2 |
| `scripts/spec-check.mjs` | Gate C1–C9 (warn/strict) | 3 |
| `scripts/spec-new.mjs` | Scaffold de nova feature | 3 |
| `AGENTS.md §10` | SDD workflow integrado aos padrões | 1 |
| `.github/pull_request_template.md` | Checklist de PR com SDD | 1 |
| `.github/workflows/ci.yml` | `fetch-depth: 0` + spec gate warn + strict | 3 |

---

## Cronologia do desenvolvimento

```
2026-06-02
  João        proposta-spec-driven-development.md (rascunho para discussão)
  Guilherme   conclusoes-revisao-sdd-guilherme.md (revisão técnica — 6 P0)
  Caio        avaliacao_sdd.md (playbook 4 fases, resolve P0)
  João        resposta-revisao-sdd.md (conciliação autor × revisores)
              implementação Fase 1 (AGENTS.md §10, sdd-governance.md, PR template)
              implementação Fase 2 (specs/, CONSTITUTION, templates, 001 baseline)
              implementação Fase 3 (scripts, CI gate)
```

---

## Próximo passo: Fase 4 — piloto

1. Definir o slug da primeira feature real: `npm run spec:new -- 002-<slug>`
2. Preencher `spec.md` com FRs reais alinhados ao `SPEC.md` macro
3. Seguir fluxo completo (7 etapas) até `status: done`
4. PR com label `sdd-strict` para validar gate em modo bloqueante
5. Retrospectiva em `docs/sdd-pilot-retro.md`
