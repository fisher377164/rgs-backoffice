import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import ComponentCard from "@/components/common/ComponentCard";
import GamesTable from "@/components/tables/GamesTable";
import { fetchGames } from "@/lib/games/fetchGames";
import Link from "next/link";

export const metadata: Metadata = {
    title: "FiG | All Builded Games",
    description: "All Games page",
};

export default async function GamesPage() {
    const games = await fetchGames();

    return (
        <div>
            <PageBreadcrumb
                pageTitle="All Builded Games"
                breadcrumbs={[
                    { label: "Builder" },
                    { label: "All Builded Games" },
                ]}
            />
            <div className="space-y-6">
                <ComponentCard title="Games"
                               action={
                                   <Link
                                       href="/builder/games/new"
                                       className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs transition-colors hover:bg-brand-600"
                                   >
                                       New Game
                                   </Link>
                               }
                >
                    <GamesTable data={games} />
                </ComponentCard>
            </div>
        </div>
    );
}
