# Análise Completa do Excel — A Line OEC Routes

> **Fonte:** `docs/Seed/A Line OEC Routes 2 (1).xlsx`
> **Sistema:** Kamyr System Operator Equipment Care — International Paper (A Line)
> **Extraído em:** 2026-06-03
> **Propósito:** Documento de referência permanente. **Não abrir o Excel novamente** — toda estrutura está aqui.

---

## 1. Resumo executivo

| Métrica | Valor |
|---|---|
| Rotas (abas) | 4 |
| Seções / andares | 20 identificadas |
| Equipamentos únicos | 99 |
| Itens de inspeção totais | 517 |
| Itens OK / Not OK | ~230 |
| Itens Yes / No | ~117 |
| Itens de medição (˚F, ips, mm, etc.) | 170 |
| Work Orders pré-definidos | ~25 equipamentos com WO# real |

---

## 2. Tipos de resposta e variação semântica

### Tipos de resposta presentes no Excel

| Tipo canônico | Variações encontradas | `isMeasurement` | Unidade |
|---|---|---|---|
| `OK_NOT_OK` | `OK / Not OK` | false | — |
| `YES_NO` | `Yes / No`, `YES / NO`, `YES  /  NO`, `Yes  / No` | false | — |
| `TEMPERATURE_F` | `˚F` | true | °F |
| `VIBRATION_IPS` | `ips` | true | ips |
| `LENGTH_MM` | `mm` | true | mm |
| `FREE_TEXT` | `null` (campo livre) | false | — |

### Thresholds identificados

| Threshold | Aplicação | Equipamentos |
|---|---|---|
| `> 170°F` | Temperatura de motor / mancal (padrão) | Maioria dos motores e bombas |
| `> 190°F` | High Pressure Feeder (equipamento crítico de alta pressão) | High Pressure Feeder |
| `> 130°F` | Equalization Line (linhas de equalização) | Equalization Line N/S |
| `> 170F` (sem °) | Variação ortográfica — mesmo threshold | Route 3, Route 2 |

> **Nota para o seed:** normalizar todos os thresholds para o valor numérico sem símbolo: `170`, `190`, `130`.

---

## 3. Catálogo de itens de inspeção por categoria (SST)

### 3.1 Categoria: Condição Mecânica (tipo `OK_NOT_OK`)

Itens que avaliam condição visual / operacional:

| Item | Significado operacional | Frequência no Excel |
|---|---|---|
| `General Condition` | Avaliação geral do equipamento | Alta (tanques, válvulas, bombas) |
| `Motor` | Condição do motor elétrico | Alta (motores) |
| `Guarding` | Proteção/guarda de segurança instalada | Alta (todo equipamento rotativo) |
| `Coupling` | Acoplamento motor-bomba em bom estado | Média (motores grandes) |
| `Drive Belts` | Correia de transmissão | Média (gearboxes) |
| `Packing / Mech Seal` | Vedação do eixo (gaxeta ou selo mecânico) | Alta (bombas) |
| `Associated Piping` | Tubulação associada sem danos | Média (tanques, vasos) |
| `Oil Level` | Nível de óleo do gearbox ou cárter | Alta (bombas/gearboxes) |
| `Junction Box` | Caixa de ligação elétrica fechada/íntegra | Média (motores) |
| `Motor Running` | Motor em funcionamento | Baixa (agitadores) |
| `Belts` | Correia do agitador ou similar | Baixa (agitadores) |
| `Visual Inspection` | Inspeção visual genérica | Baixa (strain gauges) |
| `Lube Oil Pump A / B` | Bomba de lubrificação A/B funcionando | Baixa (digestores) |

### 3.2 Categoria: Condição de Processo (tipo `YES_NO`)

Itens que verificam presença de condição ou anomalia:

