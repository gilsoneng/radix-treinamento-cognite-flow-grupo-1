---
feature: 000-technical-foundation
updated: 2026-06-02
---

# Tasks — Technical Foundation

> Tasks de infra/fundação. Numerar apenas as pendentes; concluídas ficam em `progress.md`.

## Concluídas

- [x] TF-A1: `project-orientation.mdc` — Protocolo de onboarding (menu 4 opções) (2026-06-03)
- [x] TF-A2: `project-orientation.mdc` — Gate de implementação ⛔ SPEC REQUIRED (2026-06-03)
- [x] TF-A3: `specs/006-bugs-and-minor-actions/` — 5 arquivos SDD criados (2026-06-03)
- [x] TF-A4: `specs/README.md` — linha `006` adicionada (2026-06-03)

## Concluídas (Bloco E — início da Atividade 2)

- [x] TF-E0: Análise do Excel — 4 rotas, 99 equipamentos, 517 itens, 170 medições (2026-06-03)
- [x] TF-E1-spec: `specs/002-dataseed/` — 5 arquivos SDD criados com contexto real (2026-06-03)
- [x] TF-E2: Renumeração specs 002→003, 003→004, 004→005 (2026-06-03)
- [x] TF-E3: `specs/README.md` e `project-orientation.mdc` atualizados (2026-06-03)

## Pendentes (Bloco E — Dataseed)

- [ ] TF-E1: Criar `specs/002-dataseed/spec.md` e 4 arquivos SDD complementares
- [ ] TF-E2: Renumerar specs: `002-checklist-kpis` → `003`, `003-task-result-dashboards` → `004`, `004-alerts-notifications` → `005`
- [ ] TF-E3: Atualizar `specs/README.md` para refletir nova numeração + entrada `000`
- [ ] TF-E4: Analisar Excel `docs/Seed/A Line OEC Routes 2 (1).xlsx` e rascunhar arquitetura de nodes/edges
- [ ] TF-E5: Decidir estrutura de data model (ApmAppData estendido vs. solution DM) e registrar em spec 002
- [ ] TF-E6: Gerar arquivos de seed (CSV ou Parquet) para cada view alvo
- [ ] TF-E7: Instalar Cognite Toolkit (`@cognite/toolkit`) e documentar em `docs/`
- [ ] TF-E8: Executar ingestão no `radix-dev` e validar instâncias via MCP CDF
