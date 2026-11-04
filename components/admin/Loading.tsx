import { Skeleton } from "@/components/ui/skeleton";

export function Loading() {
  return (
    <div className="space-y-3" role="status" aria-live="polite">
      <p className="text-sm text-muted-foreground">Loading…</p>
      <Skeleton className="h-10 w-full rounded-xl" />
      <Skeleton className="h-24 w-full rounded-xl" />
      <Skeleton className="h-24 w-full rounded-xl" />
    </div>
  );
}
