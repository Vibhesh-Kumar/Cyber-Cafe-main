import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoadingSpinner({ className }: { className?: string }) {
  return <Loader2 className={cn("h-6 w-6 animate-spin text-primary", className)} />;
}

export function LoadingPage() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4">
      <LoadingSpinner className="h-10 w-10" />
      <p className="text-sm text-muted-foreground animate-pulse">Loading data...</p>
    </div>
  );
}

export function LoadingCard() {
  return (
    <div className="flex h-48 flex-col items-center justify-center rounded-2xl border border-dashed bg-card/50">
      <LoadingSpinner />
    </div>
  );
}
