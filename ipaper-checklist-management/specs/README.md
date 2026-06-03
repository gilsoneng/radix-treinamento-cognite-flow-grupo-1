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

| ID | Slug | Epic owner | Status | Owner | Rigor | PR |
| --- | --- | --- | --- | --- | --- | --- |
| 000 | technical-foundation | — | in-progress | time-grupo-1 | leve | — |
| 001 | checklist-management | Guilherme | done | time-grupo-1 | completo | — |
| 002 | dataseed | — | done | time-grupo-1 | leve | — |
| 003 | checklist-kpis | João | done | time-grupo-1 | completo | — |
| 004 | task-result-dashboards | Caio | done | time-grupo-1 | completo | — |
| 005 | alerts-notifications | Caio | done | time-grupo-1 | completo | — |
| 006 | bugs-and-minor-actions | — | in-progress | time-grupo-1 | leve | — |

Cada feature **completo** inclui: `spec.md`, `research.md`, `plan.md`, `tasks.md`, `progress.md`.

**Numeração canônica (2026-06-03):** use apenas as pastas do índice abaixo. Pastas legadas com `DEPRECATED.md` (`002-checklist-kpis`, `003-task-result-trends`, `004-alerts-notifications`) não devem receber implementação.

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
