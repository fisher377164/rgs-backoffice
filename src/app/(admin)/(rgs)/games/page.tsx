import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";
import ComponentCard from "@/components/common/ComponentCard";
import OrdersTable from "@/components/tables/OrdersTable";

export const metadata: Metadata = {
    title: "FiG | All Games",
    description: "All Games page",
};

export default function GamesPage() {
    return (
        <div>
            <PageBreadcrumb pageTitle="All Games" />
            <div className="space-y-6">
                <ComponentCard title="Games">
                    <OrdersTable />
                </ComponentCard>
            </div>
        </div>
    );
}
