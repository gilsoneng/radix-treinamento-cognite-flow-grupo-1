/**
 * Phase 2 — CogniteAsset hierarchy + CogniteTimeSeries.
 * Space: flows_radix_space_group1
 * ExternalId pattern: IP.ASSET.ALINE / IP.ASSET.ALINE.ROUTE1.SECTION / IP.ASSET.ALINE.ROUTE1.7F.PUMP
 * Dual-source: cdf_cdm.CogniteAsset:v1 + cdf_core.Asset:v2
 */
import { assetId, tsId }               from '../lib/deterministic-id.mjs';
import { assetNode, tsNode }            from '../lib/dms-payload.mjs';
import { ALL_ROUTES, MEASUREMENT_DEFAULTS } from '../config.mjs';

// Excel routes 1-4: representative equipment catalogue
// (Routes 5-8 come from routes-extra.json — already in ALL_ROUTES)

// ─── Route 1 equipment (extracted from Excel, 99 equipments, using representative 25) ──
const ROUTE1_EQUIPMENTS = [
  { slug: 'diffuser-body',         name: 'Diffuser Body',              categoryCode: 'vessel',        measurements: ['TEMP-DEGF','LEVEL-PERCENT','DP-PSI'] },
  { slug: 'diffuser-scraper',      name: 'Diffuser Scraper Drive',      categoryCode: 'motor',         measurements: ['MOTOR-AMPS','IB-BEARING-TEMP','OB-BEARING-TEMP'] },
  { slug: 'north-filtrate-pump',   name: 'North Filtrate Pump',         categoryCode: 'rotating-pump', measurements: ['IB-BEARING-TEMP','OB-BEARING-TEMP','MOTOR-AMPS','FLOW-GPM'] },
  { slug: 'south-filtrate-pump',   name: 'South Filtrate Pump',         categoryCode: 'rotating-pump', measurements: ['IB-BEARING-TEMP','OB-BEARING-TEMP','MOTOR-AMPS','FLOW-GPM'] },
  { slug: 'chip-feeder-hp',        name: 'High Pressure Chip Feeder',   categoryCode: 'feeder',        measurements: ['MOTOR-TEMP','MOTOR-AMPS','GAP-MM'] },
  { slug: 'chip-feeder-lp',        name: 'Low Pressure Chip Feeder',    categoryCode: 'feeder',        measurements: ['MOTOR-TEMP','MOTOR-AMPS','GAP-MM'] },
  { slug: 'chip-meter',            name: 'Chip Meter Drive',            categoryCode: 'motor',         measurements: ['MOTOR-AMPS','IB-BEARING-TEMP','MOTOR-TEMP'] },
  { slug: 'top-separator',         name: 'Top Separator Pump',          categoryCode: 'rotating-pump', measurements: ['IB-BEARING-TEMP','MOTOR-AMPS','OUTLET-PRESSURE-PSI'] },
  { slug: 'knot-screen-drive',     name: 'Knot Screen Drive',           categoryCode: 'screen',        measurements: ['MOTOR-AMPS','IB-BEARING-TEMP'] },
  { slug: 'blow-tank',             name: 'Blow Tank',                   categoryCode: 'vessel',        measurements: ['TEMP-DEGF','LEVEL-PERCENT','STEAM-PRESSURE-PSI'] },
  { slug: 'blow-tank-agitator',    name: 'Blow Tank Agitator',          categoryCode: 'agitator',      measurements: ['MOTOR-AMPS','IB-VIBRATION-IPS'] },
  { slug: 'blow-heat-recovery-hx', name: 'Blow Heat Recovery HX',       categoryCode: 'heat-exchanger',measurements: ['INLET-TEMP-DEGF','OUTLET-TEMP-DEGF','DP-PSI'] },
  { slug: 'steaming-vessel',       name: 'Chip Steaming Vessel',        categoryCode: 'vessel',        measurements: ['TEMP-DEGF','STEAM-PRESSURE-PSI','LEVEL-PERCENT'] },
  { slug: 'digester-body',         name: 'Kraft Digester Body',         categoryCode: 'vessel',        measurements: ['TEMP-DEGF','LEVEL-PERCENT','STEAM-PRESSURE-PSI'] },
  { slug: 'cook-liquor-heater',    name: 'Cooking Liquor Heater',       categoryCode: 'heat-exchanger',measurements: ['INLET-TEMP-DEGF','OUTLET-TEMP-DEGF','STEAM-PRESSURE-PSI'] },
  { slug: 'extract-pump-a',        name: 'Hot Liquor Extract Pump A',   categoryCode: 'rotating-pump', measurements: ['IB-BEARING-TEMP','MOTOR-AMPS','CASING-TEMP'] },
  { slug: 'extract-pump-b',        name: 'Hot Liquor Extract Pump B',   categoryCode: 'rotating-pump', measurements: ['IB-BEARING-TEMP','MOTOR-AMPS','CASING-TEMP'] },
  { slug: 'hs-wash-pump-a',        name: 'Hot-Stage Wash Pump A',       categoryCode: 'rotating-pump', measurements: ['IB-BEARING-TEMP','MOTOR-AMPS','FLOW-GPM'] },
  { slug: 'hs-wash-pump-b',        name: 'Hot-Stage Wash Pump B',       categoryCode: 'rotating-pump', measurements: ['IB-BEARING-TEMP','MOTOR-AMPS','FLOW-GPM'] },
  { slug: 'brown-stock-pump-a',    name: 'Brown Stock Pump A',          categoryCode: 'rotating-pump', measurements: ['IB-BEARING-TEMP','MOTOR-AMPS','FLOW-GPM'] },
];

