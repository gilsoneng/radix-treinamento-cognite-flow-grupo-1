# SDD — Governança (resumo para humanos)

> Resumo de 1 página. Playbook completo e instruções de agente: [`avaliacao_sdd.md`](avaliacao_sdd.md).
> Proposta e contexto: [`proposta-spec-driven-development.md`](proposta-spec-driven-development.md).

**Status:** Fases 0–2 implementadas. Fase 3 (gate CI + scripts) a implementar.

---

## Decisões adotadas (Fase 0)

| Tema | Decisão |
| --- | --- |
| Pasta | `ipaper-checklist-management/specs/` |
| Gate CI | Dois níveis: **warn** (padrão) → **strict** (label `sdd-strict`) |
| Etapas | **7** (fluxo completo) + **3** (fluxo leve) |
| Matriz FR→teste | Obrigatória para feature `done`; validada em strict |
| Adoção | Novas features em `specs/`; legado em `001-checklist-management` |
| Markdownlint | Adiado |
| Scripts | Flags `--strict` no `.mjs`; sem `cross-env` |

---

## Quando usar qual fluxo

| Situação | Fluxo | Artefatos mínimos |
| --- | --- | --- |
| Nova tela, integração CDF, novo FR de negócio | **Completo** (7 etapas) | spec + plan + tasks + research + progress |
| Bugfix, copy, CSS, refactor sem novo FR | **Leve** (3 etapas: L1/L2/L3) | spec + tasks (ou seção em spec) + progress |
| Chore/deps/docs sem tocar `src/` | **Exceção** — registrar em `specs/README.md` | — |

---

## Hierarquia de documentos

`AGENTS.md` > `CONSTITUTION.md` > `SPEC.md` > `specs/NNN/spec.md` > `plan.md`

Em conflito, prevalece o documento de maior precedência. Registrar em `research.md`.

---

## Fluxo de certificação Flows (não substituído pelo SDD)

```
flows-app-brief → build → flows-code-review → flows-design-review → flows-external-app-submit
```

SDD e certificação são complementares: SDD garante rastreabilidade interna; certificação garante rubrica Cognite.

---

## Label `sdd-strict` — quando usar

- Feature com `progress.md` `status: done`
- PR de release / pré-certificação
- Tech lead quer gate bloqueante neste PR

Sem a label, CI roda só em modo **warn** (avisa, não bloqueia).

---

## Comandos (após Fase 3)

```bash
npm run spec:check          # warn — lista violações sem reprovar CI
npm run spec:check:strict   # strict — bloqueia se houver violações
npm run spec:new            # scaffold nova feature a partir de _templates/
```

---

## Onde ler o quê

| Pergunta | Documento |
| --- | --- |
| Como o processo SDD funciona em detalhe? | `avaliacao_sdd.md` |
| Quais padrões de código seguir? | `AGENTS.md` |
| O que o produto faz? | `SPEC.md` |
| O que esta feature entrega? | `specs/<NNN>/spec.md` |
| Onde estamos nesta feature? | `specs/<NNN>/progress.md` |
| Quais features existem? | `specs/README.md` |
| Quais views CDF o app usa? | [`docs/datamodel.md`](../../docs/datamodel.md) — `ApmAppData v13` + `CogniteCore v1` |
