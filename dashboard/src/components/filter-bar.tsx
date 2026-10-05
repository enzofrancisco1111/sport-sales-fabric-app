import { useMemo, useState } from "react";
import { ChevronDown, Download, Info, Moon, RotateCw, Sun } from "lucide-react";
import { useThemeContext } from "@/hooks/theme.context";
import { rowObjects, useQueryTable } from "@/hooks/use-query-table";
import { MONTHS, type DashboardFilters } from "@/lib/dashboard-filters";
import { cn } from "@/lib/utils";
import { filterRetailers, filterYears } from "@/queries/common";

interface FilterBarProps {
    title: string;
    description: string;
    filters: DashboardFilters;
    onChange: (next: DashboardFilters) => void;
    /** Summary page is full-year — the month picker is shown disabled. */
    monthDisabled?: boolean;
    onRefresh: () => void;
    onExport: () => void;
    isExporting: boolean;
}

const iconButton =
    "inline-flex items-center justify-center rounded-xl border border-border bg-card p-200 text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function FilterBar(props: FilterBarProps) {
    const { title, description, filters, onChange, monthDisabled, onRefresh, onExport, isExporting } = props;
    const { isDark, toggleTheme } = useThemeContext();
    const [showInfo, setShowInfo] = useState(false);

    const years = useQueryTable(useMemo(() => filterYears(), []));
    const retailers = useQueryTable(useMemo(() => filterRetailers(), []));
    const yearOptions = rowObjects(years.table).map((r) => Number(r.Year));
    const retailerOptions = rowObjects(retailers.table).map((r) => String(r.Retailer));

    return (
        <header className="flex flex-col gap-400 xl:flex-row xl:items-start xl:justify-between">
            <div className="flex flex-col gap-100">
                <h1 className="font-heading text-hero-700 font-extrabold leading-hero-700 tracking-tight text-foreground">
                    {title}
                </h1>
                <p className="text-300 leading-300 text-muted-foreground">{description}</p>
            </div>

            <div className="relative flex flex-wrap items-center gap-200">
                <Select
                    label="Year"
                    value={String(filters.year)}
                    onChange={(v) => onChange({ ...filters, year: Number(v) })}
                    options={(yearOptions.length ? yearOptions : [filters.year]).map((y) => ({ value: String(y), label: String(y) }))}
                />
                <Select
                    label="Month"
                    value={String(filters.month ?? 12)}
                    disabled={monthDisabled}
                    onChange={(v) => onChange({ ...filters, month: Number(v) })}
                    options={MONTHS.map((m, i) => ({ value: String(i + 1), label: monthDisabled ? "Full year" : m }))}
                />
                <Select
                    label="Retailer"
                    value={filters.retailer ?? ""}
                    onChange={(v) => onChange({ ...filters, retailer: v || undefined })}
                    options={[{ value: "", label: "All retailers" }, ...retailerOptions.map((r) => ({ value: r, label: r }))]}
                />

                <div className={cn("flex items-center gap-200", isExporting && "hidden")}>
                <button
                    type="button"
                    className={iconButton}
                    aria-label="About this dashboard"
                    aria-expanded={showInfo}
                    onClick={() => setShowInfo((s) => !s)}
                >
                    <Info className="icon-size-200" aria-hidden />
                </button>
                <button type="button" className={iconButton} aria-label="Refresh data" title="Refresh data" onClick={onRefresh}>
                    <RotateCw className="icon-size-200" aria-hidden />
                </button>
                <button
                    type="button"
                    className={iconButton}
                    aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                    title={isDark ? "Light mode" : "Dark mode"}
                    onClick={toggleTheme}
                >
                    {isDark ? <Sun className="icon-size-200" aria-hidden /> : <Moon className="icon-size-200" aria-hidden />}
                </button>
                <button
                    type="button"
                    onClick={onExport}
                    disabled={isExporting}
                    className="inline-flex items-center gap-200 rounded-xl bg-primary px-400 py-200 text-300 font-semibold leading-300 text-primary-foreground shadow-4 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <Download className="icon-size-200" aria-hidden />
                    {isExporting ? "Exporting…" : "Export as PNG"}
                </button>
                </div>

                {showInfo && (
                    <div
                        role="note"
                        className="absolute right-0 top-full z-10 mt-200 w-full max-w-sm rounded-2xl border border-border bg-popover p-400 text-300 leading-300 text-popover-foreground shadow-16"
                    >
                        Live figures from the <strong>Sport Sales Model</strong> semantic model (Direct Lake, Fabric
                        workspace “Sport Sales App”). KPI changes compare the selected month with the month before;
                        the trend chart and Summary page cover the full selected year.
                    </div>
                )}
            </div>
        </header>
    );
}

interface SelectProps {
    label: string;
    value: string;
    options: { value: string; label: string }[];
    onChange: (value: string) => void;
    disabled?: boolean;
}

function Select({ label, value, options, onChange, disabled }: SelectProps) {
    const selected = options.find((o) => o.value === value)?.label ?? value;
    return (
        <label
            className={cn(
                "relative inline-flex items-center gap-200 rounded-xl border border-input bg-card py-200 pl-300 pr-300 text-300 font-medium leading-300 text-card-foreground",
                "hover:border-primary focus-within:ring-2 focus-within:ring-ring",
                disabled && "cursor-not-allowed opacity-60",
            )}
        >
            <span className="sr-only">{label}</span>
            <span aria-hidden>{selected}</span>
            <ChevronDown className="icon-size-200 text-muted-foreground" aria-hidden />
            <select
                value={value}
                disabled={disabled}
                onChange={(e) => onChange(e.target.value)}
                className="absolute inset-0 cursor-pointer appearance-none opacity-0 disabled:cursor-not-allowed"
            >
                {options.map((o) => (
                    <option key={o.value} value={o.value}>
                        {o.label}
                    </option>
                ))}
            </select>
        </label>
    );
}