// ─── Route 2 equipment (chip feed) ──
const ROUTE2_EQUIPMENTS = [
  { slug: 'chip-silo-belt',      name: 'Chip Silo Belt Conveyor',    categoryCode: 'conveyor',      measurements: ['MOTOR-AMPS','IB-BEARING-TEMP'] },
  { slug: 'chip-screen-drive',   name: 'Chip Screen Drive',           categoryCode: 'motor',         measurements: ['MOTOR-AMPS','IB-BEARING-TEMP','MOTOR-TEMP'] },
  { slug: 'chip-feeder-hp',      name: 'HP Chip Feeder',              categoryCode: 'feeder',        measurements: ['MOTOR-TEMP','MOTOR-AMPS','GAP-MM'] },
  { slug: 'chip-feeder-lp',      name: 'LP Chip Feeder',              categoryCode: 'feeder',        measurements: ['MOTOR-TEMP','MOTOR-AMPS','GAP-MM'] },
  { slug: 'chip-meter',          name: 'Chip Meter',                  categoryCode: 'motor',         measurements: ['MOTOR-AMPS','MOTOR-TEMP'] },
  { slug: 'steaming-vessel',     name: 'Steaming Vessel',             categoryCode: 'vessel',        measurements: ['TEMP-DEGF','STEAM-PRESSURE-PSI','LEVEL-PERCENT'] },
  { slug: 'liquor-heater-a',     name: 'Liquor Heater A',             categoryCode: 'heat-exchanger',measurements: ['INLET-TEMP-DEGF','OUTLET-TEMP-DEGF'] },
  { slug: 'wl-pump-a',           name: 'White Liquor Pump A',         categoryCode: 'rotating-pump', measurements: ['IB-BEARING-TEMP','MOTOR-AMPS','FLOW-GPM'] },
  { slug: 'wl-pump-b',           name: 'White Liquor Pump B',         categoryCode: 'rotating-pump', measurements: ['IB-BEARING-TEMP','MOTOR-AMPS','FLOW-GPM'] },
];

// ─── Route 3 equipment (brown stock washing) ──
const ROUTE3_EQUIPMENTS = [
  { slug: 'washer-1-drive',    name: 'Brown Stock Washer #1 Drive',   categoryCode: 'motor',         measurements: ['MOTOR-AMPS','IB-BEARING-TEMP','MOTOR-TEMP'] },
  { slug: 'washer-2-drive',    name: 'Brown Stock Washer #2 Drive',   categoryCode: 'motor',         measurements: ['MOTOR-AMPS','IB-BEARING-TEMP','MOTOR-TEMP'] },
  { slug: 'washer-3-drive',    name: 'Brown Stock Washer #3 Drive',   categoryCode: 'motor',         measurements: ['MOTOR-AMPS','IB-BEARING-TEMP','MOTOR-TEMP'] },
  { slug: 'filtrate-pump-a',   name: 'Filtrate Pump A',               categoryCode: 'rotating-pump', measurements: ['IB-BEARING-TEMP','MOTOR-AMPS','FLOW-GPM'] },
  { slug: 'filtrate-pump-b',   name: 'Filtrate Pump B',               categoryCode: 'rotating-pump', measurements: ['IB-BEARING-TEMP','MOTOR-AMPS','FLOW-GPM'] },
  { slug: 'shower-pump',       name: 'Wash Shower Pump',              categoryCode: 'rotating-pump', measurements: ['MOTOR-AMPS','OUTLET-PRESSURE-PSI'] },
  { slug: 'dl-chest-agitator', name: 'Dilution Liquor Chest Agitator',categoryCode: 'agitator',      measurements: ['MOTOR-AMPS','IB-VIBRATION-IPS'] },
];

