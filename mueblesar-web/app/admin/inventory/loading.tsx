import { Skeleton } from "../../components/ui/Skeleton";

export default function LoadingInventoryPage() {
    return (
        <div className="p-6 space-y-6">
            {/* Header skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <div className="flex gap-3">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-32" />
                </div>
            </div>

            {/* Search and filters skeleton */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                </div>
            </div>

            {/* Tabs skeleton */}
            <div className="flex gap-1 border-b border-slate-200">
                {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-24" />
                ))}
            </div>

            {/* Table skeleton */}
            <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
                {/* Table header */}
                <div className="grid grid-cols-12 gap-4 bg-slate-50 p-4 border-b border-slate-200">
                    <Skeleton className="h-5 w-8" />
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-32 col-span-2" />
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-20" />
                </div>

                {/* Table rows */}
                {[...Array(8)].map((_, rowIndex) => (
                    <div
                        key={rowIndex}
                        className="grid grid-cols-12 gap-4 p-4 border-b border-slate-100 items-center"
                    >
                        <Skeleton className="h-5 w-6" />
                        <Skeleton className="h-12 w-12 rounded-lg" />
                        <div className="col-span-2 space-y-2">
                            <Skeleton className="h-5 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                        </div>
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-5 w-12" />
                        <Skeleton className="h-5 w-12" />
                        <div className="flex gap-2">
                            <Skeleton className="h-8 w-8 rounded" />
                            <Skeleton className="h-8 w-8 rounded" />
                            <Skeleton className="h-8 w-8 rounded" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination skeleton */}
            <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-32" />
                <div className="flex gap-2">
                    <Skeleton className="h-9 w-20" />
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-9 w-9" />
                    ))}
                    <Skeleton className="h-9 w-20" />
                </div>
            </div>
        </div>
    );
}