| Item | Resposta esperada (normal) | Alerta se |
|---|---|---|
| `Leaks` | No | Yes (vazamento detectado) |
| `Seal Water` | Yes | No (falta água de selagem = dano ao selo) |
| `Audible Noise` | No | Yes (ruído anormal) |
| `Liquid in Drip Pan` | No | Yes (acúmulo anormal) |
| `Packing` (Yes/No) | Yes | No (packing ausente) |
| `Gasket Leaks` | No | Yes |
| `Lube Oil Pump Flow` | Yes | No |
| `Horizontal` (strain gauge) | Yes | No (desalinhado) |
| `Plugged` (screens) | No | Yes (tela entupida = parada de processo) |
| `Running` (gyrators) | Yes | No |
| `Loose Bolts` | No | Yes |
| `Missing Bolts` | No | Yes |
| `Gyrators Misaligned` | No | Yes |
| `Hoses rolled up` | Yes | No |
| `Sawdust built up` | No | Yes (risco de incêndio) |
| `Pumps are running` | Yes | No |
| `Agitator Running?` | Yes | No |

### 3.3 Categoria: Medições (tipo `MEASUREMENT`)

| Item | Unidade | Threshold padrão | Normal range (pulp/paper) |
|---|---|---|---|
| `Motor Temp` | °F | > 170°F | 120–165°F |
| `IB Bearing Temp` | °F | > 170°F | 120–165°F |
| `OB Bearing Temp` | °F | > 170°F | 120–165°F |
| `DE Bearing Temp` | °F | > 170°F | 120–165°F |
| `ND Bearing Temp` | °F | > 170°F | 120–165°F |
| `Pump IB Bearing Temp` | °F | > 170°F | 120–165°F |
| `Pump OB Bearing Temp` | °F | > 170°F | 120–165°F |
| `IB Vibrations` | ips | — (sem threshold) | 0.05–0.15 ips (alarme > 0.30) |
| `OB Vibrations` | ips | — (sem threshold) | 0.05–0.15 ips (alarme > 0.30) |
| `Slide Rule Setting` | mm | — | Valor operacional (ajuste) |
| `Slide Ruler Setting` | mm | — | Variação ortográfica do acima |
| `North End Temp` | °F | > 130°F | 100–125°F (equalization line) |
| `South End Temp` | °F | > 130°F | 100–125°F |
| `Guarding` (gearbox) | °F | > 170°F | Temp da guarda do gearbox |
| `No. of Open Nozzles` | — | — | Campo livre (contagem) |

### 3.4 Categoria: Itens especiais (verificação de housekeeping)

Presentes principalmente na Route 2 / Chip Bin:

| Item | Tipo | Contexto |
|---|---|---|
| `Unusual noises on belt/wipes etc?` | Yes/No | Correia de chips |
| `Hoses rolled up` / `Cleaned?` | Yes/No | Limpeza |
| `Sawdust built up on top of chip bin` | Yes/No | Risco de incêndio |
| `Sawdust built up to roller` | Yes/No | Bloqueio mecânico |

---

## 4. Inventário completo — Route 1: IV/Kamyr Digester/Diffuser

> **Sistema:** Kamyr Digester (digestor contínuo de celulose kraft) e Diffuser (lavagem)
> **Seções:** 8 andares do digestor (7th a Ground) — 35 equipamentos, 193 itens

### 7th Floor (4 equipamentos)

| Equipamento | WO# | Itens | Medições |
|---|---|---|---|
| Diffuser Scraper | 301112080 | General Condition, Motor Temp°F(>170), Motor, IB Bearing°F(>170), OB Bearing°F(>170), Lube Oil Pump Flow, Guarding, Coupling, Audible Noise, Leaks, IB Vibrations(ips), OB Vibrations(ips) | 5 |
| Diffuser Gearbox | 301112080 | Oil Level, Guarding°F(>170), Drive Belts°F(>170) | 2 |
| #1 Backflush Tank | — | General Condition, Associated Piping | 0 |
| #2 Backflush Tank | — | General Condition, Associated Piping | 0 |

### 6th Floor (1 equipamento)

| Equipamento | WO# | Itens | Medições |
|---|---|---|---|
| Digester Top Separator | — | Oil Level, Guarding, Motor, IB Bearing°F(>170), OB Bearing°F(>170), Coupling, IB Vibrations(ips), OB Vibrations(ips) | 4 |

### 5th Floor (5 equipamentos)

