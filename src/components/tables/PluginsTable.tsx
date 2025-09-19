"use client";

import { useCallback, useMemo } from "react";

import ConfigurableTable, { TableConfig } from "@/components/tables/ConfigurableTable";
import { Plugin } from "@/lib/plugins/pluginType";

interface PluginsTableProps {
  data: Plugin[];
}

const PluginsTable = ({ data }: PluginsTableProps) => {
  const handleEditPlugin = useCallback((plugin: Plugin) => {
    console.log(`Edit plugin ${plugin.id}`);
  }, []);

  const handleRemovePlugin = useCallback((plugin: Plugin) => {
    console.log(`Remove plugin ${plugin.id}`);
  }, []);

  const tableConfig = useMemo<TableConfig<Plugin>>(
    () => ({
      name: "Plugins",
      enablePagination: true,
      enableSearch: true,
      enableSorting: true,
      defaultItemsPerPage: 10,
      itemsPerPageOptions: [5, 10, 20],
      getRowKey: (row) => row.id,
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
      ],
    }),
    [handleEditPlugin, handleRemovePlugin]
  );

  return <ConfigurableTable data={data} config={tableConfig} />;
};

export default PluginsTable;
