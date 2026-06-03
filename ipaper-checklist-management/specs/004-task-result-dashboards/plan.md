# Plan — Task Result Dashboards

> **ID:** 003-task-result-dashboards
> Responde: **COMO** implementar. Subordinado a `spec.md`.
> Referenciar `AGENTS.md` em vez de reescrever padrões.

---

## Visão técnica

Estende o módulo `modules/checklists/` da feature 002:
- `infrastructure/dto/checklist-item.dto.ts` — DTO da instância DMS `ChecklistItem v7`
- `infrastructure/mappers/checklist-item.mapper.ts` — DMS → domínio
- `infrastructure/queries/checklist-item.queries.ts` — queryFn paginada
- `presentation/task-dashboard/` — página de dashboard com tabela de resultados e filtros

---

## Mapeamento FR → módulo

| FR | Módulo `src/...` | Padrão AGENTS.md |
| --- | --- | --- |
| FR-001 | `infrastructure/queries/checklist-item.queries.ts` | §3 (DI repositório) |
| FR-002 | `presentation/task-dashboard/TaskDashboard.tsx` | §5 (ViewModel) |
| FR-003 | `presentation/task-dashboard/useTaskDashboardViewModel.ts` | §5 (ViewModel + filtro) |
| FR-004 | `presentation/task-dashboard/useTaskDashboardViewModel.ts` | §2 (estado host-synced para filtro de data) |
| FR-005 | `presentation/task-dashboard/TaskDashboard.tsx` | §5 (loading/error state) |
| FR-006 | `infrastructure/queries/checklist-item.queries.ts` | skill dm-limits |

---

## Estado e host-sync

| Estado | Tipo | Justificativa |
| --- | --- | --- |
| Template/rota selecionado | host-synced | Deve sobreviver reload |
| Período (data início/fim) | host-synced | Deve ser compartilhável via link |
| Dados de ChecklistItems | react-query (servidor) | Cache automático |
| Estado de loading/erro | local | Efêmero, derivado do react-query |

---

## Interfaces (AGENTS.md §4)

```typescript
export interface ChecklistItemRepository {
  listByChecklist(checklistId: string): Promise<ChecklistItem[]>;
  listByTemplate(templateId: string, dateRange?: DateRange): Promise<ChecklistItem[]>;
}

export interface DateRange {
  from: Date;
  to: Date;
}
```

---

## Trade-offs e alternativas

- Alternativa A: reutilizar o mesmo módulo de 002 (`checklists`) — escolhida para evitar duplicação de DTO/mapper.
- Alternativa B: criar módulo separado `checklist-items` — desnecessário nesta fase; reavaliável se o módulo crescer muito.
- Escolha: Alternativa A; `ChecklistItem` como extensão do bounded context `checklists`.

---

## Riscos

- [Campos de resultado em `ChecklistItem v7` ainda não confirmados] → [Esclarecer antes de criar o mapper]
- [Volume de ChecklistItems pode ser alto] → [Usar paginação com cursor + staleTime generoso]
