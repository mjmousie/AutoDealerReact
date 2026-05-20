import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Car, ArrowRight, Tag, Gauge, Settings, Workflow } from "lucide-react";
import { PageMeta } from "../components/seo/PageMeta";
import { TestDriveForm } from "../components/forms/TestDriveForm";
import { useCarByVin } from "../hooks/useInventory";
import { formatCurrency, formatMileage, carTitle } from "../utils/formatter";
import { ImageGallery } from "../components/inventory/ImageGallery";
import { ConditionBadge } from "../components/ui/ConditionBadge";

// ── Skeleton shown while Firestore resolves ──────────────────────
function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
      <div className="mb-6 h-4 w-36 skeleton rounded-md" />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px]">
        <div>
          <div className="aspect-[16/10] skeleton rounded-xl" />
          <div className="mt-6 space-y-4 rounded-xl border border-gray-200 bg-white p-6">
            <div className="h-7 w-3/4 skeleton rounded-md" />
            <div className="h-9 w-1/3 skeleton rounded-md" />
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 skeleton rounded-lg" />
              ))}
            </div>
          </div>
        </div>
        <div className="h-80 skeleton rounded-xl" />
      </div>
    </div>
  );
}

export default function CarDetail() {
  const { vin } = useParams();
  const { car, loading, error } = useCarByVin(vin);

  if (loading) return <DetailSkeleton />;

  if (!loading && !car) {
    return (
      <div className="p-8">
        <p className="font-bold text-red-600 text-lg">Vehicle Not Found</p>
        <div className="mt-4 p-4 bg-gray-100 rounded-xl text-xs font-mono space-y-2">
          <p>VIN from URL: <span className="text-red-600">{vin}</span></p>
          <p>Loading: {String(loading)}</p>
          <p>Error: {error || "none"}</p>
          <p>Car: {car ? "found" : "null"}</p>
        </div>
        <p className="mt-4 text-sm text-gray-500">Show this screen to your developer.</p>
      </div>
    );
  }

  const title = carTitle(car);
  const primaryImage = car.images?.[0];

  return (
    <>
      <PageMeta
        title={title}
        description={
          car.description ||
          `${title} — ${formatMileage(car.mileage)}, ${formatCurrency(car.price)}`
        }
        image={primaryImage}
        url={`/inventory/${car.vin}`}
        type="article"
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12 animate-fade-in">
        {/* Back link */}
        <Link
          to="/inventory"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500
                     hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Inventory
        </Link>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_440px]">

          {/* ── Left: image + details ──────────────────────────────── */}
          <div>
            <ImageGallery images={car.images} />

            {/* Details card */}
            <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5 sm:p-6">

              {/* Title + price row */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex flex-wrap items-start gap-3">
                  <h1 className="text-xl font-bold text-gray-900 sm:text-2xl leading-tight">{title}</h1>
                  {car.isSold && (
                    <span className="shrink-0 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-bold text-red-500">
                      SOLD
                    </span>
                  )}
                </div>
                <p className="text-3xl font-bold text-red-600 shrink-0 leading-none">
                  {formatCurrency(car.price)}
                </p>
              </div>

              {/* Spec pills */}
              {(car.bodyType || car.engine || car.transmission || car.drivetrain) && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {car.bodyType && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 border border-gray-200 text-gray-700 text-xs font-semibold">
                      <Car className="w-3 h-3 text-red-600" />
                      {car.bodyType}
                    </span>
                  )}
                  {car.transmission && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 border border-gray-200 text-gray-700 text-xs font-semibold">
                      <Settings className="w-3 h-3 text-red-600" />
                      {car.transmission}
                    </span>
                  )}
                  {car.drivetrain && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 border border-gray-200 text-gray-700 text-xs font-semibold">
                      <Workflow className="w-3 h-3 text-red-600" />
                      {car.drivetrain}
                    </span>
                  )}
                </div>
              )}

              {/* Key stats grid */}
              <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {[
                  { label: "Year", value: car.year },
                  { label: "Make", value: car.make },
                  { label: "Model", value: car.model },
                  {
                    label: "Mileage",
                    value: (
                      <span className="flex items-center gap-1">
                        <Gauge className="w-3.5 h-3.5 text-gray-400" />
                        {formatMileage(car.mileage)}
                      </span>
                    ),
                  },
                  car.condition && {
                    label: "Condition",
                    value: <ConditionBadge condition={car.condition} />,
                  },
                ].filter(Boolean).map(({ label, value }) => (
                  <div key={label} className="rounded-lg bg-gray-50 border border-gray-100 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</p>
                    <div className="mt-1 text-sm font-semibold text-gray-900">{value}</div>
                  </div>
                ))}

                {/* VIN — full width */}
                <div className="col-span-2 sm:col-span-3 rounded-lg bg-gray-50 border border-gray-100 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">VIN</p>
                  <p className="mt-1 font-mono text-sm font-semibold tracking-widest text-gray-900 break-all">
                    {car.vin}
                  </p>
                </div>
              </div>

              {/* Description */}
              {car.description && (
                <div className="mt-5 border-t border-gray-100 pt-5">
                  <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                    About This Vehicle
                  </h2>
                  <p className="text-sm leading-relaxed text-gray-700">{car.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* ── Right: test-drive form (sticky) ─────────────────────── */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
              {car.isSold ? (
                <div className="py-6 text-center">
                  <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10">
                    <Tag className="h-6 w-6 text-red-500" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Vehicle Sold</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    This vehicle has been sold. Browse our current inventory for similar options.
                  </p>
                  <Link
                    to="/inventory"
                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-red-600 px-6 py-3
                               text-sm font-bold text-white hover:bg-red-500 transition-colors"
                  >
                    Browse Inventory
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : (
                <TestDriveForm car={car} />
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
