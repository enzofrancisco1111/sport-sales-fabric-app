import type { VisualizationSpec } from "@microsoft/fabric-visuals";
import type { ColumnMetadataMap } from "@/lib/to-data-table";
import { applyParams, type DashboardFilters } from "@/lib/dashboard-filters";
import { connection } from "../connection";
import baseQuery from "./kpi-sparklines.dax?raw";
import spec from "./kpi-sparklines.json";

const columnMetadata: ColumnMetadataMap = {
    "Date[Month Num]": { name: "MonthNum", displayName: "Month number" },
    "Date[Month]": { name: "Month", displayName: "Month" },
    "[Total Sales]": { name: "TotalSales", displayName: "Total Sales", format: "$#,0.00" },
    "[Total Profit]": { name: "TotalProfit", displayName: "Total Profit", format: "$#,0.00" },
    "[Units Sold]": { name: "UnitsSold", displayName: "Total Units", format: "#,0.00" },
    "[Total Cost]": { name: "TotalCost", displayName: "Total Cost", format: "$#,0.00" },
    "[Avg Price]": { name: "AvgPrice", displayName: "Avg Price", format: "$#,0.00" },
};

export type SparklineField = "TotalSales" | "TotalProfit" | "UnitsSold" | "TotalCost" | "AvgPrice";

/** Monthly values of every KPI across the selected year (month filter ignored). */
export function kpiSparklines(filters: DashboardFilters) {
    return {
        connection,
        query: applyParams(baseQuery, filters, undefined, { includeMonth: false }),
        columnMetadata,
    };
}

/** Sparkline spec bound to one KPI column. */
export function sparklineSpec(field: SparklineField): VisualizationSpec {
    const clone = structuredClone(spec) as { encoding: { y: { field: string }; tooltip: { field: string }[] } };
    clone.encoding.y.field = field;
    clone.encoding.tooltip[1].field = field;
    return clone as unknown as VisualizationSpec;
}
