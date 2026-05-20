import { Link } from "react-router-dom";
import { Gauge, Car, ArrowRight, Settings } from "lucide-react";
import { formatCurrency, formatMileage, carTitle } from "../../utils/formatter";
import { ConditionBadge } from "./ConditionBadge";

// ── Skeleton placeholder ──────────────────────────────────────
export function SkeletonCard() {
  return (
    <div className="rounded-xl overflow-hidden bg-white border border-gray-200">
      <div className="aspect-[16/10] skeleton" />
      <div className="p-4 space-y-3">
        <div className="h-5 w-3/4 skeleton rounded-md" />
        <div className="flex items-center justify-between">
          <div className="h-7 w-1/3 skeleton rounded-md" />
          <div className="h-5 w-1/4 skeleton rounded-md" />
        </div>
        <div className="h-4 w-1/3 skeleton rounded-md" />
      </div>
    </div>
  );
}

// ── Car card ─────────────────────────────────────────────────
export function CarCard({ car, isPriority = false }) {
  const title = carTitle(car);
  const thumb = car.images?.[0];

  return (
    <Link
      to={`/inventory/${car.vin}`}
      className="group block rounded-xl overflow-hidden bg-white border border-gray-200
                 hover:border-red-500/50 hover:shadow-md
                 transition-all duration-200
                 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
    >
      {/* Thumbnail */}
      <div className="aspect-[16/10] bg-gray-100 overflow-hidden relative">
        {thumb ? (
          <img
            src={thumb}
            alt={title}
            width="677"
            height="423"
            loading={isPriority ? "eager" : "lazy"}
            fetchpriority={isPriority ? "high" : "auto"}
            decoding={isPriority ? "sync" : "async"}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Car className="w-12 h-12 text-gray-300" />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-4">
        <h3 className="text-gray-900 font-semibold text-sm leading-snug line-clamp-2">{title}</h3>

        <div className="mt-3 flex items-end justify-between gap-2">
          <span className="text-red-600 font-bold text-2xl leading-none shrink-0">
            {formatCurrency(car.price)}
          </span>
          <div className="flex flex-col items-end gap-1 min-w-0">
            {car.condition && <ConditionBadge condition={car.condition} />}
          </div>
        </div>

        {/* Secondary specs */}
        <div className="mt-2.5 flex items-center gap-3 text-xs text-gray-500">
          {car.mileage && (
            <span className="flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 shrink-0" />
              {formatMileage(car.mileage)}
            </span>
          )}
          {car.transmission && (
            <span className="flex items-center gap-1">
              <Settings className="w-3.5 h-3.5 shrink-0" />
              {car.transmission}
            </span>
          )}
        </div>

        {/* View details link */}
        <div className="mt-3 flex items-center gap-1 text-red-600 text-xs font-bold uppercase tracking-wide">
          View Details
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-150" />
        </div>
      </div>
    </Link>
  );
}
