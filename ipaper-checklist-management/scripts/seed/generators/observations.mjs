/**
 * Phase 5a — Observation (v5) nodes + ChecklistItem→Observation edges.
 *
 * APM schema (datamodel.md):
 *   Observation v5 → title, description, status, type, priority, assignedTo,
 *                    dueDate, asset, rootLocation, troubleshooting, visibility, isArchived
 *
 * Relationship: ChecklistItem → Observation via ChecklistItem.observations (edge)
 *
 * Generated for every NOT OK checklist item (stringReading = 'Not OK').
 */
import { id }                      from '../lib/deterministic-id.mjs';
import { observationNode, observationEdge, SPACES } from '../lib/dms-payload.mjs';
import { observationSeverity }     from '../rules.mjs';

// Map APM priority string → SeverityLevel code (used in classification.mjs)
const PRIORITY_TO_SEVERITY = {
  Urgent: 'critical',
  High:   'high',
  Medium: 'medium',
  Low:    'low',
};

const OBS_TITLES_BY_CATEGORY = {
  safety:       ['Machine guarding missing', 'Hot surface exposed', 'Slip hazard identified', 'Lockout/tagout required'],
  maintenance:  ['Bearing showing signs of wear', 'Seal leak detected', 'Coupling misalignment', 'Abnormal noise on motor', 'Vibration above baseline'],
  reliability:  ['Repeated high temperature reading', 'Performance degradation trending', 'Recurring seal weep'],
  housekeeping: ['Oil spill under pump', 'Chip accumulation on walkway', 'Pulp splash on motor'],
  environment:  ['Liquor leak to floor drains', 'ClO2 smell detected', 'Sulfur odor near digester'],
  quality:      ['Consistency out of range', 'Freeness deviation', 'pH out of operating range'],
};

const OBS_TYPE_MAP = {
  safety:       'Malfunction report',
  maintenance:  'Maintenance request',
  reliability:  'Maintenance request',
  housekeeping: 'Malfunction report',
  environment:  'Malfunction report',
  quality:      'Malfunction report',
};

const DUE_HOURS = { Urgent: 2, High: 8, Medium: 24, Low: 72 };

function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

/**
 * @param {Array} checklistItems     - generated ChecklistItem nodes
 * @param {Map}   ciContextMap       - Map<citemId, { routeSlug, dateStr, shiftCode, equipSlug, startHour, assetId, rootAssetId }>
 * @returns {{ observations, obsEdges }}
 */
export function generateObservations(checklistItems, ciContextMap) {
  const observations = [];
  const obsEdges     = [];
  let   obsSeq       = 0;

  for (const citem of checklistItems) {
    const props = citem.sources[0]?.properties;
    // Only create observation when note was set (NOK items have a note)
    if (!props?.note) continue;

    const ctx = ciContextMap.get(citem.externalId);
    if (!ctx) continue;

    const { routeSlug, dateStr, shiftCode, equipSlug, startHour, assetId, rootAssetId } = ctx;
    obsSeq++;

    const date = new Date(dateStr + 'T00:00:00Z');
    const { priority, categoryCode } = observationSeverity(routeSlug, date, equipSlug);

    const titles     = OBS_TITLES_BY_CATEGORY[categoryCode] ?? OBS_TITLES_BY_CATEGORY.maintenance;
    const obsTitle   = pickRandom(titles);
    const obsType    = OBS_TYPE_MAP[categoryCode] ?? 'Malfunction report';
    const dueHours   = DUE_HOURS[priority] ?? 72;
    const dueDate    = new Date(dateStr + `T${String(startHour).padStart(2,'0')}:00:00Z`);
    dueDate.setUTCHours(dueDate.getUTCHours() + dueHours);

    const obsId = id.observation(routeSlug, dateStr, shiftCode, equipSlug, obsSeq);

    const severityCode = PRIORITY_TO_SEVERITY[priority] ?? 'low';

    observations.push(observationNode(obsId, {
      title:          obsTitle,
      description:    `${obsTitle} — observed during shift ${shiftCode} on ${dateStr} (${routeSlug}, ${equipSlug})`,
      status:         priority === 'Urgent' || priority === 'High' ? 'draft' : 'completed',
      type:           obsType,
      priority,
      dueDate:        dueDate.toISOString(),
      assetId:        assetId ?? null,
      rootLocationId: rootAssetId ?? null,
      troubleshooting: priority !== 'Low'
        ? `Initial inspection: ${obsTitle.toLowerCase()}. Monitoring scheduled.`
        : null,
      // SST enrichment relations
      categoryId: id.observationCat(categoryCode),
      severityId: id.severity(severityCode),
    }));

    // Edge: ChecklistItem → Observation
    obsEdges.push(
      observationEdge(id.edgeCitemObs(citem.externalId, obsId), citem.externalId, obsId),
    );
  }

  return { observations, obsEdges };
}
