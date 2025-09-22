import Link from "next/link";
import { Metadata } from "next";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import GameConfigurationsTable from "@/components/tables/GameConfigurationsTable";
import { fetchGameById } from "@/lib/games/fetchGameById";
import { fetchGameConfigurations } from "@/lib/game-configurations/fetchGameConfigurations";

export const metadata: Metadata = {
  title: "FiG | Game details",
  description: "Game details page",
};

interface GamePageProps {
  params: Promise<{
    gameId: string;
  }>;
}

const parseGameId = (value: string): number => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error("Invalid game id");
  }

  return parsed;
};

export default async function GamePage({ params }: GamePageProps) {
  const { gameId: gameIdParam } = await params;
  const gameId = parseGameId(gameIdParam);
  const [game, configurations] = await Promise.all([
    fetchGameById(gameId),
    fetchGameConfigurations(gameId),
  ]);

  return (
    <div>
      <PageBreadcrumb
        pageTitle={game.name}
        breadcrumbs={[
          { label: "Builder" },
          { label: "All Builded Games", href: "/builder/games" },
          { label: game.name },
        ]}
      />
      <div className="space-y-6">
        <ComponentCard title="Game details">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">ID</p>
              <p className="text-base font-semibold text-gray-800 dark:text-white/90">{game.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Game key</p>
              <p className="text-base font-semibold text-gray-800 dark:text-white/90">{game.gameKey}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</p>
              <p className="text-base font-semibold text-gray-800 dark:text-white/90">{game.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Studio ID</p>
              <p className="text-base font-semibold text-gray-800 dark:text-white/90">
                {game.studioId ?? "—"}
              </p>
            </div>
          </div>
        </ComponentCard>

        <ComponentCard
          title="Game configurations"
          action={
            <Link
              href={`/builder/games/${game.id}/configurations/new`}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs transition-colors hover:bg-brand-600"
            >
              New Game Configuration
            </Link>
          }
        >
          <GameConfigurationsTable gameId={game.id} data={configurations} />
        </ComponentCard>
      </div>
    </div>
  );
}
