"use client";

import { useCallback, useMemo } from "react";

import ConfigurableTable, { TableConfig } from "@/components/tables/ConfigurableTable";
import { Game } from "@/lib/games/gameType";

interface GamesTableProps {
  data: Game[];
}

const GamesTable = ({ data }: GamesTableProps) => {
  const handleEditGame = useCallback((game: Game) => {
    console.log(`Edit game ${game.id}`);
  }, []);

  const handleRemoveGame = useCallback((game: Game) => {
    console.log(`Remove game ${game.id}`);
  }, []);

  const tableConfig = useMemo<TableConfig<Game>>(
    () => ({
      name: "Games",
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
          <div className="flex flex-col gap-1 text-sm text-gray-600 dark:text-gray-300">
            <p>
              <span className="font-medium text-gray-700 dark:text-gray-200">Game Key:</span> {row.gameKey}
            </p>
            <p>
              <span className="font-medium text-gray-700 dark:text-gray-200">Studio ID:</span> {row.studioId ?? "N/A"}
            </p>
          </div>
        ),
      },
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
      ],
    }),
    [handleEditGame, handleRemoveGame]
  );

  return <ConfigurableTable data={data} config={tableConfig} />;
};

export default GamesTable;
