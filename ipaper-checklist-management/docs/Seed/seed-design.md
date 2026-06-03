# Seed Design — ipaper-checklist-management

> **Documento de design** antes da geração. Baseado na instrução do challenge:
> *"Seed should be executed after spec.md. Realistic seed depends on the business workflow."*
> **Criado em:** 2026-06-03 | **Spec base:** `specs/002-dataseed/spec.md`

---

## 1. Escopo e volumes

| Dimensão | Valor |
|---|---|
| Rotas (Templates) | **8** (4 do Excel + 4 novas criadas por domínio) |
| Equipamentos (CogniteAsset/Equipment) | ~**320** total |
| TemplateItems | ~**1.100** total |
| Turnos por dia | **3** (Day 06h–14h · Afternoon 14h–22h · Night 22h–06h) |
| Checklists gerados | **8 rotas × 3 turnos × 365 dias = 8.760 checklists** |
| ChecklistItems | **~9,6 milhões** (estimativa baseada em média 1.100 items/route distribuídos) |
| MeasurementReadings | **~2,2 milhões** (25% dos items são medição) |
| Observations | **~35.000** (NOK rate ~7% × equipamentos críticos) |

> **Decisão de corte realista:** gerar 4 routes × 3 turnos × 365 dias = **4.380 checklists** na
> primeira execução (routes do Excel). As 4 novas routes adicionam mais 4.380.
> Total: **8.760 checklists**, todos com ChecklistItems completos.

---

## 2. Decisão de arquitetura — DM Solution `ip_checklist_dm`

### Por que criar um DM Solution próprio

O ApmAppData cobre o **fluxo operacional** (checklist, templates, observações). Mas não cobre:

| Lacuna | Impacto | Solução proposta |
|---|---|---|
| Tipos de equipamento (pump, motor, screen...) | Sem SST para classificação | View `EquipmentCategory v1` |
| Turnos operacionais (Day/Afternoon/Night) | Dashboard de performance por turno impossível sem isso | View `InspectionShift v1` |
| KPIs pré-calculados por checklist | Dashboard em tempo real requer queries pesadas sem pre-calc | View `ChecklistKpi v1` |
| Health index por equipamento | Tendência de degradação não existe no APM | View `EquipmentHealthIndex v1` |
| Categorias de observação (Safety, Quality...) | Todas as observations são genéricas no APM | View `ObservationCategory v1` |
| Metadados do seed (auditoria, proveniência) | Sem rastreabilidade de geração | View `SeedManifest v1` |
| Rotas adicionais (além das 4 do Excel) | Mais dados → melhor demonstração de KPIs | Novos `Template` + `TemplateItem` |

### Decisão: **Criar `ip_gp1_checklist_dm`**

```
Space:       ip_checklist_dm
DataModel:   ip_gp1_checklist_dm  (externalId — nome distinto do space)
Version:     v1
Importa de: cdf_apm (ApmAppData v13) + cdf_cdm (CogniteCore v1)
Não duplica: nenhuma entidade existente — apenas estende e classifica
```

---

## 3. Arquitetura do DM Solution `ip_gp1_checklist_dm`

> **Coordenadas CDF:** space = `ip_checklist_dm` · externalId = `ip_gp1_checklist_dm` · version = `v1`
>
> **Views externas (ApmAppData + CogniteCore):** definidas em `external.View.yaml` **sem `implements`** —
> cada propriedade mapeia diretamente seu container de origem (`cdf_apm`, `cdf_cdm`, `cdf_core`, `cdf_apps_shared`).
> Isso expõe somente os campos usados no seed e no Atlas AI, evitando conflitos de herança de schema.
>
> **`type: view` nas referências do DataModel:** obrigatório em cada entrada de view no
> `ip_checklist_dm.DataModel.yaml` para que o SDK Python interprete o item como `ViewId`
> (referência) e não como `ViewApply` (definição inline vazia → erro 400 na API).

### 3.1 Views de classificação / lookup (SST)

Cada tipo fica em sua própria view — **Single Source of Truth por domínio semântico**.

#### `EquipmentCategory v1`

Categorias de equipamento para filtros, ícones e relatórios específicos.

| `externalId` | `name` | `description` | `icon` |
|---|---|---|---|
| `ip.eqcat.rotating-pump` | Centrifugal Pump | Rotating equipment, centrifugal | pump |
| `ip.eqcat.positive-disp-pump` | Positive Displacement Pump | PD pump, piston/diaphragm | pump |
| `ip.eqcat.motor` | Electric Motor | AC/DC drive motor | motor |
| `ip.eqcat.gearbox` | Gearbox / Reducer | Gear reducer or transmission | gear |
| `ip.eqcat.agitator` | Agitator / Mixer | Tank agitator or in-line mixer | agitator |
| `ip.eqcat.screen` | Pressure Screen | Pulp pressure screen | screen |
| `ip.eqcat.feeder` | Chip Feeder | High/Low pressure chip feeder | feeder |
| `ip.eqcat.vessel` | Pressure Vessel / Tank | Static vessel, tank or flash tank | tank |
| `ip.eqcat.valve` | Control / Manual Valve | Process valve | valve |
| `ip.eqcat.conveyor` | Belt Conveyor / Screw | Material transport | conveyor |
| `ip.eqcat.heat-exchanger` | Heat Exchanger | Shell-and-tube or plate HX | heatx |
| `ip.eqcat.compressor` | Compressor / Blower | Gas compression | compressor |
| `ip.eqcat.refiner` | Refiner | Disc refiner for reject/TMP | refiner |
| `ip.eqcat.strain-gauge` | Strain Gauge / Sensor | Static measurement instrument | sensor |
| `ip.eqcat.chemical-system` | Chemical Dosing System | Descaler, defoamer, antiscalant | chemical |

#### `InspectionShift v1`

| `externalId` | `name` | `startHour` | `endHour` | `shiftCode` |
|---|---|---|---|---|
| `ip.shift.day` | Day Shift | 6 | 14 | `D` |
| `ip.shift.afternoon` | Afternoon Shift | 14 | 22 | `A` |
| `ip.shift.night` | Night Shift | 22 | 6 | `N` |

#### `ObservationCategory v1`

| `externalId` | `name` | `description` | `requiresWorkOrder` |
|---|---|---|---|
| `ip.obscat.safety` | Safety | Personal safety or machine guarding issue | true |
| `ip.obscat.quality` | Quality | Process parameter out of spec | false |
| `ip.obscat.maintenance` | Maintenance | Mechanical degradation requiring repair | true |
| `ip.obscat.housekeeping` | Housekeeping | Cleanliness, spills, sawdust | false |
| `ip.obscat.environment` | Environmental | Leak, spill with environmental risk | true |
| `ip.obscat.reliability` | Reliability | Repeated issue, trending degradation | true |

#### `SeverityLevel v1`

| `externalId` | `name` | `numericLevel` | `colorCode` | `slaHours` | `escalateTo` |
|---|---|---|---|---|---|
| `ip.sev.critical` | Critical | 5 | `#D32F2F` | 2 | Shift Supervisor + Maintenance Manager |
| `ip.sev.high` | High | 4 | `#F57C00` | 8 | Shift Supervisor |
| `ip.sev.medium` | Medium | 3 | `#FBC02D` | 24 | Team Lead |
| `ip.sev.low` | Low | 2 | `#388E3C` | 72 | — |
| `ip.sev.info` | Informational | 1 | `#1976D2` | — | — |

#### `MeasurementUnit v1`

> **Nota:** Unidades padrão do CogniteCore (`cdf_cdm.CogniteUnit`) devem ser referenciadas
> via `externalId` das instâncias existentes no ambiente. Esta view é para unidades específicas
> do processo que não existem no catálogo padrão do CogniteCore.

| `externalId` | `symbol` | `description` | `quantityType` |
|---|---|---|---|
| `ip.unit.degF` | °F | Degrees Fahrenheit | Temperature |
| `ip.unit.ips` | ips | Inches per second (RMS vibration) | Vibration |
| `ip.unit.mm` | mm | Millimeters (feeder gap setting) | Length |
| `ip.unit.gpm` | GPM | US Gallons per minute | Flow |
| `ip.unit.psi` | PSI | Pounds per square inch | Pressure |
| `ip.unit.rpm` | RPM | Revolutions per minute | Rotational Speed |
| `ip.unit.amps` | A | Amperes (motor current) | Current |
| `ip.unit.percent` | % | Percentage (consistency, load) | Ratio |

#### `InspectionItemType v1`

Garante SST para os tipos de resposta dos itens de inspeção.

| `externalId` | `name` | `responseOptions` | `isMeasurement` |
|---|---|---|---|
| `ip.itemtype.ok-nok` | OK / Not OK | `["OK","Not OK","N/A"]` | false |
| `ip.itemtype.yes-no` | Yes / No | `["Yes","No","N/A"]` | false |
| `ip.itemtype.numeric` | Numeric Measurement | — (free value) | true |
| `ip.itemtype.count` | Count / Integer | — (integer value) | true |
| `ip.itemtype.text` | Free Text | — | false |

---

### 3.2 Views de KPI / Analytics pré-calculadas

#### `ChecklistKpi v1`

Estende `Checklist v7` com métricas pré-calculadas na geração do seed.
No app real, seriam atualizadas quando o checklist for concluído (webhook / function).

