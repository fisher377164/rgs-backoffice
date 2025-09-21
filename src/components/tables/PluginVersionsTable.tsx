"use client";

import React, { useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import ConfigurableTable, { TableConfig } from "@/components/tables/ConfigurableTable";
import { fetchData } from "@/lib/apiClient";
import { PluginVersion } from "@/lib/plugins/pluginType";
import { showToast } from "@/lib/toastStore";

interface PluginVersionsTableProps {
    versions: PluginVersion[];
    pluginId: number | string;
}

const PluginVersionsTable = ({ versions, pluginId }: PluginVersionsTableProps) => {
    const router = useRouter();
    const sanitizedPluginId = String(pluginId);

    const handleEditVersion = useCallback(
        (version: PluginVersion) => {
            router.push(`/builder/plugins/${sanitizedPluginId}/versions/${version.id}/edit`);
        },
        [router, sanitizedPluginId],
    );

    const handleRemoveVersion = useCallback(
        async (version: PluginVersion) => {
            const confirmed = window.confirm("If user sure to delete?");
            if (!confirmed) {
                return;
            }

            try {
                await fetchData<void>(`/v1/plugins/${sanitizedPluginId}/versions/${version.id}`, {
                    method: "DELETE",
                });

                showToast({
                    variant: "success",
                    title: "Version removed",
                    message: `Version ${version.version} has been removed successfully.`,
                    hideButtonLabel: "Dismiss",
                });

                router.refresh();
            } catch (error) {
                console.error(`Failed to remove version ${version.id}`, error);
            }
        },
        [router, sanitizedPluginId],
    );

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
            actions: {
                align: "end",
                edit: {
                    label: "Edit",
                    onClick: handleEditVersion,
                },
                remove: {
                    label: "Remove",
                    onClick: handleRemoveVersion,
                    buttonProps: {
                        className: "text-red-500",
                    },
                },
            },
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
        [handleEditVersion, handleRemoveVersion, sanitizedPluginId],
    );

    return <ConfigurableTable data={versions} config={tableConfig} />;
};

export default PluginVersionsTable;
