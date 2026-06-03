/**
 * Phase 3 — Template (v8) + TemplateItem (v7) nodes + edges.
 * One template per route, items derived from inspection catalogue.
 *
 * APM schema (datamodel.md):
 *   Template v8    → title, description, status, assignedTo, rootLocation, visibility, isArchived
 *   TemplateItem v7 → title, description, order, asset, visibility, isArchived
 *   Relationship: Template→TemplateItem via multi_edge (Template.templateItems)
 *
 * For measurement templates we also create a linked MeasurementReading v4 node per item
 * that defines the measurement spec (min/max, type) — then link it via ChecklistItem.measurements edge.
 */
import { id }                        from '../lib/deterministic-id.mjs';
import {
  templateNode, templateItemNode, templateItemEdge,
  measurementReadingNode, SPACES,
} from '../lib/dms-payload.mjs';
import { ALL_ROUTES, MEASUREMENT_DEFAULTS } from '../config.mjs';

// ─── Inspection item catalogue per route ─────────────────────────────────────
// (same content as before, maps to TemplateItem + optional MeasurementReading spec)

const ITEMS_BY_ROUTE = {
  route1: [
    { order: 1,  title: 'Diffuser body temperature',               equipSlug: 'diffuser-body',        isMeasurement: true,  measSlug: 'TEMP-DEGF',           unitCode: 'degF',   min: 150, max: 280, threshold: 270 },
    { order: 2,  title: 'Diffuser level OK',                       equipSlug: 'diffuser-body',        isMeasurement: false },
    { order: 3,  title: 'Diffuser scraper motor current',          equipSlug: 'diffuser-scraper',     isMeasurement: true,  measSlug: 'MOTOR-AMPS',          unitCode: 'amps',   min: 5,   max: 60,  threshold: 55  },
    { order: 4,  title: 'Diffuser scraper IB bearing temperature', equipSlug: 'diffuser-scraper',     isMeasurement: true,  measSlug: 'IB-BEARING-TEMP',     unitCode: 'degF',   min: 70,  max: 180, threshold: 175 },
    { order: 5,  title: 'Diffuser scraper OB bearing temperature', equipSlug: 'diffuser-scraper',     isMeasurement: true,  measSlug: 'OB-BEARING-TEMP',     unitCode: 'degF',   min: 70,  max: 180, threshold: 175 },
    { order: 6,  title: 'North filtrate pump IB bearing temp',     equipSlug: 'north-filtrate-pump',  isMeasurement: true,  measSlug: 'IB-BEARING-TEMP',     unitCode: 'degF',   min: 70,  max: 180, threshold: 175 },
    { order: 7,  title: 'North filtrate pump motor current',       equipSlug: 'north-filtrate-pump',  isMeasurement: true,  measSlug: 'MOTOR-AMPS',          unitCode: 'amps',   min: 10,  max: 60,  threshold: 55  },
    { order: 8,  title: 'North filtrate pump seal water OK',       equipSlug: 'north-filtrate-pump',  isMeasurement: false },
    { order: 9,  title: 'South filtrate pump IB bearing temp',     equipSlug: 'south-filtrate-pump',  isMeasurement: true,  measSlug: 'IB-BEARING-TEMP',     unitCode: 'degF',   min: 70,  max: 180, threshold: 175 },
    { order: 10, title: 'South filtrate pump motor current',       equipSlug: 'south-filtrate-pump',  isMeasurement: true,  measSlug: 'MOTOR-AMPS',          unitCode: 'amps',   min: 10,  max: 60,  threshold: 55  },
    { order: 11, title: 'HP chip feeder motor temperature',        equipSlug: 'chip-feeder-hp',       isMeasurement: true,  measSlug: 'MOTOR-TEMP',          unitCode: 'degF',   min: 60,  max: 195, threshold: 190 },
    { order: 12, title: 'HP chip feeder motor current',            equipSlug: 'chip-feeder-hp',       isMeasurement: true,  measSlug: 'MOTOR-AMPS',          unitCode: 'amps',   min: 10,  max: 80,  threshold: 75  },
    { order: 13, title: 'HP chip feeder rotor gap OK',             equipSlug: 'chip-feeder-hp',       isMeasurement: true,  measSlug: 'GAP-MM',              unitCode: 'mm',     min: 0.5, max: 10,  threshold: 9.0 },
    { order: 14, title: 'LP chip feeder motor temperature',        equipSlug: 'chip-feeder-lp',       isMeasurement: true,  measSlug: 'MOTOR-TEMP',          unitCode: 'degF',   min: 60,  max: 195, threshold: 190 },
    { order: 15, title: 'LP chip feeder motor current',            equipSlug: 'chip-feeder-lp',       isMeasurement: true,  measSlug: 'MOTOR-AMPS',          unitCode: 'amps',   min: 10,  max: 80,  threshold: 75  },
    { order: 16, title: 'Blow tank temperature',                   equipSlug: 'blow-tank',            isMeasurement: true,  measSlug: 'TEMP-DEGF',           unitCode: 'degF',   min: 150, max: 280, threshold: 270 },
    { order: 17, title: 'Blow tank level OK',                      equipSlug: 'blow-tank',            isMeasurement: false },
    { order: 18, title: 'Blow tank safety relief valve OK',        equipSlug: 'blow-tank',            isMeasurement: false },
    { order: 19, title: 'Blow tank agitator motor current',        equipSlug: 'blow-tank-agitator',   isMeasurement: true,  measSlug: 'MOTOR-AMPS',          unitCode: 'amps',   min: 5,   max: 40,  threshold: 38  },
    { order: 20, title: 'Blow heat recovery HX inlet temperature', equipSlug: 'blow-heat-recovery-hx',isMeasurement: true,  measSlug: 'INLET-TEMP-DEGF',     unitCode: 'degF',   min: 150, max: 300, threshold: 290 },
    { order: 21, title: 'Digester body temperature',               equipSlug: 'digester-body',        isMeasurement: true,  measSlug: 'TEMP-DEGF',           unitCode: 'degF',   min: 150, max: 290, threshold: 285 },
    { order: 22, title: 'Digester level OK',                       equipSlug: 'digester-body',        isMeasurement: false },
    { order: 23, title: 'Extract pump A IB bearing temperature',   equipSlug: 'extract-pump-a',       isMeasurement: true,  measSlug: 'IB-BEARING-TEMP',     unitCode: 'degF',   min: 70,  max: 180, threshold: 175 },
    { order: 24, title: 'Extract pump A casing temperature',       equipSlug: 'extract-pump-a',       isMeasurement: true,  measSlug: 'CASING-TEMP',         unitCode: 'degF',   min: 80,  max: 200, threshold: 195 },
    { order: 25, title: 'Brown stock pump A motor current',        equipSlug: 'brown-stock-pump-a',   isMeasurement: true,  measSlug: 'MOTOR-AMPS',          unitCode: 'amps',   min: 10,  max: 70,  threshold: 65  },
    { order: 26, title: 'Hot-stage wash pump A seal water OK',     equipSlug: 'hs-wash-pump-a',       isMeasurement: false },
    { order: 27, title: 'Packing/seal condition OK — general',    equipSlug: 'north-filtrate-pump',   isMeasurement: false },
    { order: 28, title: 'General area cleanliness OK',            equipSlug: 'diffuser-body',         isMeasurement: false },
  ],
  route2: [
    { order: 1,  title: 'Chip silo belt conveyor motor current',   equipSlug: 'chip-silo-belt',       isMeasurement: true,  measSlug: 'MOTOR-AMPS',          unitCode: 'amps',   min: 5,   max: 60,  threshold: 55  },
    { order: 2,  title: 'Chip silo belt IB bearing temperature',   equipSlug: 'chip-silo-belt',       isMeasurement: true,  measSlug: 'IB-BEARING-TEMP',     unitCode: 'degF',   min: 70,  max: 175, threshold: 170 },
    { order: 3,  title: 'Chip screen drive motor current',         equipSlug: 'chip-screen-drive',    isMeasurement: true,  measSlug: 'MOTOR-AMPS',          unitCode: 'amps',   min: 5,   max: 55,  threshold: 52  },
    { order: 4,  title: 'HP chip feeder motor temperature',        equipSlug: 'chip-feeder-hp',       isMeasurement: true,  measSlug: 'MOTOR-TEMP',          unitCode: 'degF',   min: 60,  max: 195, threshold: 190 },
    { order: 5,  title: 'HP chip feeder rotor gap OK',             equipSlug: 'chip-feeder-hp',       isMeasurement: true,  measSlug: 'GAP-MM',              unitCode: 'mm',     min: 0.5, max: 10,  threshold: 9.0 },
    { order: 6,  title: 'LP chip feeder motor temperature',        equipSlug: 'chip-feeder-lp',       isMeasurement: true,  measSlug: 'MOTOR-TEMP',          unitCode: 'degF',   min: 60,  max: 195, threshold: 190 },
    { order: 7,  title: 'Steaming vessel temperature',             equipSlug: 'steaming-vessel',      isMeasurement: true,  measSlug: 'TEMP-DEGF',           unitCode: 'degF',   min: 180, max: 280, threshold: 270 },
    { order: 8,  title: 'White liquor pump A motor current',       equipSlug: 'wl-pump-a',            isMeasurement: true,  measSlug: 'MOTOR-AMPS',          unitCode: 'amps',   min: 10,  max: 65,  threshold: 60  },
    { order: 9,  title: 'White liquor pump A bearing temp',        equipSlug: 'wl-pump-a',            isMeasurement: true,  measSlug: 'IB-BEARING-TEMP',     unitCode: 'degF',   min: 70,  max: 180, threshold: 175 },
    { order: 10, title: 'Steaming vessel safety valve OK',         equipSlug: 'steaming-vessel',      isMeasurement: false },
    { order: 11, title: 'Area chip spill containment OK',          equipSlug: 'chip-silo-belt',       isMeasurement: false },
  ],
  route3: [
    { order: 1,  title: 'Washer #1 drive motor current',           equipSlug: 'washer-1-drive',       isMeasurement: true,  measSlug: 'MOTOR-AMPS',          unitCode: 'amps',   min: 10,  max: 80,  threshold: 75  },
    { order: 2,  title: 'Washer #1 drive IB bearing temperature',  equipSlug: 'washer-1-drive',       isMeasurement: true,  measSlug: 'IB-BEARING-TEMP',     unitCode: 'degF',   min: 70,  max: 180, threshold: 175 },
    { order: 3,  title: 'Washer #2 drive motor current',           equipSlug: 'washer-2-drive',       isMeasurement: true,  measSlug: 'MOTOR-AMPS',          unitCode: 'amps',   min: 10,  max: 80,  threshold: 75  },
    { order: 4,  title: 'Washer #3 drive motor current',           equipSlug: 'washer-3-drive',       isMeasurement: true,  measSlug: 'MOTOR-AMPS',          unitCode: 'amps',   min: 10,  max: 80,  threshold: 75  },
    { order: 5,  title: 'Filtrate pump A motor current',           equipSlug: 'filtrate-pump-a',      isMeasurement: true,  measSlug: 'MOTOR-AMPS',          unitCode: 'amps',   min: 10,  max: 65,  threshold: 60  },
    { order: 6,  title: 'Filtrate pump A IB bearing temperature',  equipSlug: 'filtrate-pump-a',      isMeasurement: true,  measSlug: 'IB-BEARING-TEMP',     unitCode: 'degF',   min: 70,  max: 180, threshold: 175 },
    { order: 7,  title: 'Filtrate pump B motor current',           equipSlug: 'filtrate-pump-b',      isMeasurement: true,  measSlug: 'MOTOR-AMPS',          unitCode: 'amps',   min: 10,  max: 65,  threshold: 60  },
    { order: 8,  title: 'Shower pump outlet pressure',             equipSlug: 'shower-pump',          isMeasurement: true,  measSlug: 'OUTLET-PRESSURE-PSI', unitCode: 'psi',    min: 20,  max: 100, threshold: 95  },
    { order: 9,  title: 'Dilution liquor agitator motor current',  equipSlug: 'dl-chest-agitator',    isMeasurement: true,  measSlug: 'MOTOR-AMPS',          unitCode: 'amps',   min: 5,   max: 40,  threshold: 38  },
    { order: 10, title: 'Seal water pressures OK',                 equipSlug: 'filtrate-pump-a',      isMeasurement: false },
    { order: 11, title: 'Wire wash water OK',                      equipSlug: 'washer-1-drive',       isMeasurement: false },
  ],
  route4: [
    { order: 1,  title: 'Pressure screen A motor current',         equipSlug: 'pressure-screen-a',    isMeasurement: true,  measSlug: 'MOTOR-AMPS',             unitCode: 'amps', min: 10,  max: 70,  threshold: 65  },
    { order: 2,  title: 'Pressure screen A IB bearing temperature',equipSlug: 'pressure-screen-a',    isMeasurement: true,  measSlug: 'IB-BEARING-TEMP',        unitCode: 'degF', min: 70,  max: 175, threshold: 170 },
    { order: 3,  title: 'Pressure screen A inlet pressure',        equipSlug: 'pressure-screen-a',    isMeasurement: true,  measSlug: 'INLET-PRESSURE-PSI',     unitCode: 'psi',  min: 10,  max: 80,  threshold: 75  },
    { order: 4,  title: 'Pressure screen B motor current',         equipSlug: 'pressure-screen-b',    isMeasurement: true,  measSlug: 'MOTOR-AMPS',             unitCode: 'amps', min: 10,  max: 70,  threshold: 65  },
    { order: 5,  title: 'Centrifugal cleaner A motor current',     equipSlug: 'centri-cleaner-a',      isMeasurement: true,  measSlug: 'MOTOR-AMPS',             unitCode: 'amps', min: 5,   max: 40,  threshold: 38  },
    { order: 6,  title: 'MC pump A motor current',                 equipSlug: 'mc-pump-a',             isMeasurement: true,  measSlug: 'MOTOR-AMPS',             unitCode: 'amps', min: 10,  max: 80,  threshold: 75  },
    { order: 7,  title: 'MC pump A IB bearing temperature',        equipSlug: 'mc-pump-a',             isMeasurement: true,  measSlug: 'IB-BEARING-TEMP',        unitCode: 'degF', min: 70,  max: 180, threshold: 175 },
    { order: 8,  title: 'MC pump A outlet pressure',               equipSlug: 'mc-pump-a',             isMeasurement: true,  measSlug: 'OUTLET-PRESSURE-PSI',    unitCode: 'psi',  min: 20,  max: 150, threshold: 145 },
    { order: 9,  title: 'Reject refiner A gap OK',                 equipSlug: 'refiner-reject-a',      isMeasurement: true,  measSlug: 'GAP-MM',                 unitCode: 'mm',   min: 0.5, max: 10,  threshold: 9.0 },
    { order: 10, title: 'Screen basket condition OK',              equipSlug: 'pressure-screen-a',    isMeasurement: false },
    { order: 11, title: 'Reject conveyor cleanliness OK',          equipSlug: 'reject-pump',           isMeasurement: false },
  ],
};

