#!/usr/bin/env node
/**
 * ─────────────────────────────────────────────────────────────────────────────
 * IP Checklist Seed Ingester
 * ─────────────────────────────────────────────────────────────────────────────
 * Reads generated JSON files from docs/Seed/generated/<runDir>/
 * and upserts all instances to CDF in the correct dependency order.
 *
 * Usage:
 *   node scripts/seed/ingest.mjs --run <runDir>     (e.g. run-2025-01-01-8A7C5246)
 *   node scripts/seed/ingest.mjs --run latest       (uses the most recent run)
 *   node scripts/seed/ingest.mjs --run latest --dry-run
 *
 * Dependency order (nodes before edges, schema before instances):
 *   1.  CogniteAsset              (flows_radix_space_group1)
 *   2.  CogniteTimeSeries         (flows_radix_space_group1)
 *   3.  SST classification nodes  (flows_radix_checklist_group1)
 *   4.  Template nodes            (flows_radix_checklist_group1)
 *   5.  TemplateItem nodes
 *   6.  MeasurementReading specs
 *   7.  Template→TemplateItem edges
 *   8.  Checklist nodes
 *   9.  ChecklistItem nodes
 *   10. Checklist→ChecklistItem edges
 *   11. MeasurementReading reading nodes
 *   12. ChecklistItem→MeasurementReading edges
 *   13. Observation nodes
 *   14. ChecklistItem→Observation edges
 *   15. KPI nodes (ChecklistKpi, HealthIndex, RouteKpi, MeasTrend)
 *   16. SeedManifest node
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, dirname }          from 'node:path';
import { fileURLToPath }             from 'node:url';

import { getCdfClient }     from '../cdf-mcp/create-client.mjs';
import { initLogger, log }  from './lib/logger.mjs';
import { BatchUpserter }    from './lib/batch-upserter.mjs';

const APP_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

// ─── CLI ─────────────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = { run: 'latest', dryRun: false, only: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--run')     { args.run    = argv[++i]; continue; }
    if (a === '--dry-run') { args.dryRun = true; continue; }
    if (a === '--only')    { args.only   = argv[++i]; continue; }
  }
  return args;
}

/**
 * Step groups — pass --only <group> to run only those steps.
 * Groups: assets | schema | checklists | kpis | all (default)
 */
const STEP_GROUPS = {
  /** CogniteAsset v1 + CogniteTimeSeries v1  (cdf_cdm — always deployed) */
  assets: ['02-seed-assets.json', '03-seed-timeseries.json'],

  /** APM Template v8 + TemplateItem v7 + MeasurementReading specs + edges (cdf_apm — globally deployed) */
  'apm-schema': [
    '04-seed-templates.json',
    '05-seed-template-items.json',
    '05b-seed-meas-specs.json',
    '05c-seed-template-edges.json',
  ],

  /** APM Checklist v7 + ChecklistItem v7 + MeasurementReading v4 + Observation v5 + edges */
  'apm-checklists': [
    '06-seed-checklists.json',
    '07-seed-checklist-items.json',
    '08b-seed-checklist-edges.json',
    '08-seed-measurements.json',
    '08c-seed-meas-edges.json',
    '09-seed-observations.json',
    '09b-seed-obs-edges.json',
  ],

  /** ip_checklist_dm SST lookups — requires cdf-tk deploy first */
  'ip-schema': ['01-seed-classification.json'],

  /** ip_checklist_dm KPI nodes — requires ip-schema + apm-checklists first */
  kpis: [
    '10-seed-checklist-kpis.json',
    '11-seed-health-indexes.json',
    '12-seed-route-kpis.json',
    '13-seed-meas-trends.json',
    '00-seed-manifest.json',
  ],

  /** Everything in correct dependency order */
  all: null,
};

function resolveRunDir(run) {
  const base = resolve(APP_ROOT, 'docs/Seed/generated');
  if (run === 'latest') {
    const dirs = readdirSync(base, { withFileTypes: true })
      .filter(d => d.isDirectory() && d.name.startsWith('run-'))
      .map(d => ({ name: d.name, mtime: statSync(resolve(base, d.name)).mtimeMs }))
      .sort((a, b) => b.mtime - a.mtime);
    if (!dirs.length) throw new Error('No run dirs found in docs/Seed/generated/');
    return resolve(base, dirs[0].name);
  }
  return resolve(base, run);
}

