# Protótipo Lovable — InField Checklist Intelligence

> Referência UX/UI do use case **International Paper — InField Challenge** (migração Webalo → InField).
> **Stack do protótipo:** Lovable + TanStack Start + Tailwind + shadcn/ui + Recharts (dados mock).
> **Stack de produção:** Cognite Flows + Aura + `@cognite/app-sdk` + CDF/InField APIs.

**Última atualização:** 2026-06-02

---

## Localização

| Item | Valor |
| --- | --- |
| Pasta no repo | `prototype/fieldops-insights/` |
| Nome do app | InField Checklist Intelligence |
| Cliente / contexto | International Paper — Riegelwood Mill (mock) |

### Executar localmente

```bash
cd prototype/fieldops-insights
npm install   # ou: bun install
npm run dev   # Vite dev server — URL exibida no terminal (geralmente http://localhost:5173)
```

> **URL Lovable hospedada:** se o projeto foi publicado no Lovable, adicionar o link em `docs/prototype/README.md` e nesta seção. Até lá, use o código local acima.

---

## Mapeamento requisito de negócio → rotas

| Requisito (slide IP) | Rota(s) no protótipo | Arquivo(s) |
| --- | --- | --- |
| **Checklist KPIs** — status To Do, Ongoing, Done, Overdue, Not OK | `/` | `src/routes/index.tsx` |
| **Overview** — visão operacional consolidada | `/` | `src/routes/index.tsx` |
| **Busca e listagem de checklists** | `/checklists` | `src/routes/checklists.tsx` |
| **Detalhe / resultados de um checklist** | `/checklists/:id` | `src/routes/checklists.$id.tsx` |
| **Task Result Dashboards** — OK vs Not OK | `/task-results` | `src/routes/task-results.tsx` |
| **Time-Series KPIs** — tendências por período | `/kpis` | `src/routes/kpis.tsx` |
| **Alerts & Notifications** — regras configuráveis | `/alerts` | `src/routes/alerts.tsx` |
| Preferências / escopo (placeholder) | `/settings` | `src/routes/settings.tsx` |

Navegação lateral: `src/components/app-sidebar.tsx`.

---

## Telas e comportamento (resumo)

### Overview (`/`)

- **5 KPI cards** clicáveis: To Do, Ongoing, Done, Overdue, Not OK — cada um filtra `/checklists?status=…`
- Gráfico **OK vs Not OK · últimos 14 dias** (barras empilhadas)
- **Distribuição de status** (donut)
- Tabela **Latest Not OK results** com link para detalhe
- Painel **Critical alerts** (feed operacional)
- Tabela **Overdue checklists**

### Checklists (`/checklists`)

- Busca textual (`q`) e filtros: status, area, asset, team, result
- Ordenação por coluna
- Link para detalhe por checklist

### Checklist detail (`/checklists/:id`)

- Metadados: status, team, last execution, progresso %
- Tabela de **task results** (OK / Not OK / pending) com expected vs actual, comentários, evidência
- Mini gráfico de tendência OK vs Not OK

### Task Results (`/task-results`)

- KPIs agregados: total tasks, OK, Not OK, Not OK rate
- Gráficos: OK vs Not OK over time, Not OK by checklist, Not OK by area, recurring Not OK tasks

### Time-Series KPIs (`/kpis`)

- Seletor de período: Today, 7 days, 30 days, Month, Custom
- Gráficos de linha/área: completion rate, Not OK %, overdue count, stacked OK/Not OK

### Alerts (`/alerts`)

- Tabela de **regras de alerta** (nome, trigger, scope, recipients, channel, status)
- Wizard **New rule** (multi-step): trigger, scope, recipients, channel
- Triggers modelados: Not OK em checklist/task, completed, overdue, repetição N vezes

---

## Modelo de dados (mock)

Fonte: `src/lib/mock-data.ts`

| Tipo | Valores / campos principais |
| --- | --- |
| `ChecklistStatus` | `todo` \| `ongoing` \| `done` \| `overdue` \| `notok` |
| `ResultStatus` | `ok` \| `notok` \| `pending` |
| `Checklist` | id, name, area, asset, team, status, lastExecution, result, notOkCount, totalTasks, completed |
| Dimensões | AREAS, ASSETS, TEAMS, CHECKLIST_TEMPLATES |
| Alert rule | id, name, trigger, scope, recipients, channel, status, lastTriggered |

**Regra de negócio Not OK (status):** checklist classificado como `notok` quando contém pelo menos um resultado Not OK (reflete slide IP).

---

## Tradução protótipo → app Flows

| Protótipo | Produção (AGENTS.md) |
| --- | --- |
| shadcn Card, Table, Badge | `@cognite/aura/components` |
| TanStack Router + search params | Host-synced state via `syncInternalState` (AGENTS.md §2) |
| `mock-data.ts` | Serviços CDF/InField com interfaces injetáveis (AGENTS.md §3–§4) |
| Lógica em componentes de rota | ViewModels + storage compartilhado (AGENTS.md §5) |
| Cores CSS `--status-*` | Tokens IP em `src/lib/styles.css` + Aura (ver `docs/Design.md`) |
| Recharts direto | Gráficos Aura ou padrão aprovado em `plan.md` da feature |

---

## Specs SDD associadas

| Feature | Spec SDD | Issue sugerida |
| --- | --- | --- |
| App Foundation & Shell | [`specs/001-checklist-management/spec.md`](../../specs/001-checklist-management/spec.md) | Epic #001 |
| Checklist KPIs & Overview | [`specs/002-checklist-kpis/spec.md`](../../specs/002-checklist-kpis/spec.md) | Epic #002 |
| Task Result Trends | [`specs/003-task-result-trends/spec.md`](../../specs/003-task-result-trends/spec.md) | Epic #003 |
| Alerts & Notifications | [`specs/004-alerts-notifications/spec.md`](../../specs/004-alerts-notifications/spec.md) | Epic #004 |

Ver divisão completa: [`../requirements/TASKS-DIVISION.md`](../requirements/TASKS-DIVISION.md).
