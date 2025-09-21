"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Pagination from "@/components/tables/Pagination";
import Button from "@/components/ui/button/Button";

export type SortDirection = "asc" | "desc";

export interface TableField<T> {
  key: string;
  label: string;
  /** Optional data key when the value is a direct property on the row. */
  dataKey?: keyof T;
  /** Enable sorting for the column. */
  sortable?: boolean;
  /** Set to false to exclude the column from search results. */
  searchable?: boolean;
  /** Controls text alignment. Defaults to left alignment. */
  align?: "start" | "center" | "end";
  /** Optional accessor used when sorting. */
  sortAccessor?: (row: T) => string | number | Date | null | undefined;
  /** Optional accessor used when searching. */
  searchAccessor?: (row: T) => string | number | null | undefined;
  /** Additional classes for header and cell. */
  headerClassName?: string;
  cellClassName?: string;
  /** Optional custom renderer for cell content. */
  render?: (row: T) => React.ReactNode;
}

interface TableActionButtonProps {
  variant?: "primary" | "outline";
  className?: string;
}

export interface TableAction<T> {
  label?: string;
  onClick?: (row: T) => void;
  buttonProps?: TableActionButtonProps;
}

export interface TableActions<T> {
  label?: string;
  align?: "start" | "center" | "end";
  headerClassName?: string;
  cellClassName?: string;
  edit?: TableAction<T>;
  remove?: TableAction<T>;
}

export interface TableExpandableToggleColumnConfig {
  width?: string | number;
  headerClassName?: string;
  cellClassName?: string;
}

export interface TableExpandableConfig<T> {
  renderContent: (row: T) => React.ReactNode;
  toggleColumn?: TableExpandableToggleColumnConfig;
}

export interface TableConfig<T> {
  name?: string;
  fields: TableField<T>[];
  headerAction?: React.ReactNode;
  enableSorting?: boolean;
  enableSearch?: boolean;
  enablePagination?: boolean;
  itemsPerPageOptions?: number[];
  defaultItemsPerPage?: number;
  getRowKey?: (row: T, index: number) => string | number;
  actions?: TableActions<T>;
  expandable?: TableExpandableConfig<T>;
  onRowClick?: (row: T) => void;
}

interface ConfigurableTableProps<T extends object> {
  data: T[];
  config: TableConfig<T>;
}

const normalizeValue = (value: unknown): string | number => {
  if (value === null || value === undefined) {
    return "";
  }

  if (value instanceof Date) {
    return value.getTime();
  }

  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    return value.toLowerCase();
  }

  if (typeof value === "boolean") {
    return value ? 1 : 0;
  }

  return String(value);
};

