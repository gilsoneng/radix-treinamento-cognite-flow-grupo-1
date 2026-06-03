# Design — ipaper-checklist-management (Flows + Aura)

> Guia de implementação visual **deste app**. O contrato corporativo completo está em [`design/IP-DESIGN-SYSTEM.md`](design/IP-DESIGN-SYSTEM.md).

**Regra (AGENTS.md §1):** use `@cognite/aura/components` antes de HTML/CSS custom. Não recrie widgets do catálogo Angular IP neste repo.

---

## 1. Tokens de marca IP (CSS)

Valores canônicos do IP Design System (§3.1) aplicados neste app em `src/styles.css`:

| Token IP (design system) | Variável neste app | Hex / uso |
| --- | --- | --- |
| `--color-primary` | `--ip-teal` | `#006963` — primária, links |
| `--color-primary-dark` | `--ip-teal-dark` | `#005550` — hover primário |
| Sidebar shell | `--ip-teal-sidebar` | `#004d48` |
| `--color-positive` / chart | `--ip-clover` | `#00ab5f` — secundário, sucesso |
| `--color-yellow-primary` | `--ip-yellow` | `#fcbd44` — aviso |
| `--color-blue-primary` | `--ip-sky` | `#61c4db` — info / accent |
| `--color-dark-gray` | `--ip-charcoal` | `#15191e` — texto principal |
| `--color-surface-alt` | `--ip-muted-bg` | `#f1f3f5` — fundos suaves |
| `--color-border` | `--ip-border` | `#d6dde6` |
| `--color-error` | `--ip-error` | `#c62828` — crítico / Urgent / Not OK |
| Error banner bg | `--ip-error-muted-background` | `#ffeeee` |
| Error banner border | `--ip-error-border` | `#ffcccc` |
| Fusion host link | `--link-fusion` | `#486aed` — navegação Fusion |

**Não** hardcode hex em componentes; use variáveis `--ip-*` ou tokens semânticos Aura (`--primary-background`, etc.).

---

## 2. Componentes UI

| Necessidade | Onde implementar |
| --- | --- |
| Botões, cards, alerts, loaders, tabelas, formulários | `@cognite/aura/components` |
| Layout página, shell IP | `design-system/layout/page-shell`, `ip-hero-banner`, `app-footer` |
| Loading branded | `design-system/components/ip-spinner`, `layout/states/loading-state` |
| KPI, tabela densa, sidebar expansível (referência Angular) | **Aproximar com Aura** (Card, Badge, DataTable patterns) — ver catálogo IP para densidade e hierarquia |

Catálogo detalhado (API Angular): [`design/IP-DESIGN-SYSTEM.md` §9](design/IP-DESIGN-SYSTEM.md).

---

## 3. Tipografia

| IP Design System | Este app (Flows) |
| --- | --- |
| IBM Plex Sans (obrigatório em apps Angular IP) | Aura / sistema — alinhar pesos e tamanhos ao espírito industrial (legível em 12–14px) |

Se o produto exigir Plex neste app, adicionar via `@fontsource/ibm-plex-sans` e documentar em `spec.md` — hoje o tema usa stack padrão Aura com `--ip-*` para cor.

---

## 4. Princípios (resumo)

Do IP Design System §1 — válidos para qualquer tela deste app:

- **Densidade informacional** — evitar scroll excessivo em listas/checklists.
- **Hierarquia clara** — cor para criticidade, não decoração.
- **Consistência** — mesmos padrões Aura em todas as views.
- **Feedback** — loading, erro e vazio explícitos (`AGENTS.md`, skill `design`).
- **Acessibilidade** — foco visível, labels, `aria-*` em controles Aura.

---

## 5. Tema Aura (implementação)

Arquivo: [`src/styles.css`](../src/styles.css)

### 5.1 Semântica

Tokens `--background`, `--foreground`, `--primary-*`, `--success-*`, `--warning-*`, `--info-*` mapeiam a paleta IP. **Destructive** mantém padrão Aura (não substituir por vermelho IP custom sem revisão).

### 5.5 Sidebar / chrome IP

```css
--sidebar-background: var(--ip-teal-sidebar);
--sidebar-foreground: var(--ip-muted-bg);
--sidebar-accent: var(--ip-clover);
```

Usar quando integrar navegação lateral ou shell alinhado ao layout IP (§10 do design system).

---

## 6. Referências visuais

| Recurso | Caminho |
| --- | --- |
| **Protótipo Lovable (UX InField Challenge)** | [`prototype/LOVABLE-PROTOTYPE.md`](prototype/LOVABLE-PROTOTYPE.md) · código: [`../prototype/fieldops-insights/`](../prototype/fieldops-insights/) |
| Logos e workshop | [`references/brand/`](../references/brand/) |
| Spinner / assets | [`references/utils/`](../references/utils/) (ex.: `grun-ip-spinner.gif`, `poweredbyradix.svg`) |
| Hero / logos | [`references/hero.jpg`](../references/hero.jpg), [`references/ip-logo-white.svg`](../references/ip-logo-white.svg), [`references/radix_wedge.svg`](../references/radix_wedge.svg) |
| Design system completo | [`design/IP-DESIGN-SYSTEM.md`](design/IP-DESIGN-SYSTEM.md) |
| Cópia junto aos assets | [`references/app/IP-DESIGN-SYSTEM.md`](../references/app/IP-DESIGN-SYSTEM.md) |

Ao implementar KPI cards, tabelas densas e gráficos do use case IP, use o protótipo para **layout e hierarquia**; use Aura + tokens `--ip-*` para **implementação**.

---

## 7. Certificação Flows

Reviews de design usam Aura e quality guidelines Cognite (`flows-design-review`), não o checklist Angular §17. Use o IP Design System para **marca e tokens**; use Aura para **conformidade de produto Flows**.

---

## Checklist rápido (PR de UI)

- [ ] Cores via tokens (`styles.css` / Aura), sem hex solto em TSX
- [ ] Componentes Aura antes de custom
- [ ] Estados loading / erro / vazio
- [ ] Contraste e foco em controles interativos
- [ ] Alinhado a [`design/IP-DESIGN-SYSTEM.md` §17](design/IP-DESIGN-SYSTEM.md) onde aplicável a Flows
