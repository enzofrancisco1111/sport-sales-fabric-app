import { useMemo, type ComponentType } from "react";
import { ArrowDownRight, ArrowUpRight, DollarSign, Minus, Package, Receipt, Tag, Wallet } from "lucide-react";
import { VegaVisual } from "@microsoft/fabric-visuals";
import { formatValue, type DataTable } from "@microsoft/fabric-visuals-core";
import { useThemeContext } from "@/hooks/theme.context";
import { rowObjects, useQueryTable } from "@/hooks/use-query-table";
import type { DashboardFilters } from "@/lib/dashboard-filters";
import { formatPercent, priorMonthLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import { kpiSparklines, kpiSummary, sparklineSpec, type SparklineField } from "@/queries/overview";
import { CARD_CLASS, ErrorState, Skeleton } from "./query-states";

interface KpiDef {
    label: string;
    value: SparklineField;
    delta: string;
    format: string;
    icon: ComponentType<{ className?: string }>;
}

const KPIS: KpiDef[] = [
    { label: "Total Sales", value: "TotalSales", delta: "SalesMoM", format: "$#,0.00", icon: DollarSign },
    { label: "Total Profit", value: "TotalProfit", delta: "ProfitMoM", format: "$#,0.00", icon: Wallet },
    { label: "Total Units", value: "UnitsSold", delta: "UnitsMoM", format: "#,0.00", icon: Package },
    { label: "Total Cost", value: "TotalCost", delta: "CostMoM", format: "$#,0.00", icon: Receipt },
    { label: "Avg Price", value: "AvgPrice", delta: "AvgPriceMoM", format: "$#,0.00", icon: Tag },
];

export function KpiRow({ filters }: { filters: DashboardFilters }) {
    const summarySource = useMemo(() => kpiSummary(filters), [filters]);
    const sparkSource = useMemo(() => kpiSparklines(filters), [filters]);
    const summary = useQueryTable(summarySource);
    const sparks = useQueryTable(sparkSource);

    if (summary.errorMessage) return <ErrorState title="Key metrics" message={summary.errorMessage} />;

    const row = rowObjects(summary.table)[0];

    return (
        <section aria-label="Key metrics" className="grid grid-cols-1 gap-400 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
            {KPIS.map((kpi) =>
                summary.isLoading || !summary.table ? (
                    <article key={kpi.value} aria-busy className={cn(CARD_CLASS, "flex flex-col gap-300 p-400")}>
                        <Skeleton className="h-600 w-1/2" />
                        <Skeleton className="h-800 w-2/3" />
                        <Skeleton className="h-sparkline" />
                    </article>
                ) : (
                    <KpiCard
                        key={kpi.value}
                        kpi={kpi}
                        value={row?.[kpi.value] as number | null | undefined}
                        delta={row?.[kpi.delta] as number | null | undefined}
                        comparison={priorMonthLabel(filters)}
                        sparkTable={sparks.table}
                    />
                ),
            )}
        </section>
    );
}

interface KpiCardProps {
    kpi: KpiDef;
    value: number | null | undefined;
    delta: number | null | undefined;
    comparison: string;
    sparkTable: DataTable | undefined;
}

function KpiCard({ kpi, value, delta, comparison, sparkTable }: KpiCardProps) {
    const { theme } = useThemeContext();
    const spec = useMemo(() => sparklineSpec(kpi.value), [kpi.value]);
    const Icon = kpi.icon;
    const hasDelta = delta != null && Number.isFinite(delta);
    const up = hasDelta && delta >= 0;
    const DeltaIcon = !hasDelta ? Minus : up ? ArrowUpRight : ArrowDownRight;

    return (
        <article className={cn(CARD_CLASS, "flex flex-col gap-200 p-400")}>
            <div className="flex items-center gap-300">
                <span className="flex items-center justify-center rounded-xl bg-primary p-200 text-primary-foreground">
                    <Icon className="icon-size-200" aria-hidden />
                </span>
                <h3 className="text-300 font-medium leading-300 text-muted-foreground">{kpi.label}</h3>
            </div>
            <p className="font-numeric text-hero-700 font-bold leading-hero-700 tracking-tight text-card-foreground">
                {value == null ? "—" : String(formatValue(value, kpi.format, { compact: true }))}
            </p>
            <p className="flex items-center gap-100 text-200 leading-200 text-muted-foreground">
                <span
                    className={cn(
                        "inline-flex items-center gap-100 font-semibold",
                        !hasDelta ? "text-muted-foreground" : up ? "text-success" : "text-destructive",
                    )}
                >
                    <DeltaIcon className="icon-size-100" aria-hidden />
                    {hasDelta ? formatPercent(delta) : "n/a"}
                </span>
                <span>vs {comparison}</span>
            </p>
            <div className="h-sparkline">
                {sparkTable ? (
                    <VegaVisual
                        spec={spec}
                        data={sparkTable}
                        theme={theme}
                        chromeless
                        capabilities={{ disableLineChartCrosshairTooltip: true, disableSelfHighlight: true }}
                    />
                ) : (
                    <Skeleton className="h-full" />
                )}
            </div>
        </article>
    );
}
