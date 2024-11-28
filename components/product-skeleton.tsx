import { Skeleton } from "./ui/skeleton";

export function ProductSkeleton() {
  return (
    <div className="space-y-4">
      <div className="relative h-64 w-full">
        <Skeleton className="h-full w-full" />
      </div>
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
} 