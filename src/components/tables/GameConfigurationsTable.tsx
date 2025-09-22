"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";

import ConfigurableTable, { TableConfig } from "@/components/tables/ConfigurableTable";
import { GameConfiguration } from "@/lib/game-configurations/gameConfigurationType";

interface GameConfigurationsTableProps {
  gameId: number;
  data: GameConfiguration[];
}

const GameConfigurationsTable = ({ gameId, data }: GameConfigurationsTableProps) => {
  const router = useRouter();

  const handleEditConfiguration = useCallback(
    (configuration: GameConfiguration) => {
      router.push(
        `/builder/games/${gameId}/configurations/${configuration.id}/edit`
      );
    },
    [gameId, router]
  );

  const tableConfig = useMemo<TableConfig<GameConfiguration>>(
    () => ({
      name: "Configurations",
      enablePagination: false,
      enableSearch: false,
      enableSorting: false,
      getRowKey: (row) => row.id,
      actions: {
        align: "end",
        edit: {
          label: "Edit",
          onClick: handleEditConfiguration,
        },
      },
      onRowClick: handleEditConfiguration,
      fields: [
        {
          key: "id",
          label: "ID",
          dataKey: "id",
        },
        {
          key: "name",
          label: "Name",
          dataKey: "name",
        },
        {
          key: "configuration",
          label: "Configuration",
          render: (row) => row.configuration ?? "—",
        },
      ],
    }),
    [handleEditConfiguration]
  );

  return <ConfigurableTable data={data} config={tableConfig} />;
};

export default GameConfigurationsTable;
