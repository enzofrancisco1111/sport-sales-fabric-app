//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { useMemo, useRef, useState } from "react";
import { captureElementAsImage } from "@microsoft/fabric-visuals-extensibility";
import { FilterBar } from "@/components/filter-bar";
import { Skeleton } from "@/components/query-states";
import { Sidebar, type Page } from "@/components/sidebar";
import { clearQueryCache } from "@/hooks/use-semantic-model-query";
import { rowObjects, useQueryTable } from "@/hooks/use-query-table";
import type { DashboardFilters, Metric } from "@/lib/dashboard-filters";
import { OverviewPage } from "@/pages/overview-page";
import { SummaryPage } from "@/pages/summary-page";
import { dataFreshness } from "@/queries/common";

const PAGE_TEXT: Record<Page, { title: string; description: string }> = {
    overview: {
        title: "Executive Performance Overview",
        description: "Track key business metrics and performance insights",
    },
    summary: {
        title: "Performance Summary",
        description: "Full-year detail by retailer, product, region and state",
    },
};

function App() {
    const [page, setPage] = useState<Page>("overview");
    const [metric, setMetric] = useState<Metric>("profit");
    const [chosenFilters, setFilters] = useState<DashboardFilters>();
    const [refreshKey, setRefreshKey] = useState(0);
    const [isExporting, setIsExporting] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    // Until the user picks a period, default to the latest month that has data.
    const freshness = useQueryTable(useMemo(() => dataFreshness(), []));
    const defaultFilters = useMemo<DashboardFilters | undefined>(() => {
        const last = rowObjects(freshness.table)[0]?.LastInvoiceDate;
        if (last) {
            const [year, month] = String(last).split("-").map(Number);
            return { year, month };
        }
        if (freshness.errorMessage) return { year: new Date().getFullYear(), month: new Date().getMonth() + 1 };
        return undefined;
    }, [freshness.table, freshness.errorMessage]);
    const filters = chosenFilters ?? defaultFilters;

    const refresh = () => {
        clearQueryCache();
        setRefreshKey((k) => k + 1);
    };

    const exportPng = async () => {
        if (!contentRef.current) return;
        setIsExporting(true);
        try {
            // Let React hide the toolbar buttons before the page is captured.
            await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
            const blob = await captureElementAsImage(contentRef.current);
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `sport-sales-${page}-${filters?.year ?? ""}-${filters?.month ?? ""}.png`;
            link.click();
            URL.revokeObjectURL(url);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="flex min-h-full flex-col bg-background lg:flex-row">
            <Sidebar page={page} onNavigate={setPage} />
            <main className="min-w-0 flex-1 p-400 sm:p-600">
                <div ref={contentRef} className="mx-auto flex max-w-dashboard flex-col gap-600 bg-background">
                    {filters ? (
                        <>
                            <FilterBar
                                {...PAGE_TEXT[page]}
                                filters={filters}
                                onChange={setFilters}
                                monthDisabled={page === "summary"}
                                onRefresh={refresh}
                                onExport={exportPng}
                                isExporting={isExporting}
                            />
                            <div key={refreshKey}>
                                {page === "overview" ? (
                                    <OverviewPage
                                        filters={filters}
                                        metric={metric}
                                        onMetricChange={setMetric}
                                        onViewReport={() => setPage("summary")}
                                    />
                                ) : (
                                    <SummaryPage filters={filters} />
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col gap-400" aria-busy>
                            <Skeleton className="h-1200 w-1/2" />
                            <Skeleton className="h-chart" />
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default App;
