#!/usr/bin/env node
/**
 * ─────────────────────────────────────────────────────────────────────────────
 * IP Checklist Seed Generator
 * ─────────────────────────────────────────────────────────────────────────────
 * Usage:
 *   node scripts/seed/index.mjs [options]
 *
 * Options:
 *   --dry-run            Generate JSON files, do NOT push to CDF
 *   --from YYYY-MM-DD    Start date (default: 2025-01-01)
 *   --to   YYYY-MM-DD    End date   (default: 2025-12-31)
 *   --routes r1,r2,...   Comma-separated route slugs (default: all)
 *   --help               Print this help
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { randomUUID } from 'node:crypto';

import { initLogger, log }                          from './lib/logger.mjs';
import { initOutput, writeJson, writeJsonObject }   from './lib/output.mjs';

import { generateClassification }                   from './generators/classification.mjs';
import { generateAssets }                            from './generators/assets.mjs';
import { generateTemplates }                         from './generators/templates.mjs';
import { generateChecklists }                        from './generators/checklists.mjs';
import { generateObservations }                      from './generators/observations.mjs';
import {
  generateChecklistKpis,
  generateEquipmentHealthIndex,
  generateRouteKpiSnapshots,
  generateMeasurementTrends,
} from './generators/kpis.mjs';
import { generateSeedManifest }                      from './generators/manifest.mjs';

// ─── CLI arg parsing ──────────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = { dryRun: false, from: '2025-01-01', to: '2025-12-31', routes: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run') { args.dryRun = true; continue; }
    if (a === '--from')    { args.from   = argv[++i]; continue; }
    if (a === '--to')      { args.to     = argv[++i]; continue; }
    if (a === '--routes')  { args.routes = argv[++i].split(',').map(r => r.trim()); continue; }
    if (a === '--help')    { printHelp(); process.exit(0); }
  }
  return args;
}

function printHelp() {
  console.log(`
IP Checklist Seed Generator
Usage: node scripts/seed/index.mjs [options]

  --dry-run            Write JSON files only, do NOT push to CDF
  --from YYYY-MM-DD    Start date (default: 2025-01-01)
  --to   YYYY-MM-DD    End date   (default: 2025-12-31)
  --routes r1,r2,...   Comma-separated route slugs
  --help               Print this help
`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const args  = parseArgs(process.argv);
  const runId = randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase();

  initLogger(runId);
  const runDir = initOutput(runId, args.from);

  log.info('=== IP Checklist Seed Generator ===', {
    runId, from: args.from, to: args.to, routes: args.routes ?? 'all', dryRun: args.dryRun,
  });

  const fromDate = new Date(args.from + 'T00:00:00Z');
  const toDate   = new Date(args.to   + 'T23:59:59Z');

  // ── Phase 1: Classification (SST lookups) ──────────────────────────────────
  log.info('[Phase 1] Generating SST classification lookups...');
  const classification = generateClassification();
  writeJson('01-seed-classification', classification);
  log.info(`  → ${classification.length} nodes`);

  // ── Phase 2: CogniteAsset + CogniteTimeSeries ──────────────────────────────
  log.info('[Phase 2] Generating CogniteAsset hierarchy + CogniteTimeSeries...');
  const { assets, timeseries, index: assetIndex } = generateAssets();

  // Build route-level root asset index (assetId for the route sub-asset)
  // assets.mjs creates IP.ASSET.ALINE.ROUTE1 etc.; map route.root → that ID
  const { ALL_ROUTES } = await import('./config.mjs');
  for (const route of ALL_ROUTES) {
    const routeAssetId = `IP.ASSET.ALINE.${route.slug.toUpperCase()}`;
    assetIndex.set(`${route.slug}.root`, routeAssetId);
  }

  writeJson('02-seed-assets', assets);
  writeJson('03-seed-timeseries', timeseries);
  log.info(`  → ${assets.length} assets, ${timeseries.length} time series`);

  // ── Phase 3: Templates + TemplateItems ────────────────────────────────────
  log.info('[Phase 3] Generating Template (v8) + TemplateItem (v7) + edges...');
  const { templates, templateItems, templateEdges, measSpecs, itemsByRoute } =
    generateTemplates(assetIndex);
  writeJson('04-seed-templates', templates);
  writeJson('05-seed-template-items', templateItems);
  writeJson('05b-seed-meas-specs', measSpecs);
  writeJson('05c-seed-template-edges', templateEdges);
  log.info(`  → ${templates.length} templates, ${templateItems.length} items, ${measSpecs.length} specs, ${templateEdges.length} edges`);

  // ── Phase 4: Checklists + Items + Measurements ───────────────────────────
  log.info('[Phase 4] Generating Checklist (v7) + ChecklistItem (v7) + MeasurementReading (v4) + edges...');
  const {
    checklists, checklistItems, checklistEdges,
    measurements, measEdges, measContextMap, ciContextMap,
  } = generateChecklists({ fromDate, toDate, routes: args.routes, assetIndex, itemsByRoute });

  writeJson('06-seed-checklists',       checklists);
  writeJson('07-seed-checklist-items',  checklistItems);
  writeJson('08-seed-measurements',     measurements);
  writeJson('08b-seed-checklist-edges', checklistEdges);
  writeJson('08c-seed-meas-edges',      measEdges);
  log.info(`  → ${checklists.length} checklists, ${checklistItems.length} items, ${measurements.length} readings`);
  log.info(`     ${checklistEdges.length} checklist-edges, ${measEdges.length} meas-edges`);

  // ── Phase 5a: Observations ────────────────────────────────────────────────
  log.info('[Phase 5a] Generating Observation (v5) + edges...');
  const { observations, obsEdges } = generateObservations(checklistItems, ciContextMap);
  writeJson('09-seed-observations',  observations);
  writeJson('09b-seed-obs-edges',    obsEdges);
  log.info(`  → ${observations.length} observations, ${obsEdges.length} edges`);

  // ── Phase 5b: KPIs ────────────────────────────────────────────────────────
  log.info('[Phase 5b] Generating KPIs...');

  // Build chkContextMap for KPIs
  const chkContextMap = new Map();
  for (const chk of checklists) {
    const parts = chk.externalId.replace('CKM_CHK_GR1_', '').split('-');
    const routeSlug = parts[0]?.toLowerCase() ?? '';
    const shiftCode = parts[parts.length - 1] ?? '';
    const dateStr   = parts.slice(1, parts.length - 1).join('-');
    chkContextMap.set(chk.externalId, {
      routeSlug, dateStr, shiftCode,
      startHour: chk.sources[0]?.properties?.startTime
        ? new Date(chk.sources[0].properties.startTime).getUTCHours()
        : 6,
    });
  }

  const checklistKpis = generateChecklistKpis(
    checklists, checklistItems, measurements, observations, chkContextMap,
  );
  const healthIndexes = generateEquipmentHealthIndex(assetIndex, checklistItems, measContextMap);
  const routeKpis     = generateRouteKpiSnapshots(checklistKpis);
  const measTrends    = generateMeasurementTrends(measurements, measContextMap, assetIndex);

  writeJson('10-seed-checklist-kpis', checklistKpis);
  writeJson('11-seed-health-indexes', healthIndexes);
  writeJson('12-seed-route-kpis',     routeKpis);
  writeJson('13-seed-meas-trends',    measTrends);
  log.info(`  → ${checklistKpis.length} kpis, ${healthIndexes.length} health, ${routeKpis.length} route snapshots, ${measTrends.length} trends`);

  // ── Phase 6: Manifest ─────────────────────────────────────────────────────
  log.info('[Phase 6] Writing seed manifest...');
  const stats = {
    classification:   classification.length,
    assets:           assets.length,
    timeseries:       timeseries.length,
    templates:        templates.length,
    templateItems:    templateItems.length,
    measSpecs:        measSpecs.length,
    templateEdges:    templateEdges.length,
    checklists:       checklists.length,
    checklistItems:   checklistItems.length,
    checklistEdges:   checklistEdges.length,
    measurements:     measurements.length,
    measEdges:        measEdges.length,
    observations:     observations.length,
    obsEdges:         obsEdges.length,
    checklistKpis:    checklistKpis.length,
    healthIndexes:    healthIndexes.length,
    routeKpis:        routeKpis.length,
    measurementTrends:measTrends.length,
  };

  const manifest = generateSeedManifest(runId, stats, {
    fromDate: args.from, toDate: args.to,
    routes: args.routes ?? 'all', dryRun: args.dryRun,
  });

  writeJson('00-seed-manifest', [manifest]);
  writeJsonObject('audit', { runId, generatedAt: new Date().toISOString(), stats, runDir });

  // ── Summary ───────────────────────────────────────────────────────────────
  const totalNodes = Object.values(stats).reduce((a, v) => a + v, 0);
  log.info('');
  log.info('=== Seed generation complete ===');
  log.info(`  Run ID : ${runId}`);
  log.info(`  Output : ${runDir}`);
  log.info(`  Total  : ${totalNodes.toLocaleString()} instances (nodes + edges)`);
  log.info('');
  log.info('  Breakdown:');
  for (const [k, v] of Object.entries(stats)) {
    log.info(`    ${k.padEnd(22)} ${String(v).padStart(8)}`);
  }

  if (args.dryRun) {
    log.info('');
    log.info('[DRY-RUN] JSON files written. CDF NOT modified.');
    log.info('To ingest: node scripts/seed/index.mjs --from 2025-01-01 --to 2025-12-31');
  }
}

main().catch(err => { console.error('[FATAL]', err); process.exit(1); });
