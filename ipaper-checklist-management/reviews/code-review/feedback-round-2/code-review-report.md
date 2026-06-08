# ipaper-checklist-management — Flows code review (round 2)

This document is the platform review for ipaper-checklist-management, conducted as part of the Cognite Flows app certification process.

## What this review covers

- **Protect the user and the customer** — no known bugs, correct SDK usage, healthy dependencies, adequate test coverage, and a clean codebase.
- **Protect Cognite services** — efficient DMS query patterns, server-side filtering, bounded pagination, and graceful rate-limit handling.
- **Protect the brand** — UI consistency with the Aura design system.

Scores are 1–5. A score of 1–2 on any criterion blocks approval. Score 3 is acceptable with tracked follow-up. Scores 4–5 are good.

## Path to approval

This review found **1 must-fix item(s)** that block approval. Address line-coverage regression and re-run `flows-code-review`. Do not proceed to `flows-external-app-submit` until `Must Fix open: 0`.

---

## Review details

### Summary

Specs 004/005 landed well: consolidated **Analytics** page, **Checklists** list, **Alerts** page, overview alert panel, and CDF-backed repositories with context DI. Build and 69 unit tests pass. Round 1’s SDK `unknown` bridge was replaced with `toCdfReadClient`, but **overall line coverage fell to 66.38%** after large untested UI modules were added — this blocks certification until tests are added for new pages/mappers or coverage scope is justified at ≥80%.

### Reviewed commit

`87e520d9a10890eb1975ddedfc26621b4b190746`

### Test coverage

- **Framework:** Vitest + `@vitest/coverage-v8`
- **Tests run:** 69 passed, 0 failed
- **Coverage:** Statements: 66.38% | Branches: 81.22% | Functions: 67.39% | **Lines: 66.38%**
- **Notable gaps:** `analytics.page.tsx`, `alerts.page.tsx`, `checklists.page.tsx`, `checklist-item.mapper.ts`, `observation.mapper.ts`, `cdf-client.ts` adapter paths

### Package & security summary

- **Total packages:** 441 prod, 427 dev (npm audit metadata)
- **Health:** Direct Cognite deps 1 major behind; dev vitest chain has critical advisories
- **Vulnerabilities:** 3 critical, 4 moderate (vitest/vite/esbuild — dev only)
- Full details: see `review-packages.md`

### Scores

| Area | Criterion | Score | Notes |
| ---- | --------- | ----- | ----- |
| User & customer | 1.1 Known bugs | 4 | No failing tests; filter/search client-side only |
| User & customer | 1.2 CDF via SDK | 5 | `toCdfReadClient` wraps `instances.list` |
| User & customer | 1.3 Packages | 3 | Vitest critical CVEs in dev; @cognite/* 1 major behind |
| User & customer | 1.4 Tests & coverage | **2** | **66.38% lines — below 80% gate** |
| User & customer | 1.5 Dead code | 3 | `module-placeholder.view.tsx` unused |
| User & customer | 1.6 Patterns & testability | 5 | `UseChecklistDataQueriesContext` + stub repos in tests |
| Cognite services | 2.1 DMS query patterns | 4 | `instances.list` per view |
| Cognite services | 2.2 Server-side filter | 3 | Checklist search/status filtered in browser |
| Cognite services | 2.3 Limits & pages | 5 | `cdf-list-nodes` caps + cursor |
| Cognite services | 2.4 Call rate | 5 | react-query staleTime; alerts refetch 120s |
| Cognite services | 2.5 429 backoff | 5 | `retry-policy.ts` |
| Brand | 3.1 Aura | 4 | Aura Card/Badge/Input; IP sidebar tokens |

### Must fix before deploy

- [ ] Raise overall **line coverage to ≥ 80%** — add tests for `checklists.page.tsx`, `analytics.page.tsx`, `alerts.page.tsx`, `overview-alerts-panel.tsx`, and mapper/repository branches — `src/modules/checklists/**` — **1.4**
  _Impact:_ Certification requires measurable test safety net; shipping 66% coverage means new CDF/alert regressions can reach production undetected.

### Should fix before deploy

- [ ] Remove unused `ModulePlaceholderView` — `src/app/routing/module-placeholder.view.tsx` — **1.5**
  _Impact:_ Dead files confuse reviewers and suggest incomplete migration from placeholder routes.
- [ ] Add server-side filter for checklist list when volume exceeds pagination — `checklists.page.tsx` / repository — **2.2**
  _Impact:_ Large tenants may see incomplete lists and misleading KPIs.
- [ ] Upgrade vitest stack to ≥4.1.0 (dev) — `package.json` — **1.3**
  _Impact:_ Known critical advisory on Vitest UI server affects developers running `test:ui`.
- [ ] Narrow `useCogniteSdk() as CogniteClient` to typed SDK interface — `cdf-client.ts:67` — **1.6**
  _Impact:_ Residual cast can hide SDK breaking changes.

### Nice to fix before deploy

- [ ] Add unit tests for `status-badge.tsx` and `task-result.rules` period filters
- [ ] Delete deprecated spec folders after team sign-off (`specs/002-checklist-kpis`, etc.)
- [ ] Plan `@cognite/app-sdk` / `@cognite/aura` minor upgrades before submit

## Summary

- Must Fix open: 1
- Should Fix open: 4
- Nice Fix open: 3
