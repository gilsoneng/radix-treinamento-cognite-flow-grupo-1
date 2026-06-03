/**
 * Phase 6 — SeedManifest (audit + provenance node)
 * One node per run, stored in ip_checklist_dm space.
 */
import { id }    from '../lib/deterministic-id.mjs';
import { dmNode } from '../lib/dms-payload.mjs';

/**
 * @param {string} runId
 * @param {object} stats - { assets, timeseries, classification, templates, templateItems,
 *                           checklists, checklistItems, measurements, observations,
 *                           checklistKpis, healthIndexes, routeKpis, measurementTrends }
 * @param {object} opts  - { fromDate, toDate, routes, dryRun }
 */
export function generateSeedManifest(runId, stats, opts) {
  const manifestId = id.seedManifest(runId);

  const totalNodes = Object.values(stats).reduce((a, v) => a + v, 0);

  return dmNode(manifestId, 'SeedManifest', {
    runId,
    executedAt:   new Date().toISOString(),
    scriptVersion: '1.0.0',
    sourceFile:   'A Line OEC Routes 2 (1).xlsx',
    routeSlug:    opts.routes ?? 'all',
    periodStart:  opts.fromDate,
    periodEnd:    opts.toDate,
    isDryRun:     opts.dryRun ?? false,
    totalNodes,
    mapping:      stats,
  });
}
