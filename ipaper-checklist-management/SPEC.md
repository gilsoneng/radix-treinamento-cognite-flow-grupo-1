# Product Spec — ipaper-checklist-management

> Fonte de verdade do produto. Leia antes de tomar decisões de feature. Mantenha em
> sincronia com qualquer mudança de comportamento visível ao usuário.

---

## Visão geral

O **ipaper-checklist-management** é um app Cognite Flows que digitaliza os checklists de
inspeção OEC (Operator Equipment Checklist) das linhas de produção da **International
Paper (IP)**. Substitui o processo manual em papel por um fluxo guiado no Fusion, com
rastreabilidade completa no CDF.

**Ambiente CDF:** projeto `radix-dev` · cluster `az-eastus-1` · space `cdf_apm`
**Data model principal:** `ApmAppData` v13 (space `cdf_apm`) — schema completo em `docs/datamodel.md`

---

## Personas

| Persona | Papel | Necessidade principal |
|---|---|---|
| **Inspetor de linha** | Executa as inspeções no campo (mobile/tablet) | Ver a rota do dia, preencher itens, registrar observações e leituras |
| **Supervisor de manutenção** | Monitora e valida inspeções da equipe | Acompanhar status em tempo real, ver KPIs, tratar alertas |
| **Coordenador de operações** | Visão consolidada por área/turno | Dashboards de resultado, relatórios de conformidade |

---

## User Stories

### Inspetor de linha

- Como **inspetor**, quero ver a lista de checklists da minha rota do dia, para saber o que preciso inspecionar.
- Como **inspetor**, quero preencher cada item do checklist com resultado (OK / NOK / N/A), para registrar a inspeção.
- Como **inspetor**, quero registrar observações com foto e texto em itens NOK, para dar contexto ao supervisor.
- Como **inspetor**, quero inserir leituras de medição (ex.: temperatura, pressão) em itens com `isMeasurement: true`, para rastrear valores operacionais.
- Como **inspetor**, quero assinar digitalmente a conclusão do checklist, para formalizar a execução.

### Supervisor

- Como **supervisor**, quero ver o status de todos os checklists do meu turno (pendente / em andamento / concluído), para garantir cobertura de inspeção.
- Como **supervisor**, quero receber alertas quando um item crítico for marcado NOK, para agir rapidamente.
- Como **supervisor**, quero aprovar ou rejeitar um checklist concluído, para validar a qualidade da inspeção.

---

## Acceptance Scenarios

- Dado que o inspetor acessa o app, quando o dia começa, então vê apenas os checklists da sua rota/turno ativos.
- Dado um checklist em andamento, quando o inspetor preenche todos os itens obrigatórios e assina, então o status muda para `Completed` no CDF.
- Dado um item com `isMeasurement: true`, quando o inspetor insere um valor fora do range, então o sistema sinaliza visualmente a anomalia.
- Dado que o supervisor abre o dashboard, então vê KPIs agregados (% concluídos, itens NOK abertos, itens pendentes) por rota/área.

---

## Functional Requirements

- **FR-001:** O app DEVE listar checklists filtrados por rota, turno e status para o usuário autenticado.
- **FR-002:** O app DEVE permitir preencher cada `ChecklistItem` com resultado (OK / NOK / N/A) e comentário opcional.
- **FR-003:** O app DEVE suportar registro de `MeasurementReading` para itens com `isMeasurement: true`.
- **FR-004:** O app DEVE suportar criação de `Observation` (com descrição e severidade) vinculada a um `ChecklistItem`.
- **FR-005:** O app DEVE registrar `startTime` e `endTime` da inspeção e armazenar no CDF ao concluir.
- **FR-006:** O app DEVE exibir KPIs agregados por rota/área/turno para o supervisor.
- **FR-007:** O app DEVE enviar alertas (notificação no Fusion ou status visual) quando um item crítico for NOK.
- **FR-008:** O estado de navegação (checklist ativo, filtros) DEVE sobreviver a reload via host-synced state.

---

## Success Criteria

- **SC-001:** Inspetor conclui um checklist completo (preencher + assinar) em ≤ 3 minutos para rotas de até 20 itens.
- **SC-002:** Supervisor visualiza status consolidado do turno em ≤ 5 segundos após abrir o dashboard.
- **SC-003:** 100% dos checklists concluídos ficam rastreáveis no CDF com timestamps e autoria.
- **SC-004:** Cobertura de testes ≥ 80% (gate de certificação Flows).

---

## Assumptions

- Autenticação gerenciada pelo host Fusion via `@cognite/app-sdk` (sem login próprio).
- O app é usado principalmente em tablet/desktop industrial com conectividade WiFi estável (sem modo offline v1).
- Templates e rotas são pré-configurados no CDF pelo time de operações (não gerenciados pelo app v1).
- Dados históricos de inspeções anteriores são somente leitura neste app.

---

## Data Models & CDF Integration

### Ambiente

| Parâmetro | Valor |
|---|---|
| CDF Project | `radix-dev` |
| Cluster | `az-eastus-1` |
| Space principal | `cdf_apm` |
| Data model | `ApmAppData` v13 |
| Schema completo | `docs/datamodel.md` |

### Views existentes utilizadas

| View | Versão | Space | Uso |
|---|---|---|---|
| `Checklist` | v7 | cdf_apm | Instância de inspeção executada |
| `ChecklistItem` | v7 | cdf_apm | Item individual do checklist |
| `Template` | v8 | cdf_apm | Template de checklist (configuração) |
| `TemplateItem` | v7 | cdf_apm | Item de template |
| `Observation` | v5 | cdf_apm | Observação/não-conformidade registrada |
| `MeasurementReading` | v4 | cdf_apm | Leitura de medição numérica |
| `Schedule` | v4 | cdf_apm | Agendamento recorrente de inspeção |
| `CogniteAsset` | v1 | cdf_cdm | Equipamento/ativo inspecionado (hierarquia funcional) |
| `CogniteEquipment` | v1 | cdf_cdm | Equipamento físico (serialNumber, manufacturer) |
| `CogniteActivity` | v1 | cdf_cdm | Atividade/inspeção com período de tempo |

### Spaces

| Space | Conteúdo |
|---|---|
| `cdf_apm` | Data model APM (ApmAppData v13) — checklists, templates, observações |
| `cdf_cdm` | CogniteCore v1 — assets, equipment, activities, files, timeseries (leitura + seed) |

### Novas views (planejadas — a definir em specs)

- Views estendidas em space próprio para propriedades IP-específicas (ex.: código de rota OEC, turno, linha de produção) — decisão arquitetural pendente em `specs/002-dataseed`.
