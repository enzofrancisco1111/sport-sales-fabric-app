import type { ColumnMetadataMap } from "@/lib/to-data-table";
import { connection } from "../connection";
import query from "./filter-years.dax?raw";

const columnMetadata: ColumnMetadataMap = {
    "Date[Year]": { name: "Year", displayName: "Year" },
    "[Total Sales]": { name: "TotalSales", displayName: "Total Sales", format: "$#,0.00" },
};

/** Years that have sales — drives the Year dropdown. */
export function filterYears() {
    return { connection, query, columnMetadata };
}