| Equipamento | WO# | Itens | Medições |
|---|---|---|---|
| NE Diffuser Hydraulic Cylinder | — | General Condition, Water Packing, Hyd.Oil Packing, Liquid in Drip Pan, Packing | 0 |
| SE Diffuser Hydraulic Cylinder | — | (mesmos 5 itens) | 0 |
| SW Diffuser Hydraulic Cylinder | — | (mesmos 5 itens) | 0 |
| NW Diffuser Hydraulic Cylinder | — | (mesmos 5 itens) | 0 |
| Main Hydraulic Unit | — | General Condition, Level, Leaks | 0 |

### 4.5th Floor (3 equipamentos)

| Equipamento | WO# | Itens | Medições |
|---|---|---|---|
| 165# Steam Header | — | General Condition, Associated Piping, Leaks | 0 |
| BC1 and BC2 | — | General Condition, Associated Piping, Leaks | 0 |
| Upper Strain Gauge | — | Visual Inspection, Horizontal | 0 |

### 4th Floor (2 equipamentos)

| Equipamento | WO# | Itens | Medições |
|---|---|---|---|
| IV Top Separator Motor | 291142040 | Oil Level, Motor, Guarding, Coupling, IB Bearing°F(>170), OB Bearing°F(>170), Junction Box, IB Vibrations(ips), OB Vibrations(ips) | 4 |
| DIG Bottom Strain Gauge | — | Visual Inspection, Horizontal | 0 |

### 3rd Floor (1 equipamento)

| Equipamento | WO# | Itens | Medições |
|---|---|---|---|
| V53 and V54 | — | General Condition, Packing, Gasket Leaks | 0 |

### 2nd Floor (2 equipamentos)

| Equipamento | WO# | Itens | Medições |
|---|---|---|---|
| V151 (4 Nozzles) | — | General Condition, Leaks | 0 |
| V72 (8 Valves) | — | General Condition, Packing, Gasket Leaks, No. of Open Nozzles | 0 |

### Ground Floor (17 equipamentos)

| Equipamento | WO# | Itens | Medições |
|---|---|---|---|
| Kamyr Digester OD | 291158080 | Motor, Guarding, Drive Belts, IB Bearing°F(>170), OB Bearing°F(>170), Junction Box, IB Vib(ips), OB Vib(ips), Lube Oil Pump A, Lube Oil Pump B | 4 |
| Kamyr Digester OD Gear Box | 291158080 | Oil Level, Guarding°F(>170), Drive Belts°F(>170) | 2 |
| IV OD | 291158080 | Motor, Guarding, Drive Belts, IB Bearing°F(>170), OB Bearing°F(>170), Junction Box, IB Vib(ips), OB Vib(ips), Lube Oil Pump A, Lube Oil Pump B | 4 |
| IV OD Gear Box | 291158080 | Oil Level, Guarding°F(>170), Drive Belts°F(>170) | 2 |
| Stripped Condensate Tank | — | General Condition, Associated Piping | 0 |
| Decker Shower Pump | — | Motor Temp°F(>170), Oil Level, Guarding, Packing/Mech Seal, IB Bearing°F(>170), OB Bearing°F(>170), IB Vib(ips), OB Vib(ips), Seal Water | 5 |
| TMS | — | Motor Temp°F(>170), Oil Level, Guarding, Packing/Mech Seal, IB Bearing°F(>170), OB Bearing°F(>170), IB Vib(ips), OB Vib(ips), Seal Water | 5 |
| #2 Flash Tank | — | General Condition, Associated Piping | 0 |
| South Flash Tank Pump | — | Motor Temp°F(>170), Oil Level, Guarding, Packing/Mech Seal, IB Bearing°F(>170), OB Bearing°F(>170), IB Vib(ips), OB Vib(ips), Seal Water | 5 |
| North Flash Tank Pump | — | Motor Temp°F(>170), Oil Level, Guarding, Packing/Mech Seal, IB Bearing°F(>170), OB Bearing°F(>170), Seal Water, IB Vib(ips), OB Vib(ips) | 5 |
| Cooling Water Reflux Pump | — | Motor Temp°F(>170), Oil Level, Guarding, Packing/Mech Seal, IB Bearing°F(>170), OB Bearing°F(>170), Seal Water | 4 |
| #2 Reflux Supply Pump | — | Motor Temp°F(>170), Oil Level, Guarding, Packing/Mech Seal, IB Bearing°F(>170), OB Bearing°F(>170), Seal Water | 4 |
| #1 Backflush Pump (South) | — | Motor Temp°F(>170), Oil Level, Guarding, Packing/Mech Seal, IB Bearing°F(>170), OB Bearing°F(>170), Seal Water | 4 |
| #2 Backflush Pump (North) | — | Motor Temp°F(>170), Oil Level, Guarding, Packing/Mech Seal, IB Bearing°F(>170), OB Bearing°F(>170), Seal Water | 4 |
| North Filtrate Pump | — | Motor Temp°F(>170), Oil Level, Guarding, Packing/Mech Seal, IB Bearing°F(>170), OB Bearing°F(>170), Seal Water | 4 |
| South Filtrate Pump | — | Motor Temp°F(>170), Oil Level, Guarding, Packing/Mech Seal, IB Bearing°F(>170), OB Bearing°F(>170), Seal Water | 4 |
| Condensate Filtrate Pump | 291150020 | Motor Temp°F(>170), Oil Level, Guarding, Packing/Mech Seal, IB Bearing°F(>170), OB Bearing°F(>170), Seal Water | 4 |

