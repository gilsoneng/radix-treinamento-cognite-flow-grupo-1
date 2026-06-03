import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — InField" }] }),
  component: Settings,
});

function Settings() {
  return (
    <>
      <PageHeader title="Settings" description="Dashboard preferences, notification channels and operational defaults" />

      <div className="space-y-4 p-6 max-w-3xl">
        <Section title="Dashboard preferences" description="Defaults that apply to every operator dashboard">
          <Row label="Default landing page">
            <select className="input"><option>Overview</option><option>Checklists</option><option>Task Results</option></select>
          </Row>
          <Row label="Compact density">
            <Toggle defaultChecked />
          </Row>
          <Row label="Show critical alerts banner">
            <Toggle defaultChecked />
          </Row>
        </Section>

        <Section title="Default time range" description="Used by KPI and trend charts">
          <Row label="Time range">
            <select className="input">
              <option>Today</option>
              <option>Last 7 days</option>
              <option selected>Last 30 days</option>
              <option>Current month</option>
            </select>
          </Row>
          <Row label="Data refresh interval">
            <select className="input">
              <option>15 seconds</option>
              <option selected>30 seconds</option>
              <option>1 minute</option>
              <option>5 minutes</option>
            </select>
          </Row>
        </Section>

        <Section title="Notification channels" description="Default channels available to alert rules">
          {["Email", "SMS", "Microsoft Teams", "Webhook"].map((c, i) => (
            <Row key={c} label={c}><Toggle defaultChecked={i < 3} /></Row>
          ))}
        </Section>

        <Section title="User roles" description="Roles and what they can see / do">
          <div className="divide-y divide-border rounded-md border border-border">
            {[
              { name: "Operator", desc: "Executes checklists in the field" },
              { name: "Supervisor", desc: "Monitors completion and overdue items" },
              { name: "Process / Maintenance Eng.", desc: "Analyzes Not OK results and trends" },
              { name: "Admin", desc: "Configures notification rules and recipients" },
            ].map((r) => (
              <div key={r.name} className="flex items-center justify-between px-4 py-3">
                <div>
                  <div className="text-sm font-medium">{r.name}</div>
                  <div className="text-xs text-muted-foreground">{r.desc}</div>
                </div>
                <button className="rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground">Manage</button>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <style>{`.input{border-radius:6px;border:1px solid var(--border);background:var(--background);padding:0.45rem 0.7rem;font-size:0.875rem;color:var(--foreground);outline:none;min-width:200px}.input:focus{border-color:var(--primary)}`}</style>
    </>
  );
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <div className="text-sm font-semibold">{title}</div>
        {description && <div className="mt-0.5 text-xs text-muted-foreground">{description}</div>}
      </div>
      <div className="p-5 space-y-3">{children}</div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="text-sm">{label}</div>
      {children}
    </div>
  );
}

function Toggle({ defaultChecked }: { defaultChecked?: boolean }) {
  return (
    <label className="relative inline-flex h-5 w-9 cursor-pointer items-center">
      <input type="checkbox" defaultChecked={defaultChecked} className="peer sr-only" />
      <span className="absolute inset-0 rounded-full bg-accent peer-checked:bg-primary transition" />
      <span className="relative ml-0.5 h-4 w-4 rounded-full bg-background shadow transition peer-checked:translate-x-4" />
    </label>
  );
}
