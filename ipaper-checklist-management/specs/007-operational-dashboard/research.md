# Research — 007-operational-dashboard

## Turno operacional vs calendário real

O seed usa datas 2025; o relógio do cliente pode ser 2026. A regra de domínio `resolveOperationalShiftContext` usa a **data mais recente presente nos `externalId` de checklist** (`…-YYYY-MM-DD-D|A|N`) como dia operacional, e o código de turno do relógio (06–14 D, 14–22 A, resto N), com fallback para o turno mais populoso nesse dia.

## Semáforo (FR-003)

| Bucket | `critical` | `watch` | `good` |
| --- | --- | --- | --- |
| overdue, notok | valor > 0 e delta > 0 | valor > 0 | valor = 0 |
| done | — | delta < 0 | delta > 0 |
| todo, ongoing | delta > 0 | — | delta < 0 |

`neutral` quando delta = 0 ou sem cohort anterior.

## Delta (FR-002)

`delta[b] = countCurrentShift[b] - countPreviousShift[b]` onde cada contagem é `summarizeChecklistKpis` no subconjunto filtrado por `date` + `shift` parseados do `externalId`.

## Charts (Fase B+)

- Biblioteca: `recharts` (já no `package.json`).
- Heat calendar: grid CSS + escala verde→vermelho em `styles.css` com tokens IP.
- Treemap/Sankey: Recharts; evitar libs extras até necessário.

## Atlas (FR-023)

Seguir skill `.agents/skills/integrate-fusion-agent` — fora do escopo da Fase A.
