import { useMemo } from "react";
import { DataGrid } from "@microsoft/fabric-datagrid";
import { CARD_CLASS, EmptyState, ErrorState, Skeleton } from "@/components/query-states";
import { useThemeContext } from "@/hooks/theme.context";
import { useQueryTable } from "@/hooks/use-query-table";
import type { DashboardFilters } from "@/lib/dashboard-filters";
import type { ColumnMetadataMap } from "@/lib/to-data-table";
import { cn } from "@/lib/utils";
import { retailerProductDetail, stateDetail } from "@/queries/summary";

export function SummaryPage({ filters }: { filters: DashboardFilters }) {
    const scope = `Full year ${filters.year}${filters.retailer ? ` · ${filters.retailer}` : ""}`;
    const byRetailer = useMemo(() => retailerProductDetail(filters), [filters]);
    const byState = useMemo(() => stateDetail(filters), [filters]);

    return (
        <div className="grid grid-cols-1 gap-400 2xl:grid-cols-2">
            <DetailGrid title="Performance by Retailer & Product" subtitle={scope} source={byRetailer} />
            <DetailGrid title="Performance by Region & State" subtitle={scope} source={byState} />
        </div>
    );
}

interface DetailGridProps {
    title: string;
    subtitle: string;
    source: { connection: string; query: string; columnMetadata: ColumnMetadataMap };
}

function DetailGrid({ title, subtitle, source }: DetailGridProps) {
    const { theme } = useThemeContext();
    const { table, isLoading, errorMessage } = useQueryTable(source);

    let body;
    if (errorMessage) body = <ErrorState title={title} message={errorMessage} />;
    else if (isLoading || !table) body = <Skeleton className="h-full" />;
    else if (table.rows.length === 0) body = <EmptyState title={title} />;
    else
        body = (
            <DataGrid
                data={table}
                theme={theme}
                header={{ title, subtitle }}
                containerClassName={cn(CARD_CLASS, "h-full")}
            />
        );

    return <div className="flex h-grid min-h-0 flex-col [&>*]:flex-1 [&>*]:min-h-0">{body}</div>;
}
