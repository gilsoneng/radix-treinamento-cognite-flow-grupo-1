---
feature: 006-bugs-and-minor-actions
updated: 2026-06-03
---

# Plan — Bugs & Minor Actions

> Spec de manutenção não tem plano fixo. Cada task é independente.
> O agente consulta o contexto específico de cada bug/ajuste antes de agir.

## Protocolo de execução

1. Dev informa o bug ou ajuste no chat
2. Agente lê os arquivos relevantes (sem assumir contexto de sessões anteriores)
3. Agente adiciona task em `tasks.md` antes de implementar
4. Implementa
5. Marca task como concluída
6. Aplica gatilhos de manutenção de documentação conforme `project-orientation.mdc`
