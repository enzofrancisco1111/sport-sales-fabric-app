import type { ColumnDef } from "@microsoft/fabric-visuals-core";
import { METRICS, type Metric } from "@/lib/dashboard-filters";

/** Column metadata for the `[Value]` column returned by every metric-driven query. */
export function metricValueColumn(metric: Metric): ColumnDef {
    return { name: "Value", displayName: METRICS[metric].label, format: METRICS[metric].format };
}
