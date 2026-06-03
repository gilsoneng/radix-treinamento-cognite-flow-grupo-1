const STORAGE_KEY = 'ip-notification-dismissed-v1';

function readIds(): string[] {
  if (typeof sessionStorage === 'undefined') {
    return [];
  }
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((id): id is string => typeof id === 'string');
  } catch {
    return [];
  }
}

export function loadDismissedAlertIds(): Set<string> {
  return new Set(readIds());
}

function writeIds(ids: Iterable<string>): void {
  if (typeof sessionStorage === 'undefined') {
    return;
  }
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}

export function saveDismissedAlertIds(ids: Set<string>): void {
  writeIds(ids);
}

export function dismissAlertIds(ids: Iterable<string>): Set<string> {
  const next = loadDismissedAlertIds();
  for (const id of ids) {
    next.add(id);
  }
  saveDismissedAlertIds(next);
  return next;
}
