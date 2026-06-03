#!/usr/bin/env node
/**
 * ─────────────────────────────────────────────────────────────────────────────
 * IP Checklist Seed Cleaner
 * ─────────────────────────────────────────────────────────────────────────────
 * Deletes ALL instances (nodes + edges) that were ingested by seed/ingest.mjs.
 * Reads the generated JSON files from the latest (or specified) run to know
 * exactly what to delete — never touches data outside those externalIds.
 *
 * Usage:
 *   node scripts/seed/clean.mjs                  (deletes latest run)
 *   node scripts/seed/clean.mjs --run <runDir>   (deletes specific run)
 *   node scripts/seed/clean.mjs --dry-run        (list only, no deletion)
 *   node scripts/seed/clean.mjs --space <space>  (delete all nodes in space)
 *
 * Order (reverse dependency order):
 *   1. KPI nodes (ChecklistKpi, EquipmentHealthIndex, RouteKpiSnapshot, MeasurementTrend)
 *   2. SeedManifest
 *   3. Edges (obs, meas, checklist)
 *   4. Observation nodes
 *   5. MeasurementReading nodes
 *   6. ChecklistItem nodes
 *   7. Checklist nodes
 *   8. TemplateItem + Template + specs + edges
 *   9. CogniteTimeSeries + CogniteAsset
 *  10. SST classification nodes
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, dirname }                    from 'node:path';
import { fileURLToPath }                       from 'node:url';

import { getCdfClient }    from '../cdf-mcp/create-client.mjs';
import { initLogger, log } from './lib/logger.mjs';

const APP_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const BATCH    = 1000;
const MAX_CONC = 5;

// ─── CLI ─────────────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = { run: 'latest', dryRun: false, space: null, only: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--run')     { args.run    = argv[++i]; continue; }
    if (a === '--dry-run') { args.dryRun = true;      continue; }
    if (a === '--space')   { args.space  = argv[++i]; continue; }
    if (a === '--only')    { args.only   = argv[++i]; continue; }
  }
  return args;
}

/**
 * Groups matching the same groups as ingest.mjs.
 * --only ip      → ip-schema + kpis (everything from ip_checklist_dm views)
 * --only kpis    → KPI nodes + manifest only
 * --only ip-schema → SST classification only
 */
