export const APM_DM_SPACE = 'cdf_apm';

/** Instance space for Radix grupo-1 seed (CKM_* external IDs). */
export const CHECKLIST_INSTANCE_SPACE = 'flows_radix_checklist_group1';

export const CHECKLIST_VIEW = {
  space: APM_DM_SPACE,
  externalId: 'Checklist',
  version: 'v7',
} as const;

export const CHECKLIST_ITEM_VIEW = {
  space: APM_DM_SPACE,
  externalId: 'ChecklistItem',
  version: 'v7',
} as const;

export const TEMPLATE_VIEW = {
  space: APM_DM_SPACE,
  externalId: 'Template',
  version: 'v8',
} as const;

export const OBSERVATION_VIEW = {
  space: APM_DM_SPACE,
  externalId: 'Observation',
  version: 'v5',
} as const;
