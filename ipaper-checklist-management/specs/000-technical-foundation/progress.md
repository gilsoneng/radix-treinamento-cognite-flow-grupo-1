---
feature: 000-technical-foundation
status: in-progress
owner: time-grupo-1
updated: 2026-06-02
rigor: leve
---

# Progress — Technical Foundation (Fundação Técnica)

> Enabler Epic: trabalho de infra, context engineering e exploração que habilita as features de produto.
> Não segue fluxo SDD completo (sem FR de usuário final).

---

## Entregas e status

### Bloco A — Context Engineering (agentes de IA eficazes)

| Entrega | Status | Data | Descrição |
|---|---|---|---|
| `AGENTS.md` — seção arquitetura | ✅ done | 2026-06-02 | Ponteiros para `docs/architecture/` e data models |
| `CLAUDE.md` — seção data models | ✅ done | 2026-06-02 | Espelho do AGENTS.md para Claude Code |
| `.cursor/rules/project-orientation.mdc` | ✅ done | 2026-06-02 | Cursor Rule `alwaysApply: true` — mapa de orientação de sessão |
| `.cursor/rules/architecture.mdc` | ✅ done | 2026-06-02 | Cursor Rule `alwaysApply: true` — regras de camada (era `false`) |
| `SPEC.md` preenchido | ✅ done | 2026-06-02 | Produto, personas, user stories, FRs, data models (era vazio) |

### Bloco B — Exploração e documentação de Data Models

| Entrega | Status | Data | Descrição |
|---|---|---|---|
| `docs/datamodel.md` — ApmAppData v13 | ✅ done | 2026-06-02 | 22 views com propriedades e relacionamentos via MCP |
| `docs/datamodel.md` — CogniteCore v1 | ✅ done | 2026-06-02 | 33 views; 7 detalhadas + tabela de compatibilidade cdf_core↔cdf_cdm |
| Referências atualizadas em 7 arquivos | ✅ done | 2026-06-02 | AGENTS, CLAUDE, README, CONSTITUTION, sdd-governance, mcp-cdf, SPEC |

### Bloco C — MCP CDF (Cursor ↔ CDF)

| Entrega | Status | Data | Descrição |
|---|---|---|---|
| `scripts/cdf-mcp/server.mjs` | ✅ done | 2026-06-01 | Servidor MCP Node.js (stdio) para CDF Data Modeling |
| `.cursor/mcp.json` (workspace root) | ✅ done | 2026-06-01 | Configuração do servidor para o workspace raiz |
| `ipaper-checklist-management/.cursor/mcp.json` | ✅ done | 2026-06-01 | Configuração para o subprojeto |
| `.env_example` | ✅ done | 2026-06-01 | Template de credenciais CDF |
| `docs/mcp-cdf.md` | ✅ done | 2026-06-02 | Guia completo de uso do MCP CDF |

### Bloco A-bis — Workflow Gate & Agent Onboarding

| Entrega | Status | Data | Descrição |
|---|---|---|---|
| `specs/006-bugs-and-minor-actions/` (5 arquivos) | ✅ done | 2026-06-03 | Spec de manutenção permanente (fluxo leve) — bugfixes e ajustes menores |
| `project-orientation.mdc` — Protocolo de onboarding | ✅ done | 2026-06-03 | Menu de 4 opções que o agente apresenta ao iniciar a sessão |
| `project-orientation.mdc` — Gate de implementação | ✅ done | 2026-06-03 | Bloco ⛔ SPEC REQUIRED para sessões sem spec confirmada |
| `specs/README.md` — linha `006` adicionada | ✅ done | 2026-06-03 | Índice atualizado com nova spec |

### Bloco D — Arquitetura de software

| Entrega | Status | Data | Descrição |
|---|---|---|---|
| `docs/architecture/README.md` | ✅ done | 2026-06-02 | Princípios DDD+Clean+SOLID adaptados a Flows |
| `docs/architecture/folder-structure.md` | ✅ done | 2026-06-02 | Estrutura `src/` anotada + mapa Angular→React |
| `docs/architecture/layers.md` | ✅ done | 2026-06-02 | Responsabilidades por camada + regras de import |
| `docs/architecture/adr/0001-angular-base-to-react-flows.md` | ✅ done | 2026-06-02 | ADR 0001: decisão de adaptar base Angular para Flows |

### Bloco E — Dataseed (enabler para ingestão de dados reais)

| Entrega | Status | Data | Descrição |
|---|---|---|---|
| `docs/Seed/A Line OEC Routes 2 (1).xlsx` | ✅ done | 2026-06-02 | Excel fonte (OEC Routes — Linha A) |
| `specs/002-dataseed/` | ✅ done | 2026-06-03 | Spec SDD criada; análise Excel concluída; arquitetura ApmAppData as-is decidida |
| Renumeração specs 002→003, 003→004, 004→005 | ✅ done | 2026-06-03 | Pastas renomeadas + README + project-orientation atualizados |
| Cognite Toolkit instalado e documentado | 🔲 pending | — | Atividade 4 do roadmap |
| Arquivos de seed (CSV/Parquet) | 🔲 pending | — | Atividade 3 do roadmap |
| Seed ingerido no `radix-dev` | 🔲 pending | — | Atividade 5 do roadmap |

---

## Roadmap de atividades restantes

Ver detalhes completos em `.cursor/plans/roadmap_5_atividades_efdd434d.plan.md`.

| Atividade | Status | Bloqueado por |
|---|---|---|
| ~~Atividade 0: Context engineering~~ | ✅ concluída | — |
| ~~Atividade 1: Mapear data models~~ | ✅ concluída | — |
| ~~Atividade 2: Criar spec 002-dataseed + renumerar~~ | ✅ concluída | — |
| Atividade 3: Projetar e criar dataseed | 🔲 pendente | Atividade 1 ✅ |
| Atividade 4: Cognite Toolkit | 🔲 pendente | nada |
| Atividade 5: Ingestão seed | 🔲 pendente | Atividades 3 + 4 |
