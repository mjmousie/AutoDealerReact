import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Phone, ChevronRight } from "lucide-react";
import { PageMeta } from "../components/seo/PageMeta";
import { CarCard, SkeletonCard } from "../components/ui/CarCard";
import { InventoryPreviewPanel } from "../components/ui/InventoryPreviewPanel";
import { useFeaturedCars } from "../hooks/useInventory";
import business from "../config/business";

export default function Home() {
  const { featured, loading, error } = useFeaturedCars();

  const heroRef = useRef(null);
  const panelRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    if (window.innerWidth < 1024) return;

    let rafId = null;
    let timeoutId = null;

    function handleScroll() {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        if (!heroRef.current) { rafId = null; return; }
        const rect = heroRef.current.getBoundingClientRect();
        const heroHeight = heroRef.current.offsetHeight;
        const progress = Math.min(Math.max(-rect.top / (heroHeight * 1.5), 0), 1);
        setScrollProgress(progress);

        // Drive panel animation directly — no React re-render needed
        if (panelRef.current) {
          panelRef.current.style.opacity = String(Math.max(1 - progress * 3, 0));
          panelRef.current.style.transform = `translateX(${progress * 120}px)`;
        }

        rafId = null;
      });
    }

    timeoutId = setTimeout(() => {
      window.addEventListener("scroll", handleScroll, { passive: true });
    }, 500);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("scroll", handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    setScrollProgress(0);
  }, []);

  const isDesktop = typeof window !== "undefined" && window.innerWidth >= 1024;
  const textOpacity = Math.max(1 - scrollProgress * 2, 0);

  return (
    <>
      <PageMeta
        description="Browse hand-picked pre-owned vehicles at honest prices. No pressure, no games."
        url="/"
      />

      {/* ── Hero — dark editorial ────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative flex min-h-[680px] lg:min-h-[800px] items-center justify-center overflow-hidden bg-zinc-900 px-4"
      >
        {/* Subtle grid texture overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg,#fff 0px,#fff 1px,transparent 1px,transparent 48px)," +
              "repeating-linear-gradient(90deg,#fff 0px,#fff 1px,transparent 1px,transparent 48px)",
          }}
        />

        {/* Red accent stripe — far left edge */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-1 bg-red-600" />

        {/* Two-column layout: left = hero text, right = inventory panel */}
        <div className="relative z-10 mx-auto max-w-7xl w-full flex flex-col lg:flex-row lg:items-center lg:gap-10">

          {/* Left: hero text content */}
          <div
            className="flex-1 min-w-0"
            style={{
              opacity: isDesktop ? textOpacity : 1,
              transition: "none",
            }}
          >
            {/* Eyebrow */}
            <div className="animate-fade-in mb-6 inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
              <span className="text-xs font-semibold uppercase tracking-widest text-red-400">
                Pre-Owned Dealership — Youngstown, OH
              </span>
            </div>

            {/* Main headline */}
            <h1
              className="animate-slide-up anim-delay-100 font-display text-balance
                         text-[clamp(2.5rem,8vw,6.5rem)] uppercase leading-none tracking-wide
                         text-white"
            >
              Affordable Cars{" "}
              <span className="text-red-500">in Mahoning</span>{" "}
              <span className="text-zinc-300">& Trumbull County</span>
            </h1>

            {/* Divider */}
            <div className="animate-fade-in anim-delay-200 mt-8 flex items-center gap-4">
              <div className="h-px flex-1 max-w-[80px] bg-red-600" />
              <p className="text-base leading-relaxed text-zinc-400 sm:text-lg max-w-xl">
                Hand-picked pre-owned vehicles at honest prices. No pressure, no
                games — just great cars and straightforward deals.
              </p>
            </div>

            {/* CTAs */}
            <div className="animate-slide-up anim-delay-300 mt-10 flex flex-col items-start gap-3 sm:flex-row sm:gap-4">
              <Link
                to="/inventory"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-8 py-4
                           text-base font-bold text-white
                           hover:bg-red-500 active:bg-red-700 transition-colors duration-150 sm:w-auto"
              >
                Browse Inventory
                <ArrowRight className="h-5 w-5" />
              </Link>

              <a
                href={business.phoneHref}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-700
                           bg-transparent px-8 py-4 text-base font-bold text-white
                           hover:bg-zinc-800 active:bg-zinc-700 transition-colors duration-150 sm:w-auto"
              >
                <Phone className="h-5 w-5" />
                {business.phone}
              </a>
            </div>

            {/* Trust indicators */}
            <div className="animate-fade-in anim-delay-500 mt-12 flex flex-wrap items-center gap-x-8 gap-y-2 text-sm text-zinc-500">
              {["No hidden fees", "Transparent vehicle history", "Test drives welcome"].map((item) => (
                <span key={item} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500/70 shrink-0" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Right: inventory preview panel — hidden on mobile */}
          <InventoryPreviewPanel panelRef={panelRef} />
        </div>
      </section>

      {/* ── Featured Vehicles ─────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:py-20">
        {/* Section header */}
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-red-600">
              Hand-picked weekly
            </p>
            <h2 className="font-display text-4xl uppercase tracking-wide text-gray-900 sm:text-5xl">
              Featured Vehicles
            </h2>
          </div>

          <Link
            to="/inventory"
            className="hidden items-center gap-1 text-sm font-semibold text-gray-500
                       hover:text-red-600 transition-colors sm:flex"
          >
            View All <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <p className="py-10 text-center text-sm text-red-400">
            Unable to load featured vehicles. Please refresh.
          </p>
        )}

        {/* Empty */}
        {!loading && !error && featured.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-gray-500">No featured vehicles right now.</p>
            <Link
              to="/inventory"
              className="mt-4 inline-block text-sm font-semibold text-red-600 hover:text-red-500 transition-colors"
            >
              Browse all inventory
            </Link>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && featured.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((car, index) => (
              <CarCard key={car.id} car={car} isPriority={index === 0} />
            ))}
          </div>
        )}

        {/* Mobile "view all" */}
        <div className="mt-8 text-center sm:hidden">
          <Link
            to="/inventory"
            className="inline-flex items-center gap-1 text-sm font-semibold text-red-600 hover:text-red-500 transition-colors"
          >
            View All Inventory <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