const ConfigurableTable = <T extends object>({
  data,
  config,
}: ConfigurableTableProps<T>) => {
  const enableSorting = config.enableSorting ?? true;
  const enableSearch = config.enableSearch ?? true;
  const enablePagination = config.enablePagination ?? true;
  const pageSizeOptions = config.itemsPerPageOptions?.length
    ? config.itemsPerPageOptions
    : [5, 10, 20];

  const initialItemsPerPage = enablePagination
    ? config.defaultItemsPerPage && pageSizeOptions.includes(config.defaultItemsPerPage)
      ? config.defaultItemsPerPage
      : pageSizeOptions[0]
    : data.length || pageSizeOptions[0];

  const [searchTerm, setSearchTerm] = useState("");
  const [sortState, setSortState] = useState<{
    field: string | null;
    direction: SortDirection;
  }>({ field: null, direction: "asc" });
  const [itemsPerPage, setItemsPerPage] = useState<number>(initialItemsPerPage);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState<Set<string | number>>(
    () => new Set()
  );

  const toggleRowExpansion = useCallback((rowKey: string | number) => {
    setExpandedRows((previousSet) => {
      const nextSet = new Set(previousSet);
      if (nextSet.has(rowKey)) {
        nextSet.delete(rowKey);
      } else {
        nextSet.add(rowKey);
      }
      return nextSet;
    });
  }, []);

  useEffect(() => {
    setItemsPerPage(initialItemsPerPage);
    setCurrentPage(1);
  }, [initialItemsPerPage]);

  useEffect(() => {
    if (enablePagination) {
      setCurrentPage(1);
    }
  }, [enablePagination, searchTerm]);

  const resolveFieldValue = useCallback((row: T, field: TableField<T>) => {
    if (field.dataKey !== undefined) {
      const key = field.dataKey;
      return (row as Record<keyof T, unknown>)[key];
    }

    return (row as Record<string, unknown>)[field.key];
  }, []);

  const handleSort = useCallback(
    (field: TableField<T>) => {
      if (!enableSorting || field.sortable === false) {
        return;
      }

      setSortState((previousState) => {
        if (previousState.field === field.key) {
          return {
            field: field.key,
            direction: previousState.direction === "asc" ? "desc" : "asc",
          };
        }

        return {
          field: field.key,
          direction: "asc",
        };
      });
    },
    [enableSorting]
  );

  const filteredData = useMemo(() => {
    if (!enableSearch) {
      return data;
    }

    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return data;
    }

    return data.filter((row) =>
      config.fields.some((field) => {
        if (field.searchable === false) {
          return false;
        }

        const rawValue = field.searchAccessor?.(row) ?? resolveFieldValue(row, field);

        if (rawValue === null || rawValue === undefined) {
          return false;
        }

        if (typeof rawValue === "number") {
          return rawValue.toString().toLowerCase().includes(term);
        }

        if (rawValue instanceof Date) {
          return rawValue.toISOString().toLowerCase().includes(term);
        }

        return String(rawValue).toLowerCase().includes(term);
      })
    );
  }, [config.fields, data, enableSearch, resolveFieldValue, searchTerm]);

  const sortedData = useMemo(() => {
    if (!enableSorting || !sortState.field) {
      return filteredData;
    }

    const field = config.fields.find((item) => item.key === sortState.field);
    if (!field) {
      return filteredData;
    }

    const getValue = (row: T) => {
      if (field.sortAccessor) {
        return field.sortAccessor(row);
      }

      return resolveFieldValue(row, field);
    };

    return [...filteredData].sort((a, b) => {
      const aValue = getValue(a);
      const bValue = getValue(b);

      const normalizedA = normalizeValue(aValue);
      const normalizedB = normalizeValue(bValue);

      if (normalizedA < normalizedB) {
        return sortState.direction === "asc" ? -1 : 1;
      }

      if (normalizedA > normalizedB) {
        return sortState.direction === "asc" ? 1 : -1;
      }

      return 0;
    });
  }, [config.fields, enableSorting, filteredData, resolveFieldValue, sortState.direction, sortState.field]);

  const totalItems = sortedData.length;
  const totalPages = enablePagination
    ? Math.max(Math.ceil(totalItems / Math.max(itemsPerPage, 1)), 1)
    : 1;

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedData = useMemo(() => {
    if (!enablePagination) {
      return sortedData;
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, enablePagination, itemsPerPage, sortedData]);

  const rowKeyGetter = config.getRowKey;
  const computeRowKey = useCallback(
    (row: T, index: number) => {
      const key = rowKeyGetter?.(row, index);
      if (key === undefined || key === null) {
        return index;
      }
      return key;
    },
    [rowKeyGetter]
  );

  const handleItemsPerPageChange = useCallback((value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback(
    (page: number) => {
      if (!enablePagination) {
        return;
      }

      const clampedPage = Math.min(Math.max(page, 1), totalPages);
      setCurrentPage(clampedPage);
    },
    [enablePagination, totalPages]
  );

  const startEntry = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endEntry = enablePagination
    ? Math.min(currentPage * itemsPerPage, totalItems)
    : totalItems;

  const actionsConfig = config.actions;
  const hasActions = Boolean(actionsConfig && (actionsConfig.edit || actionsConfig.remove));
  const actionsAlignment =
    actionsConfig?.align === "start"
      ? "text-start"
      : actionsConfig?.align === "center"
      ? "text-center"
      : "text-end";

  const totalColumns =
    config.fields.length + (hasActions ? 1 : 0) + (config.expandable ? 1 : 0);
  const baseRowIndex = enablePagination ? (currentPage - 1) * itemsPerPage : 0;
  const isRowClickable = Boolean(config.onRowClick);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 dark:border-white/[0.05]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            {config.name && (
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                {config.name}
              </h3>
            )}
            {config.headerAction && <div className="sm:ml-2">{config.headerAction}</div>}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            {enableSearch && (
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M17.5 17.5L13.875 13.875M15.8333 9.58333C15.8333 13.1812 12.9312 16.0833 9.33333 16.0833C5.73551 16.0833 2.83333 13.1812 2.83333 9.58333C2.83333 5.98551 5.73551 3.08333 9.33333 3.08333C12.9312 3.08333 15.8333 5.98551 15.8333 9.58333Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search..."
                  className="h-10 w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-700 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-white/[0.05] dark:bg-transparent dark:text-white/80 dark:placeholder:text-gray-500"
                />
              </div>
            )}
            {enablePagination && (
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span>Rows per page:</span>
                <select
                  value={itemsPerPage}
                  onChange={(event) => handleItemsPerPageChange(Number(event.target.value))}
                  className="h-10 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-white/[0.05] dark:bg-transparent dark:text-white/80"
                >
                  {pageSizeOptions.map((option) => (
                    <option key={option} value={option} className="text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1024px]">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                {config.expandable && (
                  <TableCell
                    isHeader
                    className={`px-4 py-3 text-center text-theme-xs text-gray-500 dark:text-gray-400 ${
                      config.expandable.toggleColumn?.headerClassName ?? ""
                    }`}
                    style={
                      config.expandable.toggleColumn?.width
                        ? { width: config.expandable.toggleColumn.width }
                        : undefined
                    }
                  >
                    <span className="sr-only">Toggle row details</span>
                  </TableCell>
                )}
                {config.fields.map((field) => {
                  const alignmentClass =
                    field.align === "center"
                      ? "text-center"
                      : field.align === "end"
                      ? "text-right"
                      : "text-start";

                  const isSortedColumn = sortState.field === field.key;

                  return (
                    <TableCell
                      key={field.key}
                      isHeader
                      onClick={
                        enableSorting && field.sortable !== false
                          ? () => handleSort(field)
                          : undefined
                      }
                      className={`select-none px-4 py-3 font-medium text-theme-xs text-gray-500 transition-colors duration-150 dark:text-gray-400 ${alignmentClass} ${
                        enableSorting && field.sortable !== false
                          ? "cursor-pointer hover:text-gray-700 dark:hover:text-white/80"
                          : ""
                      } ${field.headerClassName ?? ""}`}
                    >
                      <span className="inline-flex items-center gap-1">
                        {field.label}
                        {enableSorting && field.sortable !== false && (
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {isSortedColumn ? (sortState.direction === "asc" ? "▲" : "▼") : "↕"}
                          </span>
                        )}
                      </span>
                    </TableCell>
                  );
                })}
                {hasActions && (
                  <TableCell
                    key="actions"
                    isHeader
                    className={`px-4 py-3 font-medium text-theme-xs text-gray-500 ${actionsAlignment} ${
                      actionsConfig?.headerClassName ?? ""
                    }`}
                  >
                    {actionsConfig?.label ?? "Actions"}
                  </TableCell>
                )}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {paginatedData.map((row, rowIndex) => {
                const absoluteIndex = baseRowIndex + rowIndex;
                const rowKey = computeRowKey(row, absoluteIndex);
                const isExpanded = expandedRows.has(rowKey);
                const handleRowClick = config.onRowClick
                  ? () => {
                      config.onRowClick?.(row);
                    }
                  : undefined;

                return (
                  <React.Fragment key={String(rowKey)}>
                    <TableRow
                      onClick={handleRowClick}
                      className={
                        isRowClickable
                          ? "cursor-pointer transition-colors hover:bg-gray-50/80 dark:hover:bg-white/[0.05]"
                          : undefined
                      }
                    >
                      {config.expandable && (
                        <TableCell
                          className={`px-4 py-3 text-center ${
                            config.expandable.toggleColumn?.cellClassName ?? ""
                          }`}
                          style={
                            config.expandable.toggleColumn?.width
                              ? { width: config.expandable.toggleColumn.width }
                              : undefined
                          }
                          >
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                toggleRowExpansion(rowKey);
                              }}
                              aria-label={isExpanded ? "Collapse row" : "Expand row"}
                              aria-expanded={isExpanded}
                              className="inline-flex h-7 w-7 items-center justify-center rounded border border-gray-200 text-sm font-medium text-gray-500 transition-colors hover:border-brand-300 hover:text-brand-500 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 dark:border-white/10 dark:text-gray-400 dark:hover:text-white"
                            >
                              {isExpanded ? "−" : "+"}
                          </button>
                        </TableCell>
                      )}
                      {config.fields.map((field) => {
                        const alignmentClass =
                          field.align === "center"
                            ? "text-center"
                            : field.align === "end"
                            ? "text-right"
                            : "text-start";

                        return (
                          <TableCell
                            key={field.key}
                            className={`px-4 py-3 text-theme-sm text-gray-500 dark:text-gray-400 ${alignmentClass} ${field.cellClassName ?? ""}`}
                          >
                            {field.render
                              ? field.render(row)
                              : (() => {
                                  const value = resolveFieldValue(row, field);
                                  return value !== null && value !== undefined ? String(value) : "";
                                })()}
                          </TableCell>
                        );
                      })}
                      {hasActions && (
                        <TableCell
                          className={`px-4 py-3 text-theme-sm text-gray-500 dark:text-gray-400 ${actionsAlignment} ${
                            actionsConfig?.cellClassName ?? ""
                          }`}
                        >
                          <div
                            className={`flex gap-2 ${
                              actionsConfig?.align === "center"
                                ? "justify-center"
                                : actionsConfig?.align === "start"
                                ? "justify-start"
                                : "justify-end"
                            }`}
                          >
                            {actionsConfig?.edit && (
                              <Button
                                size="sm"
                                variant={actionsConfig.edit.buttonProps?.variant ?? "outline"}
                                className={actionsConfig.edit.buttonProps?.className}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  actionsConfig.edit?.onClick?.(row);
                                }}
                              >
                                {actionsConfig.edit.label ?? "Edit"}
                              </Button>
                            )}
                            {actionsConfig?.remove && (
                              <Button
                                size="sm"
                                variant={actionsConfig.remove.buttonProps?.variant ?? "outline"}
                                className={
                                  actionsConfig.remove.buttonProps?.className ?? "text-red-500"
                                }
                                onClick={(event) => {
                                  event.stopPropagation();
                                  actionsConfig.remove?.onClick?.(row);
                                }}
                              >
                                {actionsConfig.remove.label ?? "Remove"}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                    {config.expandable && isExpanded && (
                      <TableRow className="bg-gray-50/80 dark:bg-white/[0.02]">
                        <TableCell
                          colSpan={totalColumns}
                          className="px-6 py-4 text-theme-sm text-gray-600 dark:text-gray-300"
                        >
                          {config.expandable.renderContent(row)}
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
              {paginatedData.length === 0 && (
                <TableRow>
                  <TableCell
                    className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400"
                    colSpan={totalColumns}
                  >
                    No records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      {enablePagination && (
        <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 text-sm text-gray-500 dark:border-white/[0.05] dark:text-gray-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Showing {startEntry} to {endEntry} of {totalItems} entries
          </p>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      )}
    </div>
  );
};
export default ConfigurableTable;

