import { Metadata } from "next";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { fetchGameConfiguration } from "@/lib/game-configurations/fetchGameConfiguration";
import { fetchGameById } from "@/lib/games/fetchGameById";
import { fetchGamePlugins } from "@/lib/game-plugins/fetchGamePlugins";
import { GamePlugin } from "@/lib/game-plugins/gamePluginType";
import { fetchReelSets } from "@/lib/reel-sets/fetchReelSets";
import { ReelSet } from "@/lib/reel-sets/reelSetType";
import { fetchSymbols } from "@/lib/symbols/fetchSymbols";
import { GameSymbol } from "@/lib/symbols/symbolType";

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

const renderEmptyState = (message: string) => (
  <p className="text-sm text-gray-500">{message}</p>
);

const SymbolsTable = ({ symbols }: { symbols: GameSymbol[] }) => {
  if (symbols.length === 0) {
    return renderEmptyState("No symbols available for this configuration.");
  }

  return (
    <div className="overflow-x-auto">
      <Table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <TableHeader className="bg-gray-50 dark:bg-gray-900/40">
          <TableRow>
            <TableCell isHeader className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
              Name
            </TableCell>
            <TableCell isHeader className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
              Description
            </TableCell>
            <TableCell isHeader className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
              Type
            </TableCell>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
          {symbols.map((symbol) => (
            <TableRow key={symbol.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
              <TableCell className="px-4 py-2 text-sm font-medium text-gray-800 dark:text-white/90">
                {symbol.name}
              </TableCell>
              <TableCell className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">
                {symbol.description || "—"}
              </TableCell>
              <TableCell className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">
                {symbol.type}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const ReelSetsTable = ({ reelSets }: { reelSets: ReelSet[] }) => {
  if (reelSets.length === 0) {
    return renderEmptyState("No reel sets available for this configuration.");
  }

  return (
    <div className="overflow-x-auto">
      <Table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <TableHeader className="bg-gray-50 dark:bg-gray-900/40">
          <TableRow>
            <TableCell isHeader className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
              ID
            </TableCell>
            <TableCell isHeader className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
              Reel set key
            </TableCell>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
          {reelSets.map((reelSet) => (
            <TableRow key={reelSet.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
              <TableCell className="px-4 py-2 text-sm font-medium text-gray-800 dark:text-white/90">
                {reelSet.id}
              </TableCell>
              <TableCell className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">
                {reelSet.reelSetKey}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const GamePluginsTable = ({ plugins }: { plugins: GamePlugin[] }) => {
  if (plugins.length === 0) {
    return renderEmptyState("No plugins associated with this configuration.");
  }

  return (
    <div className="overflow-x-auto">
      <Table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <TableHeader className="bg-gray-50 dark:bg-gray-900/40">
          <TableRow>
            <TableCell isHeader className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
              Plugin ID
            </TableCell>
            <TableCell isHeader className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
              Description
            </TableCell>
            <TableCell isHeader className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
              Configuration
            </TableCell>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
          {plugins.map((plugin) => (
            <TableRow key={plugin.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
              <TableCell className="px-4 py-2 text-sm font-medium text-gray-800 dark:text-white/90">
                {plugin.pluginId}
              </TableCell>
              <TableCell className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">
                {plugin.description || "—"}
              </TableCell>
              <TableCell className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">
                {plugin.configuration || "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
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
        pageTitle={`Configuration: ${configuration.name}`}
        breadcrumbs={[
          { label: "Builder" },
          { label: "All Builded Games", href: "/builder/games" },
          { label: game.name, href: `/builder/games/${game.id}` },
          { label: configuration.name },
        ]}
      />
      <div className="space-y-6">
        <ComponentCard title="Configuration details">
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

        <ComponentCard title="Symbols">
          <SymbolsTable symbols={symbols} />
        </ComponentCard>

        <ComponentCard title="Reel sets">
          <ReelSetsTable reelSets={reelSets} />
        </ComponentCard>

        <ComponentCard title="Plugins">
          <GamePluginsTable plugins={plugins} />
        </ComponentCard>
      </div>
    </div>
  );
}
