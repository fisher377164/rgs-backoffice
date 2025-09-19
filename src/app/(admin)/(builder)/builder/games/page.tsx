import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import ComponentCard from "@/components/common/ComponentCard";
import GamesTable from "@/components/tables/GamesTable";
import { fetchGames } from "@/lib/games/fetchGames";

export const metadata: Metadata = {
    title: "FiG | All Builded Games",
    description: "All Games page",
};

export default async function GamesPage() {
    const games = await fetchGames();

    return (
        <div>
            <PageBreadcrumb pageTitle="All Builded Games" />
            <div className="space-y-6">
                <ComponentCard title="Games">
                    <GamesTable data={games} />
                </ComponentCard>
            </div>
        </div>
    );
}
