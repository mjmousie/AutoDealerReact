import { useState, useMemo, useEffect } from "react";
import { SlidersHorizontal, X, Search } from "lucide-react";
import { PageMeta } from "../components/seo/PageMeta";
import { CarCard, SkeletonCard } from "../components/ui/CarCard";
import { usePublicInventory } from "../hooks/useInventory";
import { PRICE_RANGES } from "../utils/constants";

const PRICE_OPTIONS = PRICE_RANGES.filter((r) => r.max !== Infinity);

export default function Inventory() {
  const [make, setMake] = useState("");
  const [maxPrice, setMaxPrice] = useState(null);

  const { cars, loading, error } = usePublicInventory({ make, maxPrice });

  const hasFilters = Boolean(make || maxPrice);

  const availableMakes = useMemo(() => {
    const makes = cars.map((car) => car.make).filter(Boolean);
    return [...new Set(makes)].sort();
  }, [cars]);

  useEffect(() => {
    if (make && !availableMakes.includes(make)) {
      setMake("");
    }
  }, [availableMakes, make]);

  function clearFilters() {
    setMake("");
    setMaxPrice(null);
  }

  const vehicleLabel = loading
    ? "Loading…"
    : `${cars.length} vehicle${cars.length !== 1 ? "s" : ""} available${hasFilters ? " with current filters" : ""}`;

  return (
    <>
      <PageMeta
        title="Inventory"
        description="Browse our selection of quality pre-owned vehicles at honest prices."
        url="/inventory"
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
        {/* Page header */}
        <div className="mb-8">
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-red-600">
            Available Now
          </p>
          <div className="flex items-end justify-between gap-4">
            <h1 className="font-display text-4xl uppercase tracking-wide text-gray-900 sm:text-5xl">
              Our Inventory
            </h1>
            <p className="mb-1 text-sm text-gray-500 shrink-0">{vehicleLabel}</p>
          </div>
        </div>

        {/* ── Filter bar ───────────────────────────────────────────── */}
        {(loading || cars.length > 0) && (
          <div className="mb-8 flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 sm:p-4 shadow-sm">
            <SlidersHorizontal className="h-4 w-4 shrink-0 text-red-600" />

            <select
              value={make}
              onChange={(e) => setMake(e.target.value)}
              aria-label="Filter by make"
              className="min-w-[130px] flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5
                         text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500/30
                         focus:border-red-400 transition-colors cursor-pointer"
            >
              <option value="">All Makes</option>
              {availableMakes.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            <select
              value={maxPrice ?? ""}
              onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : null)}
              aria-label="Filter by max price"
              className="min-w-[130px] flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5
                         text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500/30
                         focus:border-red-400 transition-colors cursor-pointer"
            >
              <option value="">Any Price</option>
              {PRICE_OPTIONS.map((r) => (
                <option key={r.max} value={r.max}>{r.label}</option>
              ))}
            </select>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50
                           px-3 py-2.5 text-xs font-semibold text-gray-500
                           hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
                Clear
              </button>
            )}
          </div>
        )}

        {/* ── Loading ───────────────────────────────────────────────── */}
        {loading && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* ── Error ─────────────────────────────────────────────────── */}
        {!loading && error && (
          <div className="py-20 text-center">
            <p className="text-sm text-red-500">
              Failed to load inventory. Please refresh the page.
            </p>
          </div>
        )}

        {/* ── Empty state ───────────────────────────────────────────── */}
        {!loading && !error && cars.length === 0 && (
          <div className="py-20 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <Search className="h-7 w-7 text-gray-400" />
            </div>
            <p className="text-lg font-semibold text-gray-700">
              No vehicles found{hasFilters ? " matching your filters" : ""}.
            </p>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 text-sm font-semibold text-red-600 hover:text-red-500 transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* ── Vehicle grid ──────────────────────────────────────────── */}
        {!loading && !error && cars.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-fade-in">
            {cars.map((car, index) => (
              <CarCard key={car.id} car={car} isPriority={index === 0} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
