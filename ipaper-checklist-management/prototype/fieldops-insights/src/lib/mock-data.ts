export type ChecklistStatus = "todo" | "ongoing" | "done" | "overdue" | "notok";
export type ResultStatus = "ok" | "notok" | "pending";

export const AREAS = [
  "Paper Machine 5",
  "Recausticizing",
  "Recovery Boiler",
  "Utilities",
  "Pulp Preparation",
  "Finishing Line",
] as const;

export const ASSETS = [
  "Pump P-204",
  "Conveyor CV-12",
  "Dryer Section",
  "Recovery Boiler RB-01",
  "Tank TK-88",
  "Valve XV-302",
] as const;

export const TEAMS = [
  "Operations A",
  "Operations B",
  "Maintenance",
  "Process Eng.",
  "Safety",
  "Utilities Team",
] as const;

export const CHECKLIST_TEMPLATES = [
  "Daily Safety Inspection",
  "Pump Vibration Check",
  "Boiler Area Walkdown",
  "Lubrication Checklist",
  "Conveyor Belt Inspection",
  "Tank Level Verification",
  "Shift Handover Checklist",
];

export interface Checklist {
  id: string;
  name: string;
  area: (typeof AREAS)[number];
  asset: (typeof ASSETS)[number];
  team: (typeof TEAMS)[number];
  status: ChecklistStatus;
  lastExecution: string;
  result: ResultStatus;
  notOkCount: number;
  totalTasks: number;
  completed: number;
}

const rand = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
};

const r = rand(42);
const pick = <T,>(arr: readonly T[]) => arr[Math.floor(r() * arr.length)];

const statuses: ChecklistStatus[] = ["todo", "ongoing", "done", "overdue", "notok"];

export const CHECKLISTS: Checklist[] = Array.from({ length: 48 }, (_, i) => {
  const status = statuses[Math.floor(r() * statuses.length)];
  const result: ResultStatus =
    status === "notok" ? "notok" : status === "done" ? "ok" : status === "overdue" ? "notok" : "pending";
  const total = 8 + Math.floor(r() * 14);
  const completed =
    status === "done" || status === "notok"
      ? total
      : status === "ongoing"
        ? Math.floor(total * (0.3 + r() * 0.5))
        : status === "overdue"
          ? Math.floor(total * r() * 0.7)
          : 0;
  const day = Math.floor(r() * 14);
  const hour = Math.floor(r() * 24);
  return {
    id: `CL-${(1000 + i).toString()}`,
    name: CHECKLIST_TEMPLATES[i % CHECKLIST_TEMPLATES.length],
    area: pick(AREAS),
    asset: pick(ASSETS),
    team: pick(TEAMS),
    status,
    lastExecution: `2026-05-${(15 + (day % 15)).toString().padStart(2, "0")} ${hour.toString().padStart(2, "0")}:${Math.floor(r() * 60)
      .toString()
      .padStart(2, "0")}`,
    result,
    notOkCount: status === "notok" ? 1 + Math.floor(r() * 4) : status === "overdue" ? Math.floor(r() * 2) : 0,
    totalTasks: total,
    completed,
  };
});

export const kpiCounts = {
  todo: CHECKLISTS.filter((c) => c.status === "todo").length,
  ongoing: CHECKLISTS.filter((c) => c.status === "ongoing").length,
  done: CHECKLISTS.filter((c) => c.status === "done").length,
  overdue: CHECKLISTS.filter((c) => c.status === "overdue").length,
  notok: CHECKLISTS.filter((c) => c.status === "notok").length,
};

// Time-series mock
export const trendData = Array.from({ length: 14 }, (_, i) => {
  const ok = 30 + Math.floor(r() * 25);
  const notok = 3 + Math.floor(r() * 10);
  return {
    date: `May ${i + 16}`,
    ok,
    notok,
    overdue: Math.floor(r() * 6),
    completed: ok + notok,
    pctNotOk: Math.round((notok / (ok + notok)) * 100),
  };
});

export const statusDistribution = [
  { name: "Done", value: kpiCounts.done, color: "var(--status-done)" },
  { name: "Ongoing", value: kpiCounts.ongoing, color: "var(--status-ongoing)" },
  { name: "To Do", value: kpiCounts.todo, color: "var(--status-todo)" },
  { name: "Overdue", value: kpiCounts.overdue, color: "var(--status-overdue)" },
  { name: "Not OK", value: kpiCounts.notok, color: "var(--status-notok)" },
];

export const latestNotOk = CHECKLISTS.filter((c) => c.result === "notok").slice(0, 6);
export const overdueChecklists = CHECKLISTS.filter((c) => c.status === "overdue").slice(0, 6);

