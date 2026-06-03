import {
  DEFAULT_NOTIFICATION_SETTINGS,
  type NotificationFormat,
  type NotificationRule,
  type NotificationSettings,
  type NotificationTrigger,
} from '../domain/notification-settings.model';

const STORAGE_KEY = 'ip-notification-settings-v1';

function isTrigger(value: string): value is NotificationTrigger {
  return DEFAULT_NOTIFICATION_SETTINGS.rules.some((rule) => rule.id === value);
}

function isFormat(value: string): value is NotificationFormat {
  return value === 'banner' || value === 'badge' || value === 'toast';
}

export function loadNotificationSettings(): NotificationSettings {
  if (typeof localStorage === 'undefined') {
    return DEFAULT_NOTIFICATION_SETTINGS;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_NOTIFICATION_SETTINGS;
    }
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return DEFAULT_NOTIFICATION_SETTINGS;
    }
    const record = parsed as Record<string, unknown>;
    const pollingIntervalMs =
      typeof record.pollingIntervalMs === 'number' ? record.pollingIntervalMs : 120_000;

    const defaultsById = new Map(
      DEFAULT_NOTIFICATION_SETTINGS.rules.map((rule) => [rule.id, rule]),
    );
    const storedRules = Array.isArray(record.rules) ? record.rules : [];

    const rules: NotificationRule[] = DEFAULT_NOTIFICATION_SETTINGS.rules.map((defaultRule) => {
      const stored = storedRules.find(
        (entry) =>
          entry &&
          typeof entry === 'object' &&
          'id' in entry &&
          (entry as { id: string }).id === defaultRule.id,
      ) as Partial<NotificationRule> | undefined;

      if (!stored) {
        return defaultRule;
      }

      const id = typeof stored.id === 'string' && isTrigger(stored.id) ? stored.id : defaultRule.id;
      const format =
        typeof stored.format === 'string' && isFormat(stored.format)
          ? stored.format
          : defaultRule.format;

      return {
        ...defaultRule,
        id,
        enabled: typeof stored.enabled === 'boolean' ? stored.enabled : defaultRule.enabled,
        format,
      };
    });

    for (const entry of storedRules) {
      if (!entry || typeof entry !== 'object' || !('id' in entry)) {
        continue;
      }
      const id = (entry as { id: string }).id;
      if (!isTrigger(id) || defaultsById.has(id)) {
        continue;
      }
    }

    return { rules, pollingIntervalMs };
  } catch {
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
}

export function saveNotificationSettings(settings: NotificationSettings): void {
  if (typeof localStorage === 'undefined') {
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
