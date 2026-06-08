import { AlertsPage } from '../../modules/checklists/presentation/pages/alerts/alerts.page';
import { AnalyticsPage } from '../../modules/checklists/presentation/pages/analytics/analytics.page';
import { ChecklistsPage } from '../../modules/checklists/presentation/pages/checklists/checklists.page';
import { OverviewPage } from '../../modules/checklists/presentation/pages/overview/overview.page';
import { useAppNavigation } from '../host/use-app-navigation';

import { SettingsView } from './settings.view';

export function AppView() {
  const { page } = useAppNavigation();

  switch (page) {
    case 'overview':
      return <OverviewPage />;
    case 'checklists':
      return <ChecklistsPage />;
    case 'analytics':
      return <AnalyticsPage />;
    case 'alerts':
      return <AlertsPage />;
    case 'settings':
      return <SettingsView />;
    default:
      return <OverviewPage />;
  }
}
