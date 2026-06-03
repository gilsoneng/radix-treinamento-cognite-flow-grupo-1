import { Button } from '@cognite/aura/components';

export type TablePaginationProps = {
  page: number;
  hasMore: boolean;
  canGoBack: boolean;
  onPrevious: () => void;
  onNext: () => void;
  pageSize: number;
  itemCount: number;
};

export function TablePagination({
  page,
  hasMore,
  canGoBack,
  onPrevious,
  onNext,
  pageSize,
  itemCount,
}: TablePaginationProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-3">
      <span className="text-sm text-muted-foreground">
        Page {page} · {itemCount} row{itemCount === 1 ? '' : 's'} (up to {pageSize} per request)
      </span>
      <div className="flex gap-2">
        <Button type="button" variant="secondary" disabled={!canGoBack} onClick={onPrevious}>
          Previous
        </Button>
        <Button type="button" variant="secondary" disabled={!hasMore} onClick={onNext}>
          Next
        </Button>
      </div>
    </div>
  );
}
