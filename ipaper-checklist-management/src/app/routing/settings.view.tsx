import { NotificationSettingsPanel } from '../../modules/checklists/presentation/components/notification-settings-panel/notification-settings-panel';
import { HealthView } from '../../modules/health/health.providers';

export function SettingsView() {
  return (
    <div className="flex flex-col gap-6">
      <NotificationSettingsPanel />
      <section aria-labelledby="cdf-health-heading">
        <h2 id="cdf-health-heading" className="mb-3 text-sm font-semibold uppercase tracking-wide text-primary-background">
          CDF connection
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Sample Cognite Core assets from the data model — validates Fusion auth and DMS read access.
        </p>
        <HealthView />
      </section>
    </div>
  );
}
