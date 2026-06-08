import { Button } from '@cognite/aura/components';
import { IconChevronDown, IconChevronUp, IconX } from '@tabler/icons-react';
import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';

import type { OperationalAlert } from '../../../domain/alert.model';
import type { NotificationRule } from '../../../domain/notification-settings.model';
import {
  dismissAlertIds,
  loadDismissedAlertIds,
  saveDismissedAlertIds,
} from '../../../infrastructure/notification-dismiss.storage';
import { loadNotificationSettings } from '../../../infrastructure/notification-settings.storage';
import { themeForAlertKind } from '../../theme/checklist-status-theme';
import { AlertKindBadge } from '../alert-kind-badge/alert-kind-badge';

const MAX_VISIBLE = 12;
const IN_APP_FORMATS = new Set<NotificationRule['format']>(['banner', 'toast']);

export type NotificationRuntimeProps = {
  alerts: readonly OperationalAlert[];
};

function ruleForAlert(alert: OperationalAlert, rules: readonly NotificationRule[]): NotificationRule | undefined {
  const map: Record<OperationalAlert['kind'], NotificationRule['id']> = {
    overdue: 'checklist-overdue',
    'due-soon': 'checklist-due-soon',
    'critical-observation': 'critical-observation',
    'not-ok': 'checklist-not-ok',
    completed: 'checklist-completed',
  };
  const id = map[alert.kind];
  return rules.find((rule) => rule.id === id && rule.enabled);
}

function alertsForFeed(
  alerts: readonly OperationalAlert[],
  rules: readonly NotificationRule[],
  dismissed: ReadonlySet<string>,
): OperationalAlert[] {
  return alerts.filter((alert) => {
    const rule = ruleForAlert(alert, rules);
    if (!rule || !IN_APP_FORMATS.has(rule.format)) {
      return false;
    }
    return !dismissed.has(alert.id);
  });
}

export function NotificationRuntime({ alerts }: NotificationRuntimeProps) {
  const [settings, setSettings] = useState(() => loadNotificationSettings());
  const [dismissed, setDismissed] = useState(() => loadDismissedAlertIds());
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const interval = window.setInterval(() => setSettings(loadNotificationSettings()), 5_000);
    return () => window.clearInterval(interval);
  }, []);

  const feedAlerts = useMemo(
    () => alertsForFeed(alerts, settings.rules, dismissed),
    [alerts, dismissed, settings.rules],
  );

  const visible = feedAlerts.slice(0, MAX_VISIBLE);

  const dismissOne = useCallback((id: string) => {
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(id);
      saveDismissedAlertIds(next);
      return next;
    });
  }, []);

  const dismissAll = useCallback(() => {
    setDismissed(dismissAlertIds(feedAlerts.map((alert) => alert.id)));
  }, [feedAlerts]);

  if (feedAlerts.length === 0) {
    return null;
  }

  return (
    <section className="ip-notification-feed" aria-label="Active notifications">
      <header className="ip-notification-feed__header">
        <div className="ip-notification-feed__title-row">
          <span className="ip-notification-feed__title-dot" aria-hidden />
          <h2 className="ip-notification-feed__title">
            Notifications
            <span className="ip-notification-feed__count">{feedAlerts.length}</span>
          </h2>
        </div>
        <div className="ip-notification-feed__actions">
          <Button type="button" variant="ghost" size="sm" onClick={dismissAll}>
            Dismiss all
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-expanded={!collapsed}
            aria-label={collapsed ? 'Expand notifications' : 'Collapse notifications'}
            onClick={() => setCollapsed((value) => !value)}
          >
            {collapsed ? <IconChevronDown size={16} /> : <IconChevronUp size={16} />}
          </Button>
        </div>
      </header>

      {!collapsed ? (
        <ul className="ip-notification-feed__list">
          {visible.map((alert) => {
            const theme = themeForAlertKind(alert.kind);
            return (
              <li
                key={alert.id}
                className="ip-notification-item"
                style={
                  {
                    '--ip-alert-accent': theme.color,
                    '--ip-alert-border': theme.border,
                  } as CSSProperties
                }
              >
                <span className="ip-notification-item__corner-dot" aria-hidden />
                <div className="ip-notification-item__content">
                  <div className="ip-notification-item__top">
                    <span className="ip-notification-item__title">{alert.title}</span>
                    <AlertKindBadge kind={alert.kind} />
                  </div>
                  <p className="ip-notification-item__description">{alert.description}</p>
                </div>
                <button
                  type="button"
                  className="ip-notification-item__dismiss"
                  aria-label={`Dismiss ${alert.title}`}
                  onClick={() => dismissOne(alert.id)}
                >
                  <IconX size={14} />
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="ip-notification-feed__collapsed-hint">
          {feedAlerts.length} active notification{feedAlerts.length === 1 ? '' : 's'} — expand to
          review or dismiss all.
        </p>
      )}
    </section>
  );
}