| Propriedade | Tipo | Descrição |
|---|---|---|
| `checklistRef` | direct relation → `cdf_apm.Checklist:v7` | Checklist base |
| `shiftRef` | direct relation → `ip_checklist_dm.InspectionShift:v1` | Turno |
| `totalItems` | int | Total de itens do checklist |
| `completedItems` | int | Itens respondidos |
| `nokCount` | int | Itens com resultado Not OK / No (anomalia) |
| `naCount` | int | Itens marcados N/A |
| `measurementAlarmCount` | int | Medições que ultrapassaram threshold |
| `completionPct` | float | `completedItems / totalItems × 100` |
| `nonConformanceRate` | float | `nokCount / totalItems × 100` |
| `durationMinutes` | int | Duração real (endTime - startTime) |
| `isOverdue` | boolean | Completado após o prazo do turno |
| `criticalObservations` | int | Observations com severity=critical |
| `inspectorId` | string | ID do operador (persona) |
| `approverId` | string | ID do supervisor aprovador |
| `approvedAt` | timestamp | Timestamp da aprovação |

#### `EquipmentHealthIndex v1`

Índice de saúde por equipamento — calculado a partir dos últimos N checklists.
**Este é o diferencial real do app**: permite identificar equipamentos em degradação
antes de uma falha, transformando inspeção reativa em preditiva.

| Propriedade | Tipo | Descrição |
|---|---|---|
| `assetRef` | direct relation → `cdf_cdm.CogniteAsset:v1` | Equipamento |
| `categoryRef` | direct relation → `ip_checklist_dm.EquipmentCategory:v1` | Tipo |
| `healthScore` | float | 0–100: 100=perfeito, <60=atenção, <40=crítico |
| `last30DayNokRate` | float | % NOK nos últimos 30 dias |
| `last7DayNokRate` | float | % NOK nos últimos 7 dias |
| `trendDirection` | string | `improving` / `stable` / `degrading` |
| `consecutiveNokRuns` | int | Inspeções consecutivas com NOK (early warning) |
| `lastInspectionDate` | timestamp | Data da última inspeção |
| `lastNokDate` | timestamp | Data do último NOK |
| `totalInspections` | int | Total de inspeções históricas |
| `avgDurationMinutes` | float | Tempo médio de inspeção |
| `openObservations` | int | Observations abertas sem resolução |
| `mtbf_days` | float | Mean Time Between Failures estimado |
| `calculatedAt` | timestamp | Timestamp do cálculo |

#### `RouteKpiSnapshot v1`

KPI por rota por período — base para o dashboard de supervisor.

| Propriedade | Tipo | Descrição |
|---|---|---|
| `templateRef` | direct relation → `cdf_apm.Template:v8` | Rota/Template |
| `periodStart` | timestamp | Início do período (semana/mês) |
| `periodEnd` | timestamp | Fim do período |
| `periodType` | string | `daily` / `weekly` / `monthly` |
| `totalChecklists` | int | Checklists no período |
| `completedCount` | int | Concluídos |
| `overdueCount` | int | Atrasados |
| `avgCompletionPct` | float | % médio de itens preenchidos |
| `avgNonConformanceRate` | float | % médio de NOK |
| `totalObservations` | int | Total de observações abertas |
| `criticalObservations` | int | Observações críticas |
| `avgDurationMinutes` | float | Duração média por checklist |
| `topNokEquipments` | string | JSON: top 3 equipamentos com mais NOK |

#### `MeasurementTrend v1`

Tendência de medição por item ao longo do tempo.
Base para gráficos de série temporal no dashboard.
**Inclui link direto para `CogniteTimeSeries`** — o elo entre inspeção manual e sensor contínuo.

| Propriedade | Tipo | Descrição |
|---|---|---|
| `templateItemRef` | direct relation → `cdf_apm.TemplateItem:v7` | Item de medição inspecionado |
| `assetRef` | direct relation → `cdf_cdm.CogniteAsset:v1` | Equipamento |
| `timeSeriesRef` | direct relation → `cdf_cdm.CogniteTimeSeries:v1` | **Sensor contínuo correspondente (Atlas AI bridge)** |
| `lastValue` | float | Valor mais recente da inspeção |
| `avg7dValue` | float | Média últimos 7 dias (inspeções) |
| `avg30dValue` | float | Média últimos 30 dias |
| `maxValue` | float | Valor máximo histórico |
| `threshold` | float | Threshold de alarme |
| `exceedanceCount30d` | int | Vezes que excedeu threshold em 30 dias |
| `trendSlope` | float | Inclinação da tendência (positivo = subindo) |
| `predictedDaysToAlarm` | int | Estimativa de dias até exceder threshold |
| `lastCalculatedAt` | timestamp | Timestamp do cálculo |

#### `SeedManifest v1`

Proveniência e auditoria do seed — requisito explícito do challenge.

| Propriedade | Tipo | Descrição |
|---|---|---|
| `runId` | string | UUID único por execução do script |
| `executedAt` | timestamp | Data/hora da execução |
| `scriptVersion` | string | Versão do script gerador |
| `sourceFile` | string | Nome do arquivo Excel fonte |
| `sourceHash` | string | SHA-256 do arquivo Excel |
| `routeSlug` | string | Rota processada neste run |
| `periodStart` | string | Data início dos checklists gerados |
| `periodEnd` | string | Data fim dos checklists gerados |
| `isDryRun` | boolean | true = simulação sem gravação |
| `totalNodes` | int | Total de instâncias upserted |
| `totalEdges` | int | Total de edges upserted |
| `errors` | string | JSON de erros (se houver) |
| `mapping` | string | JSON do mapeamento Excel → CDF usado |

---

## 3.5 Catálogo Completo de Views — Schema para Seed

> Este é o **contrato de geração do seed**. Cada tabela = uma planilha/CSV.
> Propriedades marcadas **✅** são obrigatórias. Relações de borda (edges) têm CSV próprio.

### Spaces e padrões de externalId

| Tipo de instância | Space | Padrão de externalId |
|---|---|---|
| `CogniteAsset` | `flows_radix_space_group1` | `IP.ASSET.{HIERARQUIA.UPPERCASE}` |
| `CogniteTimeSeries` | `flows_radix_space_group1` | `IP.TS.{PATH.UPPERCASE}.{MEDIÇÃO}` |
| Views ApmAppData (Template, Checklist, etc.) | `flows_radix_checklist_group1` | `CKM_{VIEW_CODE}_GR1_{IDENTIFICADOR_UPPERCASE}` |
| Views ip_checklist_dm (SST, KPI, etc.) | `flows_radix_checklist_group1` | `CKM_{VIEW_CODE}_GR1_{IDENTIFICADOR_UPPERCASE}` |

> **Importante — compatibilidade ApmAppData:** as views ApmAppData referenciam `cdf_core.Asset:v2`.
> Para compatibilidade, os nodes `CogniteAsset` serão instâncias **duplas**:
> propriedades de `cdf_cdm.CogniteAsset:v1` E `cdf_core.Asset:v2` no mesmo space/externalId.
> Isso permite que o APM reconheça o asset sem duplicar nodes.

---

### CSV 01 — CogniteAsset (`flows_radix_space_group1`)

**VIEW:** `cdf_cdm/CogniteAsset:v1` + `cdf_core/Asset:v2` (instância dupla)
**VIEW_CODE para externalId:** n/a — usa prefixo `IP.ASSET.`
**Arquivo:** `seed-01-assets.csv`

| Coluna CSV | Propriedade | Tipo | ✅ Obrig | Notas |
|---|---|---|---|---|
| `externalId` | externalId | string | ✅ | `IP.ASSET.ALINE` / `IP.ASSET.ALINE.ROUTE1` / `IP.ASSET.ALINE.ROUTE1.7F.DIFFUSER-SCRAPER` |
| `space` | space | string | ✅ | `flows_radix_space_group1` |
| `name` | name | string | ✅ | Nome legível: "Diffuser Scraper" |
| `description` | description | string | | Descrição técnica |
| `tags` | tags | string[] (JSON) | | `["route1","rotating","critical"]` |
| `parent_externalId` | parent.externalId | string | | externalId do asset pai |
| `parent_space` | parent.space | string | | `flows_radix_space_group1` |
| `root_externalId` | root.externalId | string | ✅ | `IP.ASSET.ALINE` (sempre) |
| `root_space` | root.space | string | ✅ | `flows_radix_space_group1` |

**ExternalIds de exemplo:**
- Root: `IP.ASSET.ALINE`
- Linha: `IP.ASSET.ALINE.ROUTE1`, `IP.ASSET.ALINE.ROUTE2`
- Seção: `IP.ASSET.ALINE.ROUTE1.7F`
- Equipamento: `IP.ASSET.ALINE.ROUTE1.7F.DIFFUSER-SCRAPER`

---

### CSV 02 — CogniteTimeSeries (`flows_radix_space_group1`)

**VIEW:** `cdf_cdm/CogniteTimeSeries:v1`
**VIEW_CODE para externalId:** n/a — usa prefixo `IP.TS.`
**Arquivo:** `seed-02-timeseries.csv`

| Coluna CSV | Propriedade | Tipo | ✅ Obrig | Notas |
|---|---|---|---|---|
| `externalId` | externalId | string | ✅ | `IP.TS.ALINE.ROUTE1.7F.DIFFUSER-SCRAPER.IB-BEARING-TEMP` |
| `space` | space | string | ✅ | `flows_radix_space_group1` |
| `name` | name | string | ✅ | "IB Bearing Temperature — Diffuser Scraper" |
| `description` | description | string | | |
| `type` | type | string | ✅ | `numeric` ou `string` |
| `isStep` | isStep | boolean | ✅ | `false` para contínuos, `true` para step (status) |
| `assets_externalId` | assets[0].externalId | string | ✅ | externalId do CogniteAsset pai |
| `assets_space` | assets[0].space | string | ✅ | `flows_radix_space_group1` |
| `unit_externalId` | unit.externalId | string | | externalId da CogniteUnit (ex: `temperature:deg_f`) |
| `unit_space` | unit.space | string | | `cdf_cdm` |