// Merge routes 5-8 from routes-extra.json
for (const route of ALL_ROUTES.filter(r => r.slug.match(/^route[5-8]$/))) {
  ITEMS_BY_ROUTE[route.slug] = (route.inspectionItems ?? []).map((item, i) => ({
    order: i + 1,
    ...item,
  }));
}

/**
 * Generate all Template + TemplateItem nodes + edges + measurement spec nodes.
 * @param {Map} assetIndex - Map<`${routeSlug}.${equipSlug}`, assetExternalId>
 * @returns {{ templates, templateItems, templateEdges, measSpecs, itemsByRoute }}
 */
export function generateTemplates(assetIndex) {
  const templates      = [];
  const templateItems  = [];
  const templateEdges  = [];
  /** MeasurementReading spec nodes (define min/max/type per TemplateItem) */
  const measSpecs      = [];
  /** Map<routeSlug, [{externalId, titemId, title, order, isMeasurement, ...}]> */
  const itemsByRoute   = new Map();

  for (const route of ALL_ROUTES) {
    const tmplSlug = route.slug;
    const tmplId   = id.template(tmplSlug);

    // Route-level root asset
    const rootAssetId = assetIndex.get(`${route.slug}.root`) ?? null;

    templates.push(templateNode(tmplId, {
      title:          route.title,
      description:    `Inspection template for ${route.title} — 1 year seed dataset (2025)`,
      status:         'ready',
      rootLocationId: rootAssetId,
    }));

    const items     = ITEMS_BY_ROUTE[route.slug] ?? [];
    const routeData = [];

    for (const item of items) {
      const titemId   = id.titem(tmplSlug, item.order, item.title);
      const assetExId = assetIndex.get(`${route.slug}.${item.equipSlug}`) ?? null;

      // Resolve SST enrichment IDs
      const inspectionTypeId = item.isMeasurement
        ? id.itemType('numeric')   // CKM_ITMTYP_GR1_NUMERIC
        : id.itemType('ok-nok');   // CKM_ITMTYP_GR1_OK-NOK
      const unitId = item.unitCode
        ? id.measUnit(item.unitCode)   // CKM_MUNIT_GR1_DEGF, etc.
        : null;

      templateItems.push(templateItemNode(titemId, {
        title:       item.title,
        description: item.isMeasurement
          ? `Measure ${item.measSlug} on ${item.equipSlug}. Threshold: ${item.threshold ?? 'N/A'} ${item.unitCode ?? ''}`
          : null,
        order:            item.order,
        assetId:          assetExId,
        inspectionTypeId,
        unitId,
      }));

      // Edge: Template → TemplateItem
      templateEdges.push(
        templateItemEdge(id.edgeTmplItem(tmplId, titemId), tmplId, titemId),
      );

      // MeasurementReading spec node (defines the measurement template)
      if (item.isMeasurement) {
        const specId = `${titemId}-SPEC`;
        measSpecs.push(measurementReadingNode(specId, {
          title:       item.title,
          description: `Spec: ${item.measSlug} — ${item.unitCode ?? ''} [${item.min ?? '-'}, ${item.max ?? '-'}]`,
          type:        'numerical',
          order:       item.order,
          min:         item.min ?? null,
          max:         item.max ?? null,
        }));
      } else {
        // OK/NOK items → label type spec
        const specId = `${titemId}-SPEC`;
        measSpecs.push(measurementReadingNode(specId, {
          title:       item.title,
          description: `OK / Not OK check — ${item.equipSlug}`,
          type:        'label',
          order:       item.order,
        }));
      }

      routeData.push({
        externalId: titemId,
        order:       item.order,
        title:       item.title,
        isMeasurement: item.isMeasurement,
        measSlug:    item.measSlug ?? null,
        equipSlug:   item.equipSlug,
        unitCode:    item.unitCode ?? null,
        min:         item.min ?? null,
        max:         item.max ?? null,
        threshold:   item.threshold ?? null,
        assetId:     assetExId,
      });
    }

    itemsByRoute.set(route.slug, routeData);
  }

  return { templates, templateItems, templateEdges, measSpecs, itemsByRoute };
}
