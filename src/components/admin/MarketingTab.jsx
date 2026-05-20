import { useState, useEffect, useRef } from "react";
import {
  Save, Copy, CheckCircle2, ArrowLeftRight, Car,
  Globe, ThumbsUp, Heart, MessageCircle, Share2, Code2,
} from "lucide-react";
import { usePostTemplate, DEFAULT_TEMPLATE } from "../../hooks/usePostTemplate";
import { SHORTCODES, renderTemplate } from "../../utils/templateRenderer";
import { formatCurrency, formatMileage, formatDate } from "../../utils/formatter";
import business from "../../config/business";

// ─────────────────────────────────────────────────────────────────
// PostTemplateSection — two-column editor + FB post preview
// ─────────────────────────────────────────────────────────────────
function PostTemplateSection({ cars }) {
  const { template, setTemplate, saving, lastSaved, saveTemplate } = usePostTemplate();

  const textareaRef = useRef(null);
  const popoverRef = useRef(null);

  const [showShortcodes, setShowShortcodes] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [previewVehicle, setPreviewVehicle] = useState(null);
  const [previewText, setPreviewText] = useState("");

  // Pick a random non-sold car once for the preview
  useEffect(() => {
    if (cars.length > 0 && !previewVehicle) {
      const available = cars.filter((c) => !c.isSold);
      if (available.length > 0) {
        const random = available[Math.floor(Math.random() * available.length)];
        setPreviewVehicle(random);
      }
    }
  }, [cars]);

  // Debounced preview render — updates 0.8s after typing stops
  useEffect(() => {
    const timer = setTimeout(() => {
      if (previewVehicle) {
        setPreviewText(renderTemplate(template, previewVehicle));
      } else {
        setPreviewText(template);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [template, previewVehicle]);

  // Close shortcodes popover on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setShowShortcodes(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function insertShortcode(code) {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newValue = template.slice(0, start) + code + template.slice(end);
    setTemplate(newValue);
    setTimeout(() => {
      textarea.selectionStart = start + code.length;
      textarea.selectionEnd = start + code.length;
      textarea.focus();
    }, 0);
  }

  async function handleSave() {
    setSaveError(null);
    try {
      await saveTemplate(template);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err?.code === "permission-denied"
        ? "Permission denied — add the settings rule in Firestore Console."
        : (err?.message || "Save failed. Check the browser console for details."));
      setTimeout(() => setSaveError(null), 6000);
    }
  }

  function handleReset() {
    setTemplate(DEFAULT_TEMPLATE);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 content-center">

      {/* ── Left column: Template Editor ──────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">

        {/* Header row */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-gray-900">Post Template</h2>
          </div>

          {/* Shortcodes popover trigger */}
          <div className="relative" ref={popoverRef}>
            <button
              onClick={() => setShowShortcodes(!showShortcodes)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                showShortcodes
                  ? "bg-red-600 text-white border-red-600"
                  : "bg-white text-gray-600 border-gray-300 hover:border-red-300 hover:text-red-600"
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              Shortcodes
            </button>

            {/* Floating popover */}
            {showShortcodes && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl
                              border border-gray-200 shadow-xl z-50 p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Click to insert at cursor
                </p>
                <div className="flex flex-wrap gap-1.5 max-h-64 overflow-y-auto">
                  {SHORTCODES.map(({ code, description }) => (
                    <button
                      key={code}
                      onClick={() => { insertShortcode(code); setShowShortcodes(false); }}
                      title={description}
                      className="inline-flex items-center px-2 py-1 rounded-lg bg-gray-50
                                 border border-gray-200 text-gray-700 text-xs font-mono
                                 hover:bg-red-50 hover:border-red-200 hover:text-red-700
                                 transition-colors"
                    >
                      {code}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Textarea */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            rows={18}
            maxLength={300}
            className="w-full px-4 py-3 pb-8 rounded-xl bg-white border border-gray-300
                       text-gray-900 text-sm font-mono resize-none
                       focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500
                       transition-colors"
            placeholder="Write your post template here using shortcodes..."
          />
          <div className={`absolute bottom-3 right-3 text-xs font-medium pointer-events-none ${
            template.length >= 280 ? "text-red-500" :
            template.length >= 240 ? "text-amber-500" : "text-gray-400"
          }`}>
            {template.length}/300
          </div>
        </div>

        {/* Save / Reset row */}
        <div className="flex items-center justify-between mt-3">
          <button
            onClick={handleReset}
            className="text-xs text-gray-400 hover:text-gray-600 underline transition-colors"
          >
            Reset to default
          </button>
          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Saved
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white
                         text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {saving ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? "Saving..." : "Save Template"}
            </button>
          </div>
        </div>

        {/* Save error */}
        {saveError && (
          <p className="text-xs text-red-600 font-medium mt-2 text-right">
            ⚠️ {saveError}
          </p>
        )}

        {/* Last saved timestamp */}
        {lastSaved && (
          <p className="text-xs text-gray-400 mt-2 text-right">
            Last saved: {formatDate(lastSaved)}
          </p>
        )}
      </div>

      {/* ── Right column: Facebook Post Preview ───────────────── */}
      <div className="scale-[0.85] content-start">
        <div className="flex justify-between mb-3">
          <h2 className="text-base font-bold text-gray-900">Post Preview</h2>
          <span className="text-xs text-gray-400 italic">
            Updates after you stop typing
          </span>
        </div>

        {/* FB Post Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

          {/* Post header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center shrink-0">
                <span className="text-white text-sm font-bold">
                  {business.fullName.charAt(0)}
                </span>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 leading-tight">
                  {business.fullName}
                </p>
                <div className="flex items-center gap-1">
                  <p className="text-xs text-gray-400">Just now ·</p>
                  <Globe className="w-3 h-3 text-gray-400" />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-0.5 px-1">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-1 h-1 rounded-full bg-gray-400" />
              ))}
            </div>
          </div>

          {/* Post text */}
          <div className="px-4 pb-3">
            <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
              {previewText || (
                <span className="text-gray-400 italic">
                  Start typing your template to see a preview...
                </span>
              )}
            </p>
          </div>

          {/* Post image */}
          <div className="aspect-[1.91/1] bg-gray-100 relative overflow-hidden">
            {previewVehicle?.images?.[0] ? (
              <img
                src={previewVehicle.images[0]}
                alt="Vehicle"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                <Car className="w-10 h-10 text-gray-300" />
                <p className="text-xs text-gray-400">Vehicle photo appears here</p>
              </div>
            )}
            {previewVehicle && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                <p className="text-white font-bold text-lg leading-tight">
                  {formatCurrency(previewVehicle.price)}
                </p>
                <p className="text-white/80 text-xs">
                  {previewVehicle.year} {previewVehicle.make} {previewVehicle.model}
                </p>
              </div>
            )}
          </div>

          {/* FB engagement bar */}
          <div className="px-4 py-1 border-t border-gray-100">
            <div className="flex items-center justify-between py-1.5">
              <div className="flex items-center gap-1">
                <div className="flex -space-x-1">
                  <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                    <ThumbsUp className="w-2.5 h-2.5 text-white" />
                  </div>
                  <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                    <Heart className="w-2.5 h-2.5 text-white" />
                  </div>
                </div>
                <span className="text-xs text-gray-500 ml-1">24</span>
              </div>
              <div className="flex gap-3">
                <span className="text-xs text-gray-500">8 comments</span>
                <span className="text-xs text-gray-500">3 shares</span>
              </div>
            </div>
            <div className="flex border-t border-gray-100 pt-1 pb-1">
              {[
                { icon: ThumbsUp, label: "Like" },
                { icon: MessageCircle, label: "Comment" },
                { icon: Share2, label: "Share" },
              ].map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5
                             text-gray-500 text-xs font-semibold hover:bg-gray-50 rounded-lg
                             transition-colors"
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {previewVehicle && (
          <p className="text-xs text-gray-400 text-center mt-2">
            Previewing with: {previewVehicle.year} {previewVehicle.make} {previewVehicle.model}
          </p>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// AIAPreviewCard — mimics a Facebook Automotive Inventory Ad card
// ─────────────────────────────────────────────────────────────────
function AIAPreviewCard({ car, allCars, onSwap }) {
  const [showSwap, setShowSwap] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="relative aspect-[1.91/1] bg-gray-100">
        {car.images?.[0] ? (
          <img
            src={car.images[0]}
            alt={`${car.year} ${car.make} ${car.model}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Car className="w-10 h-10 text-gray-300" />
          </div>
        )}
        <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm
                        text-white text-[10px] px-2 py-0.5 rounded font-medium">
          Sponsored
        </div>
        <button
          onClick={() => setShowSwap(!showSwap)}
          className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1
                     bg-white/90 backdrop-blur-sm rounded-lg text-xs font-medium
                     text-gray-700 hover:bg-white border border-gray-200 transition-colors"
        >
          <ArrowLeftRight className="w-3 h-3" />
          Swap
        </button>
      </div>

      <div className="p-3 border-t border-gray-100">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">
              {car.year} {car.make} {car.model}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {formatMileage(car.mileage)} · {car.condition || "Used"}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-sm font-bold text-red-600">{formatCurrency(car.price)}</p>
            <p className="text-[10px] text-gray-400">Starting price</p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <p className="text-[10px] text-gray-400 truncate">{business.fullName}</p>
          <div className="shrink-0 px-3 py-1.5 rounded bg-gray-100 border border-gray-200
                          text-xs font-semibold text-gray-700">
            Learn More
          </div>
        </div>
      </div>

      {showSwap && (
        <div className="border-t border-gray-100 p-3 bg-gray-50">
          <p className="text-xs text-gray-500 font-medium mb-2">Replace with:</p>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {allCars
              .filter((c) => c.id !== car.id)
              .map((c) => (
                <button
                  key={c.id}
                  onClick={() => { onSwap(c); setShowSwap(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs
                             hover:bg-white hover:border hover:border-gray-200
                             text-gray-700 transition-colors flex items-center justify-between"
                >
                  <span>{c.year} {c.make} {c.model}</span>
                  <span className="text-red-600 font-semibold">{formatCurrency(c.price)}</span>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// AIAFeedSection — feed URL + vehicle preview grid
// ─────────────────────────────────────────────────────────────────
function AIAFeedSection({ cars }) {
  const [copied, setCopied] = useState(false);
  const [previewCars, setPreviewCars] = useState([]);

  useEffect(() => {
    const featured = cars.filter((c) => c.isFeatured && !c.isSold);
    const nonFeatured = cars.filter((c) => !c.isFeatured && !c.isSold);
    setPreviewCars([...featured, ...nonFeatured].slice(0, 4));
  }, [cars]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Facebook AIA Feed Preview</h2>
        <p className="text-sm text-gray-500 mb-4">
          Preview how your vehicles appear as Facebook Automotive Inventory Ads.
          Submit the feed URL to Facebook Business Manager to enable dynamic ads.
        </p>

        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
          <code className="flex-1 text-xs text-gray-600 truncate font-mono">
            {business.siteUrl}/api/aia-feed.xml
          </code>
          <button
            onClick={() => {
              navigator.clipboard.writeText(`${business.siteUrl}/api/aia-feed.xml`);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                       bg-white border border-gray-200 text-gray-600 text-xs font-medium
                       hover:border-red-300 hover:text-red-600 transition-colors"
          >
            {copied ? (
              <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Copied!</>
            ) : (
              <><Copy className="w-3.5 h-3.5" /> Copy URL</>
            )}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          ⚠️ AIA feed integration requires Facebook Business Manager approval before going live.
        </p>
      </div>

      {previewCars.length === 0 ? (
        <div className="py-12 text-center">
          <Car className="mx-auto mb-3 w-10 h-10 text-gray-300" />
          <p className="text-sm text-gray-500">No available vehicles to preview.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {previewCars.map((car, index) => (
            <AIAPreviewCard
              key={car.id}
              car={car}
              index={index}
              allCars={cars.filter((c) => !c.isSold)}
              onSwap={(newCar) => {
                const updated = [...previewCars];
                updated[index] = newCar;
                setPreviewCars(updated);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// MarketingTab — pill nav + sub-screen switcher
// ─────────────────────────────────────────────────────────────────
export default function MarketingTab({ cars }) {
  const [activeSection, setActiveSection] = useState("postTemplate");

  return (
    <div>
      {/* Pill navigation */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setActiveSection("postTemplate")}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
            activeSection === "postTemplate"
              ? "bg-red-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          FB Post Template
        </button>
        <button
          onClick={() => setActiveSection("aiaFeed")}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
            activeSection === "aiaFeed"
              ? "bg-red-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          FB AIA Feed Preview
        </button>
      </div>

      {activeSection === "postTemplate" && <PostTemplateSection cars={cars} />}
      {activeSection === "aiaFeed" && <AIAFeedSection cars={cars} />}
    </div>
  );
}
