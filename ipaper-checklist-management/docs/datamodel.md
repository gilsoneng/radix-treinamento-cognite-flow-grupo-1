# Data Model — ApmAppData (`cdf_apm` v13)

> Documentação gerada via MCP `cognite-cdf` em 2026-06-02.  
> Fonte: `cdf_get_data_model` + `cdf_get_view` para cada view.

---

## Identificação

| Campo | Valor |
|---|---|
| **Space** | `cdf_apm` |
| **ExternalId** | `ApmAppData` |
| **Versão** | `v13` |
| **Nome** | ApmAppData |
| **Descrição** | APM data models within the cognite applications space |
| **Global** | `true` |

---

## Visão geral — 22 views em 3 spaces

| Space | Views |
|---|---|
| `cdf_apm` | `Checklist` v7, `ChecklistItem` v7, `Template` v8, `TemplateItem` v7, `Observation` v5, `MeasurementReading` v4, `Schedule` v4, `Activity` v2, `Operation` v2, `MaterialRequirement` v1, `Notification` v2, `Condition` v1, `Action` v1, `ConditionalAction` v1 |
| `cdf_apps_shared` | `CDF_User` v1, `CDF_UserPreferences` v1, `Creatable` v1, `CogniteSolutionTag` v1 |
| `cdf_core` | `Asset` v2, `Sourceable` v1, `Describable` v1, `Schedulable` v1 |

---

## Grafo de relacionamentos

```
Template (cdf_apm v8)
  ├─ rootLocation ──────────────────────────► Asset (cdf_core v2)
  ├─ createdBy / updatedBy ────────────────► CDF_User (cdf_apps_shared v1)
  ├─ solutionTags[] ───────────────────────► CogniteSolutionTag (cdf_apps_shared v1)
  └─[edge: referenceTemplateItems] ────────► TemplateItem (cdf_apm v7)
                                                ├─ asset ──────────────────► Asset (cdf_core v2)
                                                ├─[edge: referenceSchedules]──► Schedule (cdf_apm v4)
                                                └─[edge: referenceMeasurements]► MeasurementReading (cdf_apm v4)

Checklist (cdf_apm v7)
  ├─ rootLocation ──────────────────────────► Asset (cdf_core v2)
  ├─ createdBy / updatedBy ────────────────► CDF_User (cdf_apps_shared v1)
  ├─ solutionTags[] ───────────────────────► CogniteSolutionTag (cdf_apps_shared v1)
  └─[edge: referenceChecklistItems] ───────► ChecklistItem (cdf_apm v7)
                                                ├─ asset ──────────────────► Asset (cdf_core v2)
                                                ├─ files[] ────────────────► CDF Files
                                                ├─[edge: referenceMeasurements]► MeasurementReading (cdf_apm v4)
                                                └─[edge: referenceObservations]─► Observation (cdf_apm v5)
```

> **Padrão de uso:** `Template` é o "molde" reutilizável → `Checklist` é a instância em execução com estado, notas e observações.

---

## Schemas detalhados

---

### 1. `Template` — v8 — node

**Descrição:** Modelo padronizado de tarefas de manutenção/inspeção. Define o plano antes da execução.

**Containers mapeados:** `cdf_core/Describable`, `cdf_apps_shared/Creatable`, `cdf_apm/Template`

**Implementa:** `Describable v1`, `Creatable v1`

| Propriedade | Tipo | Nullable | Container | Descrição |
|---|---|---|---|---|
| `title` | `text` | sim | `Describable` | Nome do template |
| `description` | `text` | sim | `Describable` | Descrição longa |
| `labels` | `text[]` | sim | `Describable` | Labels genéricos |
| `status` | `text` | sim | `Template` | Status: draft, ready, etc. |
| `assignedTo` | `text[]` | sim | `Template` | Usuários/disciplinas atribuídos |
| `rootLocation` | `direct → Asset v2` | sim | `Template` | Asset raiz (localização) |
| `solutionTags` | `direct[] → CogniteSolutionTag v1` | sim | `Template` | Tags de solução |
| `visibility` | `text` | sim | `Creatable` | PUBLIC / PRIVATE / PROTECTED |
| `createdBy` | `direct → CDF_User v1` | sim | `Creatable` | Quem criou |
| `updatedBy` | `direct → CDF_User v1` | sim | `Creatable` | Quem atualizou por último |
| `isArchived` | `boolean` | sim | `Creatable` | Arquivado (oculto na maioria das UIs)? |
| **`templateItems`** | **edge → TemplateItem v7** | — | — | **Tasks do template** (multi_edge, outwards) |

---

### 2. `TemplateItem` — v7 — node

**Descrição:** Tarefa individual dentro de um template. Define o que será executado antes da geração de checklists.

