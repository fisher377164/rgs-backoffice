"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import Badge from "@/components/ui/badge/Badge";
import Image from "next/image";
import Pagination from "@/components/tables/Pagination";

type SortDirection = "asc" | "desc";

interface TableField<T> {
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

interface TableConfig<T> {
  name: string;
  fields: TableField<T>[];
  enableSorting?: boolean;
  enableSearch?: boolean;
  enablePagination?: boolean;
  itemsPerPageOptions?: number[];
  defaultItemsPerPage?: number;
  getRowKey?: (row: T, index: number) => string | number;
}

interface ConfigurableTableProps<T extends Record<string, unknown>> {
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

const ConfigurableTable = <T extends Record<string, unknown>>({
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
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [itemsPerPage, setItemsPerPage] = useState<number>(initialItemsPerPage);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setItemsPerPage(initialItemsPerPage);
    setCurrentPage(1);
  }, [initialItemsPerPage]);

  useEffect(() => {
    if (enablePagination) {
      setCurrentPage(1);
    }
  }, [enablePagination, searchTerm]);

  const resolveFieldValue = useCallback(
    (row: T, field: TableField<T>) => {
      if (field.dataKey !== undefined) {
        return row[field.dataKey];
      }

      return (row as Record<string, unknown>)[field.key];
    },
    []
  );

