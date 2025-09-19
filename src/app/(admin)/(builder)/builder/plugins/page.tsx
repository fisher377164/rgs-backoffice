import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import ComponentCard from "@/components/common/ComponentCard";
import GamesTable from "@/components/tables/GamesTable";
import { fetchGames } from "@/lib/games";

export const metadata: Metadata = {
    title: "FiG | All plugins",
    description: "All PlugIns page",
};

export default async function GamesPage() {
    // TODO: FIX IT
    const games = await fetchGames();

    return (
        <div>
            <PageBreadcrumb pageTitle="All plugins" />
            <div className="space-y-6">
                <ComponentCard title="plugins">
                    <GamesTable data={games} />
                </ComponentCard>
            </div>
        </div>
    );
}
