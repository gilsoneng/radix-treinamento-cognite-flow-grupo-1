# Spec — 000 Technical Foundation (Fundação Técnica)

> **ID:** 000-technical-foundation
> **Tipo:** Enabler Epic (infra, context engineering, exploração)
> **Owner:** time-grupo-1
> **Criado em:** 2026-06-02
> **Rigor:** leve (não há usuário final; não segue fluxo SDD completo)

---

## Objetivo

Garantir que o time e os agentes de IA tenham contexto completo e fidedigno do projeto
antes de implementar features de produto. Cobre:

1. **Context engineering** — regras Cursor, `SPEC.md`, `AGENTS.md`, `CLAUDE.md` em dia.
2. **Exploração de data models** — schema completo de `ApmAppData v13` e `CogniteCore v1`
   documentado em `docs/datamodel.md`.
3. **MCP CDF funcional** — servidor MCP que permite ao agente Cursor consultar o CDF
   diretamente durante a sessão.
4. **Arquitetura documentada** — `docs/architecture/` com princípios, estrutura de pastas,
   camadas e ADRs.
5. **Dataseed pronto para ingestão** — arquivos de seed derivados do Excel OEC + Cognite
   Toolkit configurado.

---

## Problema

Sem esta fundação, cada nova sessão de agente começa do zero: nomes de propriedades são
adivinhados, a arquitetura é violada, specs ficam incompletas e dados de teste são
inexistentes no ambiente `radix-dev`.

---

## Entregas rastreadas

Ver `progress.md` desta pasta para status completo, datas e detalhes de cada entrega.

### Concluídas
- Cursor Rules `alwaysApply: true` (`project-orientation.mdc`, `architecture.mdc`)
- `SPEC.md` produto populado
- `docs/datamodel.md` com ApmAppData v13 + CogniteCore v1
- MCP CDF (`scripts/cdf-mcp/`) configurado e funcionando
- `docs/architecture/` completa (README, folder-structure, layers, ADR 0001)
- Referências cruzadas em 7 arquivos de instrução

### Pendentes (atividades 2–5)
- `specs/002-dataseed/` — spec do dataseed
- Cognite Toolkit instalado e documentado
- Arquivos CSV/Parquet de seed derivados do Excel OEC
- Ingestão do seed no ambiente `radix-dev`

---

## Assumptions

- Esta spec não bloqueia o início de `001-checklist-management`; as entregas desta spec
  **habilitam** a implementação correta da feature.
- O Excel `docs/Seed/A Line OEC Routes 2 (1).xlsx` é a fonte primária de dados de seed.
- Decisões de arquitetura de data model (ApmAppData estendido vs. solution DM) serão
  formalizadas em `specs/002-dataseed/spec.md`.

---

## Relates to

- SPEC.md — seção "Data Models & CDF Integration"
- `docs/architecture/` — arquitetura técnica global
- `specs/002-dataseed/` — próxima entrega desta fundação
