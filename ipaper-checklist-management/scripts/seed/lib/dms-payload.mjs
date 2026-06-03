/**
 * DMS payload builders.
 * Wraps instances in the exact format expected by CogniteClient.instances.upsert().
 *
 * APM view references match the DEPLOYED schema (datamodel.md):
 *   Template     → cdf_apm / Template     / v8
 *   TemplateItem → cdf_apm / TemplateItem / v7
 *   Checklist    → cdf_apm / Checklist    / v7
 *   ChecklistItem→ cdf_apm / ChecklistItem/ v7
 *   Observation  → cdf_apm / Observation  / v5
 *   MeasurementReading → cdf_apm / MeasurementReading / v4
 */

export const SPACES = {
  assets:    'flows_radix_space_group1',
  checklist: 'flows_radix_checklist_group1',
  dm:        'ip_checklist_dm',
  apm:       'cdf_apm',
  cdm:       'cdf_cdm',
  core:      'cdf_core',
};

/** Build a view source reference */
export function viewSource(space, externalId, version) {
  return { type: 'view', space, externalId, version };
}

/**
 * Build a node upsert payload.
 * @param {string} space
 * @param {string} externalId
 * @param {Array<{source: object, properties: object}>} sources
 */
export function node(space, externalId, sources) {
  return { instanceType: 'node', space, externalId, sources };
}

/**
 * Build an edge upsert payload.
 * @param {string} space
 * @param {string} externalId
 * @param {{space,externalId}} startNode
 * @param {{space,externalId}} endNode
 * @param {{space,externalId}} type
 */
export function edge(space, externalId, startNode, endNode, type) {
  return { instanceType: 'edge', space, externalId, startNode, endNode, type };
}

/** Build a direct_relation value */
export function rel(space, externalId) {
  return { space, externalId };
}

// ─── APM view source refs (from deployed schema) ──────────────────────────────

export const APM_VIEWS = {
  Template:           viewSource(SPACES.apm, 'Template',           'v8'),
  TemplateItem:       viewSource(SPACES.apm, 'TemplateItem',       'v7'),
  Checklist:          viewSource(SPACES.apm, 'Checklist',          'v7'),
  ChecklistItem:      viewSource(SPACES.apm, 'ChecklistItem',      'v7'),
  Observation:        viewSource(SPACES.apm, 'Observation',        'v5'),
  MeasurementReading: viewSource(SPACES.apm, 'MeasurementReading', 'v4'),
};

/**
 * APM edge types (multi_edge relations between nodes).
 * These are the `type` reference used in edge upserts.
 * In APM the edge type space is cdf_apm.
 */
export const APM_EDGE_TYPES = {
  templateItems:  { space: SPACES.apm, externalId: 'referenceTemplateItems' },
  checklistItems: { space: SPACES.apm, externalId: 'referenceChecklistItems' },
  measurements:   { space: SPACES.apm, externalId: 'referenceMeasurements' },
  observations:   { space: SPACES.apm, externalId: 'referenceObservations' },
};

/**
 * Build a CogniteAsset node.
 * Dual source: cdf_cdm/CogniteAsset/v1 (name, tags) + cdf_core/Asset/v2 (title — Describable).
 * The cdf_core source is required for APM rootLocation/asset direct relation constraints.
 */
export function assetNode(externalId, props, parentId, rootId) {
  return node(SPACES.assets, externalId, [
    {
      source: viewSource(SPACES.cdm, 'CogniteAsset', 'v1'),
      properties: {
        name:        props.name,
        description: props.description ?? null,
        tags:        props.tags ?? [],
        // root is system-managed — never set it directly
        ...(parentId ? { parent: rel(SPACES.assets, parentId) } : {}),
      },
    },
    {
      // cdf_core/Asset/v2 uses Describable container → 'title' (not 'name')
      source: viewSource(SPACES.core, 'Asset', 'v2'),
      properties: {
        title:       props.name,
        description: props.description ?? null,
      },
    },
  ]);
}

/** Build a CogniteTimeSeries node */
export function tsNode(externalId, props) {
  return node(SPACES.assets, externalId, [
    {
      source: viewSource(SPACES.cdm, 'CogniteTimeSeries', 'v1'),
      properties: {
        name:        props.name,
        description: props.description ?? null,
        type:        props.type ?? 'numeric',
        isStep:      props.isStep ?? false,
        sourceUnit:  props.sourceUnit ?? null,
        assets:      props.assetId ? [rel(SPACES.assets, props.assetId)] : [],
      },
    },
  ]);
}

/** Build a node for any ip_checklist_dm view */
export function dmNode(externalId, viewExternalId, properties) {
  return node(SPACES.checklist, externalId, [
    {
      source: viewSource(SPACES.dm, viewExternalId, 'v1'),
      properties,
    },
  ]);
}

// ─── APM node builders (correct view + property names) ───────────────────────

/** Template v8 node */
export function templateNode(externalId, props) {
  return node(SPACES.checklist, externalId, [
    {
      source: APM_VIEWS.Template,
      properties: {
        title:        props.title,
        description:  props.description ?? null,
        status:       props.status ?? 'ready',
        assignedTo:   props.assignedTo ?? [],
        rootLocation: props.rootLocationId
          ? rel(SPACES.assets, props.rootLocationId)
          : null,
        visibility:   'PUBLIC',
        isArchived:   false,
      },
    },
  ]);
}

