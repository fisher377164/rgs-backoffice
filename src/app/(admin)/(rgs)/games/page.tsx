import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import ComponentCard from "@/components/common/ComponentCard";
import OrdersTable from "@/components/tables/OrdersTable";
import { fetchGames } from "@/lib/games";

export const metadata: Metadata = {
    title: "FiG | All Games",
    description: "All Games page",
};

export default async function GamesPage() {
    const games = await fetchGames();

    return (
        <div>
            <PageBreadcrumb pageTitle="All Games" />
            <div className="space-y-6">
                <ComponentCard title="Games">
                    <OrdersTable data={games} />
                </ComponentCard>
            </div>
        </div>
    );
}
