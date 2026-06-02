import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pencil, Plus, Power, Trash2, X } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { ALERT_RULES, AREAS, CHECKLIST_TEMPLATES } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/alerts")({
  head: () => ({ meta: [{ title: "Alerts — InField" }] }),
  component: Alerts,
});

const TRIGGERS = [
  "Checklist receives a Not OK result",
  "Checklist is completed",
  "Checklist becomes overdue",
  "Specific task receives a Not OK result",
  "Not OK result repeats more than N times in period",
];

function Alerts() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [rules, setRules] = useState(ALERT_RULES);

  return (
    <>
      <PageHeader
        title="Alerts & Notifications"
        description="Configure automated notifications for Not OK results, overdue checklists and recurring issues"
        actions={
          <button
            onClick={() => { setOpen(true); setStep(1); }}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> New rule
          </button>
        }
      />

      <div className="p-6">
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-background/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left font-medium">Rule name</th>
                  <th className="px-4 py-3 text-left font-medium">Trigger</th>
                  <th className="px-4 py-3 text-left font-medium">Scope</th>
                  <th className="px-4 py-3 text-left font-medium">Recipients</th>
                  <th className="px-4 py-3 text-left font-medium">Channel</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Last triggered</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((r) => (
                  <tr key={r.id} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                    <td className="px-4 py-3 font-medium">{r.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.trigger}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.scope}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.recipients}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.channel}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium uppercase",
                        r.status === "active"
                          ? "border-[color:var(--status-ok)]/30 bg-[color:var(--status-ok)]/15 text-[color:var(--status-ok)]"
                          : "border-border bg-muted text-muted-foreground"
                      )}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground tabular-nums">{r.lastTriggered}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground" title="Edit"><Pencil className="h-3.5 w-3.5" /></button>
                        <button
                          onClick={() => setRules(rules.map(x => x.id === r.id ? { ...x, status: x.status === "active" ? "inactive" : "active" } : x))}
                          className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                          title="Toggle"
                        ><Power className="h-3.5 w-3.5" /></button>
                        <button
                          onClick={() => setRules(rules.filter(x => x.id !== r.id))}
                          className="rounded p-1.5 text-muted-foreground hover:bg-[color:var(--status-notok)]/15 hover:text-[color:var(--status-notok)]"
                          title="Delete"
                        ><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4 backdrop-blur" onClick={() => setOpen(false)}>
          <div className="w-full max-w-lg overflow-hidden rounded-lg border border-border bg-card shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
              <div>
                <div className="text-sm font-semibold">New alert rule</div>
                <div className="text-xs text-muted-foreground">Step {step} of 3</div>
              </div>
              <button onClick={() => setOpen(false)} className="rounded p-1 hover:bg-accent"><X className="h-4 w-4" /></button>
            </div>

            <div className="space-y-4 p-5">
              <div className="flex gap-1.5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className={cn("h-1 flex-1 rounded-full", i <= step ? "bg-primary" : "bg-accent")} />
                ))}
              </div>

              {step === 1 && (
                <>
                  <Field label="Rule name"><input placeholder="e.g. Pump vibration repeats" className="input" /></Field>
                  <Field label="Trigger condition">
                    <select className="input">
                      {TRIGGERS.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </Field>
                  <Field label="Threshold (if applicable)"><input type="number" defaultValue={3} className="input" /></Field>
                </>
              )}

              {step === 2 && (
                <>
                  <Field label="Checklist scope">
                    <select className="input">
                      <option>All checklists</option>
                      {CHECKLIST_TEMPLATES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </Field>
                  <Field label="Area scope">
                    <select className="input">
                      <option>All areas</option>
                      {AREAS.map((a) => <option key={a}>{a}</option>)}
                    </select>
                  </Field>
                </>
              )}

              {step === 3 && (
                <>
                  <Field label="Recipients"><input placeholder="Safety team, shift supervisor…" className="input" /></Field>
                  <Field label="Channel">
                    <div className="flex flex-wrap gap-2">
                      {["Email", "SMS", "Teams", "Webhook"].map((c) => (
                        <label key={c} className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-sm">
                          <input type="checkbox" defaultChecked={c === "Email"} className="accent-[color:var(--primary)]" /> {c}
                        </label>
                      ))}
                    </div>
                  </Field>
                  <Field label="Message format"><textarea rows={3} className="input" defaultValue="[{area}] {checklist} → {task} is Not OK ({occurrences}x in 24h)" /></Field>
                </>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-border px-5 py-3">
              <button
                onClick={() => setStep(Math.max(1, step - 1))}
                disabled={step === 1}
                className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent disabled:opacity-40"
              >
                Back
              </button>
              {step < 3 ? (
                <button onClick={() => setStep(step + 1)} className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground">Next</button>
              ) : (
                <button onClick={() => setOpen(false)} className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground">Create rule</button>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`.input{width:100%;border-radius:6px;border:1px solid var(--border);background:var(--background);padding:0.5rem 0.75rem;font-size:0.875rem;color:var(--foreground);outline:none}.input:focus{border-color:var(--primary)}`}</style>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
