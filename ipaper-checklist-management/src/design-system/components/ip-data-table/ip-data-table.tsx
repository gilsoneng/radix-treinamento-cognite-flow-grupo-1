import {
  Button,
  Card,
  CardContent,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@cognite/aura/components';
import { IconArrowDown, IconArrowUp, IconSelector } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';

import { TablePagination } from '../table-pagination/table-pagination';

export type SortDirection = 'asc' | 'desc';

export type IpDataTableColumn<T> = {
  readonly id: string;
  readonly header: string;
  readonly cell: (row: T) => ReactNode;
  readonly sortValue?: (row: T) => string | number;
  readonly align?: 'left' | 'right';
};

export type IpDataTableProps<T> = {
  readonly title?: string;
  readonly rows: readonly T[];
  readonly columns: readonly IpDataTableColumn<T>[];
  readonly getRowKey: (row: T) => string;
  readonly searchPlaceholder?: string;
  readonly searchFilter?: (row: T, query: string) => boolean;
  readonly emptyMessage?: string;
  readonly pageSize?: number;
  readonly pageSizeOptions?: readonly number[];
  readonly toolbar?: ReactNode;
};

export function IpDataTable<T>({
  title,
  rows,
  columns,
  getRowKey,
  searchPlaceholder = 'Search...',
  searchFilter,
  emptyMessage = 'No rows match your filters.',
  pageSize: initialPageSize = 10,
  pageSizeOptions = [10, 25, 50],
  toolbar,
}: IpDataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [pageIndex, setPageIndex] = useState(0);

  const filtered = useMemo(() => {
    if (!searchFilter || !search.trim()) {
      return [...rows];
    }
    return rows.filter((row) => searchFilter(row, search));
  }, [rows, search, searchFilter]);

  const sorted = useMemo(() => {
    if (!sortColumn) {
      return filtered;
    }
    const column = columns.find((col) => col.id === sortColumn);
    if (!column?.sortValue) {
      return filtered;
    }
    const copy = [...filtered];
    copy.sort((a, b) => {
      const av = column.sortValue!(a);
      const bv = column.sortValue!(b);
      if (av === bv) {
        return 0;
      }
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDirection === 'asc' ? av - bv : bv - av;
      }
      const as = String(av);
      const bs = String(bv);
      return sortDirection === 'asc' ? as.localeCompare(bs) : bs.localeCompare(as);
    });
    return copy;
  }, [columns, filtered, sortColumn, sortDirection]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePageIndex = Math.min(pageIndex, pageCount - 1);
  const pageRows = sorted.slice(safePageIndex * pageSize, safePageIndex * pageSize + pageSize);

  const toggleSort = (columnId: string) => {
    const column = columns.find((col) => col.id === columnId);
    if (!column?.sortValue) {
      return;
    }
    if (sortColumn === columnId) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(columnId);
      setSortDirection('asc');
    }
    setPageIndex(0);
  };

  const SortIcon = ({ columnId }: { columnId: string }) => {
    if (sortColumn !== columnId) {
      return <IconSelector className="h-3.5 w-3.5 opacity-40" aria-hidden />;
    }
    return sortDirection === 'asc' ? (
      <IconArrowUp className="h-3.5 w-3.5" aria-hidden />
    ) : (
      <IconArrowDown className="h-3.5 w-3.5" aria-hidden />
    );
  };

  return (
    <Card className="overflow-hidden">
      {(title || searchFilter || toolbar) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
          {title ? <h3 className="ip-data-table__title m-0 text-sm font-semibold">{title}</h3> : <span />}
          <div className="flex flex-wrap items-center gap-2">
            {toolbar}
            {searchFilter ? (
              <Input
                className="h-9 w-56"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPageIndex(0);
                }}
                aria-label="Search table"
              />
            ) : null}
            <Select
              value={String(pageSize)}
              onValueChange={(value) => {
                setPageSize(Number(value));
                setPageIndex(0);
              }}
            >
              <SelectTrigger className="h-9 w-[110px]" aria-label="Rows per page">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option} / page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="ip-data-table w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted-background/60">
                {columns.map((column) => (
                  <th
                    key={column.id}
                    className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground ${
                      column.align === 'right' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {column.sortValue ? (
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-auto gap-1 p-0 font-semibold uppercase"
                        onClick={() => toggleSort(column.id)}
                      >
                        {column.header}
                        <SortIcon columnId={column.id} />
                      </Button>
                    ) : (
                      column.header
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-10 text-center text-muted-foreground"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                pageRows.map((row) => (
                  <tr
                    key={getRowKey(row)}
                    className="border-b border-border/70 transition-colors last:border-0 hover:bg-accent-background/40"
                  >
                    {columns.map((column) => (
                      <td
                        key={column.id}
                        className={`px-4 py-3 align-middle ${
                          column.align === 'right' ? 'text-right' : 'text-left'
                        }`}
                      >
                        {column.cell(row)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <TablePagination
          page={safePageIndex + 1}
          hasMore={safePageIndex < pageCount - 1}
          canGoBack={safePageIndex > 0}
          onPrevious={() => setPageIndex((prev) => Math.max(0, prev - 1))}
          onNext={() => setPageIndex((prev) => Math.min(pageCount - 1, prev + 1))}
          pageSize={pageSize}
          itemCount={pageRows.length}
        />
      </CardContent>
    </Card>
  );
}
