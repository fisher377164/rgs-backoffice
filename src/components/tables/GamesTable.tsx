"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";

import ConfigurableTable, { TableConfig } from "@/components/tables/ConfigurableTable";
import { Game } from "@/lib/games/gameType";
import { deleteGame } from "@/lib/games/deleteGame";
import { showToast } from "@/lib/toastStore";

interface GamesTableProps {
  data: Game[];
}

const GamesTable = ({ data }: GamesTableProps) => {
  const router = useRouter();

  const handleEditGame = useCallback(
    (game: Game) => {
      router.push(`/builder/games/${game.id}/edit`);
    },
    [router]
  );

  const handleRemoveGame = useCallback(
    async (game: Game) => {
      const confirmed = window.confirm("If user sure to delete?");
      if (!confirmed) {
        return;
      }

      try {
        await deleteGame(game.id);

        showToast({
          variant: "success",
          title: "Game removed",
          message: `${game.name} has been removed successfully.`,
          hideButtonLabel: "Dismiss",
        });

        router.refresh();
      } catch (error) {
        console.error(`Failed to remove game ${game.id}`, error);
      }
    },
    [router]
  );

  const handleNavigateToGame = useCallback(
    (game: Game) => {
      router.push(`/builder/games/${game.id}`);
    },
    [router]
  );

  const tableConfig = useMemo<TableConfig<Game>>(
    () => ({
      name: "Games",
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
          onClick: handleEditGame,
        },
        remove: {
          label: "Remove",
          onClick: handleRemoveGame,
          buttonProps: {
            className: "text-red-500",
          },
        },
      },
      onRowClick: handleNavigateToGame,
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
          dataKey: "gameKey",
          sortable: true,
        },
        {
          key: "name",
          label: "Name",
          dataKey: "name",
          sortable: true,
        },
        {
          key: "studioId",
          label: "Studio ID",
          dataKey: "studioId",
          sortable: true,
        },
      ],
    }),
    [handleEditGame, handleNavigateToGame, handleRemoveGame]
  );

  return <ConfigurableTable data={data} config={tableConfig} />;
};

export default GamesTable;
