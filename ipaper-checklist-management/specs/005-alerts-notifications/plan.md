# Plan — Alerts & Notifications

> **ID:** 004-alerts-notifications
> Responde: **COMO** implementar. Subordinado a `spec.md`.
> Referenciar `AGENTS.md` em vez de reescrever padrões.

---

## Visão técnica

Estende `modules/checklists/` e integra ao shell da aplicação:
- `domain/rules/alert.rules.ts` — regras puras de cálculo de alertas (prazo, vencimento)
- `domain/alert.model.ts` — modelo de domínio `Alert` com tipo e severidade
- `infrastructure/dto/observation.dto.ts` — DTO da instância DMS `Observation v5`
- `infrastructure/mappers/observation.mapper.ts` — DMS → domínio
- `infrastructure/queries/observation.queries.ts` — queryFn com `refetchInterval`
- `presentation/alerts-panel/` — painel de alertas com lista priorizada
- Integração no shell: badge contador via Context compartilhado

---

## Mapeamento FR → módulo

| FR | Módulo `src/...` | Padrão AGENTS.md |
| --- | --- | --- |
| FR-001 | `domain/rules/alert.rules.ts` | §4 (domínio puro TS) |
| FR-002 | `infrastructure/queries/observation.queries.ts` | §3 (DI repositório) |
| FR-003 | `presentation/alerts-panel/AlertsPanel.tsx` | §5 (ViewModel) |
| FR-004 | `design-system/layout/` + Context de alertas | §3 (DI via Context) |
| FR-005 | `infrastructure/queries/` (`refetchInterval`) | §2 (react-query polling) |
| FR-006 | `presentation/alerts-panel/AlertsPanel.tsx` | §5 (loading/error) |

---

## Estado e host-sync

| Estado | Tipo | Justificativa |
| --- | --- | --- |
| Dados de alertas calculados | react-query (servidor + derivado) | Atualiza via polling |
| Contador de alertas no badge | React Context global | Derivado do react-query; compartilhado com shell |
| Estado de loading/erro | local | Efêmero |

---

## Interfaces (AGENTS.md §4)

```typescript
export type AlertSeverity = 'critical' | 'warning' | 'info';
export type AlertType = 'overdue' | 'due-soon' | 'critical-observation';

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  checklistId: string;
  dueDate?: Date;
}

export interface AlertRepository {
  listActive(): Promise<Alert[]>;
}
```

---

## Trade-offs e alternativas

- Alternativa A: polling automático via `refetchInterval` do react-query — escolhida pela simplicidade e alinhamento com o padrão do projeto.
- Alternativa B: WebSocket / SSE para notificações em tempo real — fora do escopo desta fase (sem suporte CDF nativo para push).
- Escolha: Alternativa A com intervalo configurável via constante.

---

## Riscos

- [Campos de `Observation v5` ainda não confirmados] → [Esclarecer antes de criar mapper]
- [Polling muito frequente pode causar 429] → [Intervalo mínimo de 60 s; usar `retry-policy.ts` de `core/query`]
- [Badge no shell requer integração cross-feature] → [Context global de alertas; cuidado com acoplamento]