---

## 5. Inventário completo — Route 2: Feed System

> **Sistema:** Sistema de alimentação de cavacos ao digestor (chips → digestor)
> **Seções:** CHIP BIN, LOW PRESSURE FEEDER, STEAMING VESSEL, HIGH PRESSURE FEEDER, TOP CIRCULATION, OTHER, CHIP CHUTE, BOTTOM CIRCULATION, TRIM LIQUOR, MCC WHITE LIQUOR, COLD BLOW, MAKEUP LIQUOR, SEAL WATER — 38 equipamentos, 183 itens

### CHIP BIN (4 equipamentos)

| Equipamento | WO# | Itens notáveis |
|---|---|---|
| Top of Chip Bin & Belts | — | Unusual noises, Hoses rolled up, Sawdust built up (housekeeping) |
| Chip Bin Gyrators | 291104080 | Loose Bolts, Missing Bolts, Gyrators Misaligned, Running |
| Chip Meter | 291104080 | Motor°F(>170), IB/OB Bearing°F(>170), IB/OB Vib(ips), Audible Noise |
| Chip Meter Gearbox | 291104080 | Oil Level, Guarding°F(>170), Drive Belts°F(>170) |

### LOW PRESSURE FEEDER (4 equipamentos)

| Equipamento | WO# | Itens notáveis |
|---|---|---|
| Low Pressure Feeder | 291106080 | Motor°F(>170), IB Bearing°F(>170), Slide Rule Setting(mm), Audible Noise |
| Low Pressure Feeder Gearbox | 291106080 | Oil Level, Guarding°F, Drive Belts°F(>170) |
| Valve 9 (V009) | — | Number of Rings (campo livre) |
| Defoamer | — | Check Line for Leaks |

### STEAMING VESSEL (2 equipamentos)

| Equipamento | WO# | Itens notáveis |
|---|---|---|
| Steaming Vessel Motor | 291108080 | DE/ND Bearing°F(>170), DE/ND Guarding, DE/ND Noise, IB/OB Vib(ips), Packing |
| Steaming Vessel Gearbox | 291108080 | Oil Level, Guarding°F(>170), Drive Belts°F(>170) |

### HIGH PRESSURE FEEDER (3 equipamentos)

| Equipamento | WO# | Itens notáveis |
|---|---|---|
| High Pressure Feeder | 291106080 | Motor°F(**>190**), IB Bearing°F(**>190**), Slide Ruler Setting(mm) — threshold especial! |
| High Pressure Feeder Gearbox | 291106080 | Oil Level, Guarding°F(>170), Drive Belts°F(>170) |
| Equalization Line | 291106080 | North End Temp°F(**>130**), South End Temp°F(**>130**) — threshold especial! |

### TOP CIRCULATION (2 equipamentos)

| Equipamento | WO# | Itens notáveis |
|---|---|---|
| Top Circulation | 291106080 | Motor°F(>170), IB Bearing°F(>170), Junction Box, Motor Base Condition |
| Top Circulation Pump | 291106080 | Oil Level, Packing/Mech Seal, IB/OB Bearing°F(>170), Seal Water |

