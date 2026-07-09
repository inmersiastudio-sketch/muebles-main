"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-[var(--gray-200)]",
        className
      )}
    />
  );
}

// Product Card Skeleton
export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-[var(--gray-200)] bg-white">
      {/* Image Skeleton */}
      <div className="relative aspect-[4/3] bg-[var(--gray-100)]">
        <Skeleton className="absolute inset-0 rounded-none" />
      </div>
      
      {/* Content Skeleton */}
      <div className="p-2 sm:p-3.5 space-y-2">
        {/* Title */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        
        {/* Original Price */}
        <Skeleton className="h-3 w-16 mt-2" />
        
        {/* Price */}
        <div className="flex items-center gap-2 mt-1">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-3 w-12" />
        </div>
        
        {/* Cuotas */}
        <Skeleton className="h-3 w-32" />
        
        {/* Envío */}
        <Skeleton className="h-3 w-24" />
        
        {/* Button */}
        <div className="pt-2 mt-2 border-t border-[var(--gray-200)]">
          <Skeleton className="h-8 w-full rounded-md" />
        </div>
      </div>
    </div>
  );
}

// Hero Section Skeleton
export function HeroSkeleton() {
  return (
    <div className="bg-white">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="grid items-center gap-8 lg:grid-cols-2 py-8 lg:py-12">
          {/* Text Content Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-40 rounded-full" />
            <Skeleton className="h-12 w-full max-w-md" />
            <Skeleton className="h-12 w-3/4 max-w-sm" />
            <Skeleton className="h-4 w-full max-w-lg" />
            <Skeleton className="h-4 w-2/3 max-w-md" />
            
            <div className="flex gap-3 pt-4">
              <Skeleton className="h-12 w-40 rounded-xl" />
              <Skeleton className="h-12 w-32 rounded-xl" />
            </div>
            
            <div className="flex gap-8 pt-6 border-t border-[var(--gray-200)]">
              <div className="space-y-1">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-12" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-8 w-12" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </div>
          
          {/* Image Skeleton */}
          <div className="flex items-center justify-center">
            <Skeleton className="w-full max-w-[400px] aspect-square rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Store Card Skeleton
export function StoreCardSkeleton() {
  return (
    <div className="rounded-xl border border-[var(--gray-200)] bg-white p-4 space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-2/3" />
      <div className="pt-2">
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  );
}

// Grid Skeleton for Products
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Categories Skeleton
export function CategoriesSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="aspect-[16/10] rounded-lg" />
      ))}
    </div>
  );
}

// Page Loading State
export function PageLoading() {
  return (
    <div className="min-h-screen bg-[var(--gray-100)]">
      <HeroSkeleton />
      
      {/* Benefits Bar Skeleton */}
      <div className="bg-white border-b border-[var(--gray-200)]">
        <div className="max-w-[1700px] mx-auto px-4 py-4">
          <div className="flex justify-around">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
      </div>
      
      {/* Sections Skeleton */}
      <div className="max-w-[1700px] mx-auto px-4 py-6 space-y-6">
        <div className="rounded-xl border border-[var(--gray-200)] bg-white p-4">
          <Skeleton className="h-6 w-48 mb-4" />
          <CategoriesSkeleton />
        </div>
        
        <div className="rounded-xl border border-[var(--gray-200)] bg-white p-4">
          <Skeleton className="h-6 w-40 mb-4" />
          <ProductGridSkeleton count={8} />
        </div>
      </div>
    </div>
  );
}
