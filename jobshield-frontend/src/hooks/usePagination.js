import { useState, useMemo, useCallback } from 'react';

/**
 * @typedef {Object} PaginationOptions
 * @property {number} [initialPage=0] - Starting page index (0-based)
 * @property {number} [initialPageSize=10] - Number of records per page
 * @property {number} [initialTotalElements=0] - Initial total items count
 * @property {number} [initialTotalPages=1] - Initial total pages count
 */

/**
 * @typedef {Object} PaginationResult
 * @property {number} currentPage - Current 0-based page index
 * @property {number} pageSize - Number of items displayed per page
 * @property {number} totalPages - Total available pages
 * @property {number} totalElements - Total elements across all pages
 * @property {boolean} isFirstPage - Whether current page is the first page (0)
 * @property {boolean} isLastPage - Whether current page is the last page
 * @property {number} showingFrom - 1-based index of starting item on current page
 * @property {number} showingTo - 1-based index of ending item on current page
 * @property {(page: number) => void} goToPage - Jump to a specific page index
 * @property {() => void} goToNextPage - Navigate to next page if available
 * @property {() => void} goToPrevPage - Navigate to previous page if available
 * @property {() => void} goToFirstPage - Navigate directly to page 0
 * @property {() => void} goToLastPage - Navigate to the final page
 * @property {() => void} resetPage - Reset current page back to 0
 * @property {(data: { totalPages?: number; totalElements?: number }) => void} setPageData - Update metadata from API responses
 * @property {(size: number) => void} setPageSize - Update items per page and reset to page 0
 */

/**
 * Custom hook to manage state, boundaries, and computed indices for paginated data.
 *
 * @param {PaginationOptions} [options={}] - Configuration options
 * @returns {PaginationResult} Pagination state and navigation methods
 *
 * @example
 * const pagination = usePagination({ initialPage: 0, initialPageSize: 10 });
 * console.log(`Displaying items ${pagination.showingFrom} to ${pagination.showingTo}`);
 * pagination.goToNextPage();
 */
export const usePagination = ({
  initialPage = 0,
  initialPageSize = 10,
  initialTotalElements = 0,
  initialTotalPages = 1,
} = {}) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [totalElements, setTotalElements] = useState(initialTotalElements);

  const isFirstPage = currentPage <= 0;
  const isLastPage = totalPages > 0 ? currentPage >= totalPages - 1 : true;

  const showingFrom = useMemo(() => {
    if (totalElements === 0) return 0;
    return currentPage * pageSize + 1;
  }, [currentPage, pageSize, totalElements]);

  const showingTo = useMemo(() => {
    if (totalElements === 0) return 0;
    return Math.min((currentPage + 1) * pageSize, totalElements);
  }, [currentPage, pageSize, totalElements]);

  const goToPage = useCallback(
    (pageNumber) => {
      const target = Math.max(0, Math.min(pageNumber, Math.max(0, totalPages - 1)));
      setCurrentPage(target);
    },
    [totalPages]
  );

  const goToNextPage = useCallback(() => {
    if (!isLastPage) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [isLastPage]);

  const goToPrevPage = useCallback(() => {
    if (!isFirstPage) {
      setCurrentPage((prev) => Math.max(0, prev - 1));
    }
  }, [isFirstPage]);

  const goToFirstPage = useCallback(() => {
    setCurrentPage(0);
  }, []);

  const goToLastPage = useCallback(() => {
    if (totalPages > 0) {
      setCurrentPage(totalPages - 1);
    }
  }, [totalPages]);

  const resetPage = useCallback(() => {
    setCurrentPage(0);
  }, []);

  const setPageData = useCallback(({ totalPages: pages, totalElements: elements }) => {
    if (typeof pages === 'number') setTotalPages(pages);
    if (typeof elements === 'number') setTotalElements(elements);
  }, []);

  const setPageSize = useCallback((newSize) => {
    const parsed = parseInt(newSize, 10);
    if (!isNaN(parsed) && parsed > 0) {
      setPageSizeState(parsed);
      setCurrentPage(0);
    }
  }, []);

  return {
    currentPage,
    pageSize,
    totalPages,
    totalElements,
    isFirstPage,
    isLastPage,
    showingFrom,
    showingTo,
    goToPage,
    goToNextPage,
    goToPrevPage,
    goToFirstPage,
    goToLastPage,
    resetPage,
    setPageData,
    setPageSize,
  };
};

export default usePagination;
