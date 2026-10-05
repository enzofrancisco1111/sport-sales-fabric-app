import { useMemo } from "react";
import { Footprints, LayoutGrid, Table2, Zap } from "lucide-react";
import { rowObjects, useQueryTable } from "@/hooks/use-query-table";
import { monthYear } from "@/lib/format";
import { cn } from "@/lib/utils";
import { dataFreshness } from "@/queries/common";

export type Page = "overview" | "summary";

const NAV: { id: Page; label: string; icon: typeof LayoutGrid }[] = [
    { id: "overview", label: "Overview", icon: LayoutGrid },
    { id: "summary", label: "Summary", icon: Table2 },
];

export function Sidebar({ page, onNavigate }: { page: Page; onNavigate: (page: Page) => void }) {
    const freshness = useQueryTable(useMemo(() => dataFreshness(), []));
    const last = rowObjects(freshness.table)[0]?.LastInvoiceDate;

    return (
        <aside className="flex shrink-0 flex-col gap-600 border-border bg-card p-400 lg:sticky lg:top-0 lg:h-screen lg:w-sidebar lg:border-r">
            <div className="flex items-center gap-300 px-200">
                <span className="flex items-center justify-center rounded-xl bg-primary p-200 text-primary-foreground">
                    <Footprints className="icon-size-300" aria-hidden />
                </span>
                <span className="font-heading text-500 font-extrabold leading-500 tracking-tight text-card-foreground">
                    Sport Sales
                </span>
            </div>

            <nav aria-label="Pages" className="flex gap-200 lg:flex-col">
                {NAV.map(({ id, label, icon: Icon }) => {
                    const active = page === id;
                    return (
                        <button
                            key={id}
                            type="button"
                            aria-current={active ? "page" : undefined}
                            onClick={() => onNavigate(id)}
                            className={cn(
                                "flex items-center gap-300 rounded-xl px-400 py-300 text-300 font-semibold leading-300",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                active
                                    ? "bg-primary text-primary-foreground shadow-4"
                                    : "bg-secondary text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                            )}
                        >
                            <Icon className="icon-size-200" aria-hidden />
                            {label}
                        </button>
                    );
                })}
            </nav>

            <div className="mt-auto hidden items-center gap-300 rounded-2xl border border-border bg-secondary p-300 lg:flex">
                <span className="flex items-center justify-center rounded-xl bg-primary p-200 text-primary-foreground">
                    <Zap className="icon-size-200" aria-hidden />
                </span>
                <p className="text-200 leading-200 text-muted-foreground">
                    Live from Fabric
                    <br />
                    <span className="font-semibold text-primary">
                        Data through {last ? monthYear(String(last)) : "…"}
                    </span>
                </p>
            </div>
        </aside>
    );
}
