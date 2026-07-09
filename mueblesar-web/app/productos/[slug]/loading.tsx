import { Container } from "../../components/layout/Container";
import { Skeleton } from "../../components/ui/Skeleton";

export default function LoadingProductDetail() {
  return (
    <div className="py-10">
      <Container>
        <div className="pb-4">
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-4">
            <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
            <div className="grid grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="aspect-[4/3] w-full rounded-lg" />
              ))}
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-28" />
            </div>
            <Skeleton className="h-20 w-full" />
            <div className="grid grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-11 w-40" />
              <Skeleton className="h-11 w-36" />
            </div>
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      </Container>
    </div>
  );
}
