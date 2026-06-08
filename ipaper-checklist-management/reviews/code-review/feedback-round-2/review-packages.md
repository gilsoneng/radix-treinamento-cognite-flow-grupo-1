## Package audit: ipaper-checklist-management

### Dependencies (direct)

| Package | Used version | Latest | Deprecated | CVEs | Health |
| ------- | ------------ | ------ | ---------- | ---- | ------ |
| @cognite/app-sdk | 0.5.1 | 0.6.0 | No | 0 | Warn (1 major) |
| @cognite/aura | 0.1.7 | 0.2.0 | No | 0 | Warn (1 major) |
| @cognite/sdk | (transitive) | — | No | 0 | Pass |
| react | 18.3.1 | 19.2.7 | No | 0 | Pass (pinned 18) |
| react-dom | 18.3.1 | 19.2.7 | No | 0 | Pass |
| @tanstack/react-query | current | — | No | 0 | Pass |

### Dev toolchain (not shipped)

| Package | Used version | Latest | CVEs | Health |
| ------- | ------------ | ------ | ---- | ------ |
| vitest | 2.1.9 | 4.1.8 | Critical (GHSA-5xrq) | Fail |
| @vitest/coverage-v8 | 2.1.9 | 4.1.8 | via vitest | Fail |
| @vitest/ui | 2.1.9 | 4.1.8 | via vitest | Fail |
| vite (vitest nested) | ≤6.4.1 | — | Moderate | Warn |
| esbuild (vitest nested) | ≤0.24.2 | — | Moderate | Warn |

### Security audit

| Severity | Count |
| -------- | ----- |
| Critical | 3 |
| High | 0 |
| Moderate | 4 |
| Low | 0 |

#### Vulnerabilities (notable)

| Package | Severity | Title | Patched in | Advisory |
| ------- | -------- | ----- | ---------- | -------- |
| vitest | Critical | Vitest UI arbitrary file read/execute | >=4.1.0 | GHSA-5xrq-8626-4rwp |
| @vitest/coverage-v8 | Critical | via vitest | >=4.1.0 | — |
| esbuild | Moderate | dev server request leak | >0.24.2 | GHSA-67mh-4wv8-2f99 |

**Note:** Critical findings are confined to **devDependencies** (test UI). Production bundle does not ship vitest. Plan major vitest upgrade in CI/dev environments before external submit.
