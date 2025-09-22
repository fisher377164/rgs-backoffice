import { Metadata } from "next";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { fetchGameById } from "@/lib/games/fetchGameById";

import EditGameForm from "../EditGameForm";

export const metadata: Metadata = {
  title: "FiG | Edit game",
  description: "Edit game",
};

interface EditGamePageProps {
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

export default async function EditGamePage({ params }: EditGamePageProps) {
  const gameId = parseGameId(params.gameId);
  const game = await fetchGameById(gameId);

  return (
    <div>
      <PageBreadcrumb
        pageTitle={`Edit ${game.name}`}
        breadcrumbs={[
          { label: "Builder" },
          { label: "All Builded Games", href: "/builder/games" },
          { label: game.name, href: `/builder/games/${game.id}` },
          { label: "Edit" },
        ]}
      />
      <div className="space-y-6">
        <ComponentCard title="Edit game">
          <EditGameForm game={game} />
        </ComponentCard>
      </div>
    </div>
  );
}
