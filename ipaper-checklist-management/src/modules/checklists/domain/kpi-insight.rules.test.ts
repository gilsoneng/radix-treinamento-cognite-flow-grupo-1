import { describe, expect, it } from 'vitest';

import {
  buildChecklistKpiInsights,
  formatKpiDeltaLabel,
  resolveKpiTrafficLight,
} from './kpi-insight.rules';

describe(resolveKpiTrafficLight.name, () => {
  it('marks overdue as critical when value and delta are positive', () => {
    expect(resolveKpiTrafficLight('overdue', 2, 1)).toBe('critical');
  });

  it('marks done as good when delta is positive', () => {
    expect(resolveKpiTrafficLight('done', 10, 3)).toBe('good');
  });
});

describe(buildChecklistKpiInsights.name, () => {
  it('builds delta labels for each bucket', () => {
    const insights = buildChecklistKpiInsights(
      { todo: 5, ongoing: 1, done: 10, overdue: 2, notok: 1 },
      { todo: 8, ongoing: 0, done: 7, overdue: 0, notok: 0 },
      true,
    );
    expect(insights.todo.delta).toBe(-3);
    expect(insights.todo.deltaLabel).toBe(formatKpiDeltaLabel(-3));
    expect(insights.overdue.trafficLight).toBe('critical');
  });
});