**Containers mapeados:** `cdf_core/Describable`, `cdf_apps_shared/Creatable`, `cdf_apm/TemplateItem`

**Implementa:** `Describable v1`, `Creatable v1`

| Propriedade | Tipo | Nullable | Container | Descrição |
|---|---|---|---|---|
| `title` | `text` | sim | `Describable` | Nome da task |
| `description` | `text` | sim | `Describable` | Descrição |
| `labels` | `text[]` | sim | `Describable` | Labels |
| `order` | `int32` | sim | `TemplateItem` | Ordem de execução |
| `asset` | `direct → Asset v2` | sim | `TemplateItem` | Asset associado |
| `visibility` | `text` | sim | `Creatable` | PUBLIC / PRIVATE / PROTECTED |
| `createdBy` | `direct → CDF_User v1` | sim | `Creatable` | Quem criou |
| `updatedBy` | `direct → CDF_User v1` | sim | `Creatable` | Quem atualizou |
| `isArchived` | `boolean` | sim | `Creatable` | Arquivado? |
| **`schedules`** | **edge → Schedule v4** | — | — | **Agendamentos associados** (multi_edge, outwards) |
| **`measurements`** | **edge → MeasurementReading v4** | — | — | **Medições definidas** (multi_edge, outwards) |

---

### 3. `Checklist` — v7 — node

**Descrição:** Instância de execução de trabalho de manutenção/inspeção. Gerado a partir de um Template, mantém o estado real da execução.

**Containers mapeados:** `cdf_core/Sourceable`, `cdf_core/Describable`, `cdf_core/Schedulable`, `cdf_apps_shared/Creatable`, `cdf_apm/Checklist`

**Implementa:** `Sourceable v1`, `Describable v1`, `Schedulable v1`, `Creatable v1`

| Propriedade | Tipo | Nullable | Container | Descrição |
|---|---|---|---|---|
| `title` | `text` | sim | `Describable` | Nome do checklist |
| `description` | `text` | sim | `Describable` | Descrição |
| `labels` | `text[]` | sim | `Describable` | Labels |
| `startTime` | `timestamp` | sim | `Schedulable` | Início |
| `endTime` | `timestamp` | sim | `Schedulable` | Fim |
| `status` | `text` | sim | `Checklist` | Status atual do checklist |
| `type` | `text` | sim | `Checklist` | Tipo: Maintenance, Inspection, etc. |
| `assignedTo` | `text[]` | sim | `Checklist` | Usuários/disciplinas atribuídos |
| `rootLocation` | `direct → Asset v2` | sim | `Checklist` | Asset raiz da localização |
| `solutionTags` | `direct[] → CogniteSolutionTag v1` | sim | `Checklist` | Tags de solução |
| `visibility` | `text` | sim | `Creatable` | PUBLIC / PRIVATE / PROTECTED |
| `createdBy` | `direct → CDF_User v1` | sim | `Creatable` | Quem criou |
| `updatedBy` | `direct → CDF_User v1` | sim | `Creatable` | Quem atualizou |
| `isArchived` | `boolean` | sim | `Creatable` | Arquivado? |
| `sourceId` | `text` | sim | `Sourceable` | ID no sistema de origem |
| `source` | `text` | sim | `Sourceable` | Nome do sistema de origem |
| `sourceCreatedTime` | `timestamp` | sim | `Sourceable` | Criação no sistema de origem |
| `sourceUpdatedTime` | `timestamp` | sim | `Sourceable` | Atualização no sistema de origem |
| **`checklistItems`** | **edge → ChecklistItem v7** | — | — | **Tasks do checklist** (multi_edge, outwards) |

---

### 4. `ChecklistItem` — v7 — node

**Descrição:** Tarefa individual dentro de um checklist em execução. Registra estado, notas, arquivos e observações de campo.

**Containers mapeados:** `cdf_core/Sourceable`, `cdf_core/Describable`, `cdf_core/Schedulable`, `cdf_apps_shared/Creatable`, `cdf_apm/ChecklistItem`

**Implementa:** `Sourceable v1`, `Describable v1`, `Schedulable v1`, `Creatable v1`

