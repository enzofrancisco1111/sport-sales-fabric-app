import { METRICS, type Metric } from "@/lib/dashboard-filters";
import { cn } from "@/lib/utils";

const TABS: { id: Metric; label: string }[] = [
    { id: "sales", label: "Analyze by Sales" },
    { id: "profit", label: "Analyze by Profit" },
    { id: "units", label: "Analyze by Units" },
    { id: "cost", label: "Analyze by Cost" },
];

/** Picks the metric that drives every breakdown chart on the Overview page. */
export function MetricTabs({ metric, onChange }: { metric: Metric; onChange: (m: Metric) => void }) {
    return (
        <div role="tablist" aria-label="Metric to analyze" className="flex flex-wrap gap-200">
            {TABS.map((t) => {
                const active = t.id === metric;
                return (
                    <button
                        key={t.id}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        title={`Show ${METRICS[t.id].label.toLowerCase()} in every chart`}
                        onClick={() => onChange(t.id)}
                        className={cn(
                            "rounded-full border px-500 py-200 text-300 font-semibold leading-300",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            active
                                ? "border-primary bg-primary text-primary-foreground shadow-4"
                                : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                        )}
                    >
                        {t.label}
                    </button>
                );
            })}
        </div>
    );
}