### OTHER (7 equipamentos)

| Equipamento | WO# |
|---|---|
| Sand Separator (×2) | — |
| In-Line Drainers (North and South) | — |
| Level Tank | — |
| LV 7 | — |
| Descaler Pumps (SOSPERSE) | — |
| Defoamer Pumps (Buckman) | — |

### CHIP CHUTE (2 equipamentos)

| Equipamento | WO# | Itens notáveis |
|---|---|---|
| Chip Chute | 291106080 | Motor°F, IB/OB Bearing°F, Pump Oil Level, Packing/Mech Seal, Pump IB/OB Bearing°F |
| Sand Separator Dump Tank | — | General Condition, Associated Piping, Agitator Running? |

### BOTTOM CIRCULATION, TRIM LIQUOR, MCC WHITE LIQUOR, COLD BLOW, MAKEUP LIQUOR (10 equip — padrão motor+bomba)

> Todos seguem o mesmo padrão: **Motor** (General Condition, Motor Temp, IB Bearing, Coupling, Guarding, Leaks) + **Pump** (Oil Level, Packing/Mech Seal, IB/OB Bearing, Seal Water)
> WO# 291106080 (Trim/Bottom/MCC) e 291120080 (Cold Blow/Makeup)

### SEAL WATER (4 equipamentos — 2 conjuntos N/S)

> South/North Seal Water Motor + South/North Seal Water Pump — mesmo padrão
> WO# 291120080

---

## 6. Inventário completo — Route 3: Blow Heat/Stripper/Turpentine

> **Sistema:** Recuperação de calor (BH = Blow Heat), Stripper de condensado e recuperação de terebintina
> **Seções:** Chip Bin Floor (0 equip), Top 2 Floors (0 equip), Entrainment Separator Floor (2 equip)
> **Nota:** O Excel contém majoritariamente seções vazias — apenas 2 equipamentos com itens

### Entrainment Separator Floor (2 equipamentos)

| Equipamento | WO# | Itens | Medições |
|---|---|---|---|
| Kamyr North WL Pump | — | Motor Temp°F, Oil Level, Guarding, Packing/Mech Seal, IB Bearing°F(>170F), OB Bearing°F(>170F), IB Vib(ips), OB Vib(ips), Seal Water | 5 |
| Kamyr South WL Pump | — | Motor Temp°F(>170F), Oil Level, Guarding, Packing/Mech Seal, IB Bearing°F(>170F), OB Bearing°F(>170F), IB Vib(ips), OB Vib(ips), Seal Water | 5 |

> **Nota:** Route 3 tem apenas 2 equipamentos ativos no Excel — o restante são seções de referência sem inspeção OEC registrada nesta planilha.

---

## 7. Inventário completo — Route 4: A Line Screening and Washing

> **Sistema:** Peneiramento (A1/A2/A3 screens) e lavagem da polpa celulósica (A-Line)
> **Seções:** 4 — 24 equipamentos, 96 itens

### 2nd Floor Bleach Plant (6 equipamentos)

| Equipamento | WO# | Itens |
|---|---|---|
| A1 Screen | — | General Condition, Plugged(YES/NO) |
| A2 Screen | — | General Condition, Plugged(YES/NO) |
| A3 Screen | — | General Condition, Plugged(YES/NO) |
| Cleaner Feed Tank | — | General Condition, Associated Piping |
| A1 MC Pump | — | Oil Level, Packing/Mech Seal, IB Bearing°F(>170), OB Bearing°F(>170), Seal Water |
| A2 MC Pump | — | Oil Level, Packing/Mech Seal, IB Bearing°F(>170), OB Bearing°F(>170), Seal Water |

### Ground Floor Bleach Plant — Inside (12 equipamentos)

