# Spec — 006 Bugs & Minor Actions

> **ID:** 006-bugs-and-minor-actions
> **Tipo:** Rolling maintenance spec (nunca fecha — acumula indefinidamente)
> **Rigor:** leve (fluxo L1–L3 da CONSTITUTION.md)
> **Owner:** time-grupo-1
> **Criado em:** 2026-06-03

---

## Objetivo

Rastrear bugfixes, ajustes de copy, correções de CSS, refactors internos sem novo FR
e outras ações menores que não justificam uma spec de feature completa.

**Esta spec nunca muda para `status: done`.** Quando o `tasks.md` ficar grande demais,
arquivar com sufixo de período (ex.: `006-bugs-and-minor-actions-2026-H1`) e criar novo.

---

## Critério de uso

Use esta spec quando a tarefa se encaixar no **fluxo leve (L1–L3)** da `CONSTITUTION.md`:

| Tipo de tarefa | Usar esta spec? |
|---|---|
| Bugfix visível ao usuário | ✅ sim |
| Ajuste de copy / texto da UI | ✅ sim |
| Correção de CSS / layout | ✅ sim |
| Refactor interno sem novo FR | ✅ sim |
| Nova feature / integração CDF | ❌ não — criar spec própria com fluxo completo |
| Nova tela ou fluxo de usuário | ❌ não — criar spec própria |

---

## Como registrar uma nova tarefa

O dev informa ao agente o que vai fazer. O agente:
1. Adiciona entry em `tasks.md` com `[ ]` (pendente)
2. Executa o trabalho
3. Marca `[x]` ao concluir
4. Aplica gatilhos de manutenção conforme `project-orientation.mdc`

---

## Relates to

- `SPEC.md` macro — comportamento visível deve ser atualizado se afetado
- `specs/CONSTITUTION.md` — fluxo leve L1–L3
