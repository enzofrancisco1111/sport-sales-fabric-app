import type { ColumnMetadataMap } from "@/lib/to-data-table";
import { applyParams, type DashboardFilters } from "@/lib/dashboard-filters";
import { connection } from "../connection";
import baseQuery from "./kpi-summary.dax?raw";

const columnMetadata: ColumnMetadataMap = {
    "[Total Sales]": { name: "TotalSales", displayName: "Total Sales", format: "$#,0.00" },
    "[Sales MoM]": { name: "SalesMoM", displayName: "Sales vs prior month", format: "0.0%" },
    "[Total Profit]": { name: "TotalProfit", displayName: "Total Profit", format: "$#,0.00" },
    "[Profit MoM]": { name: "ProfitMoM", displayName: "Profit vs prior month", format: "0.0%" },
    "[Units Sold]": { name: "UnitsSold", displayName: "Total Units", format: "#,0.00" },
    "[Units MoM]": { name: "UnitsMoM", displayName: "Units vs prior month", format: "0.0%" },
    "[Total Cost]": { name: "TotalCost", displayName: "Total Cost", format: "$#,0.00" },
    "[Cost MoM]": { name: "CostMoM", displayName: "Cost vs prior month", format: "0.0%" },
    "[Avg Price]": { name: "AvgPrice", displayName: "Avg Price", format: "$#,0.00" },
    "[Avg Price MoM]": { name: "AvgPriceMoM", displayName: "Avg price vs prior month", format: "0.0%" },
};

/** One-row KPI totals for the selected month, with month-over-month change. */
export function kpiSummary(filters: DashboardFilters) {
    return { connection, query: applyParams(baseQuery, filters), columnMetadata };
}
