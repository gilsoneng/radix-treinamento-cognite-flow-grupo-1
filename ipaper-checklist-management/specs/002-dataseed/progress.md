---
feature: 002-dataseed
status: done
owner: time-grupo-1
updated: 2026-06-03
rigor: leve
---

# Progress — 002 Dataseed

## Entregas e status

| Entrega | Status | Data | Descrição |
|---|---|---|---|
| Análise do Excel (4 rotas, contagem) | ✅ done | 2026-06-03 | 4 rotas, 99 equipamentos, 517 itens, 170 medições |
| Decisão de arquitetura DM | ✅ done | 2026-06-03 | DM Solution `ip_gp1_checklist_dm` com views nativas (KPIs, SST) + views externas (APM + CDM) sem `implements` |
| `modules/ip_checklist_dm/` — schema deployado | ✅ done | 2026-06-03 | 13 containers, 11 views nativas, 8 views externas, DataModel `ip_gp1_checklist_dm` v1 — deployado no `radix-dev` |
| Typed direct relations nas views | ✅ done | 2026-06-03 | `type: direct_relation` + `source` em todas as relações — grafo de relacionamentos visível no CDF UI |
| Extension containers para enriquecimento APM | ✅ done | 2026-06-03 | `ApmTemplateItemExtended` (inspectionTypeRef, unitRef) + `ApmObservationExtended` (categoryRef, severityRef) |
| `scripts/seed/` — geradores e ingestão | ✅ done | 2026-06-03 | Geradores por domínio (assets, APM, KPIs, SST); `ingest.mjs` com `--only`; `clean.mjs` seletivo |
| `BatchUpserter` — retry com backoff exponencial | ✅ done | 2026-06-03 | Retry automático para 503/409/429 — até 5 tentativas com backoff 1s→32s |
| Bug fixes nos generators | ✅ done | 2026-06-03 | `MeasurementTrend` (numericReading), `EquipmentHealthIndex` (dedup), `SeedManifest` (mapping object, isDryRun) |
| Seed completo ingerido e validado no `radix-dev` | ✅ done | 2026-06-03 | Assets, APM, SST, KPIs — validado via MCP em todas as views |
| Validação de relações tipadas via MCP | ✅ done | 2026-06-03 | `inspectionTypeRef`, `unitRef`, `categoryRef`, `severityRef` confirmados nas instâncias |

## Contagem final de instâncias ingeridas

| Grupo | Instâncias |
|---|---|
| CogniteAsset | 84 |
| CogniteTimeSeries | 223 |
| Template + TemplateItem + edges | 8 + 92 + 92 = 192 |
| MeasurementReading specs | 92 |
| Checklist + ChecklistItem + edges | 8.760 + 96.114 + 96.114 |
| MeasurementReading (readings) | ~92.087 |
| Observation + edges | ~7.438 + ~7.438 |
| SST lookups (ip_checklist_dm) | 42 |
| ChecklistKpi | 7.695 |
| EquipmentHealthIndex | 71 |
| RouteKpiSnapshot | 96 |
| MeasurementTrend | 47 |
| SeedManifest | 1 |