  const handleSort = useCallback(
    (field: TableField<T>) => {
      if (!enableSorting || !field.sortable) {
        return;
      }

      setSortField((previousField) => {
        if (previousField === field.key) {
          setSortDirection((direction) => (direction === "asc" ? "desc" : "asc"));
          return previousField;
        }

        setSortDirection("asc");
        return field.key;
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
    if (!enableSorting || !sortField) {
      return filteredData;
    }

    const field = config.fields.find((item) => item.key === sortField);
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
        return sortDirection === "asc" ? -1 : 1;
      }

      if (normalizedA > normalizedB) {
        return sortDirection === "asc" ? 1 : -1;
      }

      return 0;
    });
  }, [config.fields, enableSorting, filteredData, resolveFieldValue, sortDirection, sortField]);

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

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 dark:border-white/[0.05]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {config.name}
          </h3>
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
                {config.fields.map((field) => {
                  const alignmentClass =
                    field.align === "center"
                      ? "text-center"
                      : field.align === "end"
                      ? "text-right"
                      : "text-start";

                  const isSortedColumn = sortField === field.key;

                  return (
                    <TableCell
                      key={field.key}
                      isHeader
                      onClick={() => handleSort(field)}
                      className={`select-none px-4 py-3 font-medium text-theme-xs text-gray-500 transition-colors duration-150 dark:text-gray-400 ${alignmentClass} ${
                        enableSorting && field.sortable ? "cursor-pointer hover:text-gray-700 dark:hover:text-white/80" : ""
                      } ${field.headerClassName ?? ""}`}
                    >
                      <span className="inline-flex items-center gap-1">
                        {field.label}
                        {enableSorting && field.sortable && (
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {isSortedColumn ? (sortDirection === "asc" ? "▲" : "▼") : "↕"}
                          </span>
                        )}
                      </span>
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {paginatedData.map((row, rowIndex) => (
                <TableRow
                  key={
                    config.getRowKey
                      ? config.getRowKey(row, (currentPage - 1) * itemsPerPage + rowIndex)
                      : `${(currentPage - 1) * itemsPerPage + rowIndex}`
                  }
                >
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
                </TableRow>
              ))}
              {paginatedData.length === 0 && (
                <TableRow>
                  <TableCell
                    className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400"
                    colSpan={config.fields.length}
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

interface Order {
  id: number;
  user: {
    image: string;
    name: string;
    role: string;
  };
  projectName: string;
  team: {
    images: string[];
  };
  status: "Active" | "Pending" | "Cancel";
  budget: string;
}

const orders: Order[] = [
  {
    id: 1,
    user: {
      image: "/images/user/user-17.jpg",
      name: "Lindsey Curtis",
      role: "Web Designer",
    },
    projectName: "Agency Website",
    team: {
      images: [
        "/images/user/user-22.jpg",
        "/images/user/user-23.jpg",
        "/images/user/user-24.jpg",
      ],
    },
    budget: "3.9K",
    status: "Active",
  },
  {
    id: 2,
    user: {
      image: "/images/user/user-18.jpg",
      name: "Kaiya George",
      role: "Project Manager",
    },
    projectName: "Technology",
    team: {
      images: ["/images/user/user-25.jpg", "/images/user/user-26.jpg"],
    },
    budget: "24.9K",
    status: "Pending",
  },
  {
    id: 3,
    user: {
      image: "/images/user/user-17.jpg",
      name: "Zain Geidt",
      role: "Content Writing",
    },
    projectName: "Blog Writing",
    team: {
      images: ["/images/user/user-27.jpg"],
    },
    budget: "12.7K",
    status: "Active",
  },
  {
    id: 4,
    user: {
      image: "/images/user/user-20.jpg",
      name: "Abram Schleifer",
      role: "Digital Marketer",
    },
    projectName: "Social Media",
    team: {
      images: [
        "/images/user/user-28.jpg",
        "/images/user/user-29.jpg",
        "/images/user/user-30.jpg",
      ],
    },
    budget: "2.8K",
    status: "Cancel",
  },
  {
    id: 5,
    user: {
      image: "/images/user/user-21.jpg",
      name: "Carla George",
      role: "Front-end Developer",
    },
    projectName: "Website",
    team: {
      images: [
        "/images/user/user-31.jpg",
        "/images/user/user-32.jpg",
        "/images/user/user-33.jpg",
      ],
    },
    budget: "4.5K",
    status: "Active",
  },
  {
    id: 6,
    user: {
      image: "/images/user/user-19.jpg",
      name: "Monica Bates",
      role: "Product Manager",
    },
    projectName: "Mobile App",
    team: {
      images: [
        "/images/user/user-24.jpg",
        "/images/user/user-25.jpg",
        "/images/user/user-26.jpg",
      ],
    },
    budget: "15.2K",
    status: "Pending",
  },
  {
    id: 7,
    user: {
      image: "/images/user/user-15.jpg",
      name: "Joel Rodas",
      role: "QA Engineer",
    },
    projectName: "Testing",
    team: {
      images: [
        "/images/user/user-27.jpg",
        "/images/user/user-28.jpg",
        "/images/user/user-29.jpg",
      ],
    },
    budget: "6.3K",
    status: "Active",
  },
  {
    id: 8,
    user: {
      image: "/images/user/user-16.jpg",
      name: "Alexa Hoover",
      role: "UX Researcher",
    },
    projectName: "User Interviews",
    team: {
      images: [
        "/images/user/user-22.jpg",
        "/images/user/user-24.jpg",
        "/images/user/user-30.jpg",
      ],
    },
    budget: "8.1K",
    status: "Active",
  },
];

const statusColorMap: Record<Order["status"], "success" | "warning" | "error"> = {
  Active: "success",
  Pending: "warning",
  Cancel: "error",
};

const orderTableConfig: TableConfig<Order> = {
  name: "Games",
  enablePagination: true,
  enableSearch: true,
  enableSorting: true,
  defaultItemsPerPage: 5,
  itemsPerPageOptions: [5, 10, 20],
  getRowKey: (row) => row.id,
  fields: [
    {
      key: "user",
      label: "User",
      sortable: true,
      searchAccessor: (row) => `${row.user.name} ${row.user.role}`,
      sortAccessor: (row) => row.user.name.toLowerCase(),
      headerClassName: "px-5",
      cellClassName: "px-5 sm:px-6 text-start",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 overflow-hidden rounded-full">
            <Image
              width={40}
              height={40}
              src={row.user.image}
              alt={row.user.name}
            />
          </div>
          <div>
            <span className="block font-medium text-theme-sm text-gray-800 dark:text-white/90">
              {row.user.name}
            </span>
            <span className="block text-theme-xs text-gray-500 dark:text-gray-400">
              {row.user.role}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "projectName",
      label: "Project Name",
      dataKey: "projectName",
      sortable: true,
      headerClassName: "text-start",
      cellClassName: "text-start",
    },
    {
      key: "team",
      label: "Team",
      headerClassName: "text-start",
      cellClassName: "text-start",
      searchAccessor: (row) => row.team.images.join(" "),
      render: (row) => (
        <div className="flex -space-x-2">
          {row.team.images.map((teamImage, index) => (
            <div
              key={teamImage}
              className="h-6 w-6 overflow-hidden rounded-full border-2 border-white dark:border-gray-900"
            >
              <Image
                width={24}
                height={24}
                src={teamImage}
                alt={`Team member ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      dataKey: "status",
      sortable: true,
      align: "center",
      cellClassName: "text-center",
      headerClassName: "text-center",
      render: (row) => (
        <Badge size="sm" color={statusColorMap[row.status]}>
          {row.status}
        </Badge>
      ),
    },
    {
      key: "budget",
      label: "Budget",
      dataKey: "budget",
      sortable: true,
      align: "end",
      cellClassName: "text-right",
      headerClassName: "text-right",
    },
  ],
};

export default function BasicTable() {
  return <ConfigurableTable data={orders} config={orderTableConfig} />;
}

