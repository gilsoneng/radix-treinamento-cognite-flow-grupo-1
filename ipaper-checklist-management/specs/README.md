# specs/ — Índice de features SDD

> Pasta oficial de specs por feature do `ipaper-checklist-management`.
> Convenção adotada: `specs/<NNN>-<slug>/` — compatível com Cognite Flows / Spec Kit / skill `flows-app-brief`.

**Playbook operacional:** [`../docs/SDD-workflow-definition/avaliacao_sdd.md`](../docs/SDD-workflow-definition/avaliacao_sdd.md)
**Resumo humano:** [`../docs/SDD-workflow-definition/sdd-governance.md`](../docs/SDD-workflow-definition/sdd-governance.md)
**Spec macro do produto:** [`../SPEC.md`](../SPEC.md)

---

## Índice de features

| ID | Slug | Status | Owner | Rigor | PR |
| --- | --- | --- | --- | --- | --- |
| 000 | technical-foundation    | in-progress | time-grupo-1 | leve    | — |
| 001 | checklist-management    | in-progress | time-grupo-1 | completo | — |
| 002 | checklist-kpis          | not-started | time-grupo-1 | completo | — |
| 003 | task-result-dashboards  | not-started | time-grupo-1 | completo | — |
| 004 | alerts-notifications    | not-started | time-grupo-1 | completo | — |

> **Nota:** A spec `002-dataseed` será criada na próxima atividade (as specs acima serão renumeradas: 002→003, 003→004, 004→005).

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
