import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowUpDown, Eye, Search } from "lucide-react";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { AREAS, ASSETS, CHECKLISTS, TEAMS, type ChecklistStatus } from "@/lib/mock-data";

const searchSchema = z.object({
  status: fallback(z.string(), "").default(""),
  area: fallback(z.string(), "").default(""),
  asset: fallback(z.string(), "").default(""),
  team: fallback(z.string(), "").default(""),
  result: fallback(z.string(), "").default(""),
  q: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/checklists")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({ meta: [{ title: "Checklists — InField" }] }),
  component: ChecklistsPage,
});

function Select({ value, onChange, options, placeholder }: { value: string; onChange: (v: string) => void; options: readonly string[]; placeholder: string }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );
}

function ChecklistsPage() {
  const initial = Route.useSearch();
  const [filters, setFilters] = useState({ ...initial });
  const [sortKey, setSortKey] = useState<string>("lastExecution");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const rows = useMemo(() => {
    let r = CHECKLISTS.filter((c) => {
      if (filters.status && c.status !== filters.status) return false;
      if (filters.area && c.area !== filters.area) return false;
      if (filters.asset && c.asset !== filters.asset) return false;
      if (filters.team && c.team !== filters.team) return false;
      if (filters.result && c.result !== filters.result) return false;
      if (filters.q && !`${c.name} ${c.asset} ${c.area} ${c.id}`.toLowerCase().includes(filters.q.toLowerCase())) return false;
      return true;
    });
    r = [...r].sort((a, b) => {
      const av = (a as never)[sortKey];
      const bv = (b as never)[sortKey];
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return r;
  }, [filters, sortKey, sortDir]);

  const toggleSort = (k: string) => {
    if (sortKey === k) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(k); setSortDir("asc"); }
  };

  const Th = ({ k, children }: { k: string; children: React.ReactNode }) => (
    <th className="px-4 py-3 text-left font-medium">
      <button onClick={() => toggleSort(k)} className="inline-flex items-center gap-1 hover:text-foreground">
        {children}
        <ArrowUpDown className="h-3 w-3 opacity-50" />
      </button>
    </th>
  );

  return (
    <>
      <PageHeader title="Checklists" description={`${rows.length} of ${CHECKLISTS.length} checklists`} />

      <div className="space-y-4 p-6">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={filters.q}
                onChange={(e) => setFilters({ ...filters, q: e.target.value })}
                placeholder="Search checklist, asset, area, ID…"
                className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <Select value={filters.status} onChange={(v) => setFilters({ ...filters, status: v })} options={["todo", "ongoing", "done", "overdue", "notok"]} placeholder="Status" />
            <Select value={filters.area} onChange={(v) => setFilters({ ...filters, area: v })} options={AREAS} placeholder="Area" />
            <Select value={filters.asset} onChange={(v) => setFilters({ ...filters, asset: v })} options={ASSETS} placeholder="Asset" />
            <Select value={filters.team} onChange={(v) => setFilters({ ...filters, team: v })} options={TEAMS} placeholder="Team" />
            <Select value={filters.result} onChange={(v) => setFilters({ ...filters, result: v })} options={["ok", "notok", "pending"]} placeholder="Result" />
            <button
              onClick={() => setFilters({ status: "", area: "", asset: "", team: "", result: "", q: "" })}
              className="rounded-md border border-border px-3 py-2 text-sm text-muted-foreground hover:bg-accent"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-border bg-card">
          {rows.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-background/40 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr className="border-b border-border">
                    <Th k="name">Checklist</Th>
                    <Th k="area">Area</Th>
                    <Th k="asset">Asset</Th>
                    <Th k="team">Team</Th>
                    <Th k="status">Status</Th>
                    <Th k="lastExecution">Last execution</Th>
                    <Th k="result">Result</Th>
                    <Th k="notOkCount">Not OK</Th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((c) => (
                    <tr key={c.id} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">{c.name}</div>
                        <div className="text-xs text-muted-foreground tabular-nums">{c.id}</div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{c.area}</td>
                      <td className="px-4 py-3 text-muted-foreground">{c.asset}</td>
                      <td className="px-4 py-3 text-muted-foreground">{c.team}</td>
                      <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                      <td className="px-4 py-3 text-muted-foreground tabular-nums">{c.lastExecution}</td>
                      <td className="px-4 py-3"><StatusBadge status={c.result} /></td>
                      <td className="px-4 py-3 tabular-nums">
                        {c.notOkCount > 0 ? (
                          <span className="rounded-md bg-[color:var(--status-notok)]/15 px-2 py-0.5 text-xs font-semibold text-[color:var(--status-notok)]">{c.notOkCount}</span>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          to="/checklists/$id"
                          params={{ id: c.id }}
                          className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs hover:border-primary hover:text-primary"
                        >
                          <Eye className="h-3.5 w-3.5" /> View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function EmptyState() {
  return (
    <div className="grid place-items-center px-6 py-16 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full border border-dashed border-border text-muted-foreground">
        <Search className="h-5 w-5" />
      </div>
      <div className="mt-3 text-sm font-medium">No checklists match your filters</div>
      <div className="mt-1 text-xs text-muted-foreground">Try clearing some filters or widening the date range.</div>
    </div>
  );
}

void (null as unknown as ChecklistStatus); // keep type import alive