| Propriedade | Tipo | Nullable | Container | Descrição |
|---|---|---|---|---|
| `title` | `text` | sim | `Describable` | Nome da tarefa |
| `description` | `text` | sim | `Describable` | Descrição |
| `labels` | `text[]` | sim | `Describable` | Labels |
| `startTime` | `timestamp` | sim | `Schedulable` | Início |
| `endTime` | `timestamp` | sim | `Schedulable` | Fim |
| `status` | `text` | sim | `ChecklistItem` | Status da tarefa |
| `order` | `int32` | sim | `ChecklistItem` | Ordem de execução |
| `note` | `text` | sim | `ChecklistItem` | Notas adicionais do operador |
| `asset` | `direct → Asset v2` | sim | `ChecklistItem` | Asset associado |
| `files` | `file[]` | sim | `ChecklistItem` | Arquivos anexos (fotos, docs) |
| `visibility` | `text` | sim | `Creatable` | PUBLIC / PRIVATE / PROTECTED |
| `createdBy` | `direct → CDF_User v1` | sim | `Creatable` | Quem criou |
| `updatedBy` | `direct → CDF_User v1` | sim | `Creatable` | Quem atualizou |
| `isArchived` | `boolean` | sim | `Creatable` | Arquivado? |
| `sourceId` | `text` | sim | `Sourceable` | ID no sistema de origem |
| `source` | `text` | sim | `Sourceable` | Nome do sistema de origem |
| `sourceCreatedTime` | `timestamp` | sim | `Sourceable` | Criação no sistema de origem |
| `sourceUpdatedTime` | `timestamp` | sim | `Sourceable` | Atualização no sistema de origem |
| **`measurements`** | **edge → MeasurementReading v4** | — | — | **Medições da tarefa** (multi_edge, outwards) |
| **`observations`** | **edge → Observation v5** | — | — | **Observações da tarefa** (multi_edge, outwards) |

---

### 5. `Observation` — v5 — node

**Descrição:** Anomalia reportada por operador de campo. Captura desvios, falhas e solicitações de manutenção.

**Containers mapeados:** `cdf_core/Sourceable`, `cdf_core/Describable`, `cdf_apps_shared/Creatable`, `cdf_apm/Observation`

**Implementa:** `Sourceable v1`, `Describable v1`, `Creatable v1`

| Propriedade | Tipo | Nullable | Container | Descrição |
|---|---|---|---|---|
| `title` | `text` | sim | `Describable` | Título da observação |
| `description` | `text` | sim | `Describable` | Descrição detalhada |
| `labels` | `text[]` | sim | `Describable` | Labels |
| `status` | `text` | sim | `Observation` | **draft / completed / sent** |
| `type` | `text` | sim | `Observation` | Malfunction report, Maintenance request, etc. |
| `priority` | `text` | sim | `Observation` | **Urgent, High**, … |
| `assignedTo` | `text[]` | sim | `Observation` | Usuários/disciplinas atribuídos |
| `dueDate` | `timestamp` | sim | `Observation` | Prazo de resolução |
| `asset` | `direct → Asset v2` | sim | `Observation` | Asset associado |
| `rootLocation` | `direct → Asset v2` | sim | `Observation` | Localização raiz |
| `files` | `file[]` | sim | `Observation` | Arquivos/fotos da anomalia |
| `troubleshooting` | `text` | sim | `Observation` | Como a anomalia foi investigada |
| `solutionTags` | `direct[] → CogniteSolutionTag v1` | sim | `Observation` | Tags de solução |
| `visibility` | `text` | sim | `Creatable` | PUBLIC / PRIVATE / PROTECTED |
| `createdBy` | `direct → CDF_User v1` | sim | `Creatable` | Quem criou |
| `updatedBy` | `direct → CDF_User v1` | sim | `Creatable` | Quem atualizou |
| `isArchived` | `boolean` | sim | `Creatable` | Arquivado? |
| `sourceId` | `text` | sim | `Sourceable` | ID no sistema de origem |
| `source` | `text` | sim | `Sourceable` | Nome do sistema de origem |
| `sourceCreatedTime` | `timestamp` | sim | `Sourceable` | Criação no sistema de origem |
| `sourceUpdatedTime` | `timestamp` | sim | `Sourceable` | Atualização no sistema de origem |

---

### 6. `MeasurementReading` — v4 — node

**Descrição:** Leitura de campo coletada durante uma inspeção. Suporta leituras numéricas e por label. Liga-se a uma timeseries CDF para histórico.

**Containers mapeados:** `cdf_apps_shared/Creatable`, `cdf_core/Describable`, `cdf_apm/MeasurementReading`

**Implementa:** `Creatable v1`, `Describable v1`

