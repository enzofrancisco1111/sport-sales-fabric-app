import { formatValue } from "@microsoft/fabric-visuals-core";
import { MONTHS, type DashboardFilters } from "@/lib/dashboard-filters";

/** "Nov 2021" for the month before the selected one. */
export function priorMonthLabel(filters: DashboardFilters): string {
    const month = filters.month ?? 1;
    return month === 1 ? `Dec ${filters.year - 1}` : `${MONTHS[month - 2]} ${filters.year}`;
}

/** Signed percentage, e.g. "+31.4%". */
export function formatPercent(value: number): string {
    return `${value >= 0 ? "+" : ""}${String(formatValue(value, "0.0%"))}`;
}

/** "2021-12-31T00:00:00" → "Dec 2021" (parsed without timezone shifts). */
export function monthYear(isoDate: string): string {
    const [year, month] = isoDate.split("-");
    return `${MONTHS[Number(month) - 1]} ${year}`;
}
