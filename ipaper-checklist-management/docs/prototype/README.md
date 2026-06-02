# prototype/ — Protótipo Lovable (referência UX)

> Protótipo interativo **InField Checklist Intelligence** gerado no [Lovable](https://lovable.dev), alinhado ao use case **International Paper — InField Challenge**.

---

## Documentação

| Documento | Para quem | Conteúdo |
| --- | --- | --- |
| [`LOVABLE-PROTOTYPE.md`](LOVABLE-PROTOTYPE.md) | Agentes, designers, devs | Rotas, telas, dados mock, mapeamento requisito → tela, como executar localmente |
| [`../../prototype/fieldops-insights/README.md`](../../prototype/fieldops-insights/README.md) | Quem roda o protótipo | Comandos `npm`/`bun`, estrutura do código |

---

## Acesso rápido

| Recurso | Caminho / URL |
| --- | --- |
| Código-fonte | [`prototype/fieldops-insights/`](../../prototype/fieldops-insights/) |
| Mock data (domínio) | [`prototype/fieldops-insights/src/lib/mock-data.ts`](../../prototype/fieldops-insights/src/lib/mock-data.ts) |
| Requisitos de negócio | [`../requirements/APPLICATION-REQUIREMENTS.md`](../requirements/APPLICATION-REQUIREMENTS.md) |
| Divisão de tarefas (Issues) | [`../requirements/TASKS-DIVISION.md`](../requirements/TASKS-DIVISION.md) |
| Specs SDD por feature | [`../../specs/README.md`](../../specs/README.md) |

---

## Regra para agentes

Antes de implementar UI de negócio em `src/`, consultar:

1. [`LOVABLE-PROTOTYPE.md`](LOVABLE-PROTOTYPE.md) — comportamento e layout esperados
2. [`../Design.md`](../Design.md) — tradução para Aura + tokens IP no app Flows
3. `specs/<NNN>-<slug>/spec.md` — FRs testáveis da feature

O protótipo **não** é código de produção: stack Lovable (TanStack Start + shadcn), dados mock. O app Flows usa `@cognite/aura` e integração CDF/InField.
