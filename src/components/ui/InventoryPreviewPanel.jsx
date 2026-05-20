import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  limit,
} from "firebase/firestore";
import { db } from "../../firebase.config";

// One-time read, cached for the page session
let _cache = null;
let _promise = null;

function fetchPreviewCars() {
  if (_cache) return Promise.resolve(_cache);
  if (_promise) return _promise;

  const q = query(
    collection(db, "inventory"),
    where("isSold", "==", false),
    orderBy("createdAt", "desc"),
    limit(10)
  );

  _promise = getDocs(q)
    .then((snap) => {
      const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const withImages = all.filter((c) => c.images?.length > 0);
      const withoutImages = all.filter((c) => !c.images?.length);
      _cache = [...withImages, ...withoutImages].slice(0, 3);
      return _cache;
    })
    .catch(() => {
      _promise = null;
      return [];
    });

  return _promise;
}

function PreviewCard({ car }) {
  const label = `${car.year} ${car.make} ${car.model}`;
  const price =
    car.price != null ? `$${Number(car.price).toLocaleString()}` : null;

  return (
    <Link
      to={`/inventory/${car.vin}`}
      tabIndex={-1}
      className="inventory-preview__card group block overflow-hidden rounded-lg bg-zinc-800 border border-zinc-700/60 transition-colors duration-150 hover:border-zinc-600"
      style={{ borderLeft: "2px solid rgb(220, 38, 38)" }}
    >
      {/* Image */}
      <div className="relative h-[115px] overflow-hidden bg-zinc-900">
        {car.images?.[0] ? (
          <img
            src={car.images[0]}
            alt={label}
            loading="lazy"
            decoding="async"
            width="340"
            height="115"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center px-4">
            <span className="text-center text-xs font-bold uppercase tracking-widest text-zinc-600">
              {label}
            </span>
          </div>
        )}
      </div>

      {/* Details row */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="min-w-0">
          <p className="truncate text-xs font-bold uppercase tracking-wide text-white leading-snug">
            {label}
          </p>
          {price && (
            <p className="mt-0.5 text-sm font-bold text-red-500">{price}</p>
          )}
        </div>
        <span className="ml-3 flex shrink-0 items-center gap-0.5 text-xs font-bold uppercase tracking-wide text-red-600 transition-colors group-hover:text-red-400">
          View
          <ArrowRight className="h-3 w-3 transition-transform duration-150 group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

function SkeletonPreviewCard() {
  return (
    <div
      className="overflow-hidden rounded-lg border border-zinc-700/60 bg-zinc-800"
      style={{ borderLeft: "2px solid rgba(127, 29, 29, 0.4)" }}
    >
      <div className="skeleton-dark h-[115px]" />
      <div className="px-3 py-2.5 space-y-2">
        <div className="skeleton-dark h-3 w-3/4 rounded" />
        <div className="skeleton-dark h-4 w-1/3 rounded" />
      </div>
    </div>
  );
}

export function InventoryPreviewPanel({ panelRef }) {
  const [cars, setCars] = useState(null); // null = loading

  useEffect(() => {
    fetchPreviewCars().then(setCars);
  }, []);

  // If fetch resolved empty, render nothing so layout stays clean
  if (cars !== null && cars.length === 0) return null;

  const isLoading = cars === null;

  return (
    <div
      ref={panelRef}
      className="inventory-preview hidden lg:flex flex-col justify-center gap-2.5 w-[340px] shrink-0"
      style={{ willChange: "transform, opacity" }}
      aria-hidden="true"
    >
      {/* Divider label */}
      <div className="mb-0.5 flex items-center gap-3">
        <div className="h-px flex-1 bg-zinc-700/50" />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
          In Stock Now
        </span>
        <div className="h-px flex-1 bg-zinc-700/50" />
      </div>

      {isLoading
        ? Array.from({ length: 3 }).map((_, i) => <SkeletonPreviewCard key={i} />)
        : cars.map((car) => <PreviewCard key={car.id} car={car} />)}
    </div>
  );
}
