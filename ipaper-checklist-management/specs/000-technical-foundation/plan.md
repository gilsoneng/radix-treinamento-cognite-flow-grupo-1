---
feature: 000-technical-foundation
updated: 2026-06-02
---

# Plan — Technical Foundation

> Enabler Epic: não tem sprint tasks de produto; as atividades são agrupadas por bloco temático.

## Blocos de trabalho

### Bloco A — Context Engineering
1. Criar `.cursor/rules/project-orientation.mdc` (`alwaysApply: true`)
2. Atualizar `.cursor/rules/architecture.mdc` para `alwaysApply: true`
3. Popular `SPEC.md` com produto, personas, FRs e data models
4. Atualizar `AGENTS.md` e `CLAUDE.md` com seções de arquitetura e data models

### Bloco B — Exploração de Data Models
1. Explorar `ApmAppData v13` via MCP e documentar em `docs/datamodel.md`
2. Explorar `CogniteCore v1` via MCP e adicionar ao mesmo arquivo
3. Atualizar referências em `docs/README.md`, `specs/CONSTITUTION.md`,
   `docs/SDD-workflow-definition/sdd-governance.md`, `docs/mcp-cdf.md`

### Bloco C — MCP CDF
1. Criar `scripts/cdf-mcp/server.mjs` (servidor MCP stdio)
2. Configurar `.cursor/mcp.json` no workspace root
3. Criar `.env_example` e `docs/mcp-cdf.md`

### Bloco D — Arquitetura
1. Criar `docs/architecture/README.md`, `folder-structure.md`, `layers.md`
2. Criar ADR 0001 (Angular → React Flows)

### Bloco E — Dataseed ← **próximos passos**
1. Criar `specs/002-dataseed/` e renumerar specs 002→003, 003→004, 004→005
2. Analisar Excel OEC e definir arquitetura de data model para seed
3. Gerar arquivos CSV/Parquet de seed
4. Instalar e configurar Cognite Toolkit
5. Ingerir seed no `radix-dev` e validar via MCP
