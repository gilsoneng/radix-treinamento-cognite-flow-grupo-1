# fieldops-insights — Protótipo Lovable

Protótipo UX do app **InField Checklist Intelligence** (International Paper). Gerado no [Lovable](https://lovable.dev); versionado neste repositório como referência para implementação Flows.

**Documentação completa:** [`docs/prototype/LOVABLE-PROTOTYPE.md`](../../docs/prototype/LOVABLE-PROTOTYPE.md)

---

## Quick start

```bash
npm install
npm run dev
```

Abra a URL exibida no terminal (ex.: `http://localhost:5173`).

---

## Rotas principais

| Rota | Tela |
| --- | --- |
| `/` | Operations Overview (KPIs + gráficos) |
| `/checklists` | Lista com busca e filtros |
| `/checklists/:id` | Detalhe e task results |
| `/task-results` | Analytics OK vs Not OK |
| `/kpis` | Time-series KPIs |
| `/alerts` | Regras de alerta |
| `/settings` | Preferências (placeholder) |

---

## Nota

Este diretório **não** faz parte do build do app Flows (`src/` na raiz do monorepo app). Não importar componentes deste protótipo diretamente em produção — use como referência visual e de fluxo.
