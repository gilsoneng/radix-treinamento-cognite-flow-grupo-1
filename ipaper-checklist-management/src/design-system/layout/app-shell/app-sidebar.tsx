import { Badge } from '@cognite/aura/components';
import {
  IconAlertCircle,
  IconChartDots,
  IconLayoutDashboard,
  IconListCheck,
  IconSettings,
  IconBuildingFactory2,
} from '@tabler/icons-react';
import type { ComponentType } from 'react';

import { useAppNavigation } from '../../../app/host/use-app-navigation';
import { APP_NAV_ITEMS, type AppPage } from '../../../app/routing/app-view.types';
import { useOperationalAlertsQuery } from '../../../modules/checklists/infrastructure/queries/use-checklist-data-queries';

const PAGE_ICONS: Record<AppPage, ComponentType<{ className?: string }>> = {
  overview: IconLayoutDashboard,
  checklists: IconListCheck,
  analytics: IconChartDots,
  alerts: IconAlertCircle,
  settings: IconSettings,
};

export function AppSidebar() {
  const { page, navigate } = useAppNavigation();
  const alertsQuery = useOperationalAlertsQuery();
  const alertCount = alertsQuery.data?.length ?? 0;

  return (
    <aside className="ip-app-sidebar hidden md:flex w-60 shrink-0 flex-col">
      <div className="ip-app-sidebar__brand flex items-center gap-2.5 px-5 py-5">
        <div className="ip-app-sidebar__logo grid h-9 w-9 place-items-center">
          <IconBuildingFactory2 className="h-5 w-5" aria-hidden />
        </div>
        <div className="leading-tight">
          <div className="ip-app-sidebar__title text-sm font-semibold tracking-tight">InField</div>
          <div className="ip-app-sidebar__subtitle text-[10px] uppercase tracking-wider">
            Checklist Intelligence
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Main navigation">
        <div className="ip-app-sidebar__section-label px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider">
          Operations
        </div>
        <ul className="space-y-0.5">
          {APP_NAV_ITEMS.map((item) => {
            const active = page === item.page;
            const Icon = PAGE_ICONS[item.page];
            return (
              <li key={item.page}>
                <button
                  type="button"
                  className="ip-app-sidebar__nav-button flex h-auto w-full items-center justify-start gap-3"
                  data-active={active ? '' : undefined}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => navigate(item.page)}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.page === 'alerts' && alertCount > 0 ? (
                    <Badge variant="error" className="h-5 min-w-5 justify-center px-1.5 text-[10px]">
                      {alertCount > 99 ? '99+' : alertCount}
                    </Badge>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="ip-app-sidebar__footer px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="ip-app-sidebar__avatar grid h-8 w-8 place-items-center text-xs font-semibold">
            IP
          </div>
          <div className="min-w-0 leading-tight">
            <div className="truncate text-xs font-medium">International Paper</div>
            <div className="ip-app-sidebar__mill truncate text-[10px]">Riegelwood Mill · Shift A</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
