import { Container } from "../components/layout/Container";
import { Skeleton } from "../components/ui/Skeleton";

export default function LoadingProductsPage() {
  return (
    <div className="py-10">
      <Container>
        <div className="flex flex-col gap-2 pb-6">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>

        <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
          <div className="space-y-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid items-center gap-3 sm:grid-cols-2">
              <Skeleton className="h-4 w-28" />
              <div className="flex justify-end gap-2">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-20" />
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <Skeleton className="aspect-[4/3] w-full rounded-xl" />
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-14" />
                  </div>
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-full" />
                  <div className="flex items-center justify-between pt-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
