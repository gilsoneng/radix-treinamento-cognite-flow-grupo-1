# Research — Task Result Dashboards

> **ID:** 003-task-result-dashboards
> Registra: decisões arquiteturais (ADRs) e clarificações resolvidas.
> Formato ADR: Contexto → Decisão → Consequência.

---

## ADR-001 — ChecklistItem como extensão do bounded context `checklists`

**Contexto:** `ChecklistItem` é fortemente acoplado ao `Checklist` (via relacionamento direto na view `ChecklistItem v7`). Criar um módulo separado geraria duplicação de DTO e repositório para um contexto que não tem vida própria sem o `Checklist`.

**Decisão:** Implementar `ChecklistItem` dentro de `modules/checklists/` como extensão do bounded context existente (criado em 002). DTOs, mappers e queries ficam na mesma pasta de infraestrutura; o ViewModel da feature 003 é isolado em `presentation/task-dashboard/`.

**Consequência:** Menos arquivos e sem duplicação; risco de crescimento excessivo do módulo se houver muitas features sobre `ChecklistItem`. Revisitar ao criar feature 005+.

---

## Clarificações resolvidas

<!-- Preencher ao resolver as perguntas abertas de spec.md -->

## Clarificações em aberto

- [ ] Quais campos de resultado existem em `ChecklistItem v7`? (`status`, `value`, `comment`, outros?) — verificar via MCP `cdf_get_view` ou `docs/datamodel.md`.
- [ ] O campo de data de execução é `completedAt`, `updatedTime` ou outro? Necessário para o filtro de período (FR-004).
