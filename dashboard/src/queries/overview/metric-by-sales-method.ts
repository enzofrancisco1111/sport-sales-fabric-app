import type { VisualizationSpec } from "@microsoft/fabric-visuals";
import type { ColumnMetadataMap } from "@/lib/to-data-table";
import { applyParams, type DashboardFilters, type Metric } from "@/lib/dashboard-filters";
import { connection } from "../connection";
import { metricValueColumn } from "./metric-value";
import baseQuery from "./metric-by-sales-method.dax?raw";
import spec from "./metric-by-sales-method.json";

/** Selected metric by sales method for the selected month. */
export function metricBySalesMethod(filters: DashboardFilters, metric: Metric) {
    const columnMetadata: ColumnMetadataMap = {
        "Sales Method[Sales Method]": { name: "SalesMethod", displayName: "Sales Method" },
        "[Value]": metricValueColumn(metric),
    };
    return {
        connection,
        query: applyParams(baseQuery, filters, metric),
        columnMetadata,
        vegaLiteSpec: spec as VisualizationSpec,
    };
}