**Padrão de nomes de medição (sufixo após o path do asset):**
- Temperatura: `IB-BEARING-TEMP`, `OB-BEARING-TEMP`, `MOTOR-TEMP`, `CASING-TEMP`
- Vibração: `IB-VIBRATION-IPS`, `OB-VIBRATION-IPS`
- Corrente: `MOTOR-AMPS`
- Pressão: `SEAL-PRESSURE-PSI`, `INLET-PRESSURE-PSI`, `OUTLET-PRESSURE-PSI`
- Vazão: `FLOW-GPM`
- Velocidade: `SPEED-RPM`
- Gap/Posição: `GAP-MM`, `LEVEL-PERCENT`

---

### CSV 03 — Template (`flows_radix_checklist_group1`)

**VIEW:** `cdf_apm/Template:v8`
**VIEW_CODE:** `TMPL`
**Arquivo:** `seed-03-templates.csv`

| Coluna CSV | Propriedade | Tipo | ✅ Obrig | Notas |
|---|---|---|---|---|
| `externalId` | externalId | string | ✅ | `CKM_TMPL_GR1_ROUTE1-KRAFT-DIGESTER` |
| `space` | space | string | ✅ | `flows_radix_checklist_group1` |
| `title` | title | string | ✅ | "Route 1 — Kraft Digester" |
| `description` | description | string | | |
| `status` | status | string | | `ready` |
| `isArchived` | isArchived | boolean | | `false` |
| `visibility` | visibility | string | | `PUBLIC` |
| `rootLocation_externalId` | rootLocation.externalId | string | | externalId do CogniteAsset raiz da rota |
| `rootLocation_space` | rootLocation.space | string | | `flows_radix_space_group1` |

---

### CSV 04 — TemplateItem (`flows_radix_checklist_group1`)

**VIEW:** `cdf_apm/TemplateItem:v7`
**VIEW_CODE:** `TITEM`
**Arquivo:** `seed-04-template-items.csv`

| Coluna CSV | Propriedade | Tipo | ✅ Obrig | Notas |
|---|---|---|---|---|
| `externalId` | externalId | string | ✅ | `CKM_TITEM_GR1_ROUTE1-7F-DIFFUSER-SCRAPER-IB-BEARING-TEMP` |
| `space` | space | string | ✅ | `flows_radix_checklist_group1` |
| `title` | title | string | ✅ | "IB Bearing Temperature" |
| `description` | description | string | | "Inspect inboard bearing temperature" |
| `order` | order | int32 | ✅ | Ordem dentro do template (1, 2, 3...) |
| `isArchived` | isArchived | boolean | | `false` |
| `visibility` | visibility | string | | `PUBLIC` |
| `asset_externalId` | asset.externalId | string | | externalId do CogniteAsset do equipamento |
| `asset_space` | asset.space | string | | `flows_radix_space_group1` |

> **Nota:** `isMeasurement`, `unit`, `min`, `max` existem na view `MeasurementReading`,
> não no `TemplateItem`. A relação Template→TemplateItems é um **EDGE** (CSV 04-edges).

---

### CSV 04-EDGES — Template → TemplateItem (edge)

**VIEW:** multi_edge `cdf_apm/Template:v8 → TemplateItem:v7`
**Arquivo:** `seed-04-edges-template-items.csv`

| Coluna CSV | Descrição | ✅ Obrig |
|---|---|---|
| `externalId` | externalId do edge: `CKM_EDGE_TMPL_TITEM_GR1_{TMPL_ID}-{TITEM_ID}` | ✅ |
| `space` | `flows_radix_checklist_group1` | ✅ |
| `startNode_externalId` | externalId do Template | ✅ |
| `startNode_space` | `flows_radix_checklist_group1` | ✅ |
| `endNode_externalId` | externalId do TemplateItem | ✅ |
| `endNode_space` | `flows_radix_checklist_group1` | ✅ |
| `type_externalId` | `templateItems` | ✅ |
| `type_space` | `cdf_apm` | ✅ |

---

### CSV 05 — Checklist (`flows_radix_checklist_group1`)

**VIEW:** `cdf_apm/Checklist:v7`
**VIEW_CODE:** `CHK`
**Arquivo:** `seed-05-checklists.csv`

| Coluna CSV | Propriedade | Tipo | ✅ Obrig | Notas |
|---|---|---|---|---|
| `externalId` | externalId | string | ✅ | `CKM_CHK_GR1_ROUTE1-2025-01-01-D` |
| `space` | space | string | ✅ | `flows_radix_checklist_group1` |
| `title` | title | string | ✅ | "Route 1 — 2025-01-01 — Day" |
| `description` | description | string | | |
| `status` | status | string | ✅ | `ToDo` / `InProgress` / `Done` / `Cancelled` |
| `type` | type | string | | `Inspection` |
| `startTime` | startTime | timestamp (ISO) | ✅ | `2025-01-01T06:00:00Z` |
| `endTime` | endTime | timestamp (ISO) | | `2025-01-01T14:00:00Z` |
| `assignedTo` | assignedTo | string[] (JSON) | ✅ | `["op.john.martinez"]` |
| `isArchived` | isArchived | boolean | | `false` |
| `visibility` | visibility | string | | `PUBLIC` |
| `rootLocation_externalId` | rootLocation.externalId | string | ✅ | Asset raiz da rota |
| `rootLocation_space` | rootLocation.space | string | ✅ | `flows_radix_space_group1` |
| `createdBy` | createdBy | string | | user externalId |

> **Nota:** A relação com Template NÃO existe como propriedade direta na view `Checklist:v7`.
> Checklist e Template são independentes — a relação é conceitual, rastreada via título e rootLocation.

---

### CSV 06 — ChecklistItem (`flows_radix_checklist_group1`)

**VIEW:** `cdf_apm/ChecklistItem:v7`
**VIEW_CODE:** `CITEM`
**Arquivo:** `seed-06-checklist-items.csv`

| Coluna CSV | Propriedade | Tipo | ✅ Obrig | Notas |
|---|---|---|---|---|
| `externalId` | externalId | string | ✅ | `CKM_CITEM_GR1_ROUTE1-2025-01-01-D-7F-DIFFUSER-SCRAPER-IB-BEARING-TEMP` |
| `space` | space | string | ✅ | `flows_radix_checklist_group1` |
| `title` | title | string | ✅ | "IB Bearing Temperature" |
| `status` | status | string | ✅ | `ToDo` / `OK` / `NotOk` / `NotApplicable` |
| `order` | order | int32 | ✅ | Ordem dentro do checklist |
| `note` | note | string | | Nota do operador (obrigatório se NotOk) |
| `startTime` | startTime | timestamp (ISO) | | |
| `endTime` | endTime | timestamp (ISO) | | |
| `isArchived` | isArchived | boolean | | `false` |
| `asset_externalId` | asset.externalId | string | ✅ | externalId do equipment asset |
| `asset_space` | asset.space | string | ✅ | `flows_radix_space_group1` |
| `createdBy` | createdBy | string | | operador |
| `updatedBy` | updatedBy | string | | operador (quem preencheu) |

---

### CSV 06-EDGES — Checklist → ChecklistItem (edge)

**VIEW:** multi_edge `cdf_apm/Checklist:v7 → ChecklistItem:v7`
**Arquivo:** `seed-06-edges-checklist-items.csv`

| Coluna CSV | Descrição | ✅ Obrig |
|---|---|---|
| `externalId` | `CKM_EDGE_CHK_CITEM_GR1_{CHK_ID}-{CITEM_ID}` | ✅ |
| `space` | `flows_radix_checklist_group1` | ✅ |
| `startNode_externalId` | externalId do Checklist | ✅ |
| `startNode_space` | `flows_radix_checklist_group1` | ✅ |
| `endNode_externalId` | externalId do ChecklistItem | ✅ |
| `endNode_space` | `flows_radix_checklist_group1` | ✅ |
| `type_externalId` | `checklistItems` | ✅ |
| `type_space` | `cdf_apm` | ✅ |

---

### CSV 07 — MeasurementReading (`flows_radix_checklist_group1`)

**VIEW:** `cdf_apm/MeasurementReading:v4`
**VIEW_CODE:** `MSRD`
**Arquivo:** `seed-07-measurement-readings.csv`

| Coluna CSV | Propriedade | Tipo | ✅ Obrig | Notas |
|---|---|---|---|---|
| `externalId` | externalId | string | ✅ | `CKM_MSRD_GR1_ROUTE1-2025-01-01-D-7F-DIFFUSER-SCRAPER-IB-BEARING-TEMP` |
| `space` | space | string | ✅ | `flows_radix_checklist_group1` |
| `title` | title | string | | "IB Bearing Temperature" |
| `type` | type | string | ✅ | `numerical` |
| `order` | order | int32 | | |
| `numericReading` | numericReading | float64 | ✅ | Valor medido (ex: `168.3`) |
| `stringReading` | stringReading | string | | Para medições por label (ex: `"Good"`) |
| `min` | min | float64 | | Mínimo aceitável |
| `max` | max | float64 | | Máximo aceitável |
| `measuredAt` | measuredAt | timestamp (ISO) | ✅ | Quando foi medido |
| `timeseries` | timeseries | string (TS externalId) | | externalId da CogniteTimeSeries CDF (legado) |
| `isArchived` | isArchived | boolean | | `false` |
| `createdBy` | createdBy | string | | operador |

