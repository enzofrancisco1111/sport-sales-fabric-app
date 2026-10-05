import { useMemo } from "react";
import { AlertTriangle, ArrowRight, Star, TrendingUp } from "lucide-react";
import { rowObjects, useQueryTable } from "@/hooks/use-query-table";
import { METRICS, type DashboardFilters, type Metric } from "@/lib/dashboard-filters";
import { formatPercent, priorMonthLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import { kpiSummary } from "@/queries/overview";
import { CARD_CLASS, Skeleton } from "./query-states";

const DELTA_FIELD: Record<Metric, string> = {
    sales: "SalesMoM",
    profit: "ProfitMoM",
    units: "UnitsMoM",
    cost: "CostMoM",
};

interface PerformanceBannerProps {
    filters: DashboardFilters;
    metric: Metric;
    onViewReport: () => void;
}

/** Plain-language callout on the selected metric's month-over-month change. */
export function PerformanceBanner({ filters, metric, onViewReport }: PerformanceBannerProps) {
    const source = useMemo(() => kpiSummary(filters), [filters]);
    const { table, isLoading, errorMessage } = useQueryTable(source);

    if (errorMessage) return null;
    if (isLoading || !table) return <Skeleton className="h-1200" />;

    const delta = rowObjects(table)[0]?.[DELTA_FIELD[metric]] as number | null | undefined;
    const label = METRICS[metric].label.replace("Total ", "").toLowerCase();
    const comparison = priorMonthLabel(filters);
    // For cost, a decrease is the good outcome.
    const good = delta != null && (metric === "cost" ? delta <= 0 : delta >= 0.1);

    let headline: string;
    let message: string;
    let Icon = Star;
    if (delta == null) {
        headline = "No comparison available";
        message = `There is no ${comparison} data to compare ${label} against.`;
        Icon = TrendingUp;
    } else if (good) {
        headline = "Outstanding Performance!";
        message = `${capitalize(label)} is ${formatPercent(delta)} vs ${comparison}. Keep up the great work!`;
    } else if (Math.abs(delta) < 0.1) {
        headline = "Steady performance";
        message = `${capitalize(label)} moved ${formatPercent(delta)} vs ${comparison}.`;
        Icon = TrendingUp;
    } else {
        headline = "Worth a closer look";
        message = `${capitalize(label)} is ${formatPercent(delta)} vs ${comparison}.`;
        Icon = AlertTriangle;
    }

    return (
        <section
            aria-label="Performance summary"
            className={cn(CARD_CLASS, "flex flex-col gap-400 p-400 sm:flex-row sm:items-center sm:justify-between")}
        >
            <div className="flex items-center gap-400">
                <span className="flex items-center justify-center rounded-full bg-primary p-300 text-primary-foreground">
                    <Icon className="icon-size-300" aria-hidden />
                </span>
                <div>
                    <p className="text-400 font-bold leading-400 text-primary">{headline}</p>
                    <p className="text-300 leading-300 text-muted-foreground">{message}</p>
                </div>
            </div>
            <button
                type="button"
                onClick={onViewReport}
                className="inline-flex items-center gap-200 self-start rounded-xl border border-primary bg-card px-400 py-200 text-300 font-semibold leading-300 text-primary hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:self-auto"
            >
                View Detailed Report
                <ArrowRight className="icon-size-200" aria-hidden />
            </button>
        </section>
    );
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
