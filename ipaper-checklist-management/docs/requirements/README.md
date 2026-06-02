# requirements/ — Requisitos de aplicação

> Requisitos de negócio do use case **International Paper — InField Challenge**, derivados do briefing do cliente e do protótipo Lovable.

---

## Documentos

| Documento | Uso | Público |
| --- | --- | --- |
| [`APPLICATION-REQUIREMENTS.md`](APPLICATION-REQUIREMENTS.md) | Requisitos funcionais e não funcionais consolidados | PO, devs, agentes |
| [`TASKS-DIVISION.md`](TASKS-DIVISION.md) | Épicos, issues GitHub e ordem de implementação | Gestão de projeto, devs |

---

## Relacionamentos

```
APPLICATION-REQUIREMENTS.md  (macro)
        │
        ├── specs/002-checklist-kpis/
        ├── specs/003-task-result-trends/
        └── specs/004-alerts-notifications/
                │
                └── TASKS-DIVISION.md  → GitHub Issues
```

| Documento | Relação |
| --- | --- |
| [`../prototype/LOVABLE-PROTOTYPE.md`](../prototype/LOVABLE-PROTOTYPE.md) | Referência UX por rota |
| [`../../SPEC.md`](../../SPEC.md) | Spec macro viva do produto |
| [`../../specs/README.md`](../../specs/README.md) | Índice SDD por feature |
| [`../Design.md`](../Design.md) | Implementação visual Flows + IP |

---

## Regra para agentes

1. Ler `APPLICATION-REQUIREMENTS.md` para contexto de negócio.
2. Implementar a partir de `specs/<NNN>-<slug>/spec.md` (FRs testáveis).
3. Consultar `docs/prototype/LOVABLE-PROTOTYPE.md` para layout e fluxos.
4. Seguir `AGENTS.md` e SDD (`docs/SDD-workflow-definition/avaliacao_sdd.md`).
