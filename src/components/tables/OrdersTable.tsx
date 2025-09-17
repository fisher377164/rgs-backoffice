"use client";

import ConfigurableTable from "@/components/tables/ConfigurableTable";
import { orderTableConfig, orders } from "@/data/dummyTableData";

const OrdersTable = () => {
  return <ConfigurableTable data={orders} config={orderTableConfig} />;
};

export default OrdersTable;
