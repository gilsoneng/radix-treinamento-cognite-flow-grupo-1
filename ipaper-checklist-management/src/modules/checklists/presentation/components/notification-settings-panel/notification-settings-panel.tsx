import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@cognite/aura/components';
import { useState } from 'react';

import {
  DEFAULT_NOTIFICATION_SETTINGS,
  type NotificationFormat,
  type NotificationRule,
  type NotificationSettings,
} from '../../../domain/notification-settings.model';
import {
  loadNotificationSettings,
  saveNotificationSettings,
} from '../../../infrastructure/notification-settings.storage';

const FORMAT_OPTIONS: { value: NotificationFormat; label: string }[] = [
  { value: 'banner', label: 'In-app feed' },
  { value: 'badge', label: 'Badge only' },
  { value: 'toast', label: 'In-app feed' },
];

export function NotificationSettingsPanel() {
  const [settings, setSettings] = useState<NotificationSettings>(() => loadNotificationSettings());
  const [saved, setSaved] = useState(false);

  const updateRule = (id: NotificationRule['id'], patch: Partial<NotificationRule>) => {
    setSettings((prev) => ({
      ...prev,
      rules: prev.rules.map((rule) => (rule.id === id ? { ...rule, ...patch } : rule)),
    }));
    setSaved(false);
  };

  const handleSave = () => {
    saveNotificationSettings(settings);
    setSaved(true);
  };

  const handleReset = () => {
    setSettings(DEFAULT_NOTIFICATION_SETTINGS);
    saveNotificationSettings(DEFAULT_NOTIFICATION_SETTINGS);
    setSaved(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Automated notifications</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="m-0 text-sm text-muted-foreground">
          Configure when the app surfaces operational events. Settings are stored locally in this
          browser (Fusion host-sync does not persist notification prefs yet).
        </p>

        <div className="flex flex-col gap-3">
          {settings.rules.map((rule) => (
            <div
              key={rule.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{rule.label}</span>
                  <Badge variant={rule.enabled ? 'secondary' : 'gray'}>
                    {rule.enabled ? 'On' : 'Off'}
                  </Badge>
                </div>
                <p className="m-0 mt-1 text-xs text-muted-foreground">{rule.description}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={rule.enabled}
                    onChange={(event) => updateRule(rule.id, { enabled: event.target.checked })}
                  />
                  Enabled
                </label>
                <Select
                  value={rule.format}
                  onValueChange={(value) =>
                    updateRule(rule.id, { format: value as NotificationFormat })
                  }
                >
                  <SelectTrigger className="h-9 w-32" aria-label={`Format for ${rule.label}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FORMAT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={handleSave}>
            Save notification rules
          </Button>
          <Button type="button" variant="secondary" onClick={handleReset}>
            Reset to defaults
          </Button>
          {saved ? (
            <span className="self-center text-sm text-success-foreground">Saved</span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
