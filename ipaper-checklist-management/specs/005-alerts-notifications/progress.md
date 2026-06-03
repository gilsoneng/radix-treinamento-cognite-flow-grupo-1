---
feature: 005-alerts-notifications
status: done
owner: time-grupo-1
updated: 2026-06-03
rigor: completo
---

# Progress — Alerts & Notifications

## Etapas

- 1 Specify — done
- 2 Clarify — done
- 3 Plan — done
- 4 Tasks — done
- 5 Implement — done (settings panel, runtime, IpDataTable alerts)
- 6 Validate — done (71 testes, build OK)
- 7 Done — done

## Matriz de rastreabilidade (FR → teste)

- FR-001 → `alert.rules.ts` — passing (`alert.rules.test.ts`)
- FR-002 → `alert.rules.ts` (not-ok, completed) — passing (`alert.rules.test.ts`)
- FR-003 → `cdf-checklist.repository.ts` + observations — passing
- FR-004 → `app-sidebar.tsx` — passing (`app-shell.test.tsx`)
- FR-005 → `use-checklist-data-queries.ts` + `notification-settings.storage.ts` — passing
- FR-006 → `notification-settings-panel.tsx` — manual (Settings)
- FR-007 → `notification-runtime.tsx` + `app-shell.tsx` — passing (build)
- FR-008 → `alerts.page.tsx` + `IpDataTable` — passing (build)

## Notas

- Settings em **Settings** view; banners globais via `NotificationRuntime` no `AppShell`.
- Formatos `badge` / `toast` configuráveis; runtime exibe banners para regras `banner` ativas.
- Overview mantém painel resumido; Alerts usa tabela completa.
