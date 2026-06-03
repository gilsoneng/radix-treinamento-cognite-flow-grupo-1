# Plan — 007-operational-dashboard

## Arquitetura

```
presentation/overview
  └── useOverviewKpisViewModel  →  react-query
infrastructure/cdf-checklist.repository
  └── computeKpiSummary  →  Checklist:v7 list + domain insights
domain/
  ├── checklist-kpi.rules (buckets)
  ├── checklist-shift.rules (filter by externalId)
  ├── inspection-shift.rules (D/A/N clock)
  └── kpi-insight.rules (delta + semáforo)
```

## UI (Aura + Design.md)

- `Card`, `CardContent`, `Badge` para KPI e delta
- Classes `ip-kpi-card--{good|watch|critical|neutral}` em `styles.css` com tokens `--ip-clover`, `--ip-yellow`, destructive

## Fase A only in this delivery

Fases B/C permanecem em `tasks.md` [ ].
