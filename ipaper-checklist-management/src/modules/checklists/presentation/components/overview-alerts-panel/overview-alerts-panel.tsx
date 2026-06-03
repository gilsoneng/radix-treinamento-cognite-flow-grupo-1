import { Card, CardContent } from '@cognite/aura/components';

import { useAppNavigation } from '../../../../../app/host/use-app-navigation';
import { useOperationalAlertsQuery } from '../../../infrastructure/queries/use-checklist-data-queries';
import { AlertKindBadge } from '../alert-kind-badge/alert-kind-badge';

export function OverviewAlertsPanel() {
  const { navigate } = useAppNavigation();
  const query = useOperationalAlertsQuery();
  const alerts = query.data ?? [];
  const top = alerts.slice(0, 5);

  if (query.isPending || top.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardContent>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="m-0 text-sm font-semibold uppercase tracking-wide text-primary-background">
            Critical alerts
          </h2>
          <button
            type="button"
            className="text-sm text-link-foreground underline-offset-2 hover:underline"
            onClick={() => navigate('alerts')}
          >
            View all ({alerts.length})
          </button>
        </div>
        <ul className="flex flex-col gap-2">
          {top.map((alert) => (
            <li
              key={alert.id}
              className="flex items-start justify-between gap-2 border-b border-border pb-2 last:border-0"
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{alert.title}</div>
                <p className="m-0 mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                  {alert.description}
                </p>
              </div>
              <AlertKindBadge kind={alert.kind} />
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
