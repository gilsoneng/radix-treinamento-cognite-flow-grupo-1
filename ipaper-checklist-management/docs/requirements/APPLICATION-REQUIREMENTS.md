# Application Requirements — ipaper-checklist-management

> **Projeto:** International Paper — InField Challenge  
> **Contexto:** IP está migrando de **Webalo** para **InField**. Este app Flows entrega enhancements customizados sobre checklists operacionais.  
> **Protótipo UX:** [`docs/prototype/LOVABLE-PROTOTYPE.md`](../prototype/LOVABLE-PROTOTYPE.md)  
> **Spec macro (Flows):** [`SPEC.md`](../../SPEC.md)

**Versão:** 1.0  
**Data:** 2026-06-02  
**Status:** Aprovado para implementação (baseline de treinamento)

---

## 1. Objetivo do produto

Fornecer visibilidade operacional sobre execução de checklists InField em uma fábrica IP, com:

1. KPIs de status de checklists em tempo quasi-real
2. Análise de resultados de tasks (OK vs Not OK) com tendências temporais
3. Alertas e notificações automatizadas e configuráveis baseadas em resultados

---

## 2. Personas

| ID | Persona | Necessidade principal |
| --- | --- | --- |
| P-01 | **Supervisor de turno** | Ver rapidamente o que está atrasado ou Not OK |
| P-02 | **Técnico de manutenção** | Investigar checklists e tasks com falha recorrente |
| P-03 | **Engenheiro de processo** | Acompanhar tendências OK/Not OK por área e checklist |
| P-04 | **Administrador / coordenador** | Configurar quem recebe alertas e em quais condições |

---

## 3. Escopo funcional (três pilares + fundação)

### 3.0 App Foundation (plataforma)

| ID | Requisito | Detalhe |
| --- | --- | --- |
| AR-001 | Integração Fusion | `connectToHostApp`, `CogniteSdkProvider`, sem auth custom |
| AR-002 | Estados de bootstrap | Loading e erro explícitos na inicialização |
| AR-003 | App shell | Sidebar + outlet para módulos Overview, Checklists, Analytics, Alerts |
| AR-004 | Navegação host-synced | Página ativa persiste via `syncInternalState` |
| AR-005 | HostAppAPI injetável | Contexto para ViewModels (AGENTS.md §3) |
| AR-006 | Branding IP no chrome | Tokens `--ip-*`, sidebar teal — `docs/Design.md` |

**Referência protótipo:** `app-sidebar.tsx`, `__root.tsx`  
**Spec SDD:** [`specs/001-checklist-management/spec.md`](../../specs/001-checklist-management/spec.md)  
**Mapeia NFR:** NFR-001, NFR-002, NFR-003

---

### 3.1 Checklist KPI Enhancements

| ID | Requisito | Detalhe |
| --- | --- | --- |
| AR-101 | KPIs de status | Exibir contagem (e %) de checklists em: **To Do**, **Ongoing**, **Done**, **Overdue**, **Not OK** |
| AR-102 | Definição Not OK | Checklist **Not OK** = contém **pelo menos um** resultado de task Not OK |
| AR-103 | Overview page | Página central com visão consolidada do estado operacional |
| AR-104 | Busca de checklists | Permitir localizar checklist por nome, ID, asset, área |
| AR-105 | Visualização rápida de resultados | A partir da overview ou lista, abrir detalhe com resultados das tasks |
| AR-106 | Filtros operacionais | Filtrar por status, área, asset, equipe, resultado agregado |
| AR-107 | Navegação drill-down | KPI card → lista filtrada → detalhe do checklist |

**Referência protótipo:** `/`, `/checklists`, `/checklists/:id`  
**Spec SDD:** [`specs/002-checklist-kpis/spec.md`](../../specs/002-checklist-kpis/spec.md)

---

### 3.2 Task Result Dashboards

| ID | Requisito | Detalhe |
| --- | --- | --- |
| AR-201 | Breakdown OK vs Not OK | Dashboards com proporção e volume de tasks OK e Not OK |
| AR-202 | Agregação dimensional | Quebrar Not OK por checklist, área, asset e task recorrente |
| AR-203 | Time-series KPIs | Séries temporais configuráveis (ex.: diário, semanal, mensal) |
| AR-204 | Métricas de tendência | Taxa Not OK (%), volume completado, contagem overdue ao longo do tempo |
| AR-205 | Período selecionável | Usuário escolhe janela temporal (7d, 30d, mês, custom) |

