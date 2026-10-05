import { useMemo } from "react";
import { ChartCard } from "@/components/chart-card";
import { KpiRow } from "@/components/kpi-row";
import { MetricTabs } from "@/components/metric-tabs";
import { PerformanceBanner } from "@/components/performance-banner";
import { METRICS, MONTHS, type DashboardFilters, type Metric } from "@/lib/dashboard-filters";
import {
    metricByProduct,
    metricByRegion,
    metricByRetailer,
    metricBySalesMethod,
    metricByState,
    metricTrend,
} from "@/queries/overview";

interface OverviewPageProps {
    filters: DashboardFilters;
    metric: Metric;
    onMetricChange: (metric: Metric) => void;
    onViewReport: () => void;
}

export function OverviewPage({ filters, metric, onMetricChange, onViewReport }: OverviewPageProps) {
    const label = METRICS[metric].label;
    const period = `${MONTHS[(filters.month ?? 12) - 1]} ${filters.year}`;
    const scope = filters.retailer ? ` · ${filters.retailer}` : "";

    const sources = useMemo(
        () => ({
            method: metricBySalesMethod(filters, metric),
            retailer: metricByRetailer(filters, metric),
            trend: metricTrend(filters, metric),
            product: metricByProduct(filters, metric),
            state: metricByState(filters, metric),
            region: metricByRegion(filters, metric),
        }),
        [filters, metric],
    );

    return (
        <div className="flex flex-col gap-500">
            <KpiRow filters={filters} />
            <MetricTabs metric={metric} onChange={onMetricChange} />

            <div className="grid grid-cols-1 gap-400 lg:grid-cols-12">
                <ChartCard
                    className="h-chart lg:col-span-6 xl:col-span-3"
                    title={`${label} by Sales Method`}
                    subtitle={period + scope}
                    source={sources.method}
                    capabilities={{ disableArcDataLabels: true }}
                />
                <ChartCard
                    className="h-chart lg:col-span-6 xl:col-span-4"
                    title={`${label} by Retailer`}
                    subtitle={period + scope}
                    source={sources.retailer}
                />
                <ChartCard
                    className="h-chart lg:col-span-12 xl:col-span-5"
                    title={`${label} Trend`}
                    subtitle={`Monthly, ${filters.year}${scope} · dashed line = average`}
                    source={sources.trend}
                />
                <ChartCard
                    className="h-chart lg:col-span-12 xl:col-span-5"
                    title={`${label} by Product`}
                    subtitle={period + scope}
                    source={sources.product}
                    capabilities={{ disableTextTruncation: true }}
                />
                <ChartCard
                    className="h-chart lg:col-span-7 xl:col-span-4"
                    title={`${label} by State`}
                    subtitle={period + scope}
                    source={sources.state}
                />
                <ChartCard
                    className="h-chart lg:col-span-5 xl:col-span-3"
                    title={`${label} by Region`}
                    subtitle={period + scope}
                    source={sources.region}
                />
            </div>

            <PerformanceBanner filters={filters} metric={metric} onViewReport={onViewReport} />
        </div>
    );
}
