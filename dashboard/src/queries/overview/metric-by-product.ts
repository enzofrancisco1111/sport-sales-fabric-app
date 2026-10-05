import type { VisualizationSpec } from "@microsoft/fabric-visuals";
import type { ColumnMetadataMap } from "@/lib/to-data-table";
import { applyParams, type DashboardFilters, type Metric } from "@/lib/dashboard-filters";
import { connection } from "../connection";
import { metricValueColumn } from "./metric-value";
import baseQuery from "./metric-by-product.dax?raw";
import spec from "./metric-by-product.json";

/** Selected metric by product for the selected month. */
export function metricByProduct(filters: DashboardFilters, metric: Metric) {
    const columnMetadata: ColumnMetadataMap = {
        "Product[Product]": { name: "Product", displayName: "Product" },
        "[Value]": metricValueColumn(metric),
    };
    return {
        connection,
        query: applyParams(baseQuery, filters, metric),
        columnMetadata,
        vegaLiteSpec: spec as VisualizationSpec,
    };
}
