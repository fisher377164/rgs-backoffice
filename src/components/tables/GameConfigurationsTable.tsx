"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";

import ConfigurableTable, { TableConfig } from "@/components/tables/ConfigurableTable";
import { deleteGameConfiguration } from "@/lib/game-configurations/deleteGameConfiguration";
import { GameConfiguration } from "@/lib/game-configurations/gameConfigurationType";
import { showToast } from "@/lib/toastStore";

interface GameConfigurationsTableProps {
  gameId: number;
  data: GameConfiguration[];
}

const GameConfigurationsTable = ({ gameId, data }: GameConfigurationsTableProps) => {
  const router = useRouter();

  const handleViewConfiguration = useCallback(
    (configuration: GameConfiguration) => {
      router.push(`/builder/games/${gameId}/configurations/${configuration.id}`);
    },
    [gameId, router]
  );

  const handleEditConfiguration = useCallback(
    (configuration: GameConfiguration) => {
      router.push(
        `/builder/games/${gameId}/configurations/${configuration.id}/edit`
      );
    },
    [gameId, router]
  );

  const handleRemoveConfiguration = useCallback(
    async (configuration: GameConfiguration) => {
      const confirmed = window.confirm("If user sure to delete?");
      if (!confirmed) {
        return;
      }

      try {
        await deleteGameConfiguration(configuration.id);

        showToast({
          variant: "success",
          title: "Configuration removed",
          message: `${configuration.name} has been removed successfully.`,
          hideButtonLabel: "Dismiss",
        });

        router.refresh();
      } catch (error) {
        console.error(
          `Failed to remove game configuration ${configuration.id}`,
          error
        );
      }
    },
    [router]
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
        remove: {
          label: "Remove",
          onClick: handleRemoveConfiguration,
          buttonProps: {
            className: "text-red-500",
          },
        },
      },
      onRowClick: handleViewConfiguration,
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
    [handleEditConfiguration, handleRemoveConfiguration, handleViewConfiguration]
  );

  return <ConfigurableTable data={data} config={tableConfig} />;
};

export default GameConfigurationsTable;
