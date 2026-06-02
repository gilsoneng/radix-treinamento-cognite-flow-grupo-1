# Feature Specification: Ipaper Checklist Management

> **International Paper — InField Challenge**  
> Custom enhancements for checklist operations on Cognite InField / Fusion Flows.  
> **Application Requirements:** [`docs/requirements/APPLICATION-REQUIREMENTS.md`](docs/requirements/APPLICATION-REQUIREMENTS.md)  
> **Tasks / Issues:** [`docs/requirements/TASKS-DIVISION.md`](docs/requirements/TASKS-DIVISION.md)  
> **UX Prototype (Lovable):** [`docs/prototype/LOVABLE-PROTOTYPE.md`](docs/prototype/LOVABLE-PROTOTYPE.md)

---

## User Scenarios & Testing

### User Stories

1. As a **shift supervisor**, I want KPI cards for checklist status (To Do, Ongoing, Done, Overdue, Not OK), so that I can spot delays and failures at a glance.
2. As a **maintenance technician**, I want to search and open checklist details with task results, so that I can act on Not OK findings.
3. As a **process engineer**, I want OK vs Not OK dashboards and time-series trends, so that I can track quality over time.
4. As an **administrator**, I want configurable alert rules for Not OK and completed checklists, so that the right teams are notified automatically.

### Acceptance Scenarios

- Given checklists in mixed statuses, when the user opens Overview, then five KPI cards show counts and percentages.
- Given a Not OK task on a checklist, when aggregating status, then the checklist is classified as Not OK.
- Given a date range selected on Time-Series KPIs, when charts render, then only data within the range is shown.
- Given an active alert rule for checklist Not OK, when a Not OK result is recorded in scope, then a notification is dispatched.

---

## Requirements

### Functional Requirements (product-level)

| ID | Requirement | Feature spec |
| --- | --- | --- |
| FR-P00 | Fusion shell, auth, host-sync navigation | `specs/001-checklist-management` |
| FR-P01 | KPIs for checklist statuses To Do, Ongoing, Done, Overdue, Not OK | `specs/002-checklist-kpis` |
| FR-P02 | Overview with search, filters, checklist detail and task results | `specs/002-checklist-kpis` |
| FR-P03 | OK vs Not OK dashboards and dimensional breakdowns | `specs/003-task-result-trends` |
| FR-P04 | Time-series KPIs with selectable periods | `specs/003-task-result-trends` |
| FR-P05 | Automated, configurable alerts (Not OK, completed, overdue) | `specs/004-alerts-notifications` |

Detailed testable FRs live in each feature `spec.md` (002–004).

---

## Success Criteria

- SC-001: Supervisor identifies Overdue and Not OK counts in under 30 seconds on Overview.
- SC-002: User finds a specific checklist via search in under 3 interactions.
- SC-003: OK/Not OK charts match CDF data for the selected period.
- SC-004: Not OK alert rule fires within 5 minutes of result registration (integrated environment).
- SC-005: All feature specs 002–004 reach `done` with FR→test matrix complete.

---

## Clarifications

- [ ] Exact InField / CDF views for checklist and task data — per-feature `research.md`
- [x] Lovable prototype at `prototype/fieldops-insights/` is UX reference only — implement with Aura in Flows. — 2026-06-02

---

## Assumptions

- [Migration from Webalo is out of scope; app enhances InField post-migration]
- [InField mobile remains execution channel; this app is analytics/alerts hub]
- [Scaffold welcome removido quando 001 FR-013 done; shell InField substitui]

---

## Data Models & CDF Integration

### Existing views

- To be mapped: InField checklist instance view
- To be mapped: InField task result view

### New views

- AlertRule (+ optional AlertEvent log) — see `specs/004-alerts-notifications`

### Spaces

- IP operational space — confirm with Cognite team

---

## Feature index (SDD)

| ID | Feature | Status |
| --- | --- | --- |
| 001 | checklist-management (app foundation & shell) | in-progress |
| 002 | checklist-kpis | not-started |
| 003 | task-result-trends | not-started |
| 004 | alerts-notifications | not-started |

See [`specs/README.md`](specs/README.md).
