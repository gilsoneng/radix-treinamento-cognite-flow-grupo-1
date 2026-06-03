export const APM_DM_SPACE = 'cdf_apm';

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
