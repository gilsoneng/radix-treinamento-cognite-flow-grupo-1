import type { ReactNode } from 'react';

import { useAppNavigation } from '../../../app/host/use-app-navigation';
import { APP_PAGE_TITLES } from '../../../app/routing/app-view.types';
import { APP_PRODUCT_NAME, RADIX_WEDGE_SRC } from '../../assets/ip-brand';
import { AppFooter } from '../app-footer/app-footer';

import { NotificationRuntime } from '../../../modules/checklists/presentation/components/notification-runtime/notification-runtime';
import { useOperationalAlertsQuery } from '../../../modules/checklists/infrastructure/queries/use-checklist-data-queries';

import { AppSidebar } from './app-sidebar';

export type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const { page } = useAppNavigation();
  const alertsQuery = useOperationalAlertsQuery();
  const pageTitle = APP_PAGE_TITLES[page];

  return (
    <div className="ip-app-shell flex min-h-screen">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="ip-app-shell__header shrink-0 px-6 py-4">
          <img
            src={RADIX_WEDGE_SRC}
            alt="Powered by Radix"
            className="ip-app-shell__radix-wedge"
          />
          <div className="ip-app-shell__header-copy">
            <h1 className="ip-app-shell__title m-0 text-lg font-semibold uppercase tracking-wide">{pageTitle}</h1>
            <p className="ip-app-shell__subtitle m-0 mt-1 text-sm">{APP_PRODUCT_NAME}</p>
          </div>
        </header>
        <main className="ip-app-shell__main flex-1 overflow-y-auto px-6 py-6">
          <NotificationRuntime alerts={alertsQuery.data ?? []} />
          {children}
        </main>
        <AppFooter />
      </div>
    </div>
  );
}
