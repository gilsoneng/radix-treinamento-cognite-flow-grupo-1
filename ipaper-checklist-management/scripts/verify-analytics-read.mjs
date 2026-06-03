#!/usr/bin/env node
/**
 * Lists MeasurementTrend + RouteKpiSnapshot and prints mapped counts (same views as the app).
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { getCdfClient } from './cdf-mcp/create-client.mjs';

const APP_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const MEASUREMENT_TREND_VIEW = {
  space: 'ip_checklist_dm',
  externalId: 'MeasurementTrend',
  version: 'v1',
};

const ROUTE_KPI_SNAPSHOT_VIEW = {
  space: 'ip_checklist_dm',
  externalId: 'RouteKpiSnapshot',
  version: 'v1',
};

const CHECKLIST_ITEM_VIEW = {
  space: 'cdf_apm',
  externalId: 'ChecklistItem',
  version: 'v7',
};

function viewPropertyKey(view) {
  return `${view.externalId}/${view.version}`;
}

function readViewProperties(node, view) {
  if (!node.properties) {
    return {};
  }
  const nestedKey = viewPropertyKey(view);
  const spacesToTry = [...new Set([view.space, node.space, ...Object.keys(node.properties)])];
  for (const space of spacesToTry) {
    const spaceProps = node.properties[space];
    if (!spaceProps || typeof spaceProps !== 'object') continue;
    const nested = spaceProps[nestedKey];
    if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
      return nested;
    }
  }
  return {};
}

async function listView(client, view, instanceSpace) {
  const result = await client.instances.list({
    instanceType: 'node',
    sources: [{ source: { type: 'view', ...view } }],
    ...(instanceSpace
      ? { filter: { equals: { property: ['node', 'space'], value: instanceSpace } } }
      : {}),
    limit: 100,
  });
  return result.items ?? [];
}

async function main() {
  const client = getCdfClient();
  console.log('CDF project:', client.project);

  const checklistSpace = 'flows_radix_checklist_group1';

  for (const view of [MEASUREMENT_TREND_VIEW, ROUTE_KPI_SNAPSHOT_VIEW, CHECKLIST_ITEM_VIEW]) {
    const spaceFilter =
      view === CHECKLIST_ITEM_VIEW ? checklistSpace : checklistSpace;
    const items = await listView(client, view, spaceFilter);
    console.log(`\n=== ${view.externalId} (${items.length} on first page) ===`);
    if (items.length === 0) {
      console.log('  (no instances — check view deploy / ingest)');
      continue;
    }
    const sample = items[0];
    console.log('  sample space:', sample.space, 'externalId:', sample.externalId);
    console.log('  property keys:', sample.properties ? Object.keys(sample.properties) : '(none)');
    const props = readViewProperties(sample, view);
    console.log('  mapped props:', JSON.stringify(props, null, 2).slice(0, 400));
    const withValues = items.filter((n) => {
      const p = readViewProperties(n, view);
      if (view.externalId === 'MeasurementTrend') {
        return typeof p.lastValue === 'number';
      }
      if (view.externalId === 'RouteKpiSnapshot') {
        return typeof p.periodLabel === 'string';
      }
      return typeof p.status === 'string' || typeof p.title === 'string';
    });
    console.log('  items with mapped values on page:', withValues.length, '/', items.length);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