function loadJson(runDir, filename) {
  const path = resolve(runDir, filename);
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    log.warn(`  File not found or empty: ${filename}`);
    return [];
  }
}

// ─── Ingest pipeline ─────────────────────────────────────────────────────────

async function main() {
  const args   = parseArgs(process.argv);
  const runDir = resolveRunDir(args.run);

  initLogger('ingest');
  log.info('=== IP Checklist Seed Ingester ===', { run: args.run, runDir, dryRun: args.dryRun, only: args.only ?? 'all' });

  const client  = getCdfClient();
  const upsert  = new BatchUpserter(client, { batchSize: 1000, maxConcurrency: 5, dryRun: args.dryRun });

  async function ingestFile(filename, label) {
    const items = loadJson(runDir, filename);
    if (!items.length) { log.info(`  [SKIP] ${label} — empty`); return; }
    log.info(`  [→] ${label}: ${items.length.toLocaleString()} instances...`);
    await upsert.upsert(items);
    log.info(`      done — ${upsert.summary().errors === 0 ? 'OK' : 'ERRORS!'}`);
  }

  // Determine which files to process
  const only = args.only;
  let filesToRun;
  if (!only || only === 'all') {
    filesToRun = [
      ...STEP_GROUPS.assets,
      ...STEP_GROUPS['apm-schema'],
      ...STEP_GROUPS['apm-checklists'],
      ...STEP_GROUPS['ip-schema'],
      ...STEP_GROUPS.kpis,
    ];
  } else if (only === 'all') {
    filesToRun = []; // handled above
  } else if (STEP_GROUPS[only]) {
    filesToRun = STEP_GROUPS[only];
  } else {
    log.error(`Unknown --only group: "${only}". Valid: assets | apm-schema | apm-checklists | ip-schema | kpis | all`);
    process.exit(1);
  }

  const LABELS = {
    '02-seed-assets.json':            'CogniteAsset (v1)',
    '03-seed-timeseries.json':        'CogniteTimeSeries (v1)',
    '01-seed-classification.json':    'SST Classification',
    '04-seed-templates.json':         'Template (v8)',
    '05-seed-template-items.json':    'TemplateItem (v7)',
    '05b-seed-meas-specs.json':       'MeasurementReading specs',
    '05c-seed-template-edges.json':   'Template→TemplateItem edges',
    '06-seed-checklists.json':        'Checklist (v7)',
    '07-seed-checklist-items.json':   'ChecklistItem (v7)',
    '08b-seed-checklist-edges.json':  'Checklist→ChecklistItem edges',
    '08-seed-measurements.json':      'MeasurementReading (v4)',
    '08c-seed-meas-edges.json':       'ChecklistItem→Measurement edges',
    '09-seed-observations.json':      'Observation (v5)',
    '09b-seed-obs-edges.json':        'ChecklistItem→Observation edges',
    '10-seed-checklist-kpis.json':    'ChecklistKpi',
    '11-seed-health-indexes.json':    'EquipmentHealthIndex',
    '12-seed-route-kpis.json':        'RouteKpiSnapshot',
    '13-seed-meas-trends.json':       'MeasurementTrend',
    '00-seed-manifest.json':          'SeedManifest',
  };

  try {
    for (const file of filesToRun) {
      await ingestFile(file, LABELS[file] ?? file);
    }
  } catch (err) {
    log.error('[INGEST FAILED]', { message: err.message });
    process.exit(1);
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  const s = upsert.summary();
  log.info('');
  log.info('=== Ingestion complete ===');
  log.info(`  Nodes:   ${s.nodes.toLocaleString()}`);
  log.info(`  Edges:   ${s.edges.toLocaleString()}`);
  log.info(`  Batches: ${s.batches}`);
  log.info(`  Errors:  ${s.errors}`);

  if (s.errors > 0) {
    log.error('There were errors — check logs above.');
    process.exit(1);
  }

  if (args.dryRun) {
    log.info('');
    log.info('[DRY-RUN] — CDF NOT modified. Remove --dry-run to ingest for real.');
  } else {
    log.info('');
    log.info('Seed successfully ingested to CDF radix-dev!');
    log.info('Validate with MCP: cdf_list_instances → Template, Checklist, Observation');
  }
}

main().catch(err => { console.error('[FATAL]', err); process.exit(1); });
