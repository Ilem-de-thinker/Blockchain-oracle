import React from 'react';

interface DataTableProps<T> {
  data: T[];
  columns: {
    key: keyof T | string;
    header: string;
    render?: (item: T) => React.ReactNode;
    className?: string;
  }[];
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  onSelect?: (items: T[]) => void;
  selectedItems?: T[];
  rowKey?: keyof T | string;
  loading?: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
}

export function DataTable<T>({
  data,
  columns,
  onSort,
  sortKey,
  sortDirection,
  onSelect,
  selectedItems = [],
  rowKey = 'id',
  loading = false,
  pagination,
}: DataTableProps<T>) {
  const [selectAll, setSelectAll] = React.useState(false);

  const handleSelectAll = () => {
    if (selectAll) {
      onSelect?.([]);
    } else {
      onSelect?.([...data]);
    }
    setSelectAll(!selectAll);
  };

  const handleSelectItem = (item: T) => {
    const key = rowKey as keyof T;
    const isSelected = selectedItems.some(s => s[key] === item[key]);
    if (isSelected) {
      onSelect?.(selectedItems.filter(s => s[key] !== item[key]));
    } else {
      onSelect?.([...selectedItems, item]);
    }
  };

  const isSelected = (item: T) => {
    const key = rowKey as keyof T;
    return selectedItems.some(s => s[key] === item[key]);
  };

  if (loading) {
    return (
      <div className="bg-surface rounded-2xl border border-border overflow-hidden">
        <div className="animate-pulse">
          <div className="h-12 bg-surface-hover border-b"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 border-b bg-bg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-2xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-bg border-b border-border">
              {onSelect && (
                <th className="px-4 py-3 w-12">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="rounded border-border text-purple-600 focus:ring-purple-500"
                  />
                </th>
              )}
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider ${col.className || ''}`}
                  onClick={() => onSort && col.key !== 'actions' ? onSort(col.key as string, sortDirection === 'asc' ? 'desc' : 'asc') : undefined}
                >
                  <div className="flex items-center gap-2">
                    {col.header}
                    {onSort && sortKey === col.key && (
                      <i className={`fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'} text-gray-400`}></i>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((item, idx) => (
              <tr
                key={idx}
                className={`hover:bg-surface-hover transition-colors ${isSelected(item) ? 'bg-purple-50' : ''}`}
              >
                {onSelect && (
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={isSelected(item)}
                      onChange={() => handleSelectItem(item)}
className="rounded border-border text-purple-600 focus:ring-purple-500"
                    />
                  </td>
                )}
                {columns.map((col, cIdx) => (
                  <td key={cIdx} className={`px-4 py-4 text-sm ${col.className || ''}`}>
                    {col.render ? col.render(item) : (item[col.key as keyof T] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && pagination.total > pagination.limit && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <p className="text-sm text-text-muted">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} results
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-1.5 text-sm rounded-lg border border-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-bg"
            >
              Previous
            </button>
            {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => pagination.onPageChange(page)}
                  className={`px-3 py-1.5 text-sm rounded-lg ${
                    pagination.page === page
                      ? 'bg-purple-600 text-white'
                      : 'border border-border hover:bg-surface-hover'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="px-3 py-1.5 text-sm rounded-lg border border-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-bg"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
