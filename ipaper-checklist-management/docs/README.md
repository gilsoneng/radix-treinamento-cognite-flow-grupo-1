# docs/ — Documentação do projeto

> Índice geral da pasta `docs/`. Cada subpasta ou arquivo abaixo tem seu próprio README com detalhes.

---

## Conteúdo atual

```
docs/
  README.md                    ← você está aqui
  Design.md                    ← IP + Aura (guia deste app Flows)
  prototype/                   ← protótipo Lovable (referência UX)
    README.md
    LOVABLE-PROTOTYPE.md
  requirements/                ← requisitos de negócio + divisão Issues
    README.md
    APPLICATION-REQUIREMENTS.md
    TASKS-DIVISION.md
  design/                      ← contrato IP Design System
    README.md
    IP-DESIGN-SYSTEM.md
  SDD-workflow-definition/     ← processo de Spec Driven Development
    README.md
    proposta-spec-driven-development.md
    conclusoes-revisao-sdd-guilherme.md
    avaliacao_sdd.md
    resposta-revisao-sdd.md
    sdd-governance.md
```

---

## prototype/ — Protótipo Lovable

Referência UX do use case **International Paper — InField Challenge** (gerado no Lovable, código em `prototype/fieldops-insights/`).

| Documento | Para quem | O que é |
| --- | --- | --- |
| [`prototype/README.md`](prototype/README.md) | Índice | Acesso rápido e regra para agentes |
| [`prototype/LOVABLE-PROTOTYPE.md`](prototype/LOVABLE-PROTOTYPE.md) | Agentes, devs, design | Rotas, telas, mock data, mapeamento requisito → tela, como rodar local |

**Regra:** consultar antes de implementar UI de negócio; traduzir layout para Aura (`Design.md`), não copiar shadcn do protótipo.

---

## requirements/ — Requisitos e Issues

| Documento | Para quem | O que é |
| --- | --- | --- |
| [`requirements/README.md`](requirements/README.md) | Índice | Estrutura e links |
| [`requirements/APPLICATION-REQUIREMENTS.md`](requirements/APPLICATION-REQUIREMENTS.md) | PO, devs, agentes | AR-101…AR-310 consolidados do briefing IP |
| [`requirements/TASKS-DIVISION.md`](requirements/TASKS-DIVISION.md) | Gestão / GitHub | Épicos 002–004, sub-issues, ordem de implementação |

Specs SDD detalhadas: [`../specs/README.md`](../specs/README.md).

---

## design/ — Design International Paper

Documentação visual e contrato de interface IP integrada à documentação do repositório.

| Documento | Para quem | O que é |
| --- | --- | --- |
| [`Design.md`](Design.md) | Desenvolvedores Flows / agentes | Mapeamento **IP → Aura**: tokens em `src/lib/styles.css`, regras de componentes, checklist de PR |
| [`design/README.md`](design/README.md) | Índice design | Estrutura, sincronização com `references/app/`, assets de marca |
| [`design/IP-DESIGN-SYSTEM.md`](design/IP-DESIGN-SYSTEM.md) | Plataforma Angular IP + referência visual | Contrato completo v1.0 (tokens, Material M3, catálogo, shell, gráficos, a11y) |

### O que foi feito (design)

- Criada pasta **`docs/design/`** com cópia indexada de [`references/app/IP-DESIGN-SYSTEM.md`](../references/app/IP-DESIGN-SYSTEM.md) (atualização que você fez em `references/app/`).
- Criado **`docs/Design.md`** — guia de implementação deste app (Aura + tokens IP), referenciado em `AGENTS.md` e `CLAUDE.md`.
- Definida sincronização: edição canônica em **`references/app/`** → copiar para **`docs/design/`** para manter o índice `docs/` atualizado.
- Assets de marca permanecem em **`references/brand/`** e **`references/utils/`**.

---

## SDD-workflow-definition/

Documentação completa do processo **Spec Driven Development** adotado pelo time.

| Documento | Para quem | O que é |
| --- | --- | --- |
| [`sdd-governance.md`](SDD-workflow-definition/sdd-governance.md) | Qualquer membro do time | Resumo de 1 página: decisões, rigor, comandos |
| [`avaliacao_sdd.md`](SDD-workflow-definition/avaliacao_sdd.md) | Agentes de código e engenheiros | Playbook operacional completo (Fases 0–4) |
| [`proposta-spec-driven-development.md`](SDD-workflow-definition/proposta-spec-driven-development.md) | Contexto histórico | Proposta original + decisões adotadas |
| [`conclusoes-revisao-sdd-guilherme.md`](SDD-workflow-definition/conclusoes-revisao-sdd-guilherme.md) | Contexto histórico | Revisão técnica do Guilherme |
| [`resposta-revisao-sdd.md`](SDD-workflow-definition/resposta-revisao-sdd.md) | Contexto histórico | Conciliação autor × revisores |

Ver índice completo: [`SDD-workflow-definition/README.md`](SDD-workflow-definition/README.md)

---

## Outras pastas (a criar conforme o projeto evolui)

| Pasta | Conteúdo sugerido |
| --- | --- |
| `architecture/` | Diagramas, ADRs globais, decisões de sistema |
| `api/` | Contratos de API, schemas CDF, integrações externas |
| `runbooks/` | Procedimentos de deploy, incidentes, rollback |

> `prototype/` e `requirements/` já existem — ver seções acima.
