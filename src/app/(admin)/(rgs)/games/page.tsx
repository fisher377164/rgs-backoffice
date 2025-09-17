import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";
import ComponentCard from "@/components/common/ComponentCard";
import ConfigurableTable from "@/components/tables/ConfigurableTable";
import { orderTableConfig, orders } from "@/data/dummyTableData";

export const metadata: Metadata = {
    title: "Next.js Blank Page | TailAdmin - Next.js Dashboard Template",
    description: "This is Next.js Blank Page TailAdmin Dashboard Template",
};

export default function GamesPage() {
    return (
        <div>
            <PageBreadcrumb pageTitle="All Games" />
            <div className="space-y-6">
                <ComponentCard title="Games">
                    <ConfigurableTable data={orders} config={orderTableConfig} />
                </ComponentCard>
            </div>
        </div>
    );
}
