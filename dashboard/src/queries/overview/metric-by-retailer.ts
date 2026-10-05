import type { VisualizationSpec } from "@microsoft/fabric-visuals";
import type { ColumnMetadataMap } from "@/lib/to-data-table";
import { applyParams, type DashboardFilters, type Metric } from "@/lib/dashboard-filters";
import { connection } from "../connection";
import { metricValueColumn } from "./metric-value";
import baseQuery from "./metric-by-retailer.dax?raw";
import spec from "./metric-by-retailer.json";

/** Selected metric by retailer for the selected month. */
export function metricByRetailer(filters: DashboardFilters, metric: Metric) {
    const columnMetadata: ColumnMetadataMap = {
        "Retailer[Retailer]": { name: "Retailer", displayName: "Retailer" },
        "[Value]": metricValueColumn(metric),
    };
    return {
        connection,
        query: applyParams(baseQuery, filters, metric),
        columnMetadata,
        vegaLiteSpec: spec as VisualizationSpec,
    };
}
