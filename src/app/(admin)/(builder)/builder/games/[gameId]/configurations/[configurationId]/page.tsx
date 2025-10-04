import Link from "next/link";
import { Metadata } from "next";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { fetchGameConfiguration } from "@/lib/game-configurations/fetchGameConfiguration";
import { fetchGameById } from "@/lib/games/fetchGameById";
import { fetchGamePlugins } from "@/lib/game-plugins/fetchGamePlugins";
import { fetchReelSets } from "@/lib/reel-sets/fetchReelSets";
import { fetchSymbols } from "@/lib/symbols/fetchSymbols";
import PluginsCard from "./PluginsCard";
import ReelSetsCard from "./ReelSetsCard";
import SymbolsCard from "./SymbolsCard";
import TriggerGameBuildButton from "./TriggerGameBuildButton";

export const metadata: Metadata = {
  title: "FiG | Game configuration details",
  description: "Game configuration details",
};

interface GameConfigurationDetailsPageProps {
  params: Promise<{
    gameId: string;
    configurationId: string;
  }>;
}

const parseId = (value: string): number => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error("Invalid identifier");
  }

  return parsed;
};

const renderConfigurationValue = (value: string | null | undefined) => {
  if (!value) {
    return <p className="text-sm text-gray-500">—</p>;
  }

  return (
    <pre className="whitespace-pre-wrap break-words rounded-lg bg-gray-50 p-4 text-sm text-gray-700 dark:bg-gray-900/40 dark:text-gray-200">
      {value}
    </pre>
  );
};

export default async function GameConfigurationDetailsPage({
  params,
}: GameConfigurationDetailsPageProps) {
  const { gameId: gameIdParam, configurationId: configurationIdParam } =
    await params;
  const gameId = parseId(gameIdParam);
  const configurationId = parseId(configurationIdParam);

  const [game, configuration, symbols, reelSets, plugins] = await Promise.all([
    fetchGameById(gameId),
    fetchGameConfiguration(configurationId),
    fetchSymbols(configurationId),
    fetchReelSets(configurationId),
    fetchGamePlugins(configurationId),
  ]);

  if (configuration.gameId !== game.id) {
    throw new Error("Configuration does not belong to the provided game");
  }

  return (
    <div>
      <PageBreadcrumb
        pageTitle={configuration.name}
        breadcrumbs={[
          { label: "Builder" },
          { label: "All Builded Games", href: "/builder/games" },
          { label: game.name, href: `/builder/games/${game.id}` },
        ]}
      />
      <div className="space-y-6">
        <ComponentCard
          title="Configuration details"
          action={
            <div className="flex flex-wrap items-center justify-end gap-3">
              <TriggerGameBuildButton
                configurationId={configuration.id}
                configurationName={configuration.name}
              />
              <Link
                href={`/builder/games/${game.id}/configurations/${configuration.id}/edit`}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-3.5 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600"
              >
                Edit
              </Link>
            </div>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                ID
              </p>
              <p className="text-base font-semibold text-gray-800 dark:text-white/90">
                {configuration.id}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Name
              </p>
              <p className="text-base font-semibold text-gray-800 dark:text-white/90">
                {configuration.name}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Game ID
              </p>
              <p className="text-base font-semibold text-gray-800 dark:text-white/90">
                {configuration.gameId}
              </p>
            </div>
          </div>
          <div className="mt-6 space-y-2">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Configuration payload
            </p>
            {renderConfigurationValue(configuration.configuration)}
          </div>
        </ComponentCard>

        <SymbolsCard
          configurationId={configuration.id}
          symbols={symbols}
        />

        <ReelSetsCard configurationId={configuration.id} reelSets={reelSets} />

        <PluginsCard configurationId={configuration.id} plugins={plugins} />
      </div>
    </div>
  );
}
