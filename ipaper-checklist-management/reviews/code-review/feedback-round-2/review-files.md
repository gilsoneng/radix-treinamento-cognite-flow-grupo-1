## File inventory: ipaper-checklist-management (round 2)

Post specs 004/005: Analytics, Alerts, Checklists pages wired; `module-placeholder.view.tsx` unused.

| File / area | Structure | Quality | Patterns | Tests | Notes |
| ---- | --------- | ------- | -------- | ----- | ----- |
| src/App.tsx | 5 | 5 | 5 | ✓ | Shell + navigation |
| src/app/host/* | 5 | 5 | 5 | ✓ | Legacy page migration |
| src/app/routing/app-view.tsx | 5 | 5 | 5 | ⚠ | Switch covers 5 pages; branches untested |
| src/app/routing/module-placeholder.view.tsx | 3 | 4 | N/A | ✗ | **Dead code** — no imports (1.5) |
| src/design-system/layout/app-shell/* | 5 | 5 | 5 | ✓ | 5-nav + alert badge |
| src/modules/checklists/domain/* | 5 | 5 | 5 | ✓ | alert + task-result rules |
| src/modules/checklists/infrastructure/cdf-* | 5 | 4 | 5 | ⚠ | Repo partial coverage |
| src/modules/checklists/infrastructure/mappers/* | 4 | 4 | 4 | ⚠ | item/observation mappers low % |
| src/modules/checklists/infrastructure/queries/* | 5 | 5 | 5 | ⚠ | Query hooks lightly covered |
| src/modules/checklists/presentation/pages/overview/* | 5 | 5 | 5 | ✓ | KPI + alerts panel |
| src/modules/checklists/presentation/pages/checklists/* | 4 | 4 | 4 | ✗ | **No page tests** (1.4) |
| src/modules/checklists/presentation/pages/analytics/* | 4 | 4 | 4 | ✗ | **No page tests** (1.4) |
| src/modules/checklists/presentation/pages/alerts/* | 4 | 4 | 4 | ✗ | **No page tests** (1.4) |
| src/modules/checklists/presentation/components/overview-alerts-panel/* | 4 | 4 | 4 | ✗ | No dedicated test |
| src/modules/checklists/presentation/components/status-badge/* | 4 | 4 | N/A | ✗ | Presentational |
| src/modules/health/** | 5 | 5 | 5 | ✓ | Unchanged |
| src/core/sdk/cdf-client.ts | 4 | 4 | 4 | ✗ | Adapter added; `as CogniteClient` remains |
| src/core/query/retry-policy.ts | 5 | 5 | 5 | ✓ | 429 backoff |
| src/shared/utils/cn.ts | 3 | 3 | N/A | ✗ | Unused? trivial |
