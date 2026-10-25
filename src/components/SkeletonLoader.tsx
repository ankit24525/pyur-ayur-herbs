"use client";

import React from "react";

export function Shimmer({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden bg-neutral-200/70 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.8s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent ${className}`}
    />
  );
}

export function HeroSkeleton() {
  return (
    <div className="w-full bg-[#1b3823] text-white overflow-hidden relative">
      <div className="mx-auto max-w-7xl px-4 py-12 md:py-20 lg:py-24">
        <div className="grid gap-8 md:grid-cols-2 items-center">
          <div className="space-y-4">
            <Shimmer className="h-6 w-36 rounded-full bg-white/15 before:via-white/30" />
            <Shimmer className="h-10 md:h-14 w-3/4 rounded-2xl bg-white/20 before:via-white/30" />
            <Shimmer className="h-5 w-5/6 rounded-xl bg-white/10 before:via-white/20" />
            <Shimmer className="h-4 w-2/3 rounded-xl bg-white/10 before:via-white/20" />
            <div className="pt-4 flex items-center gap-4">
              <Shimmer className="h-12 w-44 rounded-xl bg-white/25 before:via-white/40" />
              <Shimmer className="h-12 w-32 rounded-xl bg-white/15 before:via-white/30" />
            </div>
          </div>
          <div className="flex justify-center">
            <Shimmer className="h-64 sm:h-80 md:h-96 w-full max-w-md rounded-3xl bg-white/15 before:via-white/30 shadow-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ConcernFilterSkeleton() {
  return (
    <div className="border-b border-neutral-200 bg-white py-4">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 rounded-full border border-neutral-200 bg-neutral-100 px-4 py-2 shrink-0 shadow-2xs"
            >
              <Shimmer className="size-5 rounded-full bg-neutral-200" />
              <Shimmer className="h-3 w-16 sm:w-20 rounded-md bg-neutral-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col">
      {/* Product Image Box - Borderless floating on white */}
      <div className="relative aspect-square w-full bg-neutral-100 rounded-xl overflow-hidden flex items-center justify-center">
        <Shimmer className="h-full w-full bg-neutral-200" />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col pt-3 space-y-2">
        {/* Title */}
        <Shimmer className="h-3.5 w-3/4 rounded-md bg-neutral-300" />

        {/* Price & MRP Row */}
        <div className="flex items-baseline gap-2">
          <Shimmer className="h-4 w-16 rounded-md bg-neutral-300" />
          <Shimmer className="h-3 w-12 rounded-md bg-neutral-200" />
        </div>
      </div>
    </div>
  );
}

export function ProductRailSkeleton({ title = "Loading Products..." }: { title?: string }) {
  return (
    <section className="py-10 bg-white">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-6 flex items-center justify-between">
          <div className="space-y-1.5">
            <Shimmer className="h-7 w-48 sm:w-64 rounded-lg bg-neutral-300" />
            <Shimmer className="h-3.5 w-32 sm:w-44 rounded-md bg-neutral-200" />
          </div>
          <Shimmer className="h-8 w-24 rounded-full bg-neutral-200" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10 items-start">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function StorefrontSkeleton() {
  return (
    <div className="min-h-screen bg-white text-neutral-900 animate-in fade-in duration-200">
      {/* Top bar placeholder */}
      <div className="bg-[#023915] py-2 px-4">
        <Shimmer className="h-4 w-64 mx-auto rounded-full bg-white/20" />
      </div>

      {/* Header bar placeholder */}
      <div className="bg-white border-b border-neutral-200 py-3.5 px-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Shimmer className="size-10 rounded-full bg-neutral-200" />
            <Shimmer className="h-6 w-32 rounded-lg bg-neutral-200" />
          </div>
          <Shimmer className="hidden md:block h-10 w-80 rounded-full bg-neutral-200" />
          <div className="flex items-center gap-3">
            <Shimmer className="h-9 w-20 rounded-lg bg-neutral-200" />
            <Shimmer className="size-9 rounded-lg bg-neutral-200" />
          </div>
        </div>
      </div>

      {/* Hero Banner Shimmer */}
      <HeroSkeleton />

      {/* Concerns Bar Shimmer */}
      <ConcernFilterSkeleton />

      {/* Product Rails Shimmer */}
      <ProductRailSkeleton title="Best Sellers" />
      <ProductRailSkeleton title="Ayurvedic Remedies" />
    </div>
  );
}
