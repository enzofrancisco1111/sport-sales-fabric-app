import type { VisualizationSpec } from "@microsoft/fabric-visuals";
import type { ColumnMetadataMap } from "@/lib/to-data-table";
import { applyParams, type DashboardFilters, type Metric } from "@/lib/dashboard-filters";
import { connection } from "../connection";
import { metricValueColumn } from "./metric-value";
import baseQuery from "./metric-trend.dax?raw";
import spec from "./metric-trend.json";

/** Selected metric by month across the selected year (month filter ignored). */
export function metricTrend(filters: DashboardFilters, metric: Metric) {
    const columnMetadata: ColumnMetadataMap = {
        "Date[Month Num]": { name: "MonthNum", displayName: "Month number" },
        "Date[Month]": { name: "Month", displayName: "Month" },
        "[Value]": metricValueColumn(metric),
    };
    return {
        connection,
        query: applyParams(baseQuery, filters, metric, { includeMonth: false }),
        columnMetadata,
        vegaLiteSpec: spec as VisualizationSpec,
    };
}
