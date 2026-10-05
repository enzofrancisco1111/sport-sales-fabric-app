import { useMemo } from "react";
import type { DataTable } from "@microsoft/fabric-visuals-core";
import { useSemanticModelQuery } from "@/hooks/use-semantic-model-query";
import { toDataTable, type ColumnMetadataMap } from "@/lib/to-data-table";

interface QuerySource {
    connection: string;
    query: string;
    columnMetadata: ColumnMetadataMap;
}

interface QueryTableResult {
    table: DataTable | undefined;
    isLoading: boolean;
    errorMessage: string | undefined;
}

/** Runs a factory's DAX query and returns it as a metadata-enriched `DataTable`. */
export function useQueryTable(source: QuerySource): QueryTableResult {
    const { data, isLoading, error } = useSemanticModelQuery({
        connection: source.connection,
        query: source.query,
    });

    const table = useMemo(
        () => (data?.status === "success" ? toDataTable(data.table, source.columnMetadata) : undefined),
        [data, source.columnMetadata],
    );

    const errorMessage = data?.status === "error" ? data.error.message : error?.message;

    return { table, isLoading: isLoading || (!data && !error), errorMessage };
}

/** Converts DataTable rows into objects keyed by each column's cleaned `name`. */
export function rowObjects(table: DataTable | undefined): Record<string, unknown>[] {
    if (!table) return [];
    return table.rows.map((row) =>
        Object.fromEntries(table.columns.map((col, i) => [col.name, (row as unknown[])[i]])),
    );
}
