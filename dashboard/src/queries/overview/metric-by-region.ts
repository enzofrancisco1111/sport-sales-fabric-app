import type { VisualizationSpec } from "@microsoft/fabric-visuals";
import type { ColumnMetadataMap } from "@/lib/to-data-table";
import { applyParams, type DashboardFilters, type Metric } from "@/lib/dashboard-filters";
import { connection } from "../connection";
import { metricValueColumn } from "./metric-value";
import baseQuery from "./metric-by-region.dax?raw";
import spec from "./metric-by-region.json";

/** Selected metric by region for the selected month. */
export function metricByRegion(filters: DashboardFilters, metric: Metric) {
    const columnMetadata: ColumnMetadataMap = {
        "Geography[Region]": { name: "Region", displayName: "Region" },
        "[Value]": metricValueColumn(metric),
    };
    return {
        connection,
        query: applyParams(baseQuery, filters, metric),
        columnMetadata,
        vegaLiteSpec: spec as VisualizationSpec,
    };
}
