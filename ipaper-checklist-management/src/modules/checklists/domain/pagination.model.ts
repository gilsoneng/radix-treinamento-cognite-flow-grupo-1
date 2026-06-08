export type PagedResult<T> = {
  readonly items: readonly T[];
  readonly nextCursor?: string;
  readonly hasMore: boolean;
};
