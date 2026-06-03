import { useCallback, useState } from 'react';

/** Tracks CDF cursor stack for Previous / Next table navigation. */
export function useCursorPagination() {
  const [cursorStack, setCursorStack] = useState<(string | undefined)[]>([undefined]);
  const [pageIndex, setPageIndex] = useState(0);

  const cursor = cursorStack[pageIndex];

  const reset = useCallback(() => {
    setCursorStack([undefined]);
    setPageIndex(0);
  }, []);

  const goNext = useCallback((nextCursor: string | undefined) => {
    if (!nextCursor) {
      return;
    }
    setCursorStack((prev) => {
      const trimmed = prev.slice(0, pageIndex + 1);
      return [...trimmed, nextCursor];
    });
    setPageIndex((prev) => prev + 1);
  }, [pageIndex]);

  const goPrevious = useCallback(() => {
    setPageIndex((prev) => Math.max(0, prev - 1));
  }, []);

  return {
    cursor,
    page: pageIndex + 1,
    canGoBack: pageIndex > 0,
    goNext,
    goPrevious,
    reset,
  };
}