| Propriedade | Tipo | Nullable | Container | Descrição |
|---|---|---|---|---|
| `title` | `text` | sim | `Describable` | Nome da medição |
| `description` | `text` | sim | `Describable` | Descrição |
| `labels` | `text[]` | sim | `Describable` | Labels |
| `type` | `text` | sim | `MeasurementReading` | **numerical, label**, etc. |
| `order` | `int32` | sim | `MeasurementReading` | Ordem de execução |
| `timeseries` | `timeseries` | sim | `MeasurementReading` | Timeseries CDF vinculada (histórico) |
| `min` | `float64` | sim | `MeasurementReading` | Valor mínimo aceitável |
| `max` | `float64` | sim | `MeasurementReading` | Valor máximo aceitável |
| `options` | `json[]` | sim | `MeasurementReading` | Opções para medição por label |
| `measuredAt` | `timestamp` | sim | `MeasurementReading` | Quando a última leitura foi feita |
| `numericReading` | `float64` | sim | `MeasurementReading` | Último valor numérico registrado |
| `stringReading` | `text` | sim | `MeasurementReading` | Último valor textual registrado |
| `visibility` | `text` | sim | `Creatable` | PUBLIC / PRIVATE / PROTECTED |
| `createdBy` | `direct → CDF_User v1` | sim | `Creatable` | Quem criou |
| `updatedBy` | `direct → CDF_User v1` | sim | `Creatable` | Quem atualizou |
| `isArchived` | `boolean` | sim | `Creatable` | Arquivado? |

---

### 7. `Schedule` — v4 — node

**Descrição:** Agendamento no formato ICS (iCalendar). Aplicável a Templates, TemplateItems e Missões Robóticas. Suporta recorrência, exceções e fuso horário.

**Containers mapeados:** `cdf_core/Schedulable`, `cdf_apps_shared/Creatable`, `cdf_apm/Schedule`

**Implementa:** `Schedulable v1`, `Creatable v1`

| Propriedade | Tipo | Nullable | Container | Descrição |
|---|---|---|---|---|
| `startTime` | `timestamp` | sim | `Schedulable` | Início do agendamento |
| `endTime` | `timestamp` | sim | `Schedulable` | Fim do agendamento |
| `status` | `text` | sim | `Schedule` | **confirmed, cancelled**, etc. (= STATUS no ICS) |
| `timezone` | `text` | sim | `Schedule` | Fuso horário (= TZID no ICS) |
| `freq` | `text` | sim | `Schedule` | Frequência: daily, weekly, monthly… (= RRULE FREQ) |
| `interval` | `text` | sim | `Schedule` | Intervalo: biweekly, a cada 3 semanas, etc. |
| `byDay` | `text[]` | sim | `Schedule` | Dias da semana: MO, TU, WE… (= RRULE BYDAY) |
| `byMonth` | `text[]` | sim | `Schedule` | Meses: JAN, FEB… (= RRULE BYMONTH) |
| `until` | `timestamp` | sim | `Schedule` | Data limite da recorrência (= RRULE UNTIL) |
| `exceptionDates` | `timestamp[]` | sim | `Schedule` | Datas excluídas — máx. 300 (= EXDATE no ICS) |
| `visibility` | `text` | sim | `Creatable` | PUBLIC / PRIVATE / PROTECTED |
| `createdBy` | `direct → CDF_User v1` | sim | `Creatable` | Quem criou |
| `updatedBy` | `direct → CDF_User v1` | sim | `Creatable` | Quem atualizou |
| `isArchived` | `boolean` | sim | `Creatable` | Arquivado? |

---

## Views de suporte (outros spaces)

### `cdf_core/Describable` v1
Mixin de descrição herdado por Checklist, ChecklistItem, Template, TemplateItem, Observation, MeasurementReading.

| Propriedade | Tipo | Descrição |
|---|---|---|
| `title` | `text` | Nome do nó |
| `description` | `text` | Descrição longa |
| `labels` | `text[]` | Labels genéricos |

### `cdf_core/Schedulable` v1
Mixin de agendamento herdado por Checklist, ChecklistItem, Schedule.

| Propriedade | Tipo | Descrição |
|---|---|---|
| `startTime` | `timestamp` | Início |
| `endTime` | `timestamp` | Fim |

### `cdf_core/Sourceable` v1
Mixin de rastreabilidade de origem herdado por Checklist, ChecklistItem, Observation.

| Propriedade | Tipo | Descrição |
|---|---|---|
| `sourceId` | `text` | ID no sistema de origem |
| `source` | `text` | Nome do sistema de origem |
| `sourceCreatedTime` | `timestamp` | Criação no sistema de origem |
| `sourceUpdatedTime` | `timestamp` | Atualização no sistema de origem |

### `cdf_apps_shared/Creatable` v1
Mixin de auditoria e visibilidade herdado por todas as views APM.

| Propriedade | Tipo | Descrição |
|---|---|---|
| `visibility` | `text` | PUBLIC / PRIVATE / PROTECTED |
| `createdBy` | `direct → CDF_User v1` | Quem criou |
| `updatedBy` | `direct → CDF_User v1` | Quem atualizou por último |
| `isArchived` | `boolean` | Arquivado (oculto na maioria das UIs)? |

### `cdf_apps_shared/CDF_User` v1
Representa um usuário da plataforma Cognite. Referenciado via `createdBy` / `updatedBy`.

