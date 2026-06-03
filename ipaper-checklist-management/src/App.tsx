import { CogniteSdkProvider } from '@cognite/app-sdk/react';
import { Alert, AlertDescription } from '@cognite/aura/components';
import type { ComponentProps } from 'react';

import { AppNavigationProvider } from './app/host/app-navigation.provider';
import { useHostAppContext } from './app/host/host-app.context';
import { HostAppProvider, type HostAppProviderDeps } from './app/host/host-app.provider';
import { parseAppState } from './app/host/host-synced-state';
import { AppView } from './app/routing/app-view';
import { AppShell } from './design-system/layout/app-shell/app-shell';
import { LoadingState } from './design-system/layout/states/loading-state';

const loadingFallback = (
  <div className="flex min-h-screen items-center justify-center bg-muted-background p-8">
    <LoadingState message="Loading project..." />
  </div>
);

const errorFallback = (
  <div className="flex min-h-screen items-center justify-center bg-muted-background p-8">
    <Alert>
      <AlertDescription>Failed to connect to Fusion host</AlertDescription>
    </Alert>
  </div>
);

type AppContentProps = {
  hostDeps?: Partial<HostAppProviderDeps>;
};

function AppContent({ hostDeps }: AppContentProps) {
  return (
    <HostAppProvider deps={hostDeps}>
      <AppContentWithNavigation />
    </HostAppProvider>
  );
}

function AppContentWithNavigation() {
  const { initialState, isReady } = useHostAppContext();

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted-background p-8">
        <LoadingState message="Loading project..." />
      </div>
    );
  }

  const navigationKey = initialState ?? 'default';

  return (
    <AppNavigationProvider key={navigationKey} initialAppState={parseAppState(initialState)}>
      <AppShell>
        <AppView />
      </AppShell>
    </AppNavigationProvider>
  );
}

type AppProps = {
  deps?: ComponentProps<typeof CogniteSdkProvider>['deps'];
};

function App({ deps }: AppProps) {
  const hostDeps: Partial<HostAppProviderDeps> | undefined = deps
    ? { connectToHostApp: deps.connectToHostApp }
    : undefined;

  return (
    <CogniteSdkProvider loadingFallback={loadingFallback} errorFallback={errorFallback} deps={deps}>
      <AppContent hostDeps={hostDeps} />
    </CogniteSdkProvider>
  );
}

export default App;
