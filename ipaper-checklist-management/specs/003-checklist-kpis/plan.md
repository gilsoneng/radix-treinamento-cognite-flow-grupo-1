# Plan — Checklist KPIs

> **ID:** 002-checklist-kpis
> Responde: **COMO** implementar. Subordinado a `spec.md`.
> Referenciar `AGENTS.md` em vez de reescrever padrões.

---

## Visão técnica

Módulo `modules/checklists/` (bounded context de negócio):
- `domain/checklist.model.ts` — modelo de domínio com status tipado
- `domain/checklist.repository.ts` — interface do repositório
- `infrastructure/dto/checklist.dto.ts` — DTO da instância DMS `Checklist v7`
- `infrastructure/mappers/checklist.mapper.ts` — DMS → domínio
- `infrastructure/queries/checklist.queries.ts` — queryFn usando `@cognite/sdk`
- `presentation/kpi-dashboard/` — página KPI com cards e filtro

---

## Mapeamento FR → módulo

| FR | Módulo `src/...` | Padrão AGENTS.md |
| --- | --- | --- |
| FR-001 | `infrastructure/queries/checklist.queries.ts` | §3 (DI de repositório) |
| FR-002 | `presentation/kpi-dashboard/KpiDashboard.tsx` | §5 (ViewModel) |
| FR-003 | `presentation/kpi-dashboard/useKpiDashboardViewModel.ts` | §5 (ViewModel) |
| FR-004 | `infrastructure/queries/checklist.queries.ts` | §2 (react-query staleTime) |
| FR-005 | `presentation/kpi-dashboard/KpiDashboard.tsx` | §5 (loading/error state) |

---

## Estado e host-sync

| Estado | Tipo | Justificativa |
| --- | --- | --- |
| Filtro de template selecionado | host-synced | Deve sobreviver reload e ser compartilhável |
| Dados de checklists | react-query (servidor) | Cache automático, refetch por staleTime |
| Estado de loading/erro | local | Efêmero, derivado do react-query |

---

## Interfaces (AGENTS.md §4)

```typescript
export interface ChecklistRepository {
  listByTemplate(templateId?: string): Promise<Checklist[]>;
  countByStatus(): Promise<ChecklistKpiSummary>;
}

export interface ChecklistKpiSummary {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
}
```

---

## Trade-offs e alternativas

- Alternativa A: buscar todos os checklists e calcular KPIs no cliente — escolhida para simplicidade nesta fase; reavaliável se volume > 1000.
- Alternativa B: usar `instances.aggregate` no CDF — preferível em escala, mas requer validação da API disponível.
- Escolha: Alternativa A com limite paginado + nota em research.md para revisitar com Alternativa B.

---

## Riscos

- [Paginação CDF: se houver > 1000 checklists, uma única chamada não traz tudo] → [Implementar loop com `cursor` conforme skill `dm-limits-and-best-practices`]
- [Status values desconhecidos] → [Clarificar antes de codificar o mapper]