### `cdf_core/Asset` v2
Asset CDF padrão. Usado como `rootLocation` em Checklist/Template/Observation e como `asset` em ChecklistItem/TemplateItem.

---

## Views ainda não mapeadas neste documento

As views abaixo fazem parte do modelo mas ainda não tiveram seus schemas detalhados:

| View | Space | Versão |
|---|---|---|
| `Activity` | `cdf_apm` | v2 |
| `Operation` | `cdf_apm` | v2 |
| `MaterialRequirement` | `cdf_apm` | v1 |
| `Notification` | `cdf_apm` | v2 |
| `Condition` | `cdf_apm` | v1 |
| `Action` | `cdf_apm` | v1 |
| `ConditionalAction` | `cdf_apm` | v1 |
| `CDF_UserPreferences` | `cdf_apps_shared` | v1 |
| `CogniteSolutionTag` | `cdf_apps_shared` | v1 |

Para detalhá-las: usar `cdf_get_view` via MCP ou consultar o Cognite Data Explorer.

---

---

# Data Model — CogniteCore (`cdf_cdm` v1)

> Documentação gerada via MCP `cognite-cdf` em 2026-06-02.  
> Fonte: `cdf_get_data_model` + `cdf_get_view` para cada view.

---

## Identificação

| Campo | Valor |
|---|---|
| **Space** | `cdf_cdm` |
| **ExternalId** | `CogniteCore` |
| **Versão** | `v1` |
| **Nome** | Cognite core data model |
| **Descrição** | Cognite core data model |
| **Global** | `true` |

---

## Visão geral — 33 views no space `cdf_cdm`

### Views relevantes para este app (detalhadas abaixo)

| View | Versão | Tipo | Uso no app |
|---|---|---|---|
| `CogniteAsset` | v1 | node | Equipamento / localização funcional inspecionada |
| `CogniteEquipment` | v1 | node | Equipamento físico vinculado a asset |
| `CogniteActivity` | v1 | node | Atividade/inspeção com período de tempo |
| `CogniteFile` | v1 | node | Arquivos/fotos anexados a observações |
| `CogniteTimeSeries` | v1 | node | Séries temporais de medições |
| `CogniteUnit` | v1 | node | Unidades de medida para leituras |
| `CogniteSourceSystem` | v1 | node | Sistema de origem dos dados |

### Mixins base (herdados por todas as views acima)

| Mixin | Propriedades-chave |
|---|---|
| `CogniteDescribable` v1 | `name`, `description`, `tags[]`, `aliases[]` |
| `CogniteSourceable` v1 | `sourceId`, `sourceContext`, `source` → SourceSystem, `sourceCreatedTime`, `sourceUpdatedTime`, `sourceCreatedUser`, `sourceUpdatedUser` |
| `CogniteSchedulable` v1 | `startTime`, `endTime`, `scheduledStartTime`, `scheduledEndTime` |
| `CogniteVisualizable` v1 | `object3D` → Cognite3DObject |

### Demais views (não usadas diretamente no app — somente referência)

| View | Propósito |
|---|---|
| `CogniteAssetClass` v1 | Classe do asset (ex.: Bomba, Compressor) |
| `CogniteAssetType` v1 | Tipo do asset |
| `CogniteEquipmentType` v1 | Tipo do equipamento |
| `CogniteFileCategory` v1 | Categoria de arquivo |
| `CogniteAnnotation` v1 | Anotações genéricas |
| `CogniteDiagramAnnotation` v1 | Anotações em P&IDs |
| `Cognite3DObject` v1 | Objeto 3D associado a um asset |
| `Cognite3DModel` v1, `CogniteCADModel` v1, `CognitePointCloudModel` v1, `Cognite360ImageModel` v1 | Modelos 3D (CAD, Point Cloud, 360°) |
| `Cognite3DRevision` v1, `CogniteCADRevision` v1, `CognitePointCloudRevision` v1 | Revisões de modelos 3D |
| `Cognite360ImageCollection` v1, `Cognite360Image` v1, `Cognite360ImageStation` v1, `Cognite360ImageAnnotation` v1 | Imagens 360° |
| `CogniteCADNode` v1 | Nó em modelo CAD |
| `CognitePointCloudVolume` v1 | Volume em nuvem de pontos |
| `Cognite3DTransformation` v1, `CogniteCubeMap` v1 | Utilitários 3D |
| `CogniteDescribable` v1, `CogniteSourceable` v1, `CogniteSchedulable` v1, `CogniteVisualizable` v1, `Cognite3DTransformation` v1 | Mixins base |

---

## Grafo de relacionamentos (views relevantes)

