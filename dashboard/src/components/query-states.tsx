import { AlertTriangle, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

/** Shared card chrome — also passed to visuals via `containerClassName` so every card matches. */
export const CARD_CLASS = "rounded-2xl border border-border bg-card shadow-2";

export function Skeleton({ className }: { className?: string }) {
    return <div aria-hidden className={cn("animate-pulse rounded-2xl bg-muted", className)} />;
}

export function EmptyState({ title, message, className }: { title?: string; message?: string; className?: string }) {
    return (
        <div className={cn(CARD_CLASS, "flex h-full flex-col p-500", className)}>
            {title && <h3 className="text-300 font-semibold leading-300 text-card-foreground">{title}</h3>}
            <div className="flex flex-1 flex-col items-center justify-center gap-200 text-muted-foreground">
                <Inbox className="icon-size-400" aria-hidden />
                <p className="text-300 leading-300">{message ?? "No data for this selection."}</p>
            </div>
        </div>
    );
}

export function ErrorState({ title, message, className }: { title?: string; message: string; className?: string }) {
    return (
        <div className={cn(CARD_CLASS, "flex h-full flex-col gap-300 p-500", className)}>
            {title && <h3 className="text-300 font-semibold leading-300 text-card-foreground">{title}</h3>}
            <div
                role="alert"
                className="flex items-start gap-200 rounded-xl bg-destructive p-300 text-300 leading-300 text-destructive-foreground"
            >
                <AlertTriangle className="icon-size-200 mt-100 shrink-0" aria-hidden />
                <span>Couldn't load this data: {message}</span>
            </div>
        </div>
    );
}