export const criticalAlerts = [
  { id: "A-1", severity: "critical", title: "Recovery Boiler RB-01 — temperature deviation", time: "12 min ago", area: "Recovery Boiler" },
  { id: "A-2", severity: "high", title: "Pump P-204 vibration above threshold (3rd time today)", time: "47 min ago", area: "Paper Machine 5" },
  { id: "A-3", severity: "high", title: "Daily Safety Inspection overdue — Finishing Line", time: "1h ago", area: "Finishing Line" },
  { id: "A-4", severity: "medium", title: "Tank TK-88 level reading inconsistent", time: "2h ago", area: "Utilities" },
];

// Task-level mock for detail page
export const TASK_RESULTS = [
  { id: "T1", name: "Verify lockout/tagout in place", expected: "Applied", actual: "Applied", status: "ok", time: "08:12", comment: "", evidence: false },
  { id: "T2", name: "Bearing temperature (motor side)", expected: "< 70°C", actual: "82°C", status: "notok", time: "08:15", comment: "Trending up since last shift", evidence: true },
  { id: "T3", name: "Lubricant level", expected: "Within sight glass", actual: "OK", status: "ok", time: "08:17", comment: "", evidence: false },
  { id: "T4", name: "Vibration RMS", expected: "< 4.5 mm/s", actual: "6.1 mm/s", status: "notok", time: "08:19", comment: "Recurring issue — work order WO-4421", evidence: true },
  { id: "T5", name: "Coupling guard secured", expected: "Yes", actual: "Yes", status: "ok", time: "08:21", comment: "", evidence: false },
  { id: "T6", name: "Seal flush flow rate", expected: "> 2 L/min", actual: "2.4 L/min", status: "ok", time: "08:23", comment: "", evidence: false },
  { id: "T7", name: "Discharge pressure", expected: "5.5–6.5 bar", actual: "5.8 bar", status: "ok", time: "08:25", comment: "", evidence: false },
  { id: "T8", name: "Noise / abnormal sound", expected: "None", actual: "Slight whine", status: "notok", time: "08:27", comment: "Mechanic notified", evidence: false },
];

// Not OK aggregates
export const notOkByArea = AREAS.map((a) => ({
  area: a,
  count: 3 + Math.floor(r() * 18),
}));

export const notOkByChecklist = CHECKLIST_TEMPLATES.map((c) => ({
  checklist: c,
  count: 2 + Math.floor(r() * 15),
})).sort((a, b) => b.count - a.count);

export const recurringNotOk = [
  { task: "Vibration RMS", checklist: "Pump Vibration Check", asset: "Pump P-204", area: "Paper Machine 5", occurrences: 12, lastSeen: "2h ago" },
  { task: "Bearing temperature", checklist: "Pump Vibration Check", asset: "Pump P-204", area: "Paper Machine 5", occurrences: 9, lastSeen: "2h ago" },
  { task: "Belt tracking alignment", checklist: "Conveyor Belt Inspection", asset: "Conveyor CV-12", area: "Finishing Line", occurrences: 7, lastSeen: "5h ago" },
  { task: "Steam drum level", checklist: "Boiler Area Walkdown", asset: "Recovery Boiler RB-01", area: "Recovery Boiler", occurrences: 6, lastSeen: "1d ago" },
  { task: "Tank ullage reading", checklist: "Tank Level Verification", asset: "Tank TK-88", area: "Utilities", occurrences: 5, lastSeen: "8h ago" },
  { task: "Lubricant level (gearbox)", checklist: "Lubrication Checklist", asset: "Dryer Section", area: "Paper Machine 5", occurrences: 4, lastSeen: "1d ago" },
];

// Alert rules mock
export const ALERT_RULES = [
  {
    id: "R-101",
    name: "Critical safety Not OK → Safety team",
    trigger: "Task = Not OK",
    scope: "Daily Safety Inspection · All areas",
    recipients: "Safety Team, Shift Sup.",
    channel: "Email + Teams",
    status: "active",
    lastTriggered: "12 min ago",
  },
  {
    id: "R-102",
    name: "Pump vibration repeats > 3x / 24h",
    trigger: "Not OK repeats ≥ 3 in 24h",
    scope: "Pump Vibration Check · Paper Machine 5",
    recipients: "Maintenance, Process Eng.",
    channel: "Email + SMS",
    status: "active",
    lastTriggered: "2h ago",
  },
  {
    id: "R-103",
    name: "Boiler walkdown overdue",
    trigger: "Checklist overdue",
    scope: "Boiler Area Walkdown · Recovery Boiler",
    recipients: "Operations B Lead",
    channel: "Teams",
    status: "active",
    lastTriggered: "1d ago",
  },
  {
    id: "R-104",
    name: "Shift handover completed",
    trigger: "Checklist completed",
    scope: "Shift Handover Checklist · All",
    recipients: "Shift Supervisors",
    channel: "Email",
    status: "inactive",
    lastTriggered: "—",
  },
  {
    id: "R-105",
    name: "Conveyor inspection Not OK",
    trigger: "Checklist = Not OK",
    scope: "Conveyor Belt Inspection · Finishing Line",
    recipients: "Maintenance",
    channel: "Email",
    status: "active",
    lastTriggered: "5h ago",
  },
];