---

### CSV 07-EDGES — ChecklistItem → MeasurementReading (edge)

**Arquivo:** `seed-07-edges-measurements.csv`

| Coluna CSV | Descrição | ✅ Obrig |
|---|---|---|
| `externalId` | `CKM_EDGE_CITEM_MSRD_GR1_{CITEM_ID}-{MSRD_ID}` | ✅ |
| `space` | `flows_radix_checklist_group1` | ✅ |
| `startNode_externalId` | externalId do ChecklistItem | ✅ |
| `startNode_space` | `flows_radix_checklist_group1` | ✅ |
| `endNode_externalId` | externalId do MeasurementReading | ✅ |
| `endNode_space` | `flows_radix_checklist_group1` | ✅ |
| `type_externalId` | `measurements` | ✅ |
| `type_space` | `cdf_apm` | ✅ |

---

### CSV 08 — Observation (`flows_radix_checklist_group1`)

**VIEW:** `cdf_apm/Observation:v5`
**VIEW_CODE:** `OBS`
**Arquivo:** `seed-08-observations.csv`

| Coluna CSV | Propriedade | Tipo | ✅ Obrig | Notas |
|---|---|---|---|---|
| `externalId` | externalId | string | ✅ | `CKM_OBS_GR1_ROUTE1-2025-03-15-D-7F-DIFFUSER-SCRAPER-001` |
| `space` | space | string | ✅ | `flows_radix_checklist_group1` |
| `title` | title | string | ✅ | "OB Bearing temperature above threshold" |
| `description` | description | string | ✅ | Descrição detalhada da anomalia |
| `status` | status | string | ✅ | `draft` / `completed` / `sent` |
| `type` | type | string | ✅ | `Malfunction report` / `Maintenance request` |
| `priority` | priority | string | ✅ | `Urgent` / `High` / `Medium` / `Low` |
| `dueDate` | dueDate | timestamp (ISO) | | Prazo de resolução |
| `troubleshooting` | troubleshooting | string | | Como foi investigado |
| `isArchived` | isArchived | boolean | | `false` |
| `visibility` | visibility | string | | `PUBLIC` |
| `assignedTo` | assignedTo | string[] (JSON) | | `["sup.david.nguyen"]` |
| `asset_externalId` | asset.externalId | string | ✅ | Equipment asset |
| `asset_space` | asset.space | string | ✅ | `flows_radix_space_group1` |
| `rootLocation_externalId` | rootLocation.externalId | string | | Route asset |
| `rootLocation_space` | rootLocation.space | string | | `flows_radix_space_group1` |
| `createdBy` | createdBy | string | ✅ | operador |

---

### CSV 08-EDGES — ChecklistItem → Observation (edge)

**Arquivo:** `seed-08-edges-observations.csv`

| Coluna CSV | Descrição | ✅ Obrig |
|---|---|---|
| `externalId` | `CKM_EDGE_CITEM_OBS_GR1_{CITEM_ID}-{OBS_ID}` | ✅ |
| `space` | `flows_radix_checklist_group1` | ✅ |
| `startNode_externalId` | externalId do ChecklistItem | ✅ |
| `startNode_space` | `flows_radix_checklist_group1` | ✅ |
| `endNode_externalId` | externalId da Observation | ✅ |
| `endNode_space` | `flows_radix_checklist_group1` | ✅ |
| `type_externalId` | `observations` | ✅ |
| `type_space` | `cdf_apm` | ✅ |

---

### CSV 09 — EquipmentCategory (`flows_radix_checklist_group1`)

**VIEW:** `ip_checklist_dm/EquipmentCategory:v1`
**VIEW_CODE:** `EQCAT`
**Arquivo:** `seed-09-equipment-categories.csv`

| Coluna CSV | Propriedade | Tipo | ✅ Obrig | Notas |
|---|---|---|---|---|
| `externalId` | externalId | string | ✅ | `CKM_EQCAT_GR1_ROTATING-PUMP` |
| `space` | space | string | ✅ | `flows_radix_checklist_group1` |
| `name` | name | string | ✅ | "Centrifugal Pump" |
| `description` | description | string | | "Rotating equipment, centrifugal" |
| `icon` | icon | string | | `pump` |
| `typicalMeasurements` | typicalMeasurements | string[] (JSON) | | `["bearing-temp","vibration","motor-amps"]` |

---

### CSV 10 — InspectionShift (`flows_radix_checklist_group1`)

**VIEW:** `ip_checklist_dm/InspectionShift:v1`
**VIEW_CODE:** `SHIFT`
**Arquivo:** `seed-10-inspection-shifts.csv`

| Coluna CSV | Propriedade | Tipo | ✅ Obrig | Notas |
|---|---|---|---|---|
| `externalId` | externalId | string | ✅ | `CKM_SHIFT_GR1_DAY` |
| `space` | space | string | ✅ | `flows_radix_checklist_group1` |
| `name` | name | string | ✅ | "Day Shift" |
| `startHour` | startHour | int32 | ✅ | `6` |
| `endHour` | endHour | int32 | ✅ | `14` |
| `shiftCode` | shiftCode | string | ✅ | `D` / `A` / `N` |

---

### CSV 11 — ObservationCategory (`flows_radix_checklist_group1`)

**VIEW:** `ip_checklist_dm/ObservationCategory:v1`
**VIEW_CODE:** `OBSCAT`
**Arquivo:** `seed-11-observation-categories.csv`

| Coluna CSV | Propriedade | Tipo | ✅ Obrig | Notas |
|---|---|---|---|---|
| `externalId` | externalId | string | ✅ | `CKM_OBSCAT_GR1_SAFETY` |
| `space` | space | string | ✅ | `flows_radix_checklist_group1` |
| `name` | name | string | ✅ | "Safety" |
| `description` | description | string | | |
| `requiresWorkOrder` | requiresWorkOrder | boolean | ✅ | `true` / `false` |

---

### CSV 12 — SeverityLevel (`flows_radix_checklist_group1`)

**VIEW:** `ip_checklist_dm/SeverityLevel:v1`
**VIEW_CODE:** `SEVLVL`
**Arquivo:** `seed-12-severity-levels.csv`

| Coluna CSV | Propriedade | Tipo | ✅ Obrig | Notas |
|---|---|---|---|---|
| `externalId` | externalId | string | ✅ | `CKM_SEVLVL_GR1_CRITICAL` |
| `space` | space | string | ✅ | `flows_radix_checklist_group1` |
| `name` | name | string | ✅ | "Critical" |
| `numericLevel` | numericLevel | int32 | ✅ | `5` |
| `colorCode` | colorCode | string | | `#D32F2F` |
| `slaHours` | slaHours | int32 | | `2` |
| `escalateTo` | escalateTo | string | | "Shift Supervisor + Maintenance Manager" |

---

### CSV 13 — MeasurementUnit (`flows_radix_checklist_group1`)

**VIEW:** `ip_checklist_dm/MeasurementUnit:v1`
**VIEW_CODE:** `MUNIT`
**Arquivo:** `seed-13-measurement-units.csv`

| Coluna CSV | Propriedade | Tipo | ✅ Obrig | Notas |
|---|---|---|---|---|
| `externalId` | externalId | string | ✅ | `CKM_MUNIT_GR1_DEGF` |
| `space` | space | string | ✅ | `flows_radix_checklist_group1` |
| `symbol` | symbol | string | ✅ | `°F` |
| `description` | description | string | | "Degrees Fahrenheit" |
| `quantityType` | quantityType | string | ✅ | `Temperature` |

---

### CSV 14 — InspectionItemType (`flows_radix_checklist_group1`)

**VIEW:** `ip_checklist_dm/InspectionItemType:v1`
**VIEW_CODE:** `ITMTYP`
**Arquivo:** `seed-14-inspection-item-types.csv`

| Coluna CSV | Propriedade | Tipo | ✅ Obrig | Notas |
|---|---|---|---|---|
| `externalId` | externalId | string | ✅ | `CKM_ITMTYP_GR1_OK-NOK` |
| `space` | space | string | ✅ | `flows_radix_checklist_group1` |
| `name` | name | string | ✅ | "OK / Not OK" |
| `responseOptions` | responseOptions | string[] (JSON) | ✅ | `["OK","Not OK","N/A"]` |
| `isMeasurement` | isMeasurement | boolean | ✅ | `false` |

---

### CSV 15 — ChecklistKpi (`flows_radix_checklist_group1`)

**VIEW:** `ip_checklist_dm/ChecklistKpi:v1`
**VIEW_CODE:** `CHKPI`
**Arquivo:** `seed-15-checklist-kpis.csv`
**Gerado na Fase 5** (após geração dos checklists)

