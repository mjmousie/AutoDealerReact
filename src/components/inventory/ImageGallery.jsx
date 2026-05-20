import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight, X, Car } from "lucide-react";

export function ImageGallery({ images = [] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxVisible, setLightboxVisible] = useState(true);

  const touchStartX = useRef(null);
  const lightboxTouchStartX = useRef(null);
  const stripRef = useRef(null);
  const [stripAtStart, setStripAtStart] = useState(true);
  const [stripAtEnd, setStripAtEnd] = useState(false);

  // ── Thumbnail strip scroll ───────────────────────────────────────
  function scrollStrip(direction) {
    const strip = stripRef.current;
    if (!strip) return;
    strip.scrollBy({
      left: direction === "left" ? -200 : 200,
      behavior: "smooth",
    });
  }

  function handleStripScroll() {
    const strip = stripRef.current;
    if (!strip) return;
    setStripAtStart(strip.scrollLeft <= 0);
    setStripAtEnd(strip.scrollLeft + strip.clientWidth >= strip.scrollWidth - 4);
  }

  // ── Fade helpers ─────────────────────────────────────────────────
  function changeImage(newIndex) {
    setVisible(false);
    setTimeout(() => {
      setSelectedIndex(newIndex);
      setVisible(true);
    }, 150);
  }

  function changeLightboxImage(newIndex) {
    setLightboxVisible(false);
    setTimeout(() => {
      setSelectedIndex(newIndex);
      setLightboxVisible(true);
    }, 150);
  }

  // ── Navigation ───────────────────────────────────────────────────
  const prev = useCallback(() => {
    changeImage((selectedIndex - 1 + images.length) % images.length);
  }, [selectedIndex, images.length]);

  const next = useCallback(() => {
    changeImage((selectedIndex + 1) % images.length);
  }, [selectedIndex, images.length]);

  const lightboxPrev = useCallback(() => {
    changeLightboxImage((selectedIndex - 1 + images.length) % images.length);
  }, [selectedIndex, images.length]);

  const lightboxNext = useCallback(() => {
    changeLightboxImage((selectedIndex + 1) % images.length);
  }, [selectedIndex, images.length]);

  // ── Touch swipe (main gallery) ───────────────────────────────────
  function onTouchStart(e) {
    touchStartX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e) {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) >= 50) delta > 0 ? next() : prev();
    touchStartX.current = null;
  }

  // ── Touch swipe (lightbox) ───────────────────────────────────────
  function onLightboxTouchStart(e) {
    lightboxTouchStartX.current = e.touches[0].clientX;
  }
  function onLightboxTouchEnd(e) {
    if (lightboxTouchStartX.current === null) return;
    const delta = lightboxTouchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) >= 50) delta > 0 ? lightboxNext() : lightboxPrev();
    lightboxTouchStartX.current = null;
  }

  // ── Lightbox open/close ──────────────────────────────────────────
  function openLightbox() {
    setLightboxVisible(true);
    setLightboxOpen(true);
    document.body.style.overflow = "hidden";
  }
  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    document.body.style.overflow = "";
  }, []);

  useEffect(() => {
    if (!lightboxOpen) return;
    function onKeyDown(e) {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") lightboxPrev();
      if (e.key === "ArrowRight") lightboxNext();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxOpen, lightboxPrev, lightboxNext, closeLightbox]);

  // ── No images ────────────────────────────────────────────────────
  if (!images || images.length === 0) {
    return (
      <div className="aspect-[16/9] overflow-hidden rounded-2xl bg-gray-100 flex flex-col items-center justify-center gap-3">
        <Car className="h-14 w-14 text-gray-400" />
        <p className="text-sm text-gray-500 font-medium">No photos available</p>
      </div>
    );
  }

  const multipleImages = images.length > 1;

  return (
    <>
      {/* ── Main image area ─────────────────────────────────────────── */}
      <div
        className="group relative aspect-[16/9] overflow-hidden rounded-2xl bg-gray-100 cursor-zoom-in"
        onClick={openLightbox}
        onTouchStart={multipleImages ? onTouchStart : undefined}
        onTouchEnd={multipleImages ? onTouchEnd : undefined}
      >
        <img
          src={images[selectedIndex]}
          alt={`Vehicle photo ${selectedIndex + 1}`}
          width="900"
          height="562"
          fetchpriority="high"
          loading="eager"
          decoding="sync"
          sizes="(max-width: 768px) 100vw, 900px"
          className={`h-full w-full object-cover transition-opacity duration-200 ${
            visible ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Arrow buttons — hidden on desktop until hover, always visible on mobile */}
        {multipleImages && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="
                absolute left-2 top-1/2 -translate-y-1/2
                flex items-center justify-center
                w-10 h-10 rounded-full bg-white/80 shadow
                opacity-100 md:opacity-0 md:group-hover:opacity-100
                transition-opacity duration-150 z-10
              "
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5 text-gray-800" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="
                absolute right-2 top-1/2 -translate-y-1/2
                flex items-center justify-center
                w-10 h-10 rounded-full bg-white/80 shadow
                opacity-100 md:opacity-0 md:group-hover:opacity-100
                transition-opacity duration-150 z-10
              "
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5 text-gray-800" />
            </button>
          </>
        )}
      </div>

      {/* ── Thumbnail strip ─────────────────────────────────────────── */}
      {multipleImages && (
        <div className="flex items-center gap-2 mt-2">
          {/* Left arrow — desktop only */}
          <button
            onClick={() => scrollStrip("left")}
            disabled={stripAtStart}
            className="hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 shrink-0 disabled:opacity-30"
            aria-label="Scroll thumbnails left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Scrollable thumbnail strip */}
          <div
            ref={stripRef}
            onScroll={handleStripScroll}
            className="flex gap-2 overflow-x-auto scrollbar-hide flex-1 mb-2"
style={{ WebkitOverflowScrolling: 'touch', scrollSnapType: 'x start', scrollPaddingLeft: '8px' }}
          >
            {images.map((url, i) => (
              <div key={i} className="snap-start shrink-0" style={{ scrollSnapAlign: 'start' }}>
                  <button
  onClick={() => changeImage(i)}
  className="relative w-20 h-20 rounded-xl overflow-hidden focus:outline-none block"
                >
                  <img
                    src={url}
                    alt={`Thumbnail ${i + 1}`}
                    width="96"
                    height="96"
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                  {/* Active ring */}
                  {i === selectedIndex && (
                    <span className="absolute inset-0 rounded-xl ring-2 ring-inset ring-red-600 pointer-events-none" />
                  )}
                  {/* Dark overlay on inactive thumbnails */}
                  {i !== selectedIndex && (
                    <span className="absolute inset-0 bg-black/30 hover:opacity-0 transition-opacity duration-150 rounded-xl pointer-events-none" />
                  )}
                </button>
              </div>
            ))}
          </div>

          {/* Right arrow — desktop only */}
          <button
            onClick={() => scrollStrip("right")}
            disabled={stripAtEnd}
            className="hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 shrink-0 disabled:opacity-30"
            aria-label="Scroll thumbnails right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Lightbox ────────────────────────────────────────────────── */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
          onTouchStart={onLightboxTouchStart}
          onTouchEnd={onLightboxTouchEnd}
        >
          {/* Counter */}
          <div className="absolute top-4 left-4 text-white text-sm font-medium select-none z-10">
            {selectedIndex + 1} / {images.length}
          </div>

          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 flex items-center justify-center w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition-colors z-10"
            aria-label="Close lightbox"
          >
            <X className="h-5 w-5 text-white" />
          </button>

          {/* Image — stop propagation so clicking image doesn't close */}
          <img
            src={images[selectedIndex]}
            alt={`Vehicle photo ${selectedIndex + 1}`}
            onClick={(e) => e.stopPropagation()}
            className={`max-h-[90vh] max-w-[90vw] object-contain transition-opacity duration-200 ${
              lightboxVisible ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* Lightbox arrows */}
          {multipleImages && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); lightboxPrev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-12 h-12 rounded-full bg-white/80 shadow z-10"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6 text-gray-800" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); lightboxNext(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-12 h-12 rounded-full bg-white/80 shadow z-10"
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6 text-gray-800" />
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
