import { Skeleton } from "./Skeleton";

type SkeletonCardProps = {
    /** Number of cards to render */
    count?: number;
    /** Show product image skeleton */
    showImage?: boolean;
    /** Show category/tag skeleton */
    showCategory?: boolean;
    /** Show title skeleton */
    showTitle?: boolean;
    /** Show description skeleton */
    showDescription?: boolean;
    /** Show price skeleton */
    showPrice?: boolean;
    /** Show action button skeleton */
    showAction?: boolean;
    /** Additional CSS classes */
    className?: string;
};

/**
 * Reusable skeleton card component for loading states.
 * Displays placeholder content while data is loading.
 */
export function SkeletonCard({
    count = 1,
    showImage = true,
    showCategory = true,
    showTitle = true,
    showDescription = true,
    showPrice = true,
    showAction = true,
    className = "",
}: SkeletonCardProps) {
    const cards = Array.from({ length: count }, (_, i) => i);

    return (
        <>
            {cards.map((index) => (
                <div
                    key={index}
                    className={`flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm ${className}`}
                >
                    {showImage && (
                        <Skeleton className="aspect-[4/3] w-full rounded-xl" />
                    )}

                    {showCategory && (
                        <div className="flex flex-wrap gap-2">
                            <Skeleton className="h-6 w-20" />
                            <Skeleton className="h-6 w-14" />
                        </div>
                    )}

                    {showTitle && (
                        <Skeleton className="h-5 w-40" />
                    )}

                    {showDescription && (
                        <Skeleton className="h-4 w-full" />
                    )}

                    {showPrice && (
                        <div className="flex items-center justify-between pt-2">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-4 w-12" />
                        </div>
                    )}

                    {showAction && (
                        <Skeleton className="h-12 w-full rounded-full" />
                    )}
                </div>
            ))}
        </>
    );
}

/**
 * Grid layout with skeleton cards for product listing pages
 */
export function SkeletonCardGrid({
    count = 6,
    columns = { sm: 1, md: 2, lg: 3, xl: 4 },
    showImage = true,
    showCategory = true,
    showTitle = true,
    showDescription = true,
    showPrice = true,
    showAction = true,
    className = "",
}: SkeletonCardProps & {
    columns?: {
        sm?: number;
        md?: number;
        lg?: number;
        xl?: number;
    };
}) {
    const gridClass = [
        "grid",
        columns.sm === 1 ? "sm:grid-cols-1" : `sm:grid-cols-${columns.sm}`,
        columns.md === 2 ? "md:grid-cols-2" : `md:grid-cols-${columns.md}`,
        columns.lg === 3 ? "lg:grid-cols-3" : `lg:grid-cols-${columns.lg}`,
        columns.xl === 4 ? "xl:grid-cols-4" : `xl:grid-cols-${columns.xl}`,
    ].join(" ");

    return (
        <div className={`gap-6 ${gridClass} ${className}`}>
            <SkeletonCard
                count={count}
                showImage={showImage}
                showCategory={showCategory}
                showTitle={showTitle}
                showDescription={showDescription}
                showPrice={showPrice}
                showAction={showAction}
            />
        </div>
    );
}