| Coluna CSV | Propriedade | Tipo | ✅ Obrig | Notas |
|---|---|---|---|---|
| `externalId` | externalId | string | ✅ | `CKM_CHKPI_GR1_ROUTE1-2025-01-01-D` |
| `space` | space | string | ✅ | `flows_radix_checklist_group1` |
| `checklist_externalId` | checklist.externalId | string | ✅ | direct relation → Checklist |
| `checklist_space` | checklist.space | string | ✅ | `flows_radix_checklist_group1` |
| `shift_externalId` | shift.externalId | string | ✅ | direct relation → InspectionShift |
| `shift_space` | shift.space | string | ✅ | `flows_radix_checklist_group1` |
| `totalItems` | totalItems | int32 | ✅ | Total de ChecklistItems |
| `completedItems` | completedItems | int32 | ✅ | Items com status != ToDo |
| `okItems` | okItems | int32 | ✅ | Items com status = OK |
| `nokItems` | nokItems | int32 | ✅ | Items com status = NotOk |
| `naItems` | naItems | int32 | ✅ | Items com status = NotApplicable |
| `completionPercent` | completionPercent | float64 | ✅ | `completedItems/totalItems × 100` |
| `nokRate` | nokRate | float64 | ✅ | `nokItems/completedItems × 100` |
| `openObservations` | openObservations | int32 | | Observations com status != completed |
| `criticalObservations` | criticalObservations | int32 | | Observations com priority = Urgent |
| `durationMinutes` | durationMinutes | int32 | | Duração real da inspeção |
| `inspectorId` | inspectorId | string | ✅ | operador que executou |
| `approverId` | approverId | string | | supervisor que aprovou |
| `approvedAt` | approvedAt | timestamp (ISO) | | |

---

### CSV 16 — EquipmentHealthIndex (`flows_radix_checklist_group1`)

**VIEW:** `ip_checklist_dm/EquipmentHealthIndex:v1`
**VIEW_CODE:** `EQHI`
**Arquivo:** `seed-16-equipment-health-index.csv`
**Gerado na Fase 5** (agregação após checklists)

| Coluna CSV | Propriedade | Tipo | ✅ Obrig | Notas |
|---|---|---|---|---|
| `externalId` | externalId | string | ✅ | `CKM_EQHI_GR1_ALINE-ROUTE1-7F-DIFFUSER-SCRAPER` |
| `space` | space | string | ✅ | `flows_radix_checklist_group1` |
| `assetRef_externalId` | assetRef.externalId | string | ✅ | direct relation → CogniteAsset |
| `assetRef_space` | assetRef.space | string | ✅ | `flows_radix_space_group1` |
| `categoryRef_externalId` | categoryRef.externalId | string | ✅ | direct relation → EquipmentCategory |
| `categoryRef_space` | categoryRef.space | string | ✅ | `flows_radix_checklist_group1` |
| `healthScore` | healthScore | float64 | ✅ | 0–100 (calculado) |
| `nokRate7d` | nokRate7d | float64 | ✅ | % NOK últimos 7 dias |
| `nokRate30d` | nokRate30d | float64 | ✅ | % NOK últimos 30 dias |
| `alarmCount30d` | alarmCount30d | int32 | | Contagem de alarmes em 30 dias |
| `openObservations` | openObservations | int32 | | Observations abertas |
| `consecutiveNokRuns` | consecutiveNokRuns | int32 | | Inspeções consecutivas com NOK |
| `trendDirection` | trendDirection | string | | `improving` / `stable` / `degrading` |
| `mtbf_days` | mtbf_days | float64 | | Média de dias entre eventos NOK |
| `lastInspectedAt` | lastInspectedAt | timestamp (ISO) | | |
| `lastCalculatedAt` | lastCalculatedAt | timestamp (ISO) | ✅ | |

---

### CSV 17 — RouteKpiSnapshot (`flows_radix_checklist_group1`)

**VIEW:** `ip_checklist_dm/RouteKpiSnapshot:v1`
**VIEW_CODE:** `RTKPI`
**Arquivo:** `seed-17-route-kpi-snapshots.csv`
**Gerado na Fase 5** (agregações semanais/mensais)

| Coluna CSV | Propriedade | Tipo | ✅ Obrig | Notas |
|---|---|---|---|---|
| `externalId` | externalId | string | ✅ | `CKM_RTKPI_GR1_ROUTE1-2025-W01` |
| `space` | space | string | ✅ | `flows_radix_checklist_group1` |
| `templateRef_externalId` | templateRef.externalId | string | ✅ | direct relation → Template |
| `templateRef_space` | templateRef.space | string | ✅ | `flows_radix_checklist_group1` |
| `periodType` | periodType | string | ✅ | `weekly` / `monthly` |
| `periodLabel` | periodLabel | string | ✅ | `2025-W01` / `2025-01` |
| `periodStart` | periodStart | timestamp (ISO) | ✅ | |
| `periodEnd` | periodEnd | timestamp (ISO) | ✅ | |
| `totalChecklists` | totalChecklists | int32 | ✅ | |
| `completedChecklists` | completedChecklists | int32 | ✅ | |
| `avgNokRate` | avgNokRate | float64 | ✅ | |
| `avgCompletionPercent` | avgCompletionPercent | float64 | ✅ | |
| `avgDurationMinutes` | avgDurationMinutes | float64 | | |
| `totalObservations` | totalObservations | int32 | | |
| `criticalObservations` | criticalObservations | int32 | | |

---

### CSV 18 — MeasurementTrend (`flows_radix_checklist_group1`)

**VIEW:** `ip_checklist_dm/MeasurementTrend:v1`
**VIEW_CODE:** `MTRND`
**Arquivo:** `seed-18-measurement-trends.csv`
**Gerado na Fase 5** (uma linha por TemplateItem com medição)

| Coluna CSV | Propriedade | Tipo | ✅ Obrig | Notas |
|---|---|---|---|---|
| `externalId` | externalId | string | ✅ | `CKM_MTRND_GR1_ROUTE1-7F-DIFFUSER-SCRAPER-IB-BEARING-TEMP` |
| `space` | space | string | ✅ | `flows_radix_checklist_group1` |
| `templateItemRef_externalId` | templateItemRef.externalId | string | ✅ | direct relation → TemplateItem |
| `templateItemRef_space` | templateItemRef.space | string | ✅ | `flows_radix_checklist_group1` |
| `assetRef_externalId` | assetRef.externalId | string | ✅ | direct relation → CogniteAsset |
| `assetRef_space` | assetRef.space | string | ✅ | `flows_radix_space_group1` |
| `timeSeriesRef_externalId` | timeSeriesRef.externalId | string | ✅ | direct relation → CogniteTimeSeries **(Atlas AI bridge)** |
| `timeSeriesRef_space` | timeSeriesRef.space | string | ✅ | `flows_radix_space_group1` |
| `lastValue` | lastValue | float64 | ✅ | Última leitura de inspeção |
| `avg7dValue` | avg7dValue | float64 | | Média últimos 7 dias |
| `avg30dValue` | avg30dValue | float64 | | Média últimos 30 dias |
| `maxValue` | maxValue | float64 | | Máximo histórico |
| `threshold` | threshold | float64 | | Threshold de alarme |
| `exceedanceCount30d` | exceedanceCount30d | int32 | | Vezes acima do threshold em 30 dias |
| `trendSlope` | trendSlope | float64 | | Inclinação linear (+ = subindo) |
| `predictedDaysToAlarm` | predictedDaysToAlarm | int32 | | `(threshold - lastValue) / trendSlope` |
| `lastCalculatedAt` | lastCalculatedAt | timestamp (ISO) | ✅ | |

---

### CSV 19 — SeedManifest (`flows_radix_checklist_group1`)

**VIEW:** `ip_checklist_dm/SeedManifest:v1`
**VIEW_CODE:** `SEEDMF`
**Arquivo:** `seed-19-seed-manifest.csv`
**Gerado na Fase 6** (auditoria por execução)

| Coluna CSV | Propriedade | Tipo | ✅ Obrig | Notas |
|---|---|---|---|---|
| `externalId` | externalId | string | ✅ | `CKM_SEEDMF_GR1_20250101-RUN001` |
| `space` | space | string | ✅ | `flows_radix_checklist_group1` |
| `runId` | runId | string | ✅ | UUID único por run |
| `executedAt` | executedAt | timestamp (ISO) | ✅ | |
| `scriptVersion` | scriptVersion | string | ✅ | semver do script |
| `sourceFile` | sourceFile | string | ✅ | `A Line OEC Routes 2 (1).xlsx` |
| `sourceHash` | sourceHash | string | ✅ | SHA-256 do Excel |
| `routeSlug` | routeSlug | string | ✅ | `route1` / `all` |
| `periodStart` | periodStart | string | ✅ | `2025-01-01` |
| `periodEnd` | periodEnd | string | ✅ | `2025-12-31` |
| `isDryRun` | isDryRun | boolean | ✅ | `true` = simulação |
| `totalNodes` | totalNodes | int32 | ✅ | |
| `totalEdges` | totalEdges | int32 | ✅ | |
| `errors` | errors | string (JSON) | | JSON de erros |
| `mapping` | mapping | string (JSON) | | JSON do mapeamento Excel→CDF |

---

### Resumo dos arquivos de seed