```
CogniteAsset (cdf_cdm v1)
  ├─ parent ────────────────────────────────► CogniteAsset (self — hierarquia)
  ├─ root ──────────────────────────────────► CogniteAsset (raiz da hierarquia)
  ├─ path[] ────────────────────────────────► CogniteAsset[] (caminho completo)
  ├─ assetClass ────────────────────────────► CogniteAssetClass v1
  ├─ type ──────────────────────────────────► CogniteAssetType v1
  ├─[reverse] files[] ─────────────────────► CogniteFile.assets
  ├─[reverse] equipment[] ─────────────────► CogniteEquipment.asset
  ├─[reverse] activities[] ────────────────► CogniteActivity.assets
  └─[reverse] timeSeries[] ────────────────► CogniteTimeSeries.assets

CogniteEquipment (cdf_cdm v1)
  ├─ asset ─────────────────────────────────► CogniteAsset v1
  ├─ equipmentType ─────────────────────────► CogniteEquipmentType v1
  ├─ files[] ───────────────────────────────► CogniteFile v1
  ├─[reverse] activities[] ────────────────► CogniteActivity.equipment
  └─[reverse] timeSeries[] ────────────────► CogniteTimeSeries.equipment

CogniteActivity (cdf_cdm v1)  [extends CogniteSchedulable]
  ├─ assets[] ──────────────────────────────► CogniteAsset v1
  ├─ equipment[] ───────────────────────────► CogniteEquipment v1
  └─ timeSeries[] ──────────────────────────► CogniteTimeSeries v1

CogniteFile (cdf_cdm v1)
  ├─ assets[] ──────────────────────────────► CogniteAsset v1
  ├─ category ──────────────────────────────► CogniteFileCategory v1
  └─[reverse] equipment[] ─────────────────► CogniteEquipment.files

CogniteTimeSeries (cdf_cdm v1)
  ├─ assets[] ──────────────────────────────► CogniteAsset v1
  ├─ equipment[] ───────────────────────────► CogniteEquipment v1
  └─ unit ──────────────────────────────────► CogniteUnit v1
```

> **Padrão de uso no app:** `CogniteAsset` representa a localização funcional (linha, seção, equipamento); `CogniteEquipment` detalha o equipamento físico. `ApmAppData.Checklist` e `ApmAppData.Template` referenciam `cdf_core.Asset:v2` (space diferente — compatível mas versão anterior).

---

## Schemas detalhados

---

### `CogniteAsset` v1 — `cdf_cdm`

> Assets represent systems that support industrial functions or processes. Often called 'functional location'.

| Propriedade | Tipo | Nullable | Descrição |
|---|---|---|---|
| `name` | text | sim | Nome da instância (de CogniteDescribable) |
| `description` | text | sim | Descrição |
| `tags` | text[] | sim | Labels de uso genérico |
| `aliases` | text[] | sim | Nomes alternativos |
| `sourceId` | text | sim | Identificador no sistema de origem |
| `sourceContext` | text | sim | Contexto do sourceId |
| `source` | direct → CogniteSourceSystem | sim | Sistema de origem |
| `sourceCreatedTime` | timestamp | sim | Criação no sistema de origem |
| `sourceUpdatedTime` | timestamp | sim | Atualização no sistema de origem |
| `sourceCreatedUser` | text | sim | Usuário criador na origem |
| `sourceUpdatedUser` | text | sim | Usuário atualizador na origem |
| `parent` | direct → CogniteAsset | sim | Asset pai na hierarquia |
| `root` | direct → CogniteAsset | sim | Asset raiz (atualizado automaticamente) |
| `path` | direct[] → CogniteAsset | sim | Lista ordenada de ancestrais (atualizada automaticamente) |
| `pathLastUpdatedTime` | timestamp | sim | Última atualização do path |
| `assetClass` | direct → CogniteAssetClass | sim | Classe do asset |
| `type` | direct → CogniteAssetType | sim | Tipo do asset |
| `object3D` | direct → Cognite3DObject | sim | Representação 3D |
| `files` | reverse (CogniteFile.assets) | — | Arquivos relacionados (automático) |
| `children` | reverse (CogniteAsset.parent) | — | Filhos na hierarquia (automático) |
| `equipment` | reverse (CogniteEquipment.asset) | — | Equipamentos relacionados (automático) |
| `activities` | reverse (CogniteActivity.assets) | — | Atividades relacionadas (automático) |
| `timeSeries` | reverse (CogniteTimeSeries.assets) | — | Séries temporais (automático) |

**Mixins:** `CogniteDescribable`, `CogniteSourceable`, `CogniteVisualizable`

---

### `CogniteEquipment` v1 — `cdf_cdm`

> Equipment represents physical supplies or devices.

