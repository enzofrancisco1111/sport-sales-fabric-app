import { VegaVisual, type VegaVisualCapabilities, type VisualizationSpec } from "@microsoft/fabric-visuals";
import type { InteractionEvent } from "@microsoft/fabric-visuals-core";
import { useThemeContext } from "@/hooks/theme.context";
import { useQueryTable } from "@/hooks/use-query-table";
import type { ColumnMetadataMap } from "@/lib/to-data-table";
import { cn } from "@/lib/utils";
import { CARD_CLASS, EmptyState, ErrorState, Skeleton } from "./query-states";

interface ChartCardProps {
    title: string;
    subtitle?: string;
    source: {
        connection: string;
        query: string;
        columnMetadata: ColumnMetadataMap;
        vegaLiteSpec: VisualizationSpec;
    };
    capabilities?: Partial<VegaVisualCapabilities>;
    onInteraction?: (events: InteractionEvent[]) => void;
    className?: string;
}

/** A data-bound Vega-Lite chart with loading, empty and error states. */
export function ChartCard({ title, subtitle, source, capabilities, onInteraction, className }: ChartCardProps) {
    const { theme } = useThemeContext();
    const { table, isLoading, errorMessage } = useQueryTable(source);

    let body;
    if (errorMessage) body = <ErrorState title={title} message={errorMessage} />;
    else if (isLoading || !table) body = <Skeleton className="h-full" />;
    else if (table.rows.length === 0) body = <EmptyState title={title} />;
    else
        body = (
            <VegaVisual
                spec={source.vegaLiteSpec}
                data={table}
                theme={theme}
                header={{ title, subtitle }}
                containerClassName={cn(CARD_CLASS, "h-full")}
                capabilities={capabilities}
                onInteraction={onInteraction}
            />
        );

    return <div className={cn("h-full min-h-0", className)}>{body}</div>;
}
