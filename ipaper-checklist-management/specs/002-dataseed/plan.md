---
feature: 002-dataseed
updated: 2026-06-03
---

# Plan — 002 Dataseed

## Sequência de execução

### Fase 1 — Análise e mapeamento (Atividade 3)

1. Ler cada aba do Excel e extrair todas as entidades (seções, equipamentos, itens)
2. Montar o mapeamento coluna → view CDF com `externalId` consistente
3. Validar com `docs/datamodel.md` se todos os campos necessários existem nas views

### Fase 2 — Geração dos CSVs (Atividade 3)

Script Node.js (`scripts/generate-seed.mjs`) que lê o Excel e gera os 7 CSVs:

```
docs/Seed/generated/
  seed-assets.csv
  seed-templates.csv
  seed-template-items.csv
  seed-checklists.csv
  seed-checklist-items.csv
  seed-measurement-readings.csv
  seed-observations.csv
```

**Convenção de `externalId`:**
- Asset: `ip.asset.aline.<slug-hierarquia>` (ex: `ip.asset.aline.route1.7f.diffuser-scraper`)
- Template: `ip.template.aline.route<N>` (ex: `ip.template.aline.route1`)
- TemplateItem: `ip.tmplitem.route<N>.<slug-equip>.<slug-item>`
- Checklist: `ip.checklist.route<N>.2026-06-<DD>`
- ChecklistItem: `ip.checklistitem.<checklist-id>.<tmplitem-id>`
- MeasurementReading: `ip.measurement.<checklistitem-id>`
- Observation: `ip.observation.<checklist-id>.<equip-slug>`

### Fase 3 — Ingestão (Atividade 5)

Usar Cognite Toolkit para fazer upload dos CSVs na ordem:
1. CogniteAssets (sem dependências)
2. Templates
3. TemplateItems (referenciam Templates)
4. Checklists (referenciam Templates e Assets)
5. ChecklistItems (referenciam Checklists e TemplateItems)
6. MeasurementReadings (referenciam ChecklistItems)
7. Observations (referenciam Checklists)

---

## Convenções de simulação dos resultados

Para os Checklists simulados (1 semana de inspeções):
- **80%** dos ChecklistItems com resultado `OK` / `Yes`
- **15%** com resultado `Not OK` / `No` (gerando Observations)
- **5%** com resultado `N/A`
- Medições: valores aleatórios dentro do range normal, com ~10% acima do threshold (gerando alerta)
- Status dos Checklists: 4 `Completed`, 1 `InProgress` por rota
