'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, Search, Filter } from 'lucide-react';
import { Button } from './Button';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  page?: number;
  totalPages?: number;
  totalRecords?: number;
  onPageChange?: (page: number) => void;
  selectedIds?: string[];
  onSelectAll?: (checked: boolean) => void;
  onSelectRow?: (id: string, checked: boolean) => void;
  getRowId?: (row: T) => string;
  bulkActions?: React.ReactNode;
  filterControls?: React.ReactNode;
}

export function DataTable<T>({
  columns,
  data,
  loading = false,
  searchable = true,
  searchPlaceholder = 'Search records...',
  searchValue = '',
  onSearchChange,
  page = 1,
  totalPages = 1,
  totalRecords = 0,
  onPageChange,
  selectedIds = [],
  onSelectAll,
  onSelectRow,
  getRowId,
  bulkActions,
  filterControls,
}: DataTableProps<T>) {
  const allSelected = data.length > 0 && selectedIds.length === data.length;

  return (
    <div className="space-y-4">
      {/* Top Filter & Bulk Actions Bar */}
      {(searchable || filterControls || bulkActions) && (
        <div className="p-4 apple-glass rounded-2xl border border-white/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          {searchable && onSearchChange && (
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                className="apple-input w-full pl-10 pr-4 py-2 text-sm font-normal text-slate-900 focus:outline-none"
              />
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            {filterControls}
            {selectedIds.length > 0 && bulkActions}
          </div>
        </div>
      )}

      {/* Main Table Card */}
      <div className="apple-card overflow-hidden">
        <div className="overflow-x-auto max-h-[650px] overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-900 text-white text-sm font-semibold tracking-wide shadow-xs">
              <tr>
                {onSelectAll && (
                  <th className="py-3.5 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={(e) => onSelectAll(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                )}
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`py-3.5 px-4 ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'}`}
                    style={{ width: col.width }}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-normal">
              {loading ? (
                <tr>
                  <td colSpan={columns.length + (onSelectAll ? 1 : 0)} className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="font-medium">Loading data...</p>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + (onSelectAll ? 1 : 0)} className="py-12 text-center text-slate-400">
                    <p className="font-semibold text-slate-600 text-sm">No matching records found</p>
                    <p className="text-xs mt-0.5 font-normal">Try adjusting your filters or search query.</p>
                  </td>
                </tr>
              ) : (
                data.map((row, rIdx) => {
                  const rowId = getRowId ? getRowId(row) : (row as any).id || String(rIdx);
                  const isSelected = selectedIds.includes(rowId);

                  return (
                    <tr
                      key={rowId}
                      className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-blue-50/40' : ''}`}
                    >
                      {onSelectRow && (
                        <td className="py-3 px-4 w-10">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => onSelectRow(rowId, e.target.checked)}
                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                      )}
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          className={`py-3 px-4 ${
                            col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                          }`}
                        >
                          {col.render ? col.render(row) : (row as any)[col.key]}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination Bar */}
        {onPageChange && (
          <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-normal">
            <span>
              Showing {data.length} of {totalRecords} Records
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="font-semibold text-slate-700">
                Page {page} of {totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