/** TemplateItem v7 node — with optional ip_checklist_dm enrichment source */
export function templateItemNode(externalId, props) {
  const sources = [
    {
      source: APM_VIEWS.TemplateItem,
      properties: {
        title:       props.title,
        description: props.description ?? null,
        order:       props.order ?? 0,
        asset:       props.assetId ? rel(SPACES.assets, props.assetId) : null,
        visibility:  'PUBLIC',
        isArchived:  false,
      },
    },
  ];

  // Enrichment: inspectionTypeRef + unitRef backed by ApmTemplateItemExtended container
  if (props.inspectionTypeId || props.unitId) {
    sources.push({
      source: viewSource(SPACES.dm, 'ApmTemplateItem', 'v1'),
      properties: {
        ...(props.inspectionTypeId
          ? { inspectionTypeRef: rel(SPACES.checklist, props.inspectionTypeId) }
          : {}),
        ...(props.unitId
          ? { unitRef: rel(SPACES.checklist, props.unitId) }
          : {}),
      },
    });
  }

  return node(SPACES.checklist, externalId, sources);
}

/** Template → TemplateItem edge */
export function templateItemEdge(externalId, templateId, templateItemId) {
  return edge(
    SPACES.checklist, externalId,
    { space: SPACES.checklist, externalId: templateId },
    { space: SPACES.checklist, externalId: templateItemId },
    APM_EDGE_TYPES.templateItems,
  );
}

/** Checklist v7 node */
export function checklistNode(externalId, props) {
  return node(SPACES.checklist, externalId, [
    {
      source: APM_VIEWS.Checklist,
      properties: {
        title:        props.title,
        description:  props.description ?? null,
        status:       props.status ?? 'created',
        type:         props.type ?? 'Inspection',
        assignedTo:   props.assignedTo ? [props.assignedTo] : [],
        startTime:    props.startTime ?? null,
        endTime:      props.endTime ?? null,
        rootLocation: props.rootLocationId
          ? rel(SPACES.assets, props.rootLocationId)
          : null,
        visibility:   'PUBLIC',
        isArchived:   false,
      },
    },
  ]);
}

/** ChecklistItem v7 node */
export function checklistItemNode(externalId, props) {
  return node(SPACES.checklist, externalId, [
    {
      source: APM_VIEWS.ChecklistItem,
      properties: {
        title:      props.title,
        description:props.description ?? null,
        status:     props.status ?? 'created',
        order:      props.order ?? 0,
        note:       props.note ?? null,
        asset:      props.assetId ? rel(SPACES.assets, props.assetId) : null,
        visibility: 'PUBLIC',
        isArchived: false,
      },
    },
  ]);
}

/** Checklist → ChecklistItem edge */
export function checklistItemEdge(externalId, checklistId, checklistItemId) {
  return edge(
    SPACES.checklist, externalId,
    { space: SPACES.checklist, externalId: checklistId },
    { space: SPACES.checklist, externalId: checklistItemId },
    APM_EDGE_TYPES.checklistItems,
  );
}

/**
 * MeasurementReading v4 node.
 * For OK/NOK items: type='label', stringReading='OK'|'Not OK'
 * For numeric items: type='numerical', numericReading=<value>
 */
export function measurementReadingNode(externalId, props) {
  return node(SPACES.checklist, externalId, [
    {
      source: APM_VIEWS.MeasurementReading,
      properties: {
        title:          props.title,
        description:    props.description ?? null,
        type:           props.type ?? 'numerical',
        order:          props.order ?? 0,
        min:            props.min ?? null,
        max:            props.max ?? null,
        measuredAt:     props.measuredAt ?? null,
        numericReading: props.numericReading ?? null,
        stringReading:  props.stringReading ?? null,
        visibility:     'PUBLIC',
        isArchived:     false,
      },
    },
  ]);
}

/** ChecklistItem → MeasurementReading edge */
export function measurementEdge(externalId, checklistItemId, measurementId) {
  return edge(
    SPACES.checklist, externalId,
    { space: SPACES.checklist, externalId: checklistItemId },
    { space: SPACES.checklist, externalId: measurementId },
    APM_EDGE_TYPES.measurements,
  );
}

/** Observation v5 node — with optional ip_checklist_dm enrichment source */
export function observationNode(externalId, props) {
  const sources = [
    {
      source: APM_VIEWS.Observation,
      properties: {
        title:          props.title,
        description:    props.description ?? null,
        status:         props.status ?? 'draft',
        type:           props.type ?? 'Malfunction report',
        priority:       props.priority ?? 'Low',
        assignedTo:     props.assignedTo ? [props.assignedTo] : [],
        dueDate:        props.dueDate ?? null,
        asset:          props.assetId  ? rel(SPACES.assets, props.assetId) : null,
        rootLocation:   props.rootLocationId ? rel(SPACES.assets, props.rootLocationId) : null,
        troubleshooting:props.troubleshooting ?? null,
        visibility:     'PUBLIC',
        isArchived:     false,
      },
    },
  ];

  // Enrichment: categoryRef + severityRef backed by ApmObservationExtended container
  if (props.categoryId || props.severityId) {
    sources.push({
      source: viewSource(SPACES.dm, 'ApmObservation', 'v1'),
      properties: {
        ...(props.categoryId
          ? { categoryRef: rel(SPACES.checklist, props.categoryId) }
          : {}),
        ...(props.severityId
          ? { severityRef: rel(SPACES.checklist, props.severityId) }
          : {}),
      },
    });
  }

  return node(SPACES.checklist, externalId, sources);
}

/** ChecklistItem → Observation edge */
export function observationEdge(externalId, checklistItemId, observationId) {
  return edge(
    SPACES.checklist, externalId,
    { space: SPACES.checklist, externalId: checklistItemId },
    { space: SPACES.checklist, externalId: observationId },
    APM_EDGE_TYPES.observations,
  );
}
