import React from 'react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from '@heroicons/react/20/solid';

const Pagination = ({
  currentPage = 0,
  totalPages = 1,
  onPageChange,
  pageSize = 10,
  totalElements = 0,
}) => {
  if (totalPages <= 0) return null;

  const startElement = totalElements === 0 ? 0 : currentPage * pageSize + 1;
  const endElement = Math.min((currentPage + 1) * pageSize, totalElements);

  // Generate page numbers (max 5 around currentPage)
  const getPageNumbers = () => {
    const pages = [];
    let start = Math.max(0, currentPage - 2);
    let end = Math.min(totalPages - 1, start + 4);

    if (end - start < 4) {
      start = Math.max(0, end - 4);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-4 bg-white border-t border-gray-200 rounded-b-xl">
      <div className="text-sm text-gray-700">
        Showing <span className="font-semibold text-gray-900">{startElement}</span>-
        <span className="font-semibold text-gray-900">{endElement}</span> of{' '}
        <span className="font-semibold text-gray-900">{totalElements}</span> results
      </div>

      <div className="inline-flex items-center gap-1">
        {/* First Page */}
        <button
          type="button"
          onClick={() => onPageChange(0)}
          disabled={currentPage === 0}
          className="p-1.5 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
          title="First Page"
        >
          <ChevronDoubleLeftIcon className="w-4 h-4" />
        </button>

        {/* Previous */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="p-1.5 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
          title="Previous Page"
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </button>

        {/* Page numbers */}
        {getPageNumbers().map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`min-w-[32px] h-8 text-xs font-semibold rounded-lg transition-all duration-200 ${
              currentPage === page
                ? 'bg-blue-600 text-white shadow-sm'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {page + 1}
          </button>
        ))}

        {/* Next */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          className="p-1.5 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
          title="Next Page"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </button>

        {/* Last Page */}
        <button
          type="button"
          onClick={() => onPageChange(totalPages - 1)}
          disabled={currentPage >= totalPages - 1}
          className="p-1.5 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
          title="Last Page"
        >
          <ChevronDoubleRightIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
