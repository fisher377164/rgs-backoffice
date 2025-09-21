"use client";

import React, { useMemo } from "react";
import Link from "next/link";

import ConfigurableTable, { TableConfig } from "@/components/tables/ConfigurableTable";
import { PluginVersion } from "@/lib/plugins/pluginType";

interface PluginVersionsTableProps {
    versions: PluginVersion[];
    pluginId: number | string;
}

const PluginVersionsTable = ({ versions, pluginId }: PluginVersionsTableProps) => {
    const sanitizedPluginId = String(pluginId);

    const tableConfig = useMemo<TableConfig<PluginVersion>>(
        () => ({
            name: "Plugin versions",
            headerAction: (
                <Link
                    href={`/builder/plugins/${sanitizedPluginId}/versions/new`}
                    className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs transition-colors hover:bg-brand-600"
                >
                    New version
                </Link>
            ),
            enablePagination: true,
            enableSearch: false,
            enableSorting: true,
            defaultItemsPerPage: 5,
            itemsPerPageOptions: [5, 10, 20],
            getRowKey: (row) => row.id ?? row.version,
            fields: [
                {
                    key: "id",
                    label: "ID",
                    dataKey: "id",
                    sortable: true,
                },
                {
                    key: "version",
                    label: "Version",
                    dataKey: "version",
                    sortable: true,
                },
                {
                    key: "changeLog",
                    label: "Change log",
                    dataKey: "changeLog",
                    sortable: false,
                    render: (row) => (row.changeLog?.trim().length ? row.changeLog : "—"),
                },
                {
                    key: "configuration",
                    label: "Configuration",
                    dataKey: "configuration",
                    sortable: false,
                    render: (row) => (row.configuration?.trim().length ? row.configuration : "—"),
                },
            ],
        }),
        [sanitizedPluginId],
    );

    return <ConfigurableTable data={versions} config={tableConfig} />;
};

export default PluginVersionsTable;
