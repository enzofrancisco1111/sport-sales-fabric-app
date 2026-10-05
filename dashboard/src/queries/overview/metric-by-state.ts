import type { VisualizationSpec } from "@microsoft/fabric-visuals";
import type { ColumnMetadataMap } from "@/lib/to-data-table";
import { applyParams, type DashboardFilters, type Metric } from "@/lib/dashboard-filters";
import { connection } from "../connection";
import { metricValueColumn } from "./metric-value";
import baseQuery from "./metric-by-state.dax?raw";
import spec from "./metric-by-state.json";

/** Selected metric by US state for the selected month. */
export function metricByState(filters: DashboardFilters, metric: Metric) {
    const columnMetadata: ColumnMetadataMap = {
        "Geography[State]": { name: "State", displayName: "State" },
        "[Value]": metricValueColumn(metric),
    };
    return {
        connection,
        query: applyParams(baseQuery, filters, metric),
        columnMetadata,
        vegaLiteSpec: spec as VisualizationSpec,
    };
}
