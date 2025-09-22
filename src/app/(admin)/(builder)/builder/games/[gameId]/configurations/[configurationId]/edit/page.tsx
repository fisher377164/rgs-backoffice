import { Metadata } from "next";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { fetchGameById } from "@/lib/games/fetchGameById";
import { fetchGameConfiguration } from "@/lib/game-configurations/fetchGameConfiguration";

import EditGameConfigurationForm from "./EditGameConfigurationForm";

export const metadata: Metadata = {
  title: "FiG | Edit game configuration",
  description: "Edit game configuration",
};

interface EditGameConfigurationPageProps {
  params: {
    gameId: string;
    configurationId: string;
  };
}

const parseId = (value: string): number => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error("Invalid identifier");
  }

  return parsed;
};

export default async function EditGameConfigurationPage({
  params,
}: EditGameConfigurationPageProps) {
  const gameId = parseId(params.gameId);
  const configurationId = parseId(params.configurationId);

  const [game, configuration] = await Promise.all([
    fetchGameById(gameId),
    fetchGameConfiguration(configurationId),
  ]);

  if (configuration.gameId !== game.id) {
    throw new Error("Configuration does not belong to the provided game");
  }

  return (
    <div>
      <PageBreadcrumb
        pageTitle={`Edit configuration: ${configuration.name}`}
        breadcrumbs={[
          { label: "Builder" },
          { label: "All Builded Games", href: "/builder/games" },
          { label: game.name, href: `/builder/games/${game.id}` },
          { label: "Edit Configuration" },
        ]}
      />
      <div className="space-y-6">
        <ComponentCard title="Edit configuration">
          <EditGameConfigurationForm configuration={configuration} />
        </ComponentCard>
      </div>
    </div>
  );
}