| Propriedade | Tipo | Nullable | Descrição |
|---|---|---|---|
| `name` | text | sim | Nome |
| `description` | text | sim | Descrição |
| `tags` | text[] | sim | Labels |
| `aliases` | text[] | sim | Nomes alternativos |
| `sourceId` | text | sim | ID na origem |
| `source` | direct → CogniteSourceSystem | sim | Sistema de origem |
| `sourceCreatedTime` | timestamp | sim | — |
| `sourceUpdatedTime` | timestamp | sim | — |
| `sourceCreatedUser` | text | sim | — |
| `sourceUpdatedUser` | text | sim | — |
| `asset` | direct → CogniteAsset | sim | Asset funcional ao qual pertence |
| `serialNumber` | text | sim | Número de série |
| `manufacturer` | text | sim | Fabricante |
| `equipmentType` | direct → CogniteEquipmentType | sim | Tipo do equipamento |
| `files` | direct[] → CogniteFile | sim | Arquivos relacionados |
| `activities` | reverse (CogniteActivity.equipment) | — | Atividades (automático) |
| `timeSeries` | reverse (CogniteTimeSeries.equipment) | — | Séries temporais (automático) |

**Mixins:** `CogniteDescribable`, `CogniteSourceable`

---

### `CogniteActivity` v1 — `cdf_cdm`

> Represents activities — typically happen over a period with start and end time.

| Propriedade | Tipo | Nullable | Descrição |
|---|---|---|---|
| `name` | text | sim | Nome da atividade |
| `description` | text | sim | Descrição |
| `tags` | text[] | sim | Labels |
| `aliases` | text[] | sim | Nomes alternativos |
| `sourceId` | text | sim | ID na origem |
| `source` | direct → CogniteSourceSystem | sim | Sistema de origem |
| `sourceCreatedTime` | timestamp | sim | — |
| `sourceUpdatedTime` | timestamp | sim | — |
| `startTime` | timestamp | sim | Início real da atividade |
| `endTime` | timestamp | sim | Fim real da atividade |
| `scheduledStartTime` | timestamp | sim | Início planejado |
| `scheduledEndTime` | timestamp | sim | Fim planejado |
| `assets` | direct[] → CogniteAsset | sim | Assets relacionados (máx 1200) |
| `equipment` | direct[] → CogniteEquipment | sim | Equipamentos relacionados |
| `timeSeries` | direct[] → CogniteTimeSeries | sim | Séries temporais relacionadas |

**Mixins:** `CogniteDescribable`, `CogniteSourceable`, `CogniteSchedulable`

---

### `CogniteFile` v1 — `cdf_cdm`

> Represents files.

| Propriedade | Tipo | Nullable | Descrição |
|---|---|---|---|
| `name` | text | sim | Nome do arquivo |
| `description` | text | sim | Descrição |
| `tags` | text[] | sim | Labels |
| `aliases` | text[] | sim | Nomes alternativos |
| `sourceId` | text | sim | ID na origem |
| `source` | direct → CogniteSourceSystem | sim | Sistema de origem |
| `sourceCreatedTime` | timestamp | sim | — |
| `sourceUpdatedTime` | timestamp | sim | — |
| `assets` | direct[] → CogniteAsset | sim | Assets relacionados (máx 1200) |
| `mimeType` | text | sim | MIME type do arquivo |
| `directory` | text | sim | Caminho/diretório na origem |
| `isUploaded` | boolean | sim | Se o conteúdo foi feito upload no CDF (default: false) |
| `uploadedTime` | timestamp | sim | Momento em que o upload foi concluído |
| `category` | direct → CogniteFileCategory | sim | Categoria detectada |
| `equipment` | reverse (CogniteEquipment.files) | — | Equipamentos relacionados (automático) |

**Mixins:** `CogniteDescribable`, `CogniteSourceable`

---

### `CogniteTimeSeries` v1 — `cdf_cdm`

> Represents a series of data points in time order.

| Propriedade | Tipo | Nullable | Descrição |
|---|---|---|---|
| `name` | text | sim | Nome |
| `description` | text | sim | Descrição |
| `tags` | text[] | sim | Labels |
| `aliases` | text[] | sim | Nomes alternativos |
| `sourceId` | text | sim | ID na origem |
| `source` | direct → CogniteSourceSystem | sim | Sistema de origem |
| `isStep` | boolean | **não** | Se é série step (default: false) |
| `type` | enum: `numeric` / `string` / `state` | **não** | Tipo de dado — imutável após criação |
| `sourceUnit` | text | sim | Unidade conforme sistema de origem |
| `unit` | direct → CogniteUnit | sim | Unidade de medida padronizada |
| `assets` | direct[] → CogniteAsset | sim | Assets relacionados (máx 1200) |
| `equipment` | direct[] → CogniteEquipment | sim | Equipamentos relacionados |
| `stateSet` | direct | sim | Conjunto de estados (só quando `type = state`) |
| `activities` | reverse (CogniteActivity.timeSeries) | — | Atividades relacionadas (automático) |