| # | Arquivo CSV | View | Instâncias aprox. |
|---|---|---|---|
| 01 | `seed-01-assets.csv` | CogniteAsset | ~330 |
| 02 | `seed-02-timeseries.csv` | CogniteTimeSeries | ~960 |
| 03 | `seed-03-templates.csv` | Template:v8 | 8 |
| 04 | `seed-04-template-items.csv` | TemplateItem:v7 | ~1.100 |
| 04e | `seed-04-edges-template-items.csv` | edges Template→TemplateItem | ~1.100 |
| 05 | `seed-05-checklists.csv` | Checklist:v7 | 8.760 |
| 06 | `seed-06-checklist-items.csv` | ChecklistItem:v7 | ~9,6 M |
| 06e | `seed-06-edges-checklist-items.csv` | edges Checklist→ChecklistItem | ~9,6 M |
| 07 | `seed-07-measurement-readings.csv` | MeasurementReading:v4 | ~2,2 M |
| 07e | `seed-07-edges-measurements.csv` | edges ChecklistItem→Measurement | ~2,2 M |
| 08 | `seed-08-observations.csv` | Observation:v5 | ~35.000 |
| 08e | `seed-08-edges-observations.csv` | edges ChecklistItem→Observation | ~35.000 |
| 09 | `seed-09-equipment-categories.csv` | EquipmentCategory:v1 | 15 |
| 10 | `seed-10-inspection-shifts.csv` | InspectionShift:v1 | 3 |
| 11 | `seed-11-observation-categories.csv` | ObservationCategory:v1 | 6 |
| 12 | `seed-12-severity-levels.csv` | SeverityLevel:v1 | 5 |
| 13 | `seed-13-measurement-units.csv` | MeasurementUnit:v1 | 8 |
| 14 | `seed-14-inspection-item-types.csv` | InspectionItemType:v1 | 5 |
| 15 | `seed-15-checklist-kpis.csv` | ChecklistKpi:v1 | 8.760 |
| 16 | `seed-16-equipment-health-index.csv` | EquipmentHealthIndex:v1 | ~320 |
| 17 | `seed-17-route-kpi-snapshots.csv` | RouteKpiSnapshot:v1 | ~500 |
| 18 | `seed-18-measurement-trends.csv` | MeasurementTrend:v1 | ~275 |
| 19 | `seed-19-seed-manifest.csv` | SeedManifest:v1 | 1/run |

---

## 4. Rotas adicionais — 4 novas baseadas na planta Kraft

> **Conhecimento de domínio:** Planta de celulose Kraft completa (Kamyr).
> A "A Line" do Excel cobre Digestor e Lavagem. O processo completo inclui mais 4 áreas.

### Route 5 — Evaporadores e Caldeira de Recuperação

| Sistema | Equipamentos típicos |
|---|---|
| Multiple Effect Evaporators | Evaporator body E1–E6, condensate pumps, vapor valves |
| Recovery Boiler Feed | Black liquor supply pumps, smelt spout, dissolving tank |
| Smelt Dissolving Tank | Agitator, weak liquor pumps, level control |

**~28 equipamentos, ~140 itens, ~55 medições (temperatura °F, pressão PSI, fluxo GPM)**

### Route 6 — Caustificação e Forno de Cal

| Sistema | Equipamentos típicos |
|---|---|
| Green Liquor Clarifier | Clarifier drive, green liquor pumps |
| Slaker | Slaker agitator, classifier, milk of lime pumps |
| Causticizer Tanks | Causticizer agitators (×3), white liquor filters |
| Lime Kiln | Kiln drive motor, fans, ID fan, seal pumps |

**~32 equipamentos, ~165 itens, ~60 medições**

### Route 7 — Planta de Branqueamento (Bleach Plant)

| Sistema | Equipamentos típicos |
|---|---|
| D0 Stage | Chlorine dioxide feed pump, dilution pumps, washer |
| E/O Stage | Caustic/oxygen systems, washers |
| D1/D2 Stages | Additional ClO₂ stages, high-density towers |
| Chlorine Dioxide Plant | Generator, cooling system, ClO₂ storage |

**~30 equipamentos, ~150 itens, ~45 medições**

### Route 8 — Utilidades e Força (Power & Utilities)

| Sistema | Equipamentos típicos |
|---|---|
| Steam Plant | Turbine, steam header, condensate return pumps |
| Compressed Air | Compressors A/B/C, dryers, receivers |
| Cooling Water | Cooling tower fans, circulating pumps, makeup |
| Water Treatment | Clarifier, filters, chemical dosing |

**~35 equipamentos, ~175 itens, ~65 medições (inclui RPM, Amps, PSI)**

---

## 5. Personas completas de operadores (8 personas)

Para 3 turnos × 8 rotas realistas — operadores por especialidade:

| `externalId` | Nome | Turno | Especialidade | Rotas assignadas |
|---|---|---|---|---|
| `op.john.martinez` | John Martinez | Day (D) | Kraft Digester (10 anos) | Route 1, 2 |
| `op.sarah.chen` | Sarah Chen | Afternoon (A) | Digester/Bleach (8 anos) | Route 1, 7 |
| `op.mike.torres` | Mike Torres | Night (N) | Feed Systems (3 anos — júnior) | Route 2, 3 |
| `op.linda.kowalski` | Linda Kowalski | Day (D) | Washing & Screens (12 anos) | Route 3, 4 |
| `op.james.osei` | James Osei | Afternoon (A) | Bleach/Utilities (6 anos) | Route 4, 8 |
| `op.anna.petrov` | Anna Petrov | Night (N) | Chemical Recovery (9 anos) | Route 5, 6 |
| `op.carlos.rivera` | Carlos Rivera | Day (D) | Recovery & Causticizing (15 anos) | Route 6, 5 |
| `op.fatima.ali` | Fatima Ali | Afternoon (A) | Utilities & Power (5 anos) | Route 7, 8 |
| `sup.david.nguyen` | David Nguyen | Day (supervisor) | Manutenção — aprova críticos | todas |
| `sup.carol.bishop` | Carol Bishop | Afternoon (supervisor) | Operações — aprova rotina | todas |

---

## 6. Padrões de degradação e eventos simulados (1 ano)

### Calendário de eventos (realismo industrial)

| Período | Evento | Rotas afetadas | Impacto nos dados |
|---|---|---|---|
| Jan semana 1–2 | **Cold startup após parada anual** | Todas | N/A rate 20%, temps subindo gradualmente |
| Jan semana 3–4 | **Steady state** | Todas | NOK rate 3–4% |
| Fev | **Chip supply shortage** — Low Pressure Feeder forçado | Route 2 | Motor temps +8°F, vibration +0.08 ips |
| Mar | **Bearing failure warning — Diffuser Scraper** | Route 1 | OB Bearing sobe 162→175→183°F ao longo de 3 semanas |
| Abr semana 1 | **Unplanned downtime — Diffuser Scraper substituído** | Route 1 | 4 dias N/A, depois retorno ao normal |
| Mai | **Planned maintenance — Route 2** | Route 2 | N/A rate 15% em 1 semana |
| Jun | **Summer heat wave** — ambient temp +15°F | Todas | Todos motor temps +5–10°F |
| Jul | **Seal failure — North Filtrate Pump** | Route 1 | Seal Water=No, Packing NOK, Observation critical |
| Ago | **Recovery Boiler annual inspection** | Route 5 | N/A 100% por 10 dias |
| Set | **High Pressure Feeder threshold exceedance** | Route 2 | Motor Temp >190°F 3× em 2 semanas |
| Out | **New operator (Mike Torres)** — maior variabilidade | Route 2, 3 | Slide rule settings inconsistentes, duração +30% |
| Nov | **Pre-shutdown inspection mode** | Todas | Checklist duration +20%, mais observations |
| Dez | **Annual shutdown preparation** | Todas | Crescente N/A, último dia: shutdown |

### Distribuição de NOK por operador (realismo)

| Operador | NOK rate base | Característica |
|---|---|---|
| John Martinez | 6% | Experiente — preciso, consistente |
| Sarah Chen | 5% | Mais experiente — taxa baixa, observações detalhadas |
| Mike Torres | 11% | Júnior — taxa alta de NOK, duração maior |
| Linda Kowalski | 4% | Muito experiente — taxa mais baixa |
| James Osei | 7% | Médio, detecta mais em sistemas complexos |
| Anna Petrov | 6% | Consistente, especialista em chemical recovery |
| Carlos Rivera | 5% | Maior experiência, taxa baixa |
| Fatima Ali | 8% | Utilities tem mais variação de carga |

---

## 7. Arquitetura do script gerador (challenge requirements)

### 7.1 Princípios mandatórios

| Requisito | Implementação |
|---|---|
| **Repeatable** | Mesmo input → mesmo output (seed baseado em hash determinístico) |
| **Auditable** | `SeedManifest` gravado no CDF + logs em `docs/Seed/logs/` |
| **Incremental** | Cada run cobre período específico (`--from` / `--to`); não re-gera o que já existe |
| **Idempotent** | Todos os upserts — nunca `insert`; `externalId` determinístico garante isto |
| **Realistic** | Padrões sazonais, personas, degradação, distribuições baseadas em benchmarks industriais |
| **Bounded** | `--route`, `--from`, `--to`, `--dry-run` controlam escopo |
| **Safe for CDF** | Batch ≤ 1.000 nodes/edges por requisição; concurrency ≤ 5 requests paralelos |

### 7.2 Estrutura dos arquivos do gerador