| Equipamento | WO# | Padrão |
|---|---|---|
| A1 Seal Tank | — | General Condition, Associated Piping |
| A1 Vat Dilution Pump | — | Oil Level, Packing/Mech Seal, IB/OB Bearing°F, Seal Water |
| A1 HD Dilution Pump | — | Oil Level, Packing/Mech Seal, IB Bearing°F(>170), OB Bearing°F(>170), Seal Water |
| A1 Diffuser Shower Pump | — | Oil Level, Packing/Mech Seal, IB Bearing°F(>170), OB Bearing°F(>170), Seal Water |
| A2 Seal Tank | — | General Condition, Associated Piping |
| A2 Vat Dilution Pump | — | Oil Level, Packing/Mech Seal, IB/OB Bearing°F(>170), Seal Water |
| A2 HD Dilution Pump | — | Oil Level, Packing/Mech Seal, IB/OB Bearing°F(>170), Seal Water |
| A2 Diffuser Shower Pump | — | Oil Level, Packing/Mech Seal, IB/OB Bearing°F(>170), Seal Water |
| Reject Refiner Feed Tank | — | General Condition, Associated Piping |
| Reject Refiner Feed Tank Agitator | — | General Condition, Associated Piping, Motor Running, Belts |
| Reject Refiner Feed Pump | — | Oil Level, Packing/Mech Seal, IB/OB Bearing°F(>170), Seal Water |
| A-Line Cleaners | — | Manually Dump #1, Manually Dump #2 |

### Ground Floor Bleach Plant — Outside (6 equipamentos)

| Equipamento | WO# | Padrão |
|---|---|---|
| Screen Feed Tank | — | General Condition, Associated Piping |
| Screen Feed Tank Agitator | — | General Condition, Piping and guarding clean?, Motor Running, Belts |
| Screen Feed Tank Pump | — | Oil Level, Packing/Mech Seal, IB/OB Bearing°F, Seal Water |
| #1 Reject Refiner | — | General Condition, Motor Temp°F, Motor, IB Bearing°F, Coupling, Guarding, Leaks |
| #2 Reject Refiner | — | (mesmo que #1) |
| Reject Refiner Lube Oil System | — | General Condition, Associated Piping |

---

## 8. Mapeamento Excel → CDF (ApmAppData + CogniteCore)

### Hierarquia de assets (CogniteCore `CogniteAsset v1`)

```
ip.asset.aline                          ← Linha A (root asset)
  ip.asset.aline.route1                 ← Rota 1 (Digester/Diffuser)
    ip.asset.aline.route1.7f            ← Seção: 7th Floor
      ip.asset.aline.route1.7f.diffuser-scraper        ← Equipamento
      ip.asset.aline.route1.7f.diffuser-gearbox
      ip.asset.aline.route1.7f.backflush-tank-1
      ip.asset.aline.route1.7f.backflush-tank-2
    ip.asset.aline.route1.6f
      ip.asset.aline.route1.6f.digester-top-separator
    ...
  ip.asset.aline.route2                 ← Rota 2 (Feed System)
    ip.asset.aline.route2.chip-bin
      ip.asset.aline.route2.chip-bin.top-chip-bin-belts
      ...
  ip.asset.aline.route3
  ip.asset.aline.route4
```

### Propriedades chave dos assets

| Propriedade `CogniteAsset` | Fonte Excel | Exemplo |
|---|---|---|
| `externalId` | Gerado por slug | `ip.asset.aline.route1.7f.diffuser-scraper` |
| `name` | Nome do equipamento | `Diffuser Scraper` |
| `description` | Sistema + rota + seção | `Kamyr Diffuser — Route 1 — 7th Floor` |
| `assetType` (metadata) | Tipo inferido | `pump`, `motor`, `gearbox`, `tank`, `valve`, `screen` |
| `workOrderId` (metadata) | Coluna WO# | `301112080` |

### Mapeamento para ApmAppData

| Entidade Excel | View ApmAppData | Propriedades-chave |
|---|---|---|
| Rota (aba) | `Template v8` | `name`, `description`, `assetExternalId` (route asset) |
| Item de inspeção (□) | `TemplateItem v7` | `name`, `isMeasurement`, `description` (unidade + threshold) |
| Execução do checklist | `Checklist v7` | `status`, `startTime`, `endTime`, `assignedTo` |
| Item preenchido | `ChecklistItem v7` | `result`, `comment`, `templateItemExternalId` |
| Leitura de medição | `MeasurementReading v4` | `value`, `unit`, `checklistItemExternalId` |
| Exceção / anomalia | `Observation v5` | `description`, `severity`, `checklistExternalId` |
| Agendamento | `Schedule v4` | `frequency` (daily), `templateExternalId`, `assetExternalId` |

