# design/ — Design International Paper

> Contrato visual IP e referência de componentes para o ecossistema industrial. Este app Flows implementa a marca via **Aura** (ver [`../Design.md`](../Design.md)).

---

## Conteúdo

| Arquivo | Descrição |
| --- | --- |
| [`IP-DESIGN-SYSTEM.md`](IP-DESIGN-SYSTEM.md) | **Contrato completo** IP (v1.0): princípios, tokens, catálogo Angular/Material, layout shell, gráficos, acessibilidade, checklist |
| [`../Design.md`](../Design.md) | **Guia deste app** — mapeamento IP → Aura + tokens em `src/lib/styles.css` |

---

## Origem e sincronização

| Local | Papel |
| --- | --- |
| [`references/app/IP-DESIGN-SYSTEM.md`](../../references/app/IP-DESIGN-SYSTEM.md) | Cópia de trabalho junto aos assets de referência (`references/brand/`, `references/utils/`) |
| `docs/design/IP-DESIGN-SYSTEM.md` | Cópia indexada na documentação do projeto (manter alinhada após edições em `references/app/`) |

Ao atualizar o design system, edite **`references/app/IP-DESIGN-SYSTEM.md`** e copie para `docs/design/` (ou peça ao agente para sincronizar).

---

## Escopo por stack

| Stack | Documento principal |
| --- | --- |
| Apps **Angular** IP (widgets, Material M3) | `IP-DESIGN-SYSTEM.md` — regras obrigatórias |
| Este app **Flows + React + Aura** | `Design.md` + `AGENTS.md` §1 — Aura primeiro; tokens IP em CSS |

---

## O que o IP-DESIGN-SYSTEM cobre (sumário)

1. Princípios de design industrial  
2. Stack Angular / Material / uPlot / Storybook  
3. Tokens CSS e TypeScript  
4. Tema M3, mixins SCSS, estrutura de pastas  
5. Catálogo de componentes e shell  
6. Notificações, gráficos, arquitetura Angular  
7. Acessibilidade, responsividade, checklist de conformidade  

Implementação Flows: use o catálogo como **referência visual e de tokens**, não copie widgets Angular para o repo.

---

## Assets de marca

| Pasta | Conteúdo |
| --- | --- |
| [`references/brand/`](../../references/brand/) | Logos International Paper / Radix (workshop) |
| [`references/utils/`](../../references/utils/) | Spinner, logos PNG/SVG |

---

## Histórico

| Data | Alteração |
| --- | --- |
| 2026-06-02 | Estrutura `docs/design/` criada; `IP-DESIGN-SYSTEM.md` copiado de `references/app/`; índice e `docs/Design.md` para Aura |
