import type { ColumnMetadataMap } from "@/lib/to-data-table";
import { connection } from "../connection";
import query from "./data-freshness.dax?raw";

const columnMetadata: ColumnMetadataMap = {
    "[Last Invoice Date]": { name: "LastInvoiceDate", displayName: "Last Invoice Date", format: "mmm yyyy" },
};

/** Latest invoice date in the model — sidebar footer and default period. */
export function dataFreshness() {
    return { connection, query, columnMetadata };
}
