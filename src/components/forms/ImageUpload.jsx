// src/components/forms/ImageUpload.jsx
// ─────────────────────────────────────────────────────────────
// Mobile-first image upload component.
//
// Features:
//   • Tap-to-select OR drag-and-drop (desktop)
//   • Client-side compression + WebP conversion via browser-image-compression
//   • Live per-file progress bars
//   • Reorderable preview grid (touch-friendly)
//   • Hard cap of MAX_IMAGES (15) with user feedback
//   • Passes compressed File[] to parent via onChange callback
// ─────────────────────────────────────────────────────────────

import { useState, useCallback, useRef } from "react";
import imageCompression from "browser-image-compression";
import { Upload, X, ImagePlus, AlertCircle, CheckCircle2, GripVertical } from "lucide-react";
import { MAX_IMAGES } from "../../utils/constants";
import { formatFileSize } from "../../utils/formatter";

// Compression config — optimized for web display dimensions
const COMPRESSION_OPTIONS = {
  maxSizeMB: 0.4,            // Target ≤ 400 KB per image
  maxWidthOrHeight: 1280,    // Sufficient for web card/gallery display
  useWebWorker: true,        // Non-blocking compression
  fileType: "image/webp",    // Force WebP output
  initialQuality: 0.75,      // 75% quality — still looks great on screen
  onProgress: undefined,     // Set per-file below
};

