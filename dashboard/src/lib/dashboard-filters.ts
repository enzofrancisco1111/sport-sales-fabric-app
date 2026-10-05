/** Shared filter + metric plumbing for the dashboard DAX queries. */

export type Metric = "sales" | "profit" | "units" | "cost";

export interface DashboardFilters {
    year: number;
    /** 1–12. Omitted for full-year queries. */
    month?: number;
    /** Retailer name. Omitted for all retailers. */
    retailer?: string;
}

interface MetricDef {
    measure: string;
    label: string;
    format: string;
}

export const METRICS: Record<Metric, MetricDef> = {
    sales: { measure: "[Total Sales]", label: "Total Sales", format: "$#,0.00" },
    profit: { measure: "[Total Profit]", label: "Total Profit", format: "$#,0.00" },
    units: { measure: "[Units Sold]", label: "Total Units", format: "#,0.00" },
    cost: { measure: "[Total Cost]", label: "Total Cost", format: "$#,0.00" },
};

export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const daxString = (s: string) => `"${s.replace(/"/g, '""')}"`;

/** Builds SUMMARIZECOLUMNS filter-table arguments (each line ends with a comma). */
export function filterArgs(filters: DashboardFilters, options?: { includeMonth?: boolean }): string {
    const includeMonth = options?.includeMonth ?? true;
    const args = [`TREATAS({${Math.trunc(filters.year)}}, 'Date'[Year]),`];
    if (includeMonth && filters.month != null) {
        args.push(`TREATAS({${Math.trunc(filters.month)}}, 'Date'[Month Num]),`);
    }
    if (filters.retailer) {
        args.push(`TREATAS({${daxString(filters.retailer)}}, Retailer[Retailer]),`);
    }
    return args.join("\n    ");
}

/** Replaces the `/*FILTERS*\/` placeholder and the `__METRIC__` token in a base query. */
export function applyParams(
    baseQuery: string,
    filters: DashboardFilters,
    metric?: Metric,
    options?: { includeMonth?: boolean },
): string {
    let query = baseQuery.replace("/*FILTERS*/", filterArgs(filters, options));
    if (metric) query = query.replaceAll("__METRIC__", METRICS[metric].measure);
    return query;
}
