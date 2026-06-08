import { connectToHostApp as defaultConnectToHostApp } from '@cognite/app-sdk';
import type { ConnectToHostAppResult } from '@cognite/app-sdk';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';

import { getAppConfig } from '../config/app-config';

import { HostAppContext, type HostAppContextValue } from './host-app.context';

export type HostAppProviderDeps = {
  connectToHostApp: (meta?: { applicationName?: string }) => Promise<ConnectToHostAppResult>;
};

const defaultDeps: HostAppProviderDeps = {
  connectToHostApp: defaultConnectToHostApp,
};

export type HostAppProviderProps = {
  children: ReactNode;
  deps?: Partial<HostAppProviderDeps>;
};

export function HostAppProvider({ children, deps: depsOverride }: HostAppProviderProps) {
  const deps = useMemo(() => ({ ...defaultDeps, ...depsOverride }), [depsOverride]);
  const [value, setValue] = useState<HostAppContextValue>({
    api: null,
    initialState: undefined,
    isReady: false,
  });

  useEffect(() => {
    let cancelled = false;
    const { externalId } = getAppConfig();

    async function connect() {
      try {
        const { api, initialState } = await deps.connectToHostApp({ applicationName: externalId });
        if (!cancelled) {
          setValue({ api, initialState, isReady: true });
        }
      } catch {
        if (!cancelled) {
          setValue({ api: null, initialState: undefined, isReady: false });
        }
      }
    }

    void connect();

    return () => {
      cancelled = true;
    };
  }, [deps]);

  return <HostAppContext.Provider value={value}>{children}</HostAppContext.Provider>;
}
