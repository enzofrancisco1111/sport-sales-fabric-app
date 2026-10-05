import type { ColumnMetadataMap } from "@/lib/to-data-table";
import { applyParams, type DashboardFilters } from "@/lib/dashboard-filters";
import { connection } from "../connection";
import baseQuery from "./state-detail.dax?raw";

const columnMetadata: ColumnMetadataMap = {
    "Geography[Region]": { name: "Region", displayName: "Region" },
    "Geography[State]": { name: "State", displayName: "State" },
    "[Total Sales]": { name: "TotalSales", displayName: "Total Sales", format: "$#,0" },
    "[Total Profit]": { name: "TotalProfit", displayName: "Total Profit", format: "$#,0" },
    "[Units Sold]": { name: "UnitsSold", displayName: "Units Sold", format: "#,0" },
    "[Operating Margin]": { name: "OperatingMargin", displayName: "Operating Margin", format: "0.0%" },
    "[Sales YoY]": { name: "SalesYoY", displayName: "Sales vs Prior Year", format: "+0.0%;-0.0%" },
};

/** Full-year performance by region and state (month filter ignored). */
export function stateDetail(filters: DashboardFilters) {
    return {
        connection,
        query: applyParams(baseQuery, filters, undefined, { includeMonth: false }),
        columnMetadata,
    };
}
