/**
 * Phase 5b — KPI generators:
 *   ChecklistKpi      — per checklist (NOK%, N/A%, completion time, obs count)
 *   EquipmentHealthIndex — per equipment (rolling 30-day health score)
 *   RouteKpiSnapshot  — per route per month (completion rate, NOK rate, MTTR)
 *   MeasurementTrend  — per equipment+measurement (last 30 avg, max, trend direction)
 */
import { id }          from '../lib/deterministic-id.mjs';
import { dmNode, rel, SPACES } from '../lib/dms-payload.mjs';
import { round }       from '../rules.mjs';

// ─── ChecklistKpi ─────────────────────────────────────────────────────────────

/**
 * @param {Array} checklists
 * @param {Array} checklistItems
 * @param {Array} measurements   - MeasurementReading nodes
 * @param {Array} observations
 * @param {Map}   chkContextMap
 */
export function generateChecklistKpis(checklists, checklistItems, measurements, observations, chkContextMap) {
  const kpis = [];

  // Build lookup: chkId → items
  const itemsByChk = new Map();
  for (const ci of checklistItems) {
    // CKM_CITEM_GR1_ROUTE1-2025-01-01-D-EQUIP-... → chkId = CKM_CHK_GR1_ROUTE1-2025-01-01-D
    const ciParts = ci.externalId.replace('CKM_CITEM_GR1_', '').split('-');
    const chkId   = `CKM_CHK_GR1_${ciParts.slice(0, 5).join('-')}`; // ROUTE + YYYY + MM + DD + SHIFT
    if (!itemsByChk.has(chkId)) itemsByChk.set(chkId, []);
    itemsByChk.get(chkId).push(ci.sources[0]?.properties ?? {});
  }

  // Build: chkId → obs count
  const obsByChk = new Map();
  for (const obs of observations) {
    const desc = obs.sources[0]?.properties?.description ?? '';
    // Description contains routeSlug+dateStr+shiftCode — extract to find chkId
    // Simplified: count observations globally per checklist pattern
    obsByChk.set(obs.externalId, 1);
  }

  // Count NOK from measurements (stringReading='Not OK' or numericReading > max)
  const nokByChk = new Map();
  for (const msrd of measurements) {
    const p = msrd.sources[0]?.properties;
    if (!p) continue;
    const isNok = p.stringReading === 'Not OK' || (p.numericReading != null && p.max != null && p.numericReading > p.max);
    if (!isNok) continue;
    const mParts = msrd.externalId.replace('CKM_MSRD_GR1_', '').split('-');
    const chkId  = `CKM_CHK_GR1_${mParts.slice(0, 5).join('-')}`; // ROUTE + YYYY + MM + DD + SHIFT    nokByChk.set(chkId, (nokByChk.get(chkId) ?? 0) + 1);
  }

  for (const chk of checklists) {
    const props = chk.sources[0]?.properties;
    if (props?.status !== 'completed') continue;

    const ctx = chkContextMap.get(chk.externalId);
    if (!ctx) continue;

    const items   = itemsByChk.get(chk.externalId) ?? [];
    const total   = items.length;
    if (total === 0) continue;

    const nokCount  = nokByChk.get(chk.externalId) ?? 0;
    const obsCount  = observations.filter(o =>
      o.sources[0]?.properties?.description?.includes(ctx.routeSlug) &&
      o.sources[0]?.properties?.description?.includes(ctx.dateStr)
    ).length;

    const okCount  = total - nokCount;
    const naCount  = 0;
    const nokRate = round((nokCount / total) * 100, 1);
    const naRate  = round((naCount  / total) * 100, 1);
    const okRate  = round((okCount  / total) * 100, 1);

    const startMs = props.startTime ? new Date(props.startTime).getTime() : 0;
    const endMs   = props.endTime   ? new Date(props.endTime).getTime()   : startMs + 3600000;
    const durationMin = round((endMs - startMs) / 60000, 0);

    const kpiId = id.checklistKpi(ctx.routeSlug, ctx.dateStr, ctx.shiftCode);
    kpis.push(dmNode(kpiId, 'ChecklistKpi', {
      checklistRef:     rel(SPACES.checklist, chk.externalId),
      totalItems:       total,
      okItems:          okCount,
      nokItems:         nokCount,
      naItems:          naCount,
      completedItems:   okCount + nokCount + naCount,
      completionPercent: round(((okCount + nokCount + naCount) / total) * 100, 1),
      nokRate:          round(nokCount / total, 4),    // ratio 0.0–1.0
      openObservations: obsCount,
      durationMinutes:  durationMin,
    }));
  }

  return kpis;
}

// ─── EquipmentHealthIndex ─────────────────────────────────────────────────────

/**
 * @param {Map}   assetIndex     - Map<`${routeSlug}.${equipSlug}`, assetExternalId>
 * @param {Array} checklistItems
 * @param {Map}   measContextMap - Map<msrdId, { routeSlug, equipSlug, measSlug }>
 */