**Referência protótipo:** `/task-results`, `/kpis`  
**Spec SDD:** [`specs/003-task-result-trends/spec.md`](../../specs/003-task-result-trends/spec.md)

---

### 3.3 Alerts & Notifications

| ID | Requisito | Detalhe |
| --- | --- | --- |
| AR-301 | Automação | Notificações **disparadas automaticamente** — sem ação manual do operador |
| AR-302 | Trigger: Not OK | Alerta quando checklist ou task recebe resultado **Not OK** |
| AR-303 | Trigger: completed | Alerta quando checklist é **concluído** |
| AR-304 | Trigger: overdue | Alerta quando checklist fica **overdue** (extensão além do slide base) |
| AR-305 | Trigger: recorrência | Alerta quando mesmo Not OK se repete N vezes em período (extensão protótipo) |
| AR-306 | Destinatários configuráveis | Definir equipes/usuários/grupos por regra |
| AR-307 | Triggers configuráveis | Escolher evento, escopo (checklist template, área) |
| AR-308 | Formato configurável | Canal: e-mail, Teams, SMS (integração real depende de backend IP/Cognite) |
| AR-309 | Gestão de regras | CRUD de regras: criar, editar, ativar/desativar, excluir |
| AR-310 | Histórico | Exibir última execução / last triggered por regra |

**Referência protótipo:** `/alerts`  
**Spec SDD:** [`specs/004-alerts-notifications/spec.md`](../../specs/004-alerts-notifications/spec.md)

---

## 4. Requisitos não funcionais

| ID | Requisito |
| --- | --- |
| NFR-001 | App roda como **Cognite Flows custom app** integrado ao host Fusion (`@cognite/app-sdk`) |
| NFR-002 | UI usa **Aura** e tokens IP (`docs/Design.md`) — protótipo Lovable é referência, não código fonte |
| NFR-003 | Estado de navegação/filtros **host-synced** quando aplicável (AGENTS.md §2) |
| NFR-004 | Test-First: cada FR testável com teste de integração ou unidade (AGENTS.md §6) |
| NFR-005 | Dados de checklists/tasks originam-se de **InField / CDF** — mock apenas em dev/protótipo |
| NFR-006 | Loading, erro e vazio explícitos em todas as views de dados |
| NFR-007 | Acessibilidade: foco visível, labels, padrões Aura |

---

## 5. Fora de escopo (v1)

- Substituição completa do InField nativo para execução de checklists em campo
- Migração automatizada de dados históricos Webalo
- App mobile nativo (InField mobile permanece canal de execução)
- Editor de templates de checklist
- Autenticação customizada (usa Fusion/CogniteSdkProvider)

---

## 6. Integração de dados (visão)

| Entidade | Origem esperada | Uso |
| --- | --- | --- |
| Checklist instance | InField / CDF | KPIs, listagem, detalhe |
| Task result | InField / CDF | OK/Not OK, analytics |
| Alert rule | App config (CDF custom view ou serviço) | CRUD regras |
| Notification delivery | Serviço externo (email/Teams) | Disparo automatizado |

Detalhamento por feature nas specs SDD (seção Data Models).

Cada feature SDD (fluxo **completo**) inclui `research.md` (ADRs/clarificações) e `plan.md` (mapeamento FR→módulo) — ver `specs/001` … `specs/004`.

---

## 7. Critérios de sucesso do produto

| ID | Critério |
| --- | --- |
| SC-001 | Supervisor identifica checklists Overdue e Not OK em < 30s na overview |
| SC-002 | Usuário encontra checklist específico via busca em < 3 interações |
| SC-003 | Gráficos OK/Not OK refletem dados reais CDF para período selecionado |
| SC-004 | Regra de alerta Not OK dispara notificação em < 5 min após resultado registrado |
| SC-005 | 100% dos FRs das specs 002–004 com testes `passing` antes de `done` |

---

## 8. Rastreabilidade

| Application Requirement | Feature spec |
| --- | --- |
| AR-001 … AR-006 | `001-checklist-management` |
| AR-101 … AR-107 | `002-checklist-kpis` |
| AR-201 … AR-205 | `003-task-result-trends` |
| AR-301 … AR-310 | `004-alerts-notifications` |

Divisão de issues: [`TASKS-DIVISION.md`](TASKS-DIVISION.md).
