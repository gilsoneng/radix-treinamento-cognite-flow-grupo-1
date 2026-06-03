---
feature: 002-dataseed
updated: 2026-06-03
---

# Research — 002 Dataseed

## Análise do Excel (2026-06-03)

### Estrutura descoberta

O arquivo `A Line OEC Routes 2 (1).xlsx` representa o sistema **"Kamyr System Operator Equipment Care"**
da International Paper — rotas de inspeção de equipamentos do processo de produção de celulose (Kamyr).

**4 rotas (abas):**

| Aba | Sistema inspecionado | Complexidade |
|---|---|---|
| Route 1 — Dig IV Diff | IV/Kamyr Digester e Diffuser | Alta (8 andares, 35 equipamentos) |
| Route 2 — Feed System | Sistema de alimentação | Alta (38 equipamentos) |
| Route 3 — BH Strip Turp | Blow Heat / Stripper / Turpentine | Baixa (2 equipamentos principais) |
| Route 4 — Screening and Washing | Peneiramento e lavagem da linha A | Média (24 equipamentos) |

### Tipos de itens de inspeção

1. **OK / Not OK** — condição geral, guarda, acoplamento, vedações
2. **Yes / No** — presença de componente ou condição binária
3. **˚F (temperatura)** — motor, mancais IB/OB (`isMeasurement: true`, threshold típico `>170˚F`)
4. **ips (vibração)** — mancais IB/OB (`isMeasurement: true`, sem threshold explícito no Excel)
5. **Outros units ocasionais** — GPM, PSI, etc.

### Equipamentos com WO# (Work Order)

Alguns equipamentos têm número de Work Order pré-definido (ex: `301112080`). Este campo pode
ser mapeado para a propriedade `workOrderId` do `CogniteAsset` ou armazenado como metadata.

### Padrão de seções (andares)

Route 1 e 3/4 usam seções por andar ("7th Floor", "6th Floor", etc.).
Route 2 não tem seções explícitas — equipamentos listados em sequência.

**Decisão:** codificar a seção como parte do `externalId` e como metadata do `CogniteAsset`.

### Decisão de arquitetura

**ApmAppData as-is** — sem necessidade de DM solution próprio ou views estendidas.

**Razão:** Todas as propriedades necessárias (nome, unidade, `isMeasurement`, threshold,
resultado, leitura, observação) existem no schema atual do `cdf_apm`. A "seção/andar"
pode ser representada na hierarquia de Assets no `cdf_cdm`.
