/**
 * Phase 4 — Checklist (v7) + ChecklistItem (v7) + MeasurementReading (v4)
 *
 * APM schema (datamodel.md):
 *   Checklist v7     → title, description, status, type, assignedTo, startTime, endTime,
 *                       rootLocation, visibility, isArchived
 *   ChecklistItem v7 → title, description, status, order, note, asset, visibility, isArchived
 *   MeasurementReading v4 → title, type, order, min, max, measuredAt,
 *                           numericReading (or stringReading), visibility, isArchived
 *
 * Relationships (edges, NOT direct relations):
 *   Checklist → ChecklistItem   via Checklist.checklistItems
 *   ChecklistItem → MeasurementReading via ChecklistItem.measurements
 *
 * Result is stored in:
 *   - Numeric items: MeasurementReading.numericReading
 *   - OK/NOK  items: MeasurementReading.stringReading ('OK' | 'Not OK' | 'N/A')
 *   - ChecklistItem.note stores free-text annotation
 *   - ChecklistItem.status: 'created' | 'started' | 'completed'
 */
import { id }                        from '../lib/deterministic-id.mjs';
import {
  checklistNode, checklistItemNode, checklistItemEdge,
  measurementReadingNode, measurementEdge, SPACES,
} from '../lib/dms-payload.mjs';
import { ALL_ROUTES, SHIFTS, SUPERVISORS, getPersona, MEASUREMENT_DEFAULTS } from '../config.mjs';
import { itemResult, measurementValue, inspectionDuration } from '../rules.mjs';

function* eachDay(fromDate, toDate) {
  const cur = new Date(fromDate); cur.setUTCHours(0, 0, 0, 0);
  const end = new Date(toDate);   end.setUTCHours(0, 0, 0, 0);
  while (cur <= end) { yield new Date(cur); cur.setUTCDate(cur.getUTCDate() + 1); }
}

function fmtDate(d)  { return d.toISOString().slice(0, 10); }
function fmtTs(d, h) { const c = new Date(d); c.setUTCHours(h); return c.toISOString(); }

const ITEM_STATUS_MAP = {
  'OK':              'completed',
  'NotOk':           'completed',
  'NotApplicable':   'completed',
};

/**
 * @returns {{ checklists, checklistItems, checklistEdges,
 *             measurements, measEdges, measContextMap }}
 */
export function generateChecklists({ fromDate, toDate, routes, assetIndex, itemsByRoute }) {
  const checklists      = [];
  const checklistItems  = [];
  const checklistEdges  = [];
  const measurements    = [];
  const measEdges       = [];
  const measContextMap  = new Map();
  /** Map<citemExternalId, { routeSlug, dateStr, shiftCode, equipSlug, startHour, assetId, rootAssetId }> */
  const ciContextMap    = new Map();

  const targetRoutes = ALL_ROUTES.filter(r => !routes || routes.includes(r.slug));

  for (const date of eachDay(fromDate, toDate)) {
    const dateStr = fmtDate(date);

    for (const route of targetRoutes) {
      const rootAssetId = assetIndex.get(`${route.slug}.root`) ?? null;

      for (const shift of SHIFTS) {
        const persona     = getPersona(route.slug, shift.code);
        const startHour   = shift.startHour;
        const startTs     = fmtTs(date, startHour);

        const routeItems  = itemsByRoute.get(route.slug) ?? [];
        const durationMin = inspectionDuration(persona, route.slug, date, routeItems.length);
        const endHour     = startHour + Math.round(durationMin / 60);
        const endTs       = fmtTs(date, endHour > 23 ? 23 : endHour);

        const chkId = id.checklist(route.slug, dateStr, shift.code);

        const statusRnd = Math.random();
        const status = statusRnd < 0.88 ? 'completed'
                     : statusRnd < 0.95 ? 'started'
                     : 'created';

        checklists.push(checklistNode(chkId, {
          title:          `${route.title} — ${shift.name} — ${dateStr}`,
          description:    `Shift ${shift.code} inspection on ${dateStr}`,
          status,
          type:           'Inspection',
          assignedTo:     persona.externalId,
          startTime:      startTs,
          endTime:        status === 'completed' ? endTs : null,
          rootLocationId: rootAssetId,
        }));

        if (status === 'created') continue;

        for (const titem of routeItems) {
          const resultCode = itemResult(
            persona, route.slug, date, titem.equipSlug, titem.isMeasurement, titem.title,
          );
          const citemId = id.citem(route.slug, dateStr, shift.code, titem.equipSlug, titem.title);

          const note = resultCode === 'NotOk'
            ? `Anomaly detected during ${shift.name} on ${dateStr}`
            : null;

          checklistItems.push(checklistItemNode(citemId, {
            title:   titem.title,
            status:  status === 'started' && Math.random() < 0.3 ? 'started' : ITEM_STATUS_MAP[resultCode] ?? 'completed',
            order:   titem.order,
            note,
            assetId: titem.assetId ?? null,
          }));

          // Edge: Checklist → ChecklistItem
          checklistEdges.push(
            checklistItemEdge(id.edgeChkItem(chkId, citemId), chkId, citemId),
          );

          ciContextMap.set(citemId, {
            routeSlug:   route.slug,
            dateStr,
            shiftCode:   shift.code,
            equipSlug:   titem.equipSlug,
            startHour,
            assetId:     titem.assetId ?? null,
            rootAssetId: assetIndex.get(`${route.slug}.root`) ?? null,
          });

          // MeasurementReading for this item (every item gets one reading)
          if (resultCode !== 'NotApplicable') {
            const msrdId = id.measurement(route.slug, dateStr, shift.code, titem.equipSlug, titem.title);

            if (titem.isMeasurement) {
              const spec = MEASUREMENT_DEFAULTS[titem.measSlug] ?? {
                typical: ((titem.min ?? 0) + (titem.max ?? 100)) / 2,
                stddev:  ((titem.max ?? 100) - (titem.min ?? 0)) * 0.08,
                min: titem.min ?? 0, max: titem.max ?? 100, threshold: titem.threshold ?? 90,
              };
              const { value } = measurementValue(
                spec, route.slug, date, titem.equipSlug, titem.measSlug,
              );

              measurements.push(measurementReadingNode(msrdId, {
                title:         titem.title,
                type:          'numerical',
                order:         titem.order,
                min:           titem.min ?? null,
                max:           titem.max ?? null,
                measuredAt:    startTs,
                numericReading: value,
              }));

              measContextMap.set(msrdId, {
                routeSlug: route.slug, equipSlug: titem.equipSlug, measSlug: titem.measSlug,
              });
            } else {
              // OK/NOK label reading
              measurements.push(measurementReadingNode(msrdId, {
                title:         titem.title,
                type:          'label',
                order:         titem.order,
                measuredAt:    startTs,
                stringReading: resultCode === 'NotOk' ? 'Not OK' : 'OK',
              }));
            }

            // Edge: ChecklistItem → MeasurementReading
            measEdges.push(
              measurementEdge(id.edgeCitemMsrd(citemId, msrdId), citemId, msrdId),
            );
          }
        }
      }
    }
  }

  return { checklists, checklistItems, checklistEdges, measurements, measEdges, measContextMap, ciContextMap };
}
