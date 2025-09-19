"use client";

import { useCallback, useMemo } from "react";

import ConfigurableTable, { TableConfig } from "@/components/tables/ConfigurableTable";
import type { Game } from "@/lib/games";

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
