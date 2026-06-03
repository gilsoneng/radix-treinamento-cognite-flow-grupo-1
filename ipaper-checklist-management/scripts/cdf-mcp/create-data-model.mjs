/**
 * Creates the ip_checklist_dm DataModel directly via the CDF API.
 * Bypasses cdf-tk to diagnose and fix the deployment issue.
 */
import { getCdfClient } from './create-client.mjs';

const SPACE = 'ip_checklist_dm';
const DM_EXTERNAL_ID = 'ip_checklist_dm';
const VERSION = '1';

const views = [
  { space: SPACE, externalId: 'EquipmentCategory',      version: VERSION },
  { space: SPACE, externalId: 'InspectionShift',        version: VERSION },
  { space: SPACE, externalId: 'ObservationCategory',    version: VERSION },
  { space: SPACE, externalId: 'SeverityLevel',          version: VERSION },
  { space: SPACE, externalId: 'MeasurementUnit',        version: VERSION },
  { space: SPACE, externalId: 'InspectionItemType',     version: VERSION },
  { space: SPACE, externalId: 'ChecklistKpi',           version: VERSION },
  { space: SPACE, externalId: 'EquipmentHealthIndex',   version: VERSION },
  { space: SPACE, externalId: 'RouteKpiSnapshot',       version: VERSION },
  { space: SPACE, externalId: 'MeasurementTrend',       version: VERSION },
  { space: SPACE, externalId: 'SeedManifest',           version: VERSION },
  { space: SPACE, externalId: 'ApmTemplate',            version: VERSION },
  { space: SPACE, externalId: 'ApmTemplateItem',        version: VERSION },
  { space: SPACE, externalId: 'ApmChecklist',           version: VERSION },
  { space: SPACE, externalId: 'ApmChecklistItem',       version: VERSION },
  { space: SPACE, externalId: 'ApmMeasurementReading',  version: VERSION },
  { space: SPACE, externalId: 'ApmObservation',         version: VERSION },
  { space: SPACE, externalId: 'IpCogniteAsset',         version: VERSION },
  { space: SPACE, externalId: 'IpCogniteTimeSeries',    version: VERSION },
];

async function main() {
  const client = getCdfClient();

  console.log('Creating DataModel ip_checklist_dm/1 with', views.length, 'views...');

  try {
    const result = await client.dataModels.upsert([
      {
        space: SPACE,
        externalId: DM_EXTERNAL_ID,
        version: VERSION,
        name: 'IP Checklist Data Model',
        description:
          'Custom Data Model Solution (CKM) for ipaper-checklist-management — preventive maintenance inspections on a pulp & paper mill A-Line.',
        views: views.map(v => ({ type: 'view', ...v })),
      },
    ]);
    console.log('SUCCESS:', JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('ERROR:', err.message);
    if (err.extra) console.error('DETAILS:', JSON.stringify(err.extra, null, 2));
    process.exit(1);
  }
}

main();