**Mixins:** `CogniteDescribable`, `CogniteSourceable`

---

### `CogniteUnit` v1 — `cdf_cdm`

> Represents a single unit of measurement.

| Propriedade | Tipo | Nullable | Descrição |
|---|---|---|---|
| `name` | text | sim | Nome da unidade |
| `description` | text | sim | Descrição |
| `tags` | text[] | sim | Labels |
| `aliases` | text[] | sim | Nomes alternativos |
| `symbol` | text | sim | Símbolo (ex.: `°C`, `bar`, `rpm`) |
| `quantity` | text | sim | Grandeza física medida (ex.: `Temperature`) |
| `source` | text | sim | Fonte da definição da unidade |
| `sourceReference` | text | sim | Referência à fonte |

**Mixins:** `CogniteDescribable`

---

### `CogniteSourceSystem` v1 — `cdf_cdm`

> Standardizes how source systems are stored in CDF.

| Propriedade | Tipo | Nullable | Descrição |
|---|---|---|---|
| `name` | text | sim | Nome do sistema de origem |
| `description` | text | sim | Descrição |
| `tags` | text[] | sim | Labels |
| `aliases` | text[] | sim | Nomes alternativos |
| `version` | text | sim | Versão do sistema de origem |
| `manufacturer` | text | sim | Fabricante |

**Mixins:** `CogniteDescribable`

---

## Relação entre cdf_core (ApmAppData) e cdf_cdm (CogniteCore)

> Nota importante para o desenvolvimento do app.

| Conceito | ApmAppData referencia | CogniteCore atual |
|---|---|---|
| Asset / localização funcional | `cdf_core.Asset:v2` | `cdf_cdm.CogniteAsset:v1` |
| Sourceable (mixin) | `cdf_core.Sourceable:v1` | `cdf_cdm.CogniteSourceable:v1` |
| Describable (mixin) | `cdf_core.Describable:v1` | `cdf_cdm.CogniteDescribable:v1` |
| Schedulable (mixin) | `cdf_core.Schedulable:v1` | `cdf_cdm.CogniteSchedulable:v1` |

O `cdf_core` é um space mais antigo que o `cdf_cdm`. O `ApmAppData v13` referencia `cdf_core`, enquanto o modelo canônico atual da Cognite é o `cdf_cdm`. Para **seed data**, os assets devem ser criados no space `cdf_cdm` como `CogniteAsset:v1`, e o campo `rootLocation` do Template/Checklist deve apontar para instâncias de `cdf_core.Asset:v2` (ou verificar via MCP se o ambiente aceita `cdf_cdm.CogniteAsset:v1` diretamente).

---

## Views não detalhadas (fora do escopo do app)

| View | Space | Versão |
|---|---|---|
| `CogniteAssetClass` | `cdf_cdm` | v1 |
| `CogniteAssetType` | `cdf_cdm` | v1 |
| `CogniteEquipmentType` | `cdf_cdm` | v1 |
| `CogniteFileCategory` | `cdf_cdm` | v1 |
| `CogniteAnnotation` | `cdf_cdm` | v1 |
| `CogniteDiagramAnnotation` | `cdf_cdm` | v1 |
| `Cognite3DObject` | `cdf_cdm` | v1 |
| `Cognite3DModel` | `cdf_cdm` | v1 |
| `CogniteCADModel` | `cdf_cdm` | v1 |
| `Cognite3DRevision` | `cdf_cdm` | v1 |
| `CogniteCADRevision` | `cdf_cdm` | v1 |
| `CognitePointCloudModel` | `cdf_cdm` | v1 |
| `CognitePointCloudRevision` | `cdf_cdm` | v1 |
| `CognitePointCloudVolume` | `cdf_cdm` | v1 |
| `Cognite360ImageModel` | `cdf_cdm` | v1 |
| `Cognite360ImageCollection` | `cdf_cdm` | v1 |
| `Cognite360Image` | `cdf_cdm` | v1 |
| `Cognite360ImageStation` | `cdf_cdm` | v1 |
| `Cognite360ImageAnnotation` | `cdf_cdm` | v1 |
| `CogniteCADNode` | `cdf_cdm` | v1 |
| `Cognite3DTransformation` | `cdf_cdm` | v1 |
| `CogniteCubeMap` | `cdf_cdm` | v1 |
| `CogniteDescribable` | `cdf_cdm` | v1 |
| `CogniteSourceable` | `cdf_cdm` | v1 |
| `CogniteSchedulable` | `cdf_cdm` | v1 |
| `CogniteVisualizable` | `cdf_cdm` | v1 |

Para detalhá-las: usar `cdf_get_view` via MCP ou consultar o Cognite Data Explorer.
