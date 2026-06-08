export type TaskResultCategory = 'ok' | 'nok' | 'observation';

export type TaskResultItem = {
  readonly space: string;
  readonly externalId: string;
  readonly title: string;
  readonly status: string;
  readonly note: string | null;
  readonly endTime: string | null;
  readonly checklistExternalId: string | null;
  readonly category: TaskResultCategory;
};

export type TaskResultSummary = Record<TaskResultCategory, number>;

export type AnalyticsPeriod = '7d' | '30d' | 'all';
