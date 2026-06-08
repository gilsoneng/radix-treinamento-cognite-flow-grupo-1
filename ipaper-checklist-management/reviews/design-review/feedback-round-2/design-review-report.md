# Design Review — ipaper-checklist-management — round 2

> **Gate note:** Latest code review (round 2) has `Must Fix open: 1` (coverage). Design scores below reflect UX quality; `flows-external-app-submit` still requires code review `Must Fix open: 0` first.

## User and tasks

- **Primary user:** Shift supervisor / maintenance technician at International Paper (Riegelwood Mill).
- **Tasks evaluated:**
  1. Scan **Overview** KPIs and top critical alerts.
  2. Find and filter **Checklists** by title/status.
  3. Review **Analytics** (task results + trends by period).
  4. Triage **Alerts** and use sidebar badge count.
  5. Confirm CDF connectivity via **Settings** (Core assets).
- **Context:** Desktop Fusion embed; read-only intelligence app; seed data in `cdf_apm`.

## Pre-scan evidence (automated)

| Probe | Result |
| --- | --- |
| `@cognite/aura` in src | 14 files import Aura components |
| Hard-coded hex in src | Mostly `styles.css` IP tokens; 1 fallback in `kpi-card.tsx` |
| `<div onClick>` | 0 |
| EmptyState usage | All data pages (overview, checklists, analytics, alerts, health) |
| Loading/error patterns | `LoadingState` / `ErrorState` on every fetch page |
| `aria-current` / `aria-label` | Sidebar nav + checklist search label |
| Responsive utilities | `md:` grid/sidebar on overview, analytics, shell |
| Code review round 2 | Coverage must-fix; no UX blockers |

## Task walkthrough findings

- **Task 1 — Overview:** Five KPI cards + optional alerts panel; loading/error paths present. Supervisor can assess status quickly.
- **Task 2 — Checklists:** Search + status filter work on seeded data; empty state guides ingest. No drill-down drawer yet (acceptable for v1).
- **Task 3 — Analytics:** Tabs separate results vs trends; period selector applies to both. Tables cap at 100 rows — acceptable for demo scale.
- **Task 4 — Alerts:** Full list with priority/kind badges; sidebar shows count when alerts exist.
- **Task 5 — Settings/Health:** Core assets list still validates CDF read path.

## Scores

| Question | Score | Rationale | Improvement note |
| --- | --- | --- | --- |
| Q1 Aura consistency | 4 | Aura on all feature pages; IP brand via CSS variables | Avoid new raw hex in TSX |
| Q2 Navigation & hierarchy | 5 | 5-item sidebar; `aria-current`; page titles via shell | Breadcrumbs when checklist detail ships |
| Q3 Labels & language | 5 | Action labels (“View all”, period options) are plain English | — |
| Q4 Feedback & validation | 4 | Loading/error/retry on all CDF pages | Add tests mirroring error UI |
| Q5 Clickability | 4 | Nav and KPI use `<button>`; analytics tabs are buttons | Ensure tab focus ring visible |
| Q6 Error prevention | 5 | Read-only; no destructive writes | — |
| Q7 Responsive | 4 | Sidebar `md+`; responsive KPI/analytics grids | Mobile nav still deferred |
| Q8 Empty states | 5 | Dedicated copy on checklists, analytics, alerts | — |
| Q9 Performance | 4 | react-query cache; bounded CDF reads; large bundle warning | Consider route lazy-load later |
| Q10 Accessibility | 4 | `aria-label` on search; `aria-current` on nav; `role="tablist"` on analytics | Add `aria-label` on period `<select>` |

## Summary

- Average score: 4.4
- Quality level: Good — launch with minor fixes

## Must Fix (any score < 3)

_(none — UX)_

## Should Fix (any score 3 – 3.7)

_(none)_

## Nice to Fix (any score 3.8 – 4.4)

- Add `aria-label` on analytics period selector.
- Mobile navigation pattern before field rollout.
- Chart components (Recharts) only after Aura/design ADR — trends tab is count cards today.