// ─────────────────────────────────────────────────────────────
// FilePreview — single image tile with remove button
// ─────────────────────────────────────────────────────────────
function FilePreview({ file, index, onRemove, progress, status }) {
  const previewUrl = file._previewUrl; // Pre-generated object URL

  return (
    <div className="relative group rounded-xl overflow-hidden bg-gray-100 aspect-[4/3]">
      {/* Image */}
      <img
        src={previewUrl}
        alt={`Upload preview ${index + 1}`}
        className="w-full h-full object-cover"
        loading="lazy"
      />

      {/* Overlay: compression progress */}
      {status === "compressing" && (
        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2">
          <div className="text-xs text-white font-medium">Converting…</div>
          <div className="w-3/4 h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-600 rounded-full transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-xs text-white/70">{progress}%</div>
        </div>
      )}

      {/* Status: done */}
      {status === "done" && (
        <div className="absolute top-2 left-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 drop-shadow" />
        </div>
      )}

      {/* File info badge */}
      {status === "done" && file._compressedSize && (
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-2">
          <p className="text-[10px] text-white/80 truncate">{file.name}</p>
          <p className="text-[10px] text-emerald-400">
            {formatFileSize(file._compressedSize)}
          </p>
        </div>
      )}

      {/* Remove button */}
      <button
        type="button"
        onClick={() => onRemove(index)}
        aria-label={`Remove image ${index + 1}`}
        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm
                   flex items-center justify-center opacity-0 group-hover:opacity-100
                   focus:opacity-100 transition-opacity duration-150 hover:bg-red-500/80"
      >
        <X className="w-4 h-4 text-white" />
      </button>

      {/* Position badge */}
      <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-black/50 backdrop-blur-sm
                      flex items-center justify-center text-[10px] font-bold text-white
                      group-hover:opacity-0 transition-opacity">
        {index + 1}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main ImageUpload component
// ─────────────────────────────────────────────────────────────

/**
 * @param {Object}   props
 * @param {File[]}   props.value         - Currently selected compressed files
 * @param {Function} props.onChange      - Called with new File[] after processing
 * @param {string[]} props.existingUrls  - Already-uploaded image URLs (edit mode)
 * @param {Function} props.onRemoveExisting - Called with URL to remove from existing
 * @param {boolean}  props.disabled      - Disables all interaction
 * @param {string}   props.className
 */
export default function ImageUpload({
  value = [],
  onChange,
  existingUrls = [],
  onRemoveExisting,
  disabled = false,
  className = "",
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileStates, setFileStates] = useState([]); // { progress, status } per file
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const totalCount = existingUrls.length + value.length;
  const remainingSlots = MAX_IMAGES - totalCount;

  // ── Core: compress and convert files to WebP ──────────────
  const processFiles = useCallback(
    async (rawFiles) => {
      setError(null);

      const incoming = Array.from(rawFiles);

      if (incoming.length === 0) return;

      if (incoming.length > remainingSlots) {
        setError(
          `You can add ${remainingSlots} more image${remainingSlots !== 1 ? "s" : ""} (max ${MAX_IMAGES} total).`
        );
        return;
      }

      // Validate file types
      const invalid = incoming.filter((f) => !f.type.startsWith("image/"));
      if (invalid.length > 0) {
        setError("Only image files are accepted (JPG, PNG, HEIC, WEBP, etc.).");
        return;
      }

      // Initialize progress state for each incoming file
      const initialStates = incoming.map(() => ({ progress: 0, status: "compressing" }));
      setFileStates((prev) => [...prev, ...initialStates]);

      const startIndex = value.length; // Where new files start in the array

      const compressedFiles = await Promise.all(
        incoming.map(async (file, i) => {
          const absoluteIndex = startIndex + i;

          // Generate preview URL from the ORIGINAL file (faster UX)
          const previewUrl = URL.createObjectURL(file);

          // Compress with live progress
          const options = {
            ...COMPRESSION_OPTIONS,
            onProgress: (pct) => {
              setFileStates((prev) => {
                const next = [...prev];
                next[absoluteIndex] = { progress: pct, status: "compressing" };
                return next;
              });
            },
          };

          let compressed;
          try {
            compressed = await imageCompression(file, options);
          } catch (err) {
            console.error("[ImageUpload] Compression failed:", err);
            // Fall back to original if compression fails
            compressed = file;
          }

          // Attach metadata to the File object for preview & size display
          compressed._previewUrl = previewUrl;
          compressed._compressedSize = compressed.size;

          // Rename to .webp so the server knows the format
          const webpName = file.name.replace(/\.[^.]+$/, ".webp");
          const renamedFile = new File([compressed], webpName, {
            type: "image/webp",
          });
          renamedFile._previewUrl = previewUrl;
          renamedFile._compressedSize = compressed.size;

          // Mark done
          setFileStates((prev) => {
            const next = [...prev];
            next[absoluteIndex] = { progress: 100, status: "done" };
            return next;
          });

          return renamedFile;
        })
      );

      // Notify parent with the full updated list
      onChange([...value, ...compressedFiles]);
    },
    [value, onChange, remainingSlots]
  );

  // ── Remove a new (not yet uploaded) file ─────────────────
  const handleRemoveNew = useCallback(
    (index) => {
      // Revoke object URL to prevent memory leaks
      if (value[index]?._previewUrl) {
        URL.revokeObjectURL(value[index]._previewUrl);
      }
      const updated = value.filter((_, i) => i !== index);
      setFileStates((prev) => prev.filter((_, i) => i !== index));
      onChange(updated);
    },
    [value, onChange]
  );

  // ── Drag-and-drop handlers ────────────────────────────────
  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (!disabled) processFiles(e.dataTransfer.files);
  };

  // ── File input change ─────────────────────────────────────
  const handleInputChange = (e) => {
    processFiles(e.target.files);
    // Reset input so the same file can be re-selected if removed
    e.target.value = "";
  };

  const isAtLimit = totalCount >= MAX_IMAGES;
  const hasFiles = existingUrls.length > 0 || value.length > 0;

  return (
    <div className={`space-y-4 ${className}`}>

      {/* ── Existing (uploaded) image thumbnails ── */}
      {existingUrls.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wider">
            Uploaded Images
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {existingUrls.map((url, i) => (
              <div key={url} className="relative group rounded-xl overflow-hidden aspect-[4/3] bg-gray-100">
                <img
                  src={url}
                  alt={`Car image ${i + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {onRemoveExisting && !disabled && (
                  <button
                    type="button"
                    onClick={() => onRemoveExisting(url)}
                    aria-label="Remove uploaded image"
                    className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/60
                               flex items-center justify-center opacity-0 group-hover:opacity-100
                               focus:opacity-100 transition-opacity hover:bg-red-500/80"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── New file preview grid ── */}
      {value.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wider">
            New Images — Tap × to Remove
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {value.map((file, i) => (
              <FilePreview
                key={`${file.name}-${i}`}
                file={file}
                index={i}
                onRemove={handleRemoveNew}
                progress={fileStates[i]?.progress ?? 0}
                status={fileStates[i]?.status ?? "done"}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Drop zone / Add more button ── */}
      {!isAtLimit && !disabled && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload images"
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative flex flex-col items-center justify-center gap-3 p-8
            rounded-2xl border-2 border-dashed cursor-pointer
            transition-all duration-200 select-none
            min-h-[140px]
            ${isDragging
              ? "border-red-600 bg-red-600/10 scale-[1.02]"
              : "border-gray-300 bg-gray-50/40 hover:border-gray-500 hover:bg-gray-100/70"
            }
          `}
        >
          <div className={`p-3 rounded-xl transition-colors ${isDragging ? "bg-red-600/20" : "bg-gray-200"}`}>
            {isDragging ? (
              <Upload className="w-7 h-7 text-red-600" />
            ) : (
              <ImagePlus className="w-7 h-7 text-gray-500" />
            )}
          </div>

          <div className="text-center">
            <p className="text-sm font-semibold text-gray-700">
              {hasFiles ? "Add more photos" : "Upload vehicle photos"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Tap to select · Drag & drop on desktop
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              JPG, PNG, HEIC, WEBP · Auto-converted to WebP
            </p>
          </div>

          {/* Slot counter */}
          <div className="absolute top-3 right-3 text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
            {totalCount}/{MAX_IMAGES}
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={handleInputChange}
            aria-hidden="true"
          />
        </div>
      )}

      {/* ── At limit message ── */}
      {isAtLimit && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-600/10 border border-red-600/30">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <p className="text-xs text-red-700">
            Maximum of {MAX_IMAGES} images reached. Remove one to add another.
          </p>
        </div>
      )}

      {/* ── Error message ── */}
      {error && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-xs text-red-300">{error}</p>
        </div>
      )}

      {/* ── Compression info note ── */}
      {value.length > 0 && (
        <p className="text-[11px] text-gray-400 text-center">
          Images compressed &amp; converted to WebP for fast loading
        </p>
      )}
    </div>
  );
}
