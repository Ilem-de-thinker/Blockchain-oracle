import React from 'react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const siblingCount = 1;
    const boundaryCount = 1;

    const start = Math.max(2, currentPage - siblingCount);
    const end = Math.min(totalPages - 1, currentPage + siblingCount);

    if (currentPage - siblingCount > 2) {
      for (let i = 1; i <= boundaryCount; i++) {
        pages.push(i);
      }
      if (start > 2) {
        pages.push('...');
      }
    } else {
      for (let i = 1; i < start; i++) {
        pages.push(i);
      }
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage + siblingCount < totalPages - 1) {
      if (end < totalPages - 1) {
        pages.push('...');
      }
      for (let i = totalPages - boundaryCount + 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      for (let i = end + 1; i <= totalPages; i++) {
        pages.push(i);
      }
    }

    return pages.filter((page, index, self) => self.indexOf(page) === index);
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>
          Showing {startItem} to {endItem} of {totalItems} results
        </span>
        <span>
          Page {currentPage} of {totalPages}
        </span>
      </div>

      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-purple-600 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i className="fas fa-chevron-left text-xs"></i>
        </button>

        {pageNumbers.map((pageNum, idx) =>
          typeof pageNum === 'number' ? (
            <button
              key={idx}
              onClick={() => onPageChange(pageNum)}
              className={cn(
                'min-w-[36px] h-9 rounded-lg text-sm font-medium transition-colors',
                currentPage === pageNum
                  ? 'bg-purple-600 text-white'
                  : 'border border-gray-300 text-gray-700 hover:bg-purple-600 hover:text-white'
              )}
            >
              {pageNum}
            </button>
          ) : (
            <span key={idx} className="px-2 text-gray-400">
              ...
            </span>
          )
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-purple-600 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i className="fas fa-chevron-right text-xs"></i>
        </button>
      </div>
    </div>
  );
};

export default Pagination;
