# specs/ — Índice de features SDD

> Pasta oficial de specs por feature do `ipaper-checklist-management`.
> Convenção adotada: `specs/<NNN>-<slug>/` — compatível com Cognite Flows / Spec Kit / skill `flows-app-brief`.

**Playbook operacional:** [`../docs/SDD-workflow-definition/avaliacao_sdd.md`](../docs/SDD-workflow-definition/avaliacao_sdd.md)
**Resumo humano:** [`../docs/SDD-workflow-definition/sdd-governance.md`](../docs/SDD-workflow-definition/sdd-governance.md)
**Spec macro do produto:** [`../SPEC.md`](../SPEC.md)

---

## Requisitos e protótipo

| Documento | Conteúdo |
| --- | --- |
| [`../docs/requirements/APPLICATION-REQUIREMENTS.md`](../docs/requirements/APPLICATION-REQUIREMENTS.md) | Requisitos de aplicação (AR-001…AR-310) |
| [`../docs/requirements/TASKS-DIVISION.md`](../docs/requirements/TASKS-DIVISION.md) | Épicos e Issues GitHub sugeridas |
| [`../docs/prototype/LOVABLE-PROTOTYPE.md`](../docs/prototype/LOVABLE-PROTOTYPE.md) | Protótipo Lovable — referência UX por rota |

---

## Índice de features

| ID | Slug | Epic owner | Status | Rigor |
| --- | --- | --- | --- | --- |
| 004 | alerts-notifications | Caio | not-started | completo |
| 003 | task-result-trends | Caio | not-started | completo |
| 002 | checklist-kpis | João | not-started | completo |
| 001 | checklist-management (app foundation) | Guilherme | in-progress | completo |

Cada feature **completo** inclui: `spec.md`, `research.md`, `plan.md`, `tasks.md`, `progress.md`.

---

## Exceções SDD

> PRs que tocaram `src/` sem feature spec correspondente — registrar aqui com motivo.

| PR | Motivo | Data |
| --- | --- | --- |
| — | — | — |

---

## Comandos (após Fase 3)

```bash
npm run spec:check            # warn — lista violações, não bloqueia
npm run spec:check:strict     # strict — bloqueia se houver violação
npm run spec:new              # scaffold nova feature a partir de _templates/
```

---

## Como criar nova feature

**Fase 3 (manual até lá):**
1. Copiar `specs/_templates/` para `specs/<NNN>-<slug>/`
2. Substituir `{{NNN}}`, `{{slug}}`, `{{feature_title}}` nos arquivos
3. Adicionar linha neste índice
4. Preencher `spec.md` com FRs reais antes de codar