```
scripts/
  seed/
    index.mjs              ← entry point (--dry-run, --route, --from, --to)
    config.mjs             ← mapping config (Excel → CDF externalIds)
    rules.mjs              ← generation rules (NOK rates, distributions, events)
    generators/
      assets.mjs           ← CogniteAsset hierarchy
      classification.mjs   ← EquipmentCategory, InspectionShift, ObservationCategory, etc.
      templates.mjs        ← Template + TemplateItem
      checklists.mjs       ← Checklist + ChecklistItem + MeasurementReading
      observations.mjs     ← Observation
      kpis.mjs             ← ChecklistKpi, EquipmentHealthIndex, RouteKpiSnapshot
      manifest.mjs         ← SeedManifest (auditoria)
    lib/
      deterministic-id.mjs ← hash-based externalId generation
      batch-upserter.mjs   ← batch + concurrency control (max 5 parallel, 1000/batch)
      dry-run.mjs          ← dry-run mode (print only)
      logger.mjs           ← structured logging → docs/Seed/logs/
    data/
      routes-extra.json    ← Routes 5–8 (não estão no Excel)
      personas.json        ← 8 operadores + 2 supervisores
      events-calendar.json ← eventos sazonais com datas e impactos

docs/Seed/
  excel-raw-extract.json   ← dados extraídos do Excel (já existe)
  excel-analysis.md        ← análise documentada (já existe)
  seed-design.md           ← este arquivo
  generated/               ← CSVs de output (criados pelo script)
    run-<YYYY-MM-DD>-<runId>/
      seed-manifest.json   ← execution manifest
      audit.json           ← contagens por entidade
      seed-assets.csv
      seed-classification.csv
      seed-templates.csv
      seed-template-items.csv
      seed-checklists.csv
      seed-checklist-items.csv
      seed-measurements.csv
      seed-observations.csv
      seed-kpis.csv
  logs/
    <YYYY-MM-DD>-<runId>.log
```

### 7.3 Fluxo de execução do script

```
1. Parse args (--dry-run, --route, --from, --to, --env)
2. Load config + rules + excel-raw-extract.json
3. Compute runId (UUID) + sourceHash (SHA-256 do Excel)
4. --- FASE 1: Classification ---
   Gerar EquipmentCategory, InspectionShift, ObservationCategory, SeverityLevel,
   MeasurementUnit, InspectionItemType
5. --- FASE 2: Assets ---
   Gerar hierarquia: ALine → Route → Section → Equipment
   Classificar cada equip com EquipmentCategory
6. --- FASE 3: Templates ---
   4 routes do Excel + 4 novas → Template + TemplateItem + InspectionItemType ref
7. --- FASE 4: Checklists (loop por dia 365 × 3 turnos × N routes) ---
   Para cada checklist:
     a. Selecionar persona (operador do turno/rota)
     b. Aplicar calendar events (N/A rate, temp offset, etc.)
     c. Gerar ChecklistItems com resultados distribuídos
     d. Gerar MeasurementReadings com valores ±ruído Gaussiano
     e. Gerar Observations para cada NOK crítico
     f. Calcular ChecklistKpi inline
8. --- FASE 5: Aggregate KPIs ---
   EquipmentHealthIndex (por equipamento)
   RouteKpiSnapshot (weekly + monthly)
   MeasurementTrend (por TemplateItem com isMeasurement)
9. --- FASE 6: SeedManifest ---
   Gravar manifest com contagens e hash
10. Output: CSV files + audit.json + log
11. Se não dry-run: batch upsert via CDF SDK (batch=1000, concurrency=5)
```

### 7.4 ExternalID determinístico

```javascript
// Exemplo de geração determinística
function makeId(type, ...parts) {
  return `ip.${type}.${parts.map(slugify).join('.')}`;
}

// Checklist: ip.checklist.route1.2025-01-01.D
// ChecklistItem: ip.chkitem.route1.2025-01-01.D.7f.diffuser-scraper.motor-temp
// Measurement: ip.meas.route1.2025-01-01.D.7f.diffuser-scraper.motor-temp
// Observation: ip.obs.route1.2025-01-01.D.7f.diffuser-scraper.001
```

### 7.5 Batch + Concurrency

```javascript
// Máx 1.000 nodes/upsert, 5 requisições paralelas
// Baseado em DM operational constraints (docs/architecture + docs/mcp-cdf.md)
const batcher = new BatchUpserter({ batchSize: 1000, maxConcurrency: 5 });
await batcher.upsertNodes(nodes);
await batcher.upsertEdges(edges);
```

---

## 8. Análises que o app pode entregar (diferencial)

### 8.1 Dashboards imediatos (usando KPIs pré-calculados)

| Dashboard | View fonte | Diferencial |
|---|---|---|
| **Checklist Status Overview** | `ChecklistKpi v1` | Status real-time (To Do/Ongoing/Done/Overdue/Not OK) — FR do challenge |
| **Operator Performance** | `ChecklistKpi v1` grouped by `inspectorId` | Quem detecta mais, quem é mais rápido |
| **Equipment NOK Heatmap** | `EquipmentHealthIndex v1` | Mapa de calor: quais equipamentos mais problemáticos |
| **Degradation Early Warning** | `EquipmentHealthIndex.consecutiveNokRuns` | Alerta antes da falha — **diferencial único** |
| **Route KPI Trends** | `RouteKpiSnapshot v1` | Evolução mensal por rota |
| **Measurement Time-Series** | `MeasurementTrend v1` | Gráfico de temperatura/vibração ao longo do tempo |
| **MTBF Estimation** | `EquipmentHealthIndex.mtbf_days` | Estimativa de vida útil restante |
| **Shift Comparison** | `ChecklistKpi v1` + `InspectionShift v1` | Qual turno tem mais NOK? |

### 8.2 Cálculos preditivos armazenados no modelo

Estes são os verdadeiros diferenciais — análises que normalmente requerem um sistema externo,
mas que ficam **no próprio CDF** como propriedades das views:

| Cálculo | View | Lógica |
|---|---|---|
| `predictedDaysToAlarm` | `MeasurementTrend v1` | Regressão linear simples: `(threshold - lastValue) / trendSlope` |
| `consecutiveNokRuns` | `EquipmentHealthIndex v1` | Contador de inspeções consecutivas com NOK — early warning |
| `healthScore` | `EquipmentHealthIndex v1` | `100 - (nokRate30d × 50) - (alarmCount30d × 20) - (openObs × 5)` |
| `trendDirection` | `EquipmentHealthIndex v1` | `nokRate7d vs nokRate30d`: `improving/stable/degrading` |
| `mtbf_days` | `EquipmentHealthIndex v1` | Média de dias entre eventos NOK históricos |

---

## 9. Tabela de decisão — DM Solution vs ApmAppData

| Entidade | Onde fica | Justificativa |
|---|---|---|
| Template, TemplateItem | `cdf_apm` (ApmAppData v13) | Já existe, não duplicar |
| Checklist, ChecklistItem | `cdf_apm` (ApmAppData v13) | Já existe |
| MeasurementReading | `cdf_apm` (ApmAppData v13) | Já existe |
| Observation | `cdf_apm` (ApmAppData v13) | Já existe |
| Schedule | `cdf_apm` (ApmAppData v13) | Já existe |
| CogniteAsset | `cdf_cdm` (CogniteCore v1) | Hierarquia de assets padrão |
| CogniteEquipment | `cdf_cdm` (CogniteCore v1) | Para equipamentos rotativos com fabricante/modelo |
| **EquipmentCategory** | `ip_checklist_dm` | **Novo** — SST para tipos |
| **InspectionShift** | `ip_checklist_dm` | **Novo** — SST para turnos |
| **ObservationCategory** | `ip_checklist_dm` | **Novo** — SST para tipos de observação |
| **SeverityLevel** | `ip_checklist_dm` | **Novo** — SST para severidades com SLA |
| **MeasurementUnit** | `ip_checklist_dm` | **Novo** — unidades específicas do processo |
| **InspectionItemType** | `ip_checklist_dm` | **Novo** — SST para tipos de resposta |
| **ChecklistKpi** | `ip_checklist_dm` | **Novo** — KPIs pré-calculados por checklist |
| **EquipmentHealthIndex** | `ip_checklist_dm` | **Novo** — diferencial preditivo |
| **RouteKpiSnapshot** | `ip_checklist_dm` | **Novo** — KPI agregado por rota/período |
| **MeasurementTrend** | `ip_checklist_dm` | **Novo** — tendência temporal de medições |
| **SeedManifest** | `ip_checklist_dm` | **Novo** — auditoria do seed |

---

## 10. Estratégia de CogniteAsset + CogniteTimeSeries

> **Decisão crítica** baseada em survey das instâncias reais do CDF `radix-dev` (Jun 2026).

### 10.1 Survey de assets existentes no CDF

Query via MCP `cdf_list_instances` (views `CogniteAsset/v1` e `CogniteTimeSeries/v1`) revelou:

| Space | Assets encontrados | Contexto |
|---|---|---|
| `wind_space_instances` | 28 assets (Nitric Acid Plant hierarchy) | Outro grupo de treinamento |
| `radix_space` | 22 assets (mesma planta sem hierarquia) + `pre.t_101a` (turbine) | Outro grupo de treinamento |
| `GENAI-COR-ALL-DAT` | Assets de oil & gas | Outro grupo |

**Conclusão:** Nenhum asset de papel e celulose / IP / Kamyr existe no ambiente.

> **Não há assets reutilizáveis** para o contexto da International Paper.
> Precisamos criar os nossos próprios em `radix_space` com prefixo `ip.`.

### 10.2 Estratégia de CogniteAsset para o seed

Criar toda hierarquia IP no space `flows_radix_space_group1`:

