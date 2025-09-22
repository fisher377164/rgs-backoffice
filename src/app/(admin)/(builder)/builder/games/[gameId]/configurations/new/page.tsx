import { Metadata } from "next";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

import NewGameConfigurationForm from "./NewGameConfigurationForm";

export const metadata: Metadata = {
  title: "FiG | New game configuration",
  description: "Create a new game configuration",
};

interface NewGameConfigurationPageProps {
  params: {
    gameId: string;
  };
}

const parseGameId = (value: string): number => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error("Invalid game id");
  }

  return parsed;
};

export default async function NewGameConfigurationPage({
  params,
}: NewGameConfigurationPageProps) {
  const gameId = parseGameId(params.gameId);

  return (
    <div>
      <PageBreadcrumb
        pageTitle="New Game Configuration"
        breadcrumbs={[
          { label: "Builder" },
          { label: "All Builded Games", href: "/builder/games" },
          { label: `Game ${gameId}`, href: `/builder/games/${gameId}` },
          { label: "New Game Configuration" },
        ]}
      />
      <div className="space-y-6">
        <ComponentCard title="New configuration">
          <NewGameConfigurationForm gameId={gameId} />
        </ComponentCard>
      </div>
    </div>
  );
}
