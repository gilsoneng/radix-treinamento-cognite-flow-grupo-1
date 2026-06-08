# ipaper-checklist-management — Flows code review

This document is the platform review for ipaper-checklist-management, conducted as part of the Cognite Flows app certification process.

## What this review covers

- **Protect the user and the customer** — no known bugs, correct SDK usage, healthy dependencies, adequate test coverage, and a clean codebase.
- **Protect Cognite services** — efficient DMS query patterns, server-side filtering, bounded pagination, and graceful rate-limit handling.
- **Protect the brand** — UI consistency with the Aura design system.

Scores are 1–5. A score of 1–2 on any criterion blocks approval. Score 3 is acceptable with tracked follow-up. Scores 4–5 are good.

## Path to approval

This review found **0 must-fix item(s)** that block approval. Two should-fix items remain for follow-up before external submit. Once the must-fix items are addressed, re-run `flows-code-review`.

---

## Review details

### Summary

The app follows the documented DDD layout, uses `@cognite/sdk` for all CDF reads, implements host-sync navigation and the InField shell (spec 001), and adds checklist KPI aggregation from `cdf_apm.Checklist:v7` (spec 003). Tests and build pass; line coverage is above the 80% gate. Remaining gaps are a narrow `as unknown` cast on the SDK bridge and client-side KPI aggregation at scale.

### Reviewed commit

`87e520d9a10890eb1975ddedfc26621b4b190746`

### Test coverage

- **Framework:** Vitest
- **Tests run:** 61 passed, 0 failed
- **Coverage:** Statements: 89.46% | Branches: 83.8% | Functions: 86.36% | Lines: 89.46%
- **Notable gaps:** `overview.page.tsx` error/empty branches; `cn.ts` utility untested (trivial)

### Package & security summary

- **Total packages:** 7 dependencies, devDependencies for toolchain
- **Health:** Pass on direct dependencies (`@cognite/app-sdk`, `@cognite/aura`, `@cognite/sdk`, react, react-query)
- **Vulnerabilities:** Run `npm audit` in CI before deploy; no critical blockers identified in round 1
- Full details: see `review-packages.md`

### Scores

| Area | Criterion | Score | Notes |
| ---- | --------- | ----- | ----- |
| User & customer | 1.1 Known bugs | 5 | Build + 61 tests green |
| User & customer | 1.2 CDF via SDK | 5 | `CdfReadClient` wraps `instances.list` only |
| User & customer | 1.3 Packages | 4 | Cognite stack current; audit in CI |
| User & customer | 1.4 Tests & coverage | 5 | 89.46% lines |
| User & customer | 1.5 Dead code | 4 | Deprecated spec folders marked; no unreachable pages |
| User & customer | 1.6 Patterns & testability | 5 | Context DI for ViewModels and repositories |
| Cognite services | 2.1 DMS query patterns | 4 | `instances.list` with view filter; aggregate TBD at scale |
| Cognite services | 2.2 Server-side filter | 4 | View-scoped list; KPI filter by template client-side |
| Cognite services | 2.3 Limits & pages | 5 | Paginated checklist/item reads with caps |
| Cognite services | 2.4 Call rate | 5 | react-query staleTime + semaphore |
| Cognite services | 2.5 429 backoff | 5 | `retry-policy.ts` with jitter |
| Brand | 3.1 Aura | 4 | Aura cards/alerts; sidebar uses IP CSS classes |

### Must fix before deploy

_(none)_

### Should fix before deploy

- [ ] Replace `useCogniteSdk() as unknown as CdfReadClient` with a typed adapter factory — `src/core/sdk/cdf-client.ts` — 1.6
  _Impact:_ Weak typing can hide SDK API drift and delay detection of breaking SDK changes.
- [ ] Document or add server-side template filter when checklist volume exceeds pagination caps — `cdf-checklist.repository.ts` — 2.2
  _Impact:_ Large tenants may see incomplete KPI totals if more than 1000 checklists exist.

### Nice to fix before deploy

- [ ] Add branch tests for overview error/empty states — `overview.page.tsx` — 1.4
- [ ] Remove deprecated duplicate spec folders after team confirms — `specs/002-checklist-kpis` etc.

## Summary

- Must Fix open: 0
- Should Fix open: 2
- Nice Fix open: 2