```
IP.ASSET.ALINE                                     ← root (A Line Production Line)
  IP.ASSET.ALINE.ROUTE1                            ← Route 1 (Kraft Digester)
    IP.ASSET.ALINE.ROUTE1.7F                       ← Section
      IP.ASSET.ALINE.ROUTE1.7F.DIFFUSER-SCRAPER    ← Equipment (leaf)
      IP.ASSET.ALINE.ROUTE1.7F.CHIP-FEEDER-LP      ← Equipment (leaf)
  IP.ASSET.ALINE.ROUTE2                            ← Route 2 (Chip/Liquor Feed)
    ...
```

**Propriedades de cada `CogniteAsset` node:**
- `name`, `description`, `tags`
- `parent` → asset pai (hierarquia)
- `root` → `ip.asset.aline`
- **NÃO** colocar `categoryRef` no CogniteAsset — o CogniteCore não tem esse campo

### 10.3 Relação EquipmentCategory → CogniteAsset (design correto)

A relação **NÃO** vai em `CogniteAsset` (que é do CogniteCore e não podemos modificar).
O bridge fica no `EquipmentHealthIndex`:

```
EquipmentHealthIndex v1 (ip_checklist_dm)
  ├── assetRef    ──direct──▶  CogniteAsset:v1  (cdf_cdm)      ← link para o core
  ├── categoryRef ──direct──▶  EquipmentCategory:v1 (ip_checklist_dm) ← SST
  └── healthScore, nokRate30d, consecutiveNokRuns...
```

**Para Atlas AI:** um único hop de grafo resolve `EquipmentHealthIndex → CogniteAsset → CogniteTimeSeries`,
cruzando dados de inspeção com dados de sensor contínuo.

### 10.4 Estratégia de CogniteTimeSeries

#### O problema do reverse relation

```
CogniteTimeSeries.assets  = direct relation → CogniteAsset   ✅ queryable (filtrável)
CogniteAsset.timeSeries   = reverse direct relation (lista)   ❌ não filtrável diretamente
```

**Regra:** sempre query de `CogniteTimeSeries → Asset`, nunca de `Asset → timeSeries`.

#### O que criar

Para cada **equipamento rotativo ou com medição** de inspeção, criar `CogniteTimeSeries`
no space `radix_space` linkadas via `assets`:

```
ip.ts.route1.7f.diffuser-scraper.ib-bearing-temp        → assets: [IP.ASSET.ALINE.ROUTE1.7F.DIFFUSER-SCRAPER]
ip.ts.route1.7f.diffuser-scraper.ob-bearing-temp        → assets: [IP.ASSET.ALINE.ROUTE1.7F.DIFFUSER-SCRAPER]
ip.ts.route1.7f.diffuser-scraper.ib-vibration-ips       → assets: [IP.ASSET.ALINE.ROUTE1.7F.DIFFUSER-SCRAPER]
ip.ts.route1.7f.diffuser-scraper.motor-amps             → assets: [IP.ASSET.ALINE.ROUTE1.7F.DIFFUSER-SCRAPER]
ip.ts.route2.lp-feeder.motor-temp-degF                  → assets: [IP.ASSET.ALINE.ROUTE2.LP-FEEDER]
...
```

| Tipo de equipamento | Time series geradas |
|---|---|
| Motores rotativos | `motor-temp-degF`, `motor-amps`, `vibration-ips` |
| Bombas | `bearing-temp-degF`, `seal-pressure-psi`, `flow-gpm` |
| Alimentadores (feeders) | `motor-temp-degF`, `motor-amps`, `gap-mm` |
| Vasos de pressão | `pressure-psi`, `temp-degF`, `level-percent` |
| Trocadores de calor | `inlet-temp-degF`, `outlet-temp-degF`, `dp-psi` |
| Compressores | `discharge-pressure-psi`, `bearing-temp-degF`, `vibration-ips` |

**~320 equipamentos × ~3 TS/equip = ~960 CogniteTimeSeries nodes** (sem datapoints — apenas metadados para o grafo)

> **Nota:** Os nodes de `CogniteTimeSeries` não precisam ter datapoints para o grafo do
> Atlas AI funcionar. A relação `timeSeriesRef` em `MeasurementTrend` é suficiente para
> o AI atravessar o grafo e correlacionar com os dados de inspeção.

### 10.5 O elo gold — MeasurementTrend como bridge

```
MeasurementTrend v1 (ip_checklist_dm):
  ├── templateItemRef  ──▶  TemplateItem:v7 (cdf_apm)            ← inspeção manual
  ├── assetRef         ──▶  CogniteAsset:v1 (cdf_cdm)            ← equipamento
  ├── timeSeriesRef    ──▶  CogniteTimeSeries:v1 (cdf_cdm)       ← sensor contínuo
  ├── lastValue        float   ← último valor de inspeção
  ├── avg7dValue       float
  ├── avg30dValue      float
  ├── trendSlope       float   ← inclinação da tendência
  └── predictedDaysToAlarm int ← preditivo: `(threshold - lastValue) / trendSlope`
```

**Grafo completo para Atlas AI:**
```
TemplateItem → MeasurementTrend ← CogniteTimeSeries
                      ↓
               CogniteAsset ← EquipmentHealthIndex → EquipmentCategory
```

Qualquer query de Atlas AI que comece em um checklist, equipamento ou time series
consegue traversar o grafo completo — inspeção manual ↔ sensor ↔ health index ↔ categoria.

### 10.6 Atualização da tabela de decisão

| Entidade | Space | Nota |
|---|---|---|
| `CogniteAsset` | `flows_radix_space_group1` | **Criar novos** — prefixo `IP.ASSET.` (nenhum asset IP existe) |
| `CogniteTimeSeries` | `flows_radix_space_group1` | **Criar novos** — prefixo `IP.TS.` (~960 nodes, sem datapoints) |
| `EquipmentCategory` | `flows_radix_checklist_group1` | Lookup SST — não vai no CogniteAsset |
| `EquipmentHealthIndex` | `flows_radix_checklist_group1` | Bridge: `assetRef` + `categoryRef` juntos aqui |
| `MeasurementTrend` | `flows_radix_checklist_group1` | Bridge: `templateItemRef` + `assetRef` + `timeSeriesRef` |

---

## 11. Status e próximos passos

### Concluído ✅

| Item | Detalhe |
|---|---|
| Data Model `ip_gp1_checklist_dm` | Deployado no `radix-dev` (space `ip_checklist_dm`, version `v1`) — 11 containers, 19 views |
| Views com typed direct relations | `type: direct_relation` + `source` declarados — grafo de relacionamentos visível no CDF UI |
| `scripts/seed/index.mjs` | Gerador completo: SST → Assets → TimeSeries → Templates → Checklists → KPIs → SeedManifest |
| `scripts/seed/ingest.mjs` | Ingestão com `--only <fase>` e `--dry-run` — APM + CDM ingeridos no `radix-dev` |
| `scripts/seed/clean.mjs` | Limpeza de instâncias com `--only <grupo>` — sem risco de deletar dados de outras seeds |
| Bug fix: `MeasurementTrend` | Propriedade corrigida de `p?.value` → `p?.numericReading` (47 trends gerados) |
| Bug fix: `EquipmentHealthIndex` | Deduplicação por `equipSlug` — eliminou IDs duplicados cross-route (83→71 nós únicos) |
| Bug fix: `SeedManifest` | Nomes de propriedades corrigidos: `fromDate→periodStart`, `toDate→periodEnd`, `dryRun→isDryRun`, `generatedAt→executedAt` |

### Scripts npm disponíveis

```bash
# ── Geração ──────────────────────────────────────────────────────
npm run seed:generate           # dry-run — gera JSONs sem tocar no CDF
npm run seed:generate:full      # Jan–Dez 2025

# ── Ingestão ─────────────────────────────────────────────────────
npm run seed:ingest             # ingere tudo do último run
npm run seed:ingest:dry         # valida payload sem gravar
npm run seed:ingest:assets      # só CogniteAsset + CogniteTimeSeries
npm run seed:ingest:apm-schema  # só Templates + TemplateItems + edges
npm run seed:ingest:apm-checklists  # só Checklists + Items + Measurements + Observations
npm run seed:ingest:ip-schema   # só SST Classification
npm run seed:ingest:kpis        # só KPIs + SeedManifest

# ── Limpeza ──────────────────────────────────────────────────────
npm run seed:clean              # deleta todas as instâncias do último run
npm run seed:clean:dry          # preview do que seria deletado
npm run seed:clean:ip           # deleta só ip_checklist_dm (SST + KPIs) — APM/CDM intactos
npm run seed:clean:ip:dry       # preview do clean:ip
npm run seed:clean:kpis         # deleta só KPIs + SeedManifest
npm run seed:clean:assets       # deleta todas as instâncias do space flows_radix_space_group1
npm run seed:clean:checklist    # deleta todas as instâncias do space flows_radix_checklist_group1
```

### Concluído nesta sessão ✅ (adicionado em 2026-06-03)

| Item | Detalhe |
|---|---|
| Extension containers | `ApmTemplateItemExtended` (inspectionTypeRef+unitRef) + `ApmObservationExtended` (categoryRef+severityRef) |
| Views externas enriquecidas | `ApmTemplateItem` e `ApmObservation` ganham relações tipadas para SST lookups |
| Multi-source upsert | `templateItemNode` e `observationNode` escrevem em APM container + extensão ip_checklist_dm simultaneamente |
| Retry exponencial | `BatchUpserter` retenta 503/409/429 automaticamente — até 5x com backoff 1s→32s |
| Seed completo validado | Todas as views verificadas via MCP — relações tipadas confirmadas nas instâncias |

### ✅ Seed completo — nenhuma pendência
