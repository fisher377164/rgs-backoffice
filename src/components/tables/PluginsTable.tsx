"use client";

import React, { useCallback, useMemo } from "react";

import ConfigurableTable, { TableConfig } from "@/components/tables/ConfigurableTable";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { Plugin } from "@/lib/plugins/pluginType";
import { useRouter } from "next/navigation";

interface PluginsTableProps {
    data: Plugin[];
}

const PluginsTable = ({data}: PluginsTableProps) => {
    const router = useRouter();

    const handleEditPlugin = useCallback((plugin: Plugin) => {
        console.log(`Edit plugin ${plugin.id}`);
    }, []);

    const handleRemovePlugin = useCallback((plugin: Plugin) => {
        console.log(`Remove plugin ${plugin.id}`);
    }, []);

    const handleNavigateToPlugin = useCallback(
        (plugin: Plugin) => {
            router.push(`/builder/plugins/${plugin.id}`);
        },
        [router],
    );

    const tableConfig = useMemo<TableConfig<Plugin>>(
        () => ({
            name: "Plugins",
            enablePagination: true,
            enableSearch: true,
            enableSorting: true,
            defaultItemsPerPage: 10,
            itemsPerPageOptions: [5, 10, 20],
            getRowKey: (row) => row.id,
            expandable: {
                toggleColumn: {
                    width: "3rem",
                },
                renderContent: (row) => (
                    <div className="space-y-4">
                        <div
                            className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
                            <div
                                className="border-b border-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 dark:border-white/[0.05] dark:text-gray-200"
                            >
                                <span>Versions</span>
                            </div>
                            <div className="max-w-full overflow-x-auto">
                                <Table className="min-w-[600px]">
                                    <TableHeader className="bg-gray-50 dark:bg-white/[0.02]">
                                        <TableRow>
                                            <TableCell
                                                isHeader
                                                className="px-4 py-2 text-left text-theme-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400"
                                            >
                                                ID
                                            </TableCell>
                                            <TableCell
                                                isHeader
                                                className="px-4 py-2 text-left text-theme-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400"
                                            >
                                                Version
                                            </TableCell>
                                            <TableCell
                                                isHeader
                                                className="px-4 py-2 text-left text-theme-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400"
                                            >
                                                Change log
                                            </TableCell>
                                            <TableCell
                                                isHeader
                                                className="px-4 py-2 text-left text-theme-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400"
                                            >
                                                Configuration
                                            </TableCell>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                        {row.versions.length > 0 ? (
                                            row.versions.map((version) => (
                                                <TableRow key={version.id}>
                                                    <TableCell
                                                        className="px-4 py-3 text-theme-sm text-gray-600 dark:text-gray-300">
                                                        {version.id}
                                                    </TableCell>
                                                    <TableCell
                                                        className="px-4 py-3 text-theme-sm text-gray-600 dark:text-gray-300">
                                                        {version.version}
                                                    </TableCell>
                                                    <TableCell
                                                        className="px-4 py-3 text-theme-sm text-gray-600 dark:text-gray-300">
                                                        {version.changeLog || "—"}
                                                    </TableCell>
                                                    <TableCell
                                                        className="px-4 py-3 text-theme-sm text-gray-600 dark:text-gray-300">
                                                        {version.configuration || "—"}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={4}
                                                    className="px-4 py-4 text-center text-theme-sm text-gray-500 dark:text-gray-400"
                                                >
                                                    No versions available.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </div>
                ),
            },
            actions: {
                align: "end",
                edit: {
                    label: "Edit",
                    onClick: handleEditPlugin,
                },
                remove: {
                    label: "Remove",
                    onClick: handleRemovePlugin,
                    buttonProps: {
                        className: "text-red-500",
                    },
                },
            },
            onRowClick: handleNavigateToPlugin,
            fields: [
                {
                    key: "id",
                    label: "ID",
                    dataKey: "id",
                    sortable: true,
                    searchAccessor: (row) => row.id,
                },
                {
                    key: "key",
                    label: "Key",
                    dataKey: "pluginKey",
                    sortable: true,
                },
                {
                    key: "name",
                    label: "Name",
                    dataKey: "name",
                    sortable: true,
                },
                {
                    key: "groupId",
                    label: "Group ID",
                    dataKey: "groupId",
                    sortable: true,
                },
                {
                    key: "artifactId",
                    label: "Artifact ID",
                    dataKey: "artifactId",
                    sortable: true,
                },
                {
                    key: "description",
                    label: "Description",
                    dataKey: "description",
                },
            ],
        }),
        [handleEditPlugin, handleNavigateToPlugin, handleRemovePlugin]
    );

    return <ConfigurableTable data={data} config={tableConfig} />;
};

export default PluginsTable;
