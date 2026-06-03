# Spec — 002 Dataseed

> **ID:** 002-dataseed
> **Tipo:** Enabler técnico (infra de dados)
> **Rigor:** leve (sem FR de produto, mas com DoR e DoD definidos)
> **Owner:** time-grupo-1
> **Criado em:** 2026-06-03
> **Status:** in-progress

---

## Objetivo

Criar e ingerir um conjunto de dados realistas de inspeção de equipamentos no ambiente CDF
`radix-dev`, a partir das planilhas **A Line OEC Routes** (`docs/Seed/A Line OEC Routes 2 (1).xlsx`).

O seed popula o data model com dados suficientes para que as features de produto
(`001-checklist-management`, `003-checklist-kpis`, `004-task-result-dashboards`,
`005-alerts-notifications`) possam ser desenvolvidas e demonstradas com conteúdo real.

---

## Fonte de dados

**Arquivo:** `docs/Seed/A Line OEC Routes 2 (1).xlsx`
**Sistema de origem:** Webalo (processo manual em papel digitalizado — "Kamyr System Operator Equipment Care")

### Estrutura do Excel (4 abas = 4 Rotas)

| Rota | Seções | Equipamentos | Itens checklist | Medições |
|---|---|---|---|---|
| Route 1 — IV/Kamyr Digester/Diffuser | 8 | 35 | 193 | 68 |
| Route 2 — Feed System | — | 38 | 183 | 64 |
| Route 3 — Blow Heat/Stripper/Turpentine | 4 | 2 | 45 | 10 |
| Route 4 — A Line Screen and Washing | 4 | 24 | 96 | 28 |
| **Total** | | **99** | **517** | **170** |

### Estrutura de cada aba

```
<Título do sistema>          ← cabeçalho (ex: "Kamyr System Operator Equipment Care")
<Nome da Rota>               ← ex: "Route One - IV/Kamyr Digester/Diffuser"
□ READ AND COMPLETE NIGHT NOTES
NAME: ___   Date: ___

<Seção / Andar>              ← ex: "7th Floor", "6th Floor"
  Task Complete | <Equipment Name> | <WO#>   ← equipamento
    □  | <Item Name> | <Tipo> | <Threshold?>  ← item de inspeção
    □  | <Item Name> | OK / Not OK
    □  | <Item Name> | ˚F | >170             ← medição com threshold
    ...
  Exceptions: ___            ← campo livre de observações
```

---

## Decisão de arquitetura de data model

**Escolha: ApmAppData as-is + DM Solution `ip_checklist_dm`**

Ver design completo em `docs/Seed/seed-design.md`.

| Camada | Space | O que contém |
|---|---|---|
| Fluxo operacional | `cdf_apm` (ApmAppData v13) | Template, TemplateItem, Checklist, ChecklistItem, MeasurementReading, Observation |
| Hierarquia de assets | `cdf_cdm` (CogniteCore v1) | CogniteAsset (Linha → Rota → Seção → Equipamento), CogniteEquipment |
| **Classificações SST** | **`ip_checklist_dm` (novo)** | EquipmentCategory, InspectionShift, ObservationCategory, SeverityLevel, MeasurementUnit, InspectionItemType |
| **KPIs pré-calculados** | **`ip_checklist_dm` (novo)** | ChecklistKpi, EquipmentHealthIndex, RouteKpiSnapshot, MeasurementTrend, SeedManifest |

---

## Volume estimado do seed

| Entidade | Quantidade |
|---|---|
| Routes (Templates) | **8** (4 Excel + 4 novas: Evaporators, Causticizing, Bleach Plant, Utilities) |
| CogniteAssets | ~**320** total (4 rotas Excel ~105 + 4 novas ~215) |
| TemplateItems | ~**1.100** total |
| **Checklists** | **8 rotas × 3 turnos × 365 dias = 8.760** |
| ChecklistItems | ~**9,6 milhões** |
| MeasurementReadings | ~**2,2 milhões** |
| Observations | ~**35.000** |
| Views DM Solution (`ip_checklist_dm`) | **13 views** (6 classificação + 4 KPI + 1 trend + 1 manifest + 1 unit) |
| Instâncias de classificação (SST) | ~50 instâncias fixas (categories, shifts, severities, etc.) |
| ChecklistKpi | 8.760 (1 por checklist) |
| EquipmentHealthIndex | ~320 (1 por equipamento) |
| RouteKpiSnapshot | ~96 (weekly + monthly por rota) |
| MeasurementTrend | ~275 (1 por TemplateItem de medição) |

---

## Formato de saída

**CSV** + **JSON** (1 arquivo por entidade/view), organizados em `docs/Seed/generated/run-<date>-<runId>/`:

| Arquivo | View alvo | Space |
|---|---|---|
| `seed-assets.csv` | `CogniteAsset v1` | `cdf_cdm` |
| `seed-equipment.csv` | `CogniteEquipment v1` | `cdf_cdm` |
| `seed-classification.csv` | Todas as views SST | `ip_checklist_dm` |
| `seed-templates.csv` | `Template v8` | `cdf_apm` |
| `seed-template-items.csv` | `TemplateItem v7` | `cdf_apm` |
| `seed-checklists.csv` | `Checklist v7` | `cdf_apm` |
| `seed-checklist-items.csv` | `ChecklistItem v7` | `cdf_apm` |
| `seed-measurement-readings.csv` | `MeasurementReading v4` | `cdf_apm` |
| `seed-observations.csv` | `Observation v5` | `cdf_apm` |
| `seed-kpis.csv` | `ChecklistKpi v1` + demais KPI views | `ip_checklist_dm` |
| `seed-manifest.json` | `SeedManifest v1` | `ip_checklist_dm` |
| `audit.json` | Contagens + hash + erros | local only |

---

## Ferramenta de ingestão

**Cognite Toolkit** (`@cognite/toolkit`) — a ser instalado na Atividade 4.

---

## Definition of Ready (DoR)

- [x] Excel fonte disponível em `docs/Seed/`
- [x] Schema completo de `ApmAppData` documentado em `docs/datamodel.md`
- [x] Schema de `CogniteCore` documentado em `docs/datamodel.md`
- [ ] Cognite Toolkit instalado (Atividade 4)
- [ ] Mapeamento coluna-a-coluna detalhado (Atividade 3)

## Definition of Done (DoD)

- [ ] 4 Templates + 517 TemplateItems ingeridos no `radix-dev`
- [ ] ~105 CogniteAssets ingeridos com hierarquia correta
- [ ] Pelo menos 20 Checklists com ChecklistItems e MeasurementReadings ingeridos
- [ ] Instâncias validadas via MCP `cdf_list_instances` (contagens registradas em `progress.md`)
- [ ] Arquivos CSV de seed versionados em `docs/Seed/generated/`
