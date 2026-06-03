import { OBSERVATION_VIEW } from '../../../../core/dm/apm-dm.constants';
import { readViewProperties } from '../../../../core/dm/read-view-properties';
import type { OperationalAlert } from '../../domain/alert.model';
import type { InstanceNodeDto } from '../../../../core/sdk/cdf-client';

type ObservationPropertiesDto = {
  title?: unknown;
  description?: unknown;
  priority?: unknown;
  status?: unknown;
};

function readString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function isCriticalPriority(priority: string): boolean {
  const normalized = priority.toLowerCase();
  return normalized === 'urgent' || normalized === 'high';
}

export function toCriticalObservationAlert(node: InstanceNodeDto): OperationalAlert | null {
  const props = readViewProperties<ObservationPropertiesDto>(node, OBSERVATION_VIEW);
  if (!props || Object.keys(props).length === 0) {
    return null;
  }

  const priority = readString(props.priority);
  if (!isCriticalPriority(priority)) {
    return null;
  }

  const title = readString(props.title) || node.externalId;

  return {
    id: `obs-${node.externalId}`,
    kind: 'critical-observation',
    title,
    description: readString(props.description) || 'Critical observation from field inspection.',
    priority: priority.toLowerCase() === 'urgent' ? 'urgent' : 'high',
  };
}

export function toCriticalObservationAlerts(nodes: readonly InstanceNodeDto[]): OperationalAlert[] {
  const alerts: OperationalAlert[] = [];
  for (const node of nodes) {
    const alert = toCriticalObservationAlert(node);
    if (alert) {
      alerts.push(alert);
    }
  }
  return alerts;
}
