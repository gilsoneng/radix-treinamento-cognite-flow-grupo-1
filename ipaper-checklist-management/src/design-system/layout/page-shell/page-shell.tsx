import type { ReactNode } from 'react';

import { IpHeroBanner } from '../../components/ip-hero-banner/ip-hero-banner';
import { AppFooter } from '../app-footer/app-footer';

export interface PageShellProps {
  appName: string;
  pageTitle: string;
  children: ReactNode;
}


export function PageShell({ appName, pageTitle, children }: PageShellProps) {
  return (
    <div className="ip-page-shell flex min-h-screen flex-col">
      <header className="ip-page-shell__header shrink-0">
        <div className="ip-page-shell__brand">
          <IpHeroBanner appName={appName} pageTitle={pageTitle} />
        </div>
      </header>
      <main className="ip-page-shell__content flex-1">{children}</main>
      <AppFooter />
    </div>
  );
}
