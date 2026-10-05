import type { ColumnMetadataMap } from "@/lib/to-data-table";
import { connection } from "../connection";
import query from "./filter-retailers.dax?raw";

const columnMetadata: ColumnMetadataMap = {
    "Retailer[Retailer]": { name: "Retailer", displayName: "Retailer" },
    "[Total Sales]": { name: "TotalSales", displayName: "Total Sales", format: "$#,0.00" },
};

/** Retailers that have sales — drives the Retailer dropdown. */
export function filterRetailers() {
    return { connection, query, columnMetadata };
}
