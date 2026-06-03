/**
 * Deterministic externalId generation.
 * Same inputs always produce the same externalId — idempotency guarantee.
 */

/** Slugify a string: lowercase, replace spaces/special chars with hyphens */
export function slugify(str) {
  return String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Uppercase slug (for CKM_ pattern) */
export function slugUp(str) {
  return String(str)
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ─── CogniteAsset / CogniteTimeSeries (flows_radix_space_group1) ──────────────

/** IP.ASSET.ALINE  /  IP.ASSET.ALINE.ROUTE1  /  IP.ASSET.ALINE.ROUTE1.7F.PUMP */
export function assetId(...parts) {
  return 'IP.ASSET.' + parts.map(p => slugUp(p)).join('.');
}

/** IP.TS.ALINE.ROUTE1.7F.PUMP.MOTOR-TEMP */
export function tsId(...parts) {
  return 'IP.TS.' + parts.map(p => slugUp(p)).join('.');
}

// ─── CKM_ pattern (flows_radix_checklist_group1) ─────────────────────────────

/** Generic CKM_{VIEW_CODE}_GR1_{...parts} */
function ckm(viewCode, ...parts) {
  return `CKM_${viewCode}_GR1_${parts.map(p => slugUp(p)).join('-')}`;
}

export const id = {
  equipmentCategory: code => ckm('EQCAT', code),
  shift:             code => ckm('SHIFT', code),
  observationCat:    code => ckm('OBSCAT', code),
  severity:          code => ckm('SEVLVL', code),
  measUnit:          code => ckm('MUNIT', code),
  itemType:          code => ckm('ITMTYP', code),

  template:  slug       => ckm('TMPL', slug),
  titem:     (tmpl, order, title) => ckm('TITEM', tmpl, String(order).padStart(4, '0'), slugify(title)),

  checklist: (route, date, shift) => ckm('CHK', route, date, shift),
  citem:     (route, date, shift, equipSlug, title) =>
    ckm('CITEM', route, date, shift, equipSlug, slugify(title)),
  measurement: (route, date, shift, equipSlug, title) =>
    ckm('MSRD', route, date, shift, equipSlug, slugify(title)),
  observation:   (route, date, shift, equipSlug, seq) =>
    ckm('OBS', route, date, shift, equipSlug, String(seq).padStart(3, '0')),

  checklistKpi: (route, date, shift) => ckm('CHKPI', route, date, shift),
  healthIndex:  (equipSlug)          => ckm('EQHI', equipSlug),
  routeKpi:     (route, label)       => ckm('RTKPI', route, label),
  measTrend:    (route, equipSlug, measSlug) => ckm('MTRND', route, equipSlug, measSlug),
  seedManifest: (runId)              => ckm('SEEDMF', runId),

  // Edges
  edgeTmplItem:  (tmplId, titemId)   => ckm('EDGE-TMPL-TITEM', tmplId, titemId),
  edgeChkItem:   (chkId, citemId)    => ckm('EDGE-CHK-CITEM', chkId, citemId),
  edgeCitemMsrd: (citemId, msrdId)   => ckm('EDGE-CITEM-MSRD', citemId, msrdId),
  edgeCitemObs:  (citemId, obsId)    => ckm('EDGE-CITEM-OBS', citemId, obsId),
};
