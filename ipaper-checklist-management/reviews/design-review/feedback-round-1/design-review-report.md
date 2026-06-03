# Design Review — ipaper-checklist-management — round 1

## User and tasks

- **Primary user:** Shift supervisor / maintenance technician at International Paper (Riegelwood Mill).
- **Tasks evaluated:**
  1. Open Overview and read checklist KPI status (To Do, Ongoing, Done, Overdue, Not OK).
  2. Navigate between modules via sidebar without losing context.
  3. Validate CDF connectivity via Settings → CDF connection (Core assets sample).
- **Context:** Desktop Fusion embed; representative ApmAppData seed in `cdf_apm`.

## Task walkthrough findings

- **Task 1 — Overview KPIs:** Five cards render from CDF data with loading/error/empty states; percentages shown. Supervisor can scan status in one screen.
- **Task 2 — Navigation:** Sidebar shows active page (`aria-current`); host-sync preserves page on reload (spec 001).
- **Task 3 — CDF health:** Settings exposes Core asset list; confirms auth and DMS read path.

## Scores

| Question | Score | Rationale | Improvement note |
| --- | --- | --- | --- |
| Q1 Aura consistency | 4 | Aura Card/Button/Alert; IP tokens in CSS | Keep visual overrides in CSS not Button className |
| Q2 Navigation & hierarchy | 5 | Persistent sidebar + page title header | Add breadcrumbs when checklist detail ships |
| Q3 Labels & language | 5 | KPI labels match IP prototype | — |
| Q4 Feedback & validation | 4 | Loading/error on overview and health | Add error branch tests on overview |
| Q5 Clickability | 4 | KPI cards are native buttons with focus ring | — |
| Q6 Error prevention | 5 | Read-only app; no destructive actions | — |
| Q7 Responsive | 4 | Sidebar `md+`; grid responsive for KPIs | Mobile nav deferred per spec 001 |
| Q8 Empty states | 4 | Overview + health empty states | Charts empty states in spec 004 |
| Q9 Performance | 4 | react-query cache; paginated CDF lists | Monitor bundle size (Flows build warning) |
| Q10 Accessibility | 4 | `aria-label` on KPI buttons; nav `aria-current` | Audit icon-only controls when charts land |

## Summary

- Average score: 4.3
- Quality level: Good — launch with minor fixes

## Must Fix (any score < 3)

_(none)_

## Should Fix (any score 3 – 3.7)

_(none)_

## Nice to Fix (any score 3.8 – 4.4)

- Add overview error-state test coverage for consistent feedback patterns.
- Plan mobile navigation pattern before field rollout.