---

## 9. Guia de design do seed — 2000 checklists em 1 ano

### 9.1 Cenário de operação (paper & pulp — contexto industrial real)

A fábrica opera **24h/dia, 365 dias/ano**, com turnos de 8h (3 turnos: 06h–14h, 14h–22h, 22h–06h).
Cada rota é inspecionada **1× por turno** (3 inspeções/dia por rota).
Com 4 rotas × 3 turnos × 365 dias = **4.380 checklists/ano** (teórico).
Para 2.000 checklists realistas: usar ~6 meses de dados ou 2 inspeções/dia.

**Sugestão: 2 inspeções por rota por dia × 250 dias operacionais = 2.000 checklists**

### 9.2 Personas reais (operadores de planta Kraft)

| Persona | Papel no seed | Turno |
|---|---|---|
| `op.john.martinez` | Operador Sênior (10 anos exp.) — Route 1 e 2 | Dia (06h–14h) |
| `op.sarah.chen` | Operadora Plena — Route 1 | Tarde (14h–22h) |
| `op.mike.torres` | Operador Júnior (2 anos) — Route 2 e 3 | Noite (22h–06h) |
| `op.linda.kowalski` | Operadora Sênior — Route 3 e 4 | Dia (06h–14h) |
| `op.james.osei` | Operador Pleno — Route 4 | Tarde (14h–22h) |
| `op.anna.petrov` | Operadora Plena — Route 2 | Noite (22h–06h) |
| `sup.david.nguyen` | Supervisor de Manutenção (aprovador) | Dia |
| `sup.carol.bishop` | Supervisora de Operações (aprovadora) | Tarde |

### 9.3 Distribuição realista de resultados (benchmark industrial)

| Resultado | Frequência nos itens OK/Not OK | Comentário |
|---|---|---|
| `OK` | 88% | Condição normal |
| `Not OK` | 7% | Requer atenção |
| `N/A` | 5% | Equipamento em manutenção ou fora de serviço |

| Resultado | Frequência nos itens Yes/No | Comentário |
|---|---|---|
| Resposta esperada (positivo) | 93% | Normal |
| Resposta de anomalia | 7% | Alerta |

| Medições | Comportamento | Detalhe |
|---|---|---|
| Motor Temp | Normal: 130–160°F | 5% dos casos: 171–185°F (alarme) |
| Bearing Temp | Normal: 120–155°F | 4% dos casos: 171–180°F |
| Vibration IPS | Normal: 0.05–0.12 ips | 3% dos casos: 0.30–0.45 ips (alarme) |
| Slide Rule (mm) | Normal: 2–8mm | Valor operacional (ajuste diário) |
| Equalization Line | Normal: 100–125°F | 3% dos casos: > 130°F |

### 9.4 Padrões sazonais e de degradação (1 ano de dados)

Para tornar os dados interessantes para KPIs e dashboards:

| Período | Evento simulado | Impacto nos dados |
|---|---|---|
| Semana 1–2 (Jan) | Partida após parada de manutenção | Mais itens N/A, temps estáveis |
| Mês 2–3 | Operação normal estável | NOK rate baixo (3–4%) |
| Mês 4 | Início de degradação Diffuser Scraper | NOK rate cresce para 12% neste equipamento |
| Mês 5 | Substituição do Diffuser Scraper | Observações + WO gerados, volta ao normal |
| Mês 6 | Verão — temperaturas ambiente altas | Temps de motor 5–10°F acima do normal |
| Mês 7–8 | Operação normal | NOK rate 5–6% |
| Mês 9 | Problema em High Pressure Feeder | Temps acima de 190°F — alertas críticos |
| Mês 10 | Manutenção preventiva Route 2 | N/A rate de 15% em Route 2 |
| Mês 11–12 | Estabilização fim de ano | NOK rate baixo, preparação para parada |

### 9.5 Padrões de observações (Observation `v5`)

