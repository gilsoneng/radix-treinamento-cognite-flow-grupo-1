import { CogniteSdkProvider } from '@cognite/app-sdk/react';
import { Alert, AlertDescription } from '@cognite/aura/components';
import type { ComponentProps } from 'react';

import { getAppConfig } from './app/config/app-config';
import { PageShell } from './design-system/layout/page-shell/page-shell';
import { LoadingState } from './design-system/layout/states/loading-state';
import { HealthView } from './modules/health/health.providers';

const loadingFallback = (
  <PageShell appName="Ipaper Checklist Management" pageTitle="Core Assets">
    <LoadingState message="Loading project..." />
  </PageShell>
);

const errorFallback = (
  <PageShell appName="Ipaper Checklist Management" pageTitle="Core Assets">
    <Alert>
      <AlertDescription>Failed to connect to Fusion host</AlertDescription>
    </Alert>
  </PageShell>
);

function AppContent() {
  const { name } = getAppConfig();

  return (
    <PageShell appName={name} pageTitle="Core Assets">
      <HealthView />
    </PageShell>
  );
}

type AppProps = {
  deps?: ComponentProps<typeof CogniteSdkProvider>['deps'];
};

function App({ deps }: AppProps) {
  return (
    <CogniteSdkProvider loadingFallback={loadingFallback} errorFallback={errorFallback} deps={deps}>
      <AppContent />
    </CogniteSdkProvider>
  );
}

export default App;
