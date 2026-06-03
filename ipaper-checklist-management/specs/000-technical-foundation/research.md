---
feature: 000-technical-foundation
updated: 2026-06-02
---

# Research — Technical Foundation

## MCP CDF — descobertas

- O servidor MCP usa Node.js (ESM) via `stdio`; Cursor executa com `node <path>`.
- Credenciais via `.env` (client credentials OIDC), variáveis: `CDF_CLUSTER`, `CDF_PROJECT`,
  `IDP_CLIENT_ID`, `IDP_CLIENT_SECRET`, `IDP_TENANT_ID`.
- Cursor usa o `cwd` do workspace root para resolver o path dos `args` no `mcp.json`.
- Ferramentas disponíveis: `cdf_get_data_model`, `cdf_get_view`, `cdf_list_instances`,
  `cdf_filter_instances`, `cdf_get_instance` (e variants para spaces/containers).

## ApmAppData v13 — descobertas

- 22 views no space `cdf_apm`; versões individuais independentes da versão do DM (v13).
- Views-chave: `Checklist v7`, `ChecklistItem v7`, `Template v8`, `TemplateItem v7`,
  `Observation v5`, `MeasurementReading v4`, `Schedule v4`.
- Relationships via edge type: `checklist.items`, `template.items`, `checklist.assets`.
- `ApmAppData` referencia `cdf_core.Asset:v2` (space legado) nos campos `asset`; novo seed
  deve usar `cdf_cdm.CogniteAsset:v1`.

## CogniteCore v1 — descobertas

- 33 views no space `cdf_cdm`; base de mixins (`Describable`, `Schedulable`,
  `CogniteDescribable`, etc.).
- Views-chave para o app: `CogniteAsset v1` (hierarquia funcional), `CogniteEquipment v1`
  (hardware físico), `CogniteActivity v1` (período de tempo).
- `CogniteAsset` tem hierarquia via `parent` (edge) e `root` (direct).
- Compatibilidade `cdf_core.Asset:v2` ↔ `cdf_cdm.CogniteAsset:v1`: propriedades comuns
  são `name`, `description`, `tags`; `cdf_core` tem `source`; `cdf_cdm` tem `source`
  como objeto `SourceSystem`. Ver tabela completa em `docs/datamodel.md`.

## Cognite Toolkit — próximos passos de pesquisa

- [ ] Verificar versão atual: `npm show @cognite/toolkit version`
- [ ] Confirmar suporte a ingestão DMS (Data Modeling Service) — view instances + edges
- [ ] Avaliar formatos suportados (YAML, CSV, Parquet) para nodes/edges
- [ ] Confirmar autenticação (client credentials no `.env`)