| Severidade | Gatilho | Exemplo de descrição |
|---|---|---|
| `critical` | Motor Temp > 185°F ou Bearing > 180°F | "Motor temperature at 188°F — immediate attention required" |
| `high` | Motor Temp 171–185°F; IB/OB Bearing 171–180°F | "Bearing running hot — monitor and schedule greasing" |
| `medium` | Vibration > 0.30 ips | "Elevated vibration detected — check alignment and balance" |
| `low` | Leak detected, Packing NOK | "Minor seal leak observed — schedule packing replacement" |
| `info` | N/A justificado | "Equipment in planned maintenance (PM-2024-07)" |

### 9.6 Status dos checklists

Para 2.000 checklists gerados (distribuição):

| Status | % | Descrição |
|---|---|---|
| `Completed` | 85% | Inspeção concluída e assinada |
| `InProgress` | 5% | Em andamento (mais recentes do período) |
| `NotStarted` | 3% | Programados mas não iniciados |
| `Overdue` | 5% | Prazo vencido sem execução |
| `Approved` | 2% | Aprovado pelo supervisor após revisão |

---

## 10. Decisão de properties especiais (views CDF)

### O que o ApmAppData não cobre nativamente e como resolver

| Dado necessário | Status no ApmAppData | Solução |
|---|---|---|
| Seção / andar do equipamento | ❌ Não existe view de seção | Hierarquia de assets: Route → Section → Equipment no `CogniteAsset` |
| Threshold do item de inspeção | ❓ TemplateItem não tem `threshold` direto | Armazenar em `description` do TemplateItem: `"Motor Temp (°F) — Alarm if > 170"` |
| Unidade da medição | ✅ `MeasurementReading` tem `unit` | Usar diretamente |
| Turno da inspeção (Day/Afternoon/Night) | ❌ Não existe | Usar `metadata` do `Checklist` ou deduzir do `startTime` |
| Número de WO associado ao equipamento | ❌ Não existe no asset padrão | Usar `metadata.workOrderId` no `CogniteAsset` |
| Tipo do equipamento (pump, motor, etc.) | ❌ Não existe em `CogniteAsset` basic | Usar `assetType` em `metadata` ou `CogniteEquipment v1` |

### Recomendação: usar `CogniteEquipment v1` para equipamentos rotativos

Para motores, bombas, gearboxes (70% dos equipamentos) — usar `CogniteEquipment v1` (extends `CogniteAsset`)
pois já tem campos de `manufacturer`, `serialNumber`, `model`.
Para tanques, válvulas, telas — usar `CogniteAsset v1` simples.

---

## 11. Referência rápida de externalIds

### Convenção adotada

```
Assets:         ip.asset.aline.<route-slug>.<section-slug>.<equip-slug>
Templates:      ip.template.aline.<route-slug>
TemplateItems:  ip.tmplitem.<route-slug>.<equip-slug>.<item-slug>
Schedules:      ip.schedule.aline.<route-slug>.daily
Checklists:     ip.checklist.<route-slug>.<YYYY-MM-DD>.<shift>
ChecklistItems: ip.chkitem.<checklist-id>.<tmplitem-slug>
Measurements:   ip.meas.<checklistitem-id>
Observations:   ip.obs.<checklist-id>.<equip-slug>.<seq>
```

### Slugs de rota

| Rota | Slug |
|---|---|
| Route 1 — Dig IV Diff | `route1` |
| Route 2 — Feed System | `route2` |
| Route 3 — BH Strip Turp | `route3` |
| Route 4 — Screening & Washing | `route4` |

### Slugs de seção (Route 1)

| Seção | Slug |
|---|---|
| 7th Floor | `7f` |
| 6th Floor | `6f` |
| 5th Floor | `5f` |
| 4.5th Floor | `45f` |
| 4th Floor | `4f` |
| 3rd Floor | `3f` |
| 2nd Floor | `2f` |
| Ground Floor | `gf` |

---

## 12. Próximos passos (Atividade 3)

1. Criar `scripts/generate-seed.mjs` que lê `excel-raw-extract.json` e gera os 7 CSVs
2. Implementar lógica de simulação de resultados (distribuição acima)
3. Gerar 2.000 checklists cobrindo ~12 meses com os padrões sazonais definidos
4. Salvar em `docs/Seed/generated/`
5. Ingerir via Cognite Toolkit (Atividade 4 → 5)