// ─── Route 4 equipment (screening) ──
const ROUTE4_EQUIPMENTS = [
  { slug: 'pressure-screen-a', name: 'Pressure Screen A',             categoryCode: 'screen',        measurements: ['MOTOR-AMPS','IB-BEARING-TEMP','INLET-PRESSURE-PSI'] },
  { slug: 'pressure-screen-b', name: 'Pressure Screen B',             categoryCode: 'screen',        measurements: ['MOTOR-AMPS','IB-BEARING-TEMP','INLET-PRESSURE-PSI'] },
  { slug: 'centri-cleaner-a',  name: 'Centrifugal Cleaner Stage A',   categoryCode: 'rotating-pump', measurements: ['MOTOR-AMPS','OUTLET-PRESSURE-PSI'] },
  { slug: 'reject-pump',       name: 'Screen Reject Pump',            categoryCode: 'rotating-pump', measurements: ['IB-BEARING-TEMP','MOTOR-AMPS','FLOW-GPM'] },
  { slug: 'mc-pump-a',         name: 'Medium Consistency Pump A',     categoryCode: 'rotating-pump', measurements: ['IB-BEARING-TEMP','MOTOR-AMPS','FLOW-GPM','OUTLET-PRESSURE-PSI'] },
  { slug: 'refiner-reject-a',  name: 'Reject Refiner A',              categoryCode: 'refiner',       measurements: ['MOTOR-AMPS','IB-BEARING-TEMP','GAP-MM'] },
];

const EQUIPMENT_BY_ROUTE = {
  route1: ROUTE1_EQUIPMENTS,
  route2: ROUTE2_EQUIPMENTS,
  route3: ROUTE3_EQUIPMENTS,
  route4: ROUTE4_EQUIPMENTS,
};

// Routes 5-8 come pre-defined in routes-extra.json
for (const route of ALL_ROUTES.filter(r => r.slug.match(/^route[5-8]$/))) {
  EQUIPMENT_BY_ROUTE[route.slug] = route.equipments ?? [];
}

/**
 * Generate all CogniteAsset nodes and CogniteTimeSeries nodes.
 * Returns { assets: [...], timeseries: [...], index: Map<equipSlug, assetExternalId> }
 */
export function generateAssets() {
  const assets = [];
  const timeseries = [];
  /** Map: `${routeSlug}.${equipSlug}` → assetExternalId */
  const index = new Map();

  // ── Root: A-Line
  const rootId = assetId('ALINE');
  assets.push(assetNode(rootId, {
    name: 'A-Line (Kraft Pulping)',
    description: 'Kraft pulp mill A-Line — full production train from chip feed to bleached pulp',
    tags: ['ip', 'a-line', 'kraft', 'seed'],
  }, null, rootId));

  // ── One sub-asset per route
  for (const route of ALL_ROUTES) {
    const routeId = assetId('ALINE', route.slug);
    assets.push(assetNode(routeId, {
      name: route.title,
      description: `Section ${route.section ?? '?'} — ${route.title}`,
      tags: ['ip', 'a-line', route.slug, 'seed'],
    }, rootId, rootId));

    // ── Equipment level
    const equipments = EQUIPMENT_BY_ROUTE[route.slug] ?? [];
    for (const eq of equipments) {
      const eqId = assetId('ALINE', route.slug, eq.slug);
      assets.push(assetNode(eqId, {
        name: eq.name,
        description: `${route.title} — ${eq.name} (${eq.categoryCode})`,
        tags: ['ip', 'a-line', route.slug, eq.categoryCode, 'seed'],
      }, routeId, rootId));

      index.set(`${route.slug}.${eq.slug}`, eqId);

      // ── Time series for each measurement
      for (const measSlug of (eq.measurements ?? [])) {
        const spec = MEASUREMENT_DEFAULTS[measSlug] ?? {};
        const tsExId = tsId('ALINE', route.slug, eq.slug, measSlug);
        timeseries.push(tsNode(tsExId, {
          name: `${eq.name} — ${measSlug.replace(/-/g, ' ')}`,
          description: `${spec.quantityType ?? measSlug} on ${eq.name} (${route.slug})`,
          type: 'numeric',
          isStep: false,
          sourceUnit: spec.unit ?? null,
          assetId: eqId,
        }));
      }
    }
  }

  return { assets, timeseries, index };
}