const ONLY_FILES = {
  'ip-schema': ['01-seed-classification.json'],
  kpis: [
    '00-seed-manifest.json',
    '13-seed-meas-trends.json',
    '12-seed-route-kpis.json',
    '11-seed-health-indexes.json',
    '10-seed-checklist-kpis.json',
  ],
  ip: [
    '00-seed-manifest.json',
    '13-seed-meas-trends.json',
    '12-seed-route-kpis.json',
    '11-seed-health-indexes.json',
    '10-seed-checklist-kpis.json',
    '01-seed-classification.json',
  ],
  'apm-checklists': [
    '09b-seed-obs-edges.json',
    '09-seed-observations.json',
    '08c-seed-meas-edges.json',
    '08-seed-measurements.json',
    '08b-seed-checklist-edges.json',
    '07-seed-checklist-items.json',
    '06-seed-checklists.json',
  ],
  'apm-schema': [
    '05c-seed-template-edges.json',
    '05b-seed-meas-specs.json',
    '05-seed-template-items.json',
    '04-seed-templates.json',
  ],
  assets: ['03-seed-timeseries.json', '02-seed-assets.json'],
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

function loadIds(runDir, filename) {
  try {
    const items = JSON.parse(readFileSync(resolve(runDir, filename), 'utf8'));
    return items.map(i => ({ instanceType: i.instanceType, space: i.space, externalId: i.externalId }));
  } catch {
    return [];
  }
}

// ─── Batch deleter ────────────────────────────────────────────────────────────

async function deleteBatched(client, refs, label, dryRun) {
  if (!refs.length) { log.info(`  [SKIP] ${label} — 0 items`); return 0; }
  log.info(`  [→] Deleting ${label}: ${refs.length.toLocaleString()} instances...`);
  if (dryRun) { log.info(`      [DRY-RUN] skipped`); return refs.length; }

  let deleted = 0;
  const chunks = [];
  for (let i = 0; i < refs.length; i += BATCH) chunks.push(refs.slice(i, i + BATCH));

  for (let i = 0; i < chunks.length; i += MAX_CONC) {
    const window = chunks.slice(i, i + MAX_CONC);
    await Promise.all(window.map(async chunk => {
      try {
        await client.instances.delete(chunk);
        deleted += chunk.length;
      } catch (err) {
        // 404 = already deleted — treat as OK
        if (!err.message?.includes('404')) {
          log.warn(`  Warning: ${err.message}`);
        }
        deleted += chunk.length;
      }
    }));
  }
  log.info(`      done (${deleted.toLocaleString()} deleted)`);
  return deleted;
}

// ─── Space-level delete (all nodes in a space) ───────────────────────────────

async function deleteAllInSpace(client, space, dryRun) {
  log.info(`[Space purge] Listing all nodes in space '${space}'...`);
  let cursor;
  let total = 0;
  do {
    const res = await client.instances.list({
      filter: { equals: { property: ['node', 'space'], value: space } },
      instanceType: 'node',
      limit: 1000,
      cursor,
    });
    const refs = res.items.map(n => ({ instanceType: 'node', space: n.space, externalId: n.externalId }));
    if (refs.length) {
      await deleteBatched(client, refs, `nodes in ${space}`, dryRun);
      total += refs.length;
    }
    cursor = res.nextCursor;
  } while (cursor);

  // Edges
  cursor = undefined;
  do {
    const res = await client.instances.list({
      filter: { equals: { property: ['edge', 'space'], value: space } },
      instanceType: 'edge',
      limit: 1000,
      cursor,
    });
    const refs = res.items.map(e => ({ instanceType: 'edge', space: e.space, externalId: e.externalId }));
    if (refs.length) {
      await deleteBatched(client, refs, `edges in ${space}`, dryRun);
      total += refs.length;
    }
    cursor = res.nextCursor;
  } while (cursor);

  log.info(`  Space '${space}': ${total.toLocaleString()} instances deleted.`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs(process.argv);
  initLogger('clean');

  log.info('=== IP Checklist Seed Cleaner ===', { dryRun: args.dryRun });

  const client = getCdfClient();

  // ── Space-level purge mode ────────────────────────────────────────────────
  if (args.space) {
    await deleteAllInSpace(client, args.space, args.dryRun);
    return;
  }

  // ── Run-based precise delete (default) ───────────────────────────────────
  const runDir = resolveRunDir(args.run);
  log.info(`Run dir: ${runDir}`, { only: args.only ?? 'all' });

  // All steps in reverse dependency order
  const ALL_STEPS = [
    { file: '00-seed-manifest.json',         label: 'SeedManifest' },
    { file: '13-seed-meas-trends.json',      label: 'MeasurementTrend' },
    { file: '12-seed-route-kpis.json',       label: 'RouteKpiSnapshot' },
    { file: '11-seed-health-indexes.json',   label: 'EquipmentHealthIndex' },
    { file: '10-seed-checklist-kpis.json',   label: 'ChecklistKpi' },
    { file: '09b-seed-obs-edges.json',       label: 'ChecklistItem→Observation edges' },
    { file: '09-seed-observations.json',     label: 'Observation' },
    { file: '08c-seed-meas-edges.json',      label: 'ChecklistItem→Measurement edges' },
    { file: '08-seed-measurements.json',     label: 'MeasurementReading' },
    { file: '08b-seed-checklist-edges.json', label: 'Checklist→ChecklistItem edges' },
    { file: '07-seed-checklist-items.json',  label: 'ChecklistItem' },
    { file: '06-seed-checklists.json',       label: 'Checklist' },
    { file: '05c-seed-template-edges.json',  label: 'Template→TemplateItem edges' },
    { file: '05b-seed-meas-specs.json',      label: 'MeasurementReading specs' },
    { file: '05-seed-template-items.json',   label: 'TemplateItem' },
    { file: '04-seed-templates.json',        label: 'Template' },
    { file: '03-seed-timeseries.json',       label: 'CogniteTimeSeries' },
    { file: '02-seed-assets.json',           label: 'CogniteAsset' },
    { file: '01-seed-classification.json',   label: 'SST Classification' },
  ];

  // Filter by --only group if specified
  let steps = ALL_STEPS;
  if (args.only && args.only !== 'all') {
    const allowedFiles = ONLY_FILES[args.only];
    if (!allowedFiles) {
      log.error(`Unknown --only group: "${args.only}". Valid: ${Object.keys(ONLY_FILES).join(' | ')} | all`);
      process.exit(1);
    }
    steps = ALL_STEPS.filter(s => allowedFiles.includes(s.file));
    log.info(`Filtering to group '${args.only}': ${steps.length} file(s)`);
  }

  let total = 0;
  for (const { file, label } of steps) {
    const refs = loadIds(runDir, file);
    total += await deleteBatched(client, refs, label, args.dryRun);
  }

  log.info('');
  log.info('=== Cleanup complete ===');
  log.info(`  Total deleted: ${total.toLocaleString()} instances`);
  if (args.dryRun) {
    log.info('  [DRY-RUN] — CDF NOT modified.');
  }
}

main().catch(err => { console.error('[FATAL]', err); process.exit(1); });