export function generateEquipmentHealthIndex(assetIndex, checklistItems, measContextMap) {
  // Aggregate NOK stats per equipSlug (cross-route)
  // equipSlug → { total, nok, assetExId } — last assetExId wins (same equip across routes)
  const equipStats = new Map();

  for (const [key, assetExId] of assetIndex) {
    const parts = key.split('.');
    if (parts.length !== 2) continue; // skip root entries like `${route}.root`
    const [routeSlug, equipSlug] = parts;
    if (equipSlug === 'root') continue;

    const equipItems = checklistItems.filter(ci =>
      ci.externalId.includes(routeSlug.toUpperCase()) &&
      ci.externalId.includes(equipSlug.toUpperCase()),
    );

    const total  = equipItems.length;
    const nok    = equipItems.filter(ci => ci.sources[0]?.properties?.result === 'NotOk').length;

    if (!equipStats.has(equipSlug)) {
      equipStats.set(equipSlug, { total: 0, nok: 0, assetExId });
    }
    const s = equipStats.get(equipSlug);
    s.total += total;
    s.nok   += nok;
  }

  const nodes = [];
  for (const [equipSlug, { total, nok, assetExId }] of equipStats) {
    const nokRate     = total > 0 ? round((nok / total) * 100, 1) : 0;
    const healthScore = round(Math.max(0, 100 - 2 * nokRate), 1);

    nodes.push(dmNode(id.healthIndex(equipSlug), 'EquipmentHealthIndex', {
      assetRef:         rel(SPACES.assets, assetExId),
      healthScore,
      nokRate30d:       round(nokRate / 100, 4),
      lastCalculatedAt: new Date().toISOString(),
    }));
  }

  return nodes;
}

// ─── RouteKpiSnapshot ─────────────────────────────────────────────────────────

/**
 * Monthly KPI snapshot per route.
 * @param {Array} checklistKpis - generated ChecklistKpi nodes
 */
export function generateRouteKpiSnapshots(checklistKpis) {
  const snapshots = [];

  // Group by routeSlug + month — derive both from the externalId
  // Format: CKM_CHKPI_GR1_{ROUTE}-{YYYY-MM-DD}-{SHIFT}
  const monthly = new Map(); // `${routeSlug}|${YYYY-MM}` → [properties]
  for (const kpi of checklistKpis) {
    const p = kpi.sources[0]?.properties;
    if (!p) continue;
    // Parse route and date from externalId
    const raw = kpi.externalId.replace('CKM_CHKPI_GR1_', ''); // e.g. ROUTE1-2025-01-15-D
    const dateMatch = raw.match(/^(.+?)-(\d{4}-\d{2}-\d{2})-[DAN]$/i);
    if (!dateMatch) continue;
    const routeSlug = dateMatch[1].toLowerCase();
    const month     = dateMatch[2].slice(0, 7); // YYYY-MM
    const key = `${routeSlug}|${month}`;
    if (!monthly.has(key)) monthly.set(key, []);
    monthly.get(key).push(p);
  }

  for (const [key, kpiList] of monthly) {
    const [routeSlug, month] = key.split('|');
    if (!routeSlug || !month) continue;

    const totalChecklists = kpiList.length;
    // nokRate is stored as ratio (0.0–1.0)
    const avgNokRate   = round(kpiList.reduce((a, k) => a + (k.nokRate ?? 0), 0) / totalChecklists, 4);
    const avgDur       = round(kpiList.reduce((a, k) => a + (k.durationMinutes ?? 0), 0) / totalChecklists, 0);
    const totalObs     = kpiList.reduce((a, k) => a + (k.openObservations ?? 0), 0);

    const snapId = id.routeKpi(routeSlug, month);
    snapshots.push(dmNode(snapId, 'RouteKpiSnapshot', {
      periodLabel:        month,
      periodType:         'monthly',
      totalChecklists,
      avgNokRate,
      avgDurationMinutes: avgDur,
      totalObservations:  totalObs,
    }));
  }

  return snapshots;
}

// ─── MeasurementTrend ─────────────────────────────────────────────────────────

/**
 * 30-day rolling measurement trend per equipment+measurement.
 * @param {Array} measurements   - generated APMMeasurementReading nodes
 * @param {Map}   measContextMap - Map<msrdId, { routeSlug, equipSlug, measSlug }>
 * @param {Map}   assetIndex     - Map<`${routeSlug}.${equipSlug}`, assetExternalId>
 */
export function generateMeasurementTrends(measurements, measContextMap, assetIndex) {
  const trends = [];
  const groups = new Map(); // `${routeSlug}.${equipSlug}.${measSlug}` → [values]

  for (const msrd of measurements) {
    const p = msrd.sources[0]?.properties;
    if (p?.numericReading == null) continue;

    const ctx = measContextMap.get(msrd.externalId);
    if (!ctx) continue;

    const key = `${ctx.routeSlug}.${ctx.equipSlug}.${ctx.measSlug}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(p.numericReading);
  }

  for (const [key, values] of groups) {
    if (values.length < 2) continue;
    const [routeSlug, equipSlug, measSlug] = key.split('.');
    const assetExId = assetIndex.get(`${routeSlug}.${equipSlug}`);
    if (!assetExId) continue;

    const avg  = round(values.reduce((a, v) => a + v, 0) / values.length, 2);
    const max  = round(Math.max(...values), 2);
    const last = values[values.length - 1];
    const prev = values[Math.max(0, values.length - 8)]; // 7 readings ago

    const trendId = id.measTrend(routeSlug, equipSlug, measSlug);
    trends.push(dmNode(trendId, 'MeasurementTrend', {
      assetRef:         rel(SPACES.assets, assetExId),
      lastValue:        last,
      avg30dValue:      avg,
      maxValue:         max,
      trendSlope:       round((last - prev) / Math.max(values.length - 1, 1), 4),
      lastCalculatedAt: new Date().toISOString(),
    }));
  }

  return trends;
}
