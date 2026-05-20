import { useState, useEffect } from "react";
import {
  LogOut, Plus, Trash2, Star, Car, X, AlertCircle, CheckCircle, Pencil,
  Mail, Phone, Calendar, Clock,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useAdminInventory } from "../hooks/useInventory";
import { useLeads } from "../hooks/useLeads";
import ImageUpload from "../components/forms/ImageUpload";
import Spinner from "../components/ui/Spinner";
import { formatCurrency, formatMileage, carTitle, formatDate, formatLeadDateTime } from "../utils/formatter";
import { MAX_FEATURED, CONDITIONS } from "../utils/constants";
import { decodeVin } from "../utils/vinDecoder";
import MarketingTab from "../components/admin/MarketingTab";

// ── Empty form shape ─────────────────────────────────────────────
const EMPTY_FORM = {
  make: "",
  model: "",
  year: String(new Date().getFullYear()),
  price: "",
  mileage: "",
  vin: "",
  description: "",
  isFeatured: false,
  bodyType: "",
  engine: "",
  transmission: "",
  drivetrain: "",
  condition: "",
};

// ─────────────────────────────────────────────────────────────────
// AddVehicleForm — collapsible form for creating a new listing
// ─────────────────────────────────────────────────────────────────
function AddVehicleForm({ featuredCount, onAdd, onClose, uploading, uploadProgress }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [vinDecoding, setVinDecoding] = useState(false);
  const [vinStatus, setVinStatus] = useState(null); // { type: "success"|"error", message }

  const isWorking = submitting || uploading;

  async function handleDecodeVin() {
    setVinDecoding(true);
    setVinStatus(null);
    try {
      const decoded = await decodeVin(form.vin);
      setForm((prev) => ({
        ...prev,
        make: decoded.make || prev.make,
        model: decoded.model || prev.model,
        year: decoded.year || prev.year,
        description: decoded.description || prev.description,
        bodyType: decoded.bodyType || prev.bodyType,
        engine: decoded.engine || prev.engine,
        transmission: decoded.transmission || prev.transmission,
        drivetrain: decoded.drivetrain || prev.drivetrain,
      }));
      setVinStatus({ type: "success", message: "VIN decoded successfully" });
    } catch (err) {
      setVinStatus({ type: "error", message: err.message });
    } finally {
      setVinDecoding(false);
    }
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      await onAdd(form, images);
      onClose();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const atFeaturedLimit = !form.isFeatured && featuredCount >= MAX_FEATURED;

  const fieldClass =
    "w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-3 text-sm text-gray-900 " +
    "placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/40 " +
    "focus:border-red-500/50 transition-colors disabled:opacity-50";

  return (
    <div className="mb-5 overflow-hidden rounded-2xl border border-red-600/20 bg-white">
      {/* Form header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
        <h2 className="font-bold text-gray-900">Add New Vehicle</h2>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          aria-label="Close form"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 p-5">
        {/* VIN */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
            VIN *
          </label>
          <div className="flex gap-2">
            {/* Input with inline character counter */}
            <div className="relative flex-1">
              <input
                name="vin"
                type="text"
                placeholder="17-character VIN"
                value={form.vin}
                onChange={(e) => {
                  setVinStatus(null);
                  setForm((prev) => ({ ...prev, vin: e.target.value.toUpperCase() }));
                }}
                required
                maxLength={17}
                disabled={isWorking}
                className={
                  `${fieldClass} font-mono tracking-widest pr-14 ` +
                  (form.vin.length === 17
                    ? "border-green-500 focus:border-green-500 focus:ring-green-500/40"
                    : "")
                }
              />
              <span
                className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono
                            ${form.vin.length === 17 ? "text-green-500" : "text-gray-400"}`}
              >
                {form.vin.length}/17
              </span>
            </div>

            {/* Decode VIN button */}
            <button
              type="button"
              onClick={handleDecodeVin}
              disabled={form.vin.length !== 17 || isWorking || vinDecoding}
              className="flex shrink-0 items-center gap-1.5 rounded-xl bg-red-600 px-4 py-3
                         text-sm font-bold text-white hover:bg-red-500
                         disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            >
              {vinDecoding ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                "Decode VIN"
              )}
            </button>
          </div>

          {/* Decode status message */}
          {vinStatus && (
            <p
              className={`mt-2 flex items-center gap-1.5 text-xs font-medium
                          ${vinStatus.type === "success" ? "text-green-600" : "text-red-500"}`}
            >
              {vinStatus.type === "success" ? (
                <CheckCircle className="h-3.5 w-3.5 shrink-0" />
              ) : (
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              )}
              {vinStatus.message}
            </p>
          )}
        </div>

        {/* Year + Make + Model */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
              Year *
            </label>
            <input
              name="year"
              type="number"
              min="1990"
              max={new Date().getFullYear() + 1}
              value={form.year}
              onChange={handleChange}
              required
              disabled={isWorking}
              className={fieldClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
              Make *
            </label>
            <input
              name="make"
              type="text"
              placeholder="e.g. Honda"
              value={form.make}
              onChange={handleChange}
              required
              disabled={isWorking}
              className={fieldClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
              Model *
            </label>
            <input
              name="model"
              type="text"
              placeholder="e.g. Accord"
              value={form.model}
              onChange={handleChange}
              required
              disabled={isWorking}
              className={fieldClass}
            />
          </div>
        </div>

        {/* Body Type + Engine + Transmission + Drivetrain */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
              Body Type
            </label>
            <input
              name="bodyType"
              type="text"
              placeholder="e.g. SUV"
              value={form.bodyType}
              onChange={handleChange}
              disabled={isWorking}
              className={fieldClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
              Engine
            </label>
            <input
              name="engine"
              type="text"
              placeholder="e.g. 2.4L 4-cylinder Gasoline"
              value={form.engine}
              onChange={handleChange}
              disabled={isWorking}
              className={fieldClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
              Transmission
            </label>
            <input
              name="transmission"
              type="text"
              placeholder="e.g. Automatic"
              value={form.transmission}
              onChange={handleChange}
              disabled={isWorking}
              className={fieldClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
              Drivetrain
            </label>
            <input
              name="drivetrain"
              type="text"
              placeholder="e.g. AWD"
              value={form.drivetrain}
              onChange={handleChange}
              disabled={isWorking}
              className={fieldClass}
            />
          </div>
        </div>

        {/* Condition */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
            Condition
          </label>
          <select
            name="condition"
            value={form.condition}
            onChange={handleChange}
            disabled={isWorking}
            className={fieldClass}
          >
            <option value="">Select condition...</option>
            {CONDITIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Price + Mileage */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
              Price ($) *
            </label>
            <input
              name="price"
              type="number"
              min="0"
              step="5"
              placeholder="4995"
              value={form.price}
              onChange={handleChange}
              required
              disabled={isWorking}
              className={fieldClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
              Mileage *
            </label>
            <input
              name="mileage"
              type="number"
              min="0"
              placeholder="45000"
              value={form.mileage}
              onChange={handleChange}
              required
              disabled={isWorking}
              className={fieldClass}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
            Description
          </label>
          <textarea
            name="description"
            rows={3}
            placeholder="One owner, well maintained, non-smoker…"
            value={form.description}
            onChange={handleChange}
            disabled={isWorking}
            className={`${fieldClass} resize-none`}
          />
        </div>

        {/* Featured toggle */}
        <label
          className={`flex cursor-pointer items-center gap-3 rounded-xl border border-gray-300 bg-gray-50 p-3
                      ${atFeaturedLimit ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <div className="relative shrink-0">
            <input
              type="checkbox"
              name="isFeatured"
              checked={form.isFeatured}
              onChange={handleChange}
              disabled={isWorking || atFeaturedLimit}
              className="peer sr-only"
            />
            <div className="h-5 w-9 rounded-full bg-gray-300 transition-colors peer-checked:bg-red-600" />
            <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Feature on homepage</p>
            <p className="text-xs text-gray-500">
              {featuredCount}/{MAX_FEATURED} slots used
              {atFeaturedLimit && " — at limit"}
            </p>
          </div>
        </label>

        {/* Image upload */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Photos
          </p>
          <ImageUpload value={images} onChange={setImages} disabled={isWorking} />
        </div>

        {/* Upload progress bar */}
        {uploading && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Uploading images…</span>
              <span>{uploadProgress}%</span>
            </div>
            {/* width driven by inline style — only valid use of inline style here */}
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-red-600 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Error */}
        {formError && (
          <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
            <p className="text-xs text-red-300">{formError}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={isWorking}
            className="flex-1 rounded-xl border border-gray-300 bg-gray-50 py-3 text-sm font-semibold
                       text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isWorking}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 py-3
                       text-sm font-bold text-white hover:bg-red-500 disabled:opacity-50 transition-colors"
          >
            {isWorking ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                {uploading ? "Uploading…" : "Saving…"}
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Add Vehicle
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// EditVehicleModal — modal overlay for editing an existing listing
// ─────────────────────────────────────────────────────────────────
function EditVehicleModal({ car, featuredCount, onUpdate, onDeleteImage, onClose, uploading, uploadProgress }) {
  const [form, setForm] = useState({
    make: car.make || "",
    model: car.model || "",
    year: String(car.year || new Date().getFullYear()),
    price: String(car.price || ""),
    mileage: String(car.mileage || ""),
    description: car.description || "",
    isFeatured: Boolean(car.isFeatured),
    bodyType: car.bodyType || "",
    engine: car.engine || "",
    transmission: car.transmission || "",
    drivetrain: car.drivetrain || "",
    condition: car.condition || "",
  });
  const [newImages, setNewImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const isWorking = submitting || uploading;
  const otherFeaturedCount = featuredCount - (car.isFeatured ? 1 : 0);
  const atFeaturedLimit = !form.isFeatured && otherFeaturedCount >= MAX_FEATURED;

  useEffect(() => {
    if (!saveSuccess) return;
    const timer = setTimeout(() => onClose(), 2000);
    return () => clearTimeout(timer);
  }, [saveSuccess, onClose]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      await onUpdate(car.id, {
        make: form.make,
        model: form.model,
        year: Number(form.year),
        price: Number(form.price),
        mileage: Number(form.mileage),
        description: form.description,
        isFeatured: form.isFeatured,
        bodyType: form.bodyType,
        engine: form.engine,
        transmission: form.transmission,
        drivetrain: form.drivetrain,
        condition: form.condition,
      }, newImages);
      setSaveSuccess(true);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const fieldClass =
    "w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-3 text-sm text-gray-900 " +
    "placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/40 " +
    "focus:border-red-500/50 transition-colors disabled:opacity-50";

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Panel — full-screen on mobile, centered modal on desktop */}
      <div
        className="relative w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-2xl bg-white flex flex-col overflow-hidden sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 shrink-0">
          <h2 className="font-bold text-gray-900">Edit Vehicle</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="space-y-4 p-5">

            {/* VIN — read-only */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                VIN{" "}
                <span className="font-normal normal-case tracking-normal text-gray-400">
                  (cannot be changed)
                </span>
              </label>
              <input
                type="text"
                value={car.vin}
                readOnly
                className={`${fieldClass} cursor-not-allowed bg-gray-100 text-gray-500 font-mono tracking-widest`}
              />
            </div>

            {/* Year + Make + Model */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Year *
                </label>
                <input
                  name="year"
                  type="number"
                  min="1990"
                  max={new Date().getFullYear() + 1}
                  value={form.year}
                  onChange={handleChange}
                  required
                  disabled={isWorking}
                  className={fieldClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Make *
                </label>
                <input
                  name="make"
                  type="text"
                  placeholder="e.g. Honda"
                  value={form.make}
                  onChange={handleChange}
                  required
                  disabled={isWorking}
                  className={fieldClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Model *
                </label>
                <input
                  name="model"
                  type="text"
                  placeholder="e.g. Accord"
                  value={form.model}
                  onChange={handleChange}
                  required
                  disabled={isWorking}
                  className={fieldClass}
                />
              </div>
            </div>

            {/* Body Type + Engine + Transmission + Drivetrain */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Body Type
                </label>
                <input
                  name="bodyType"
                  type="text"
                  placeholder="e.g. SUV"
                  value={form.bodyType}
                  onChange={handleChange}
                  disabled={isWorking}
                  className={fieldClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Engine
                </label>
                <input
                  name="engine"
                  type="text"
                  placeholder="e.g. 2.4L 4-cylinder Gasoline"
                  value={form.engine}
                  onChange={handleChange}
                  disabled={isWorking}
                  className={fieldClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Transmission
                </label>
                <input
                  name="transmission"
                  type="text"
                  placeholder="e.g. Automatic"
                  value={form.transmission}
                  onChange={handleChange}
                  disabled={isWorking}
                  className={fieldClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Drivetrain
                </label>
                <input
                  name="drivetrain"
                  type="text"
                  placeholder="e.g. AWD"
                  value={form.drivetrain}
                  onChange={handleChange}
                  disabled={isWorking}
                  className={fieldClass}
                />
              </div>
            </div>

            {/* Condition */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                Condition
              </label>
              <select
                name="condition"
                value={form.condition}
                onChange={handleChange}
                disabled={isWorking}
                className={fieldClass}
              >
                <option value="">Select condition...</option>
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Price + Mileage */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Price ($) *
                </label>
                <input
                  name="price"
                  type="number"
                  min="0"
                  step="5"
                  placeholder="24999"
                  value={form.price}
                  onChange={handleChange}
                  required
                  disabled={isWorking}
                  className={fieldClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Mileage *
                </label>
                <input
                  name="mileage"
                  type="number"
                  min="0"
                  placeholder="45000"
                  value={form.mileage}
                  onChange={handleChange}
                  required
                  disabled={isWorking}
                  className={fieldClass}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                Description
              </label>
              <textarea
                name="description"
                rows={3}
                placeholder="One owner, well maintained, non-smoker…"
                value={form.description}
                onChange={handleChange}
                disabled={isWorking}
                className={`${fieldClass} resize-none`}
              />
            </div>

            {/* Featured toggle */}
            <label
              className={`flex cursor-pointer items-center gap-3 rounded-xl border border-gray-300 bg-gray-50 p-3
                          ${atFeaturedLimit ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <div className="relative shrink-0">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={form.isFeatured}
                  onChange={handleChange}
                  disabled={isWorking || atFeaturedLimit}
                  className="peer sr-only"
                />
                <div className="h-5 w-9 rounded-full bg-gray-300 transition-colors peer-checked:bg-red-600" />
                <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Feature on homepage</p>
                <p className="text-xs text-gray-500">
                  {featuredCount}/{MAX_FEATURED} slots used
                  {atFeaturedLimit && " — at limit"}
                </p>
              </div>
            </label>

            {/* Image upload */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Photos
              </p>
              <ImageUpload
                value={newImages}
                onChange={setNewImages}
                existingUrls={car.images || []}
                onRemoveExisting={(url) => onDeleteImage(car.id, url)}
                disabled={isWorking}
              />
            </div>

            {/* Upload progress bar */}
            {uploading && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Uploading images…</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-red-600 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Success */}
            {saveSuccess && (
              <div className="flex items-start gap-2 rounded-xl border border-green-500/30 bg-green-500/10 p-3">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                <p className="text-xs text-green-700">Changes saved! Closing…</p>
              </div>
            )}

            {/* Error */}
            {formError && (
              <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                <p className="text-xs text-red-300">{formError}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                disabled={isWorking}
                className="flex-1 rounded-xl border border-gray-300 bg-gray-50 py-3 text-sm font-semibold
                           text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isWorking || saveSuccess}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 py-3
                           text-sm font-bold text-white hover:bg-red-500 disabled:opacity-50 transition-colors"
              >
                {isWorking ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    {uploading ? "Uploading…" : "Saving…"}
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// AdminCarCard — single vehicle row in the admin list
// ─────────────────────────────────────────────────────────────────
function AdminCarCard({ car, featuredCount, onMarkSold, onToggleFeatured, onDelete, onEdit }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [rowError, setRowError] = useState(null);

  const thumb = car.images?.[0];
  const title = carTitle(car);
  const atFeaturedLimit = !car.isFeatured && featuredCount >= MAX_FEATURED;

  async function run(action) {
    setBusy(true);
    setRowError(null);
    try {
      await action();
    } catch (err) {
      setRowError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className={`overflow-hidden rounded-2xl border bg-white transition-opacity
                  ${car.isSold ? "border-gray-200/50 opacity-60" : "border-gray-200"}`}
    >
      {/* ── Car info ────────────────────────────────────────────── */}
      <div className="flex gap-3 p-3">
        {/* Thumbnail */}
        <div className="h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100">
          {thumb ? (
            <img src={thumb} alt={title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Car className="h-5 w-5 text-gray-400" />
            </div>
          )}
        </div>

        {/* Details */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate text-sm font-bold leading-tight text-gray-900">{title}</p>
            <div className="flex shrink-0 gap-1">
              {car.isSold && (
                <span className="rounded-full border border-red-500/30 bg-red-500/20 px-1.5 py-0.5 text-[10px] font-bold text-red-400">
                  SOLD
                </span>
              )}
              {car.isFeatured && !car.isSold && (
                <span className="rounded-full border border-red-600/30 bg-red-600/20 px-1.5 py-0.5 text-[10px] font-bold text-red-600">
                  ★ FEAT
                </span>
              )}
            </div>
          </div>
          <p className="mt-0.5 text-sm font-bold text-red-600">{formatCurrency(car.price)}</p>
          <p className="truncate text-xs text-gray-500">
            {formatMileage(car.mileage)} &bull; {car.vin}
          </p>
        </div>
      </div>

      {/* ── Action buttons ──────────────────────────────────────── */}
      {!confirmDelete ? (
        <div className="flex gap-2 border-t border-gray-200/60 px-3 py-2.5">
          {/* Mark Sold */}
          <button
            disabled={car.isSold || busy}
            onClick={() => run(onMarkSold)}
            className="flex-1 rounded-xl bg-gray-100 py-2 text-xs font-semibold text-gray-600
                       hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
          >
            Mark Sold
          </button>

          {/* Toggle Featured */}
          <button
            disabled={atFeaturedLimit || busy || car.isSold}
            onClick={() => run(onToggleFeatured)}
            title={atFeaturedLimit ? `Max ${MAX_FEATURED} featured vehicles` : undefined}
            className={`flex-1 rounded-xl py-2 text-xs font-semibold transition-colors
                        disabled:cursor-not-allowed disabled:opacity-40
                        ${car.isFeatured
                          ? "border border-red-600/30 bg-red-600/20 text-red-600 hover:bg-red-600/10"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            <span className="flex items-center justify-center gap-1">
              <Star className="h-3 w-3" />
              {car.isFeatured ? "Unfeature" : "Feature"}
            </span>
          </button>

          {/* Edit — only for available vehicles */}
          {!car.isSold && (
            <button
              disabled={busy}
              onClick={onEdit}
              className="rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 text-xs
                         text-gray-600 hover:bg-gray-100 disabled:opacity-40 transition-colors"
              aria-label="Edit vehicle"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Delete */}
          <button
            disabled={busy}
            onClick={() => setConfirmDelete(true)}
            className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs
                       text-red-400 hover:bg-red-500/20 disabled:opacity-40 transition-colors"
            aria-label="Delete vehicle"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        // ── Delete confirmation ────────────────────────────────
        <div className="border-t border-gray-200/60 px-3 py-3">
          <p className="mb-2.5 text-center text-xs text-gray-500">
            Delete{" "}
            <span className="font-semibold text-gray-800">{title}</span>?
            {" "}This cannot be undone.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setConfirmDelete(false)}
              className="flex-1 rounded-xl bg-gray-100 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => run(onDelete).then(() => setConfirmDelete(false))}
              disabled={busy}
              className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-red-500 py-2
                         text-xs font-bold text-white hover:bg-red-400 disabled:opacity-50 transition-colors"
            >
              {busy ? (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                "Yes, Delete"
              )}
            </button>
          </div>
        </div>
      )}

      {/* Inline error */}
      {rowError && (
        <div className="flex items-center gap-1.5 border-t border-gray-200/60 px-3 py-2">
          <AlertCircle className="h-3.5 w-3.5 shrink-0 text-red-400" />
          <p className="text-xs text-red-300">{rowError}</p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// StatsBar — quick counts at the top of the dashboard
// ─────────────────────────────────────────────────────────────────
function StatsBar({ cars }) {
  const stats = [
    { label: "Total", value: cars.length },
    { label: "Available", value: cars.filter((c) => !c.isSold).length, accent: true },
    { label: "Sold", value: cars.filter((c) => c.isSold).length },
    {
      label: "Featured",
      value: `${cars.filter((c) => c.isFeatured && !c.isSold).length}/${MAX_FEATURED}`,
    },
  ];

  return (
    <div className="mb-5 grid grid-cols-4 gap-2 rounded-2xl border border-gray-200 bg-white p-3">
      {stats.map(({ label, value, accent }) => (
        <div key={label} className="text-center">
          <p className={`text-lg font-bold ${accent ? "text-red-600" : "text-gray-900"}`}>
            {value}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-gray-500">{label}</p>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Admin — main dashboard page
// Already wrapped in <ProtectedRoute> by App.jsx
// ─────────────────────────────────────────────────────────────────
export default function Admin() {
  const { user, signOut } = useAuth();
  const {
    cars,
    loading,
    error,
    addCar,
    updateCar,
    markAsSold,
    toggleFeatured,
    deleteCar,
    deleteImage,
    uploading,
    uploadProgress,
  } = useAdminInventory();

  const [showAddForm, setShowAddForm] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [activeTab, setActiveTab] = useState("inventory");
  const [leadToDelete, setLeadToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const featuredCount = cars.filter((c) => c.isFeatured && !c.isSold).length;

  const { leads, loading: leadsLoading, error: leadsError, deleteLead } = useLeads();

  const [lastVisited] = useState(() => localStorage.getItem("leadsLastVisited"));

  useEffect(() => {
    if (activeTab === "leads") {
      localStorage.setItem("leadsLastVisited", new Date().toISOString());
    }
  }, [activeTab]);

  const isNew = (lead) => {
    if (!lastVisited || !lead.createdAt) return false;
    const leadDate = lead.createdAt.toDate ? lead.createdAt.toDate() : new Date(lead.createdAt);
    return leadDate > new Date(lastVisited);
  };

  const newLeadsCount = leads.filter(isNew).length;

  function openDeleteModal(lead) { setLeadToDelete(lead); }
  function closeDeleteModal() { setLeadToDelete(null); }

  async function confirmDeleteLead() {
    if (!leadToDelete) return;
    setDeleting(true);
    try {
      await deleteLead(leadToDelete.id);
      closeDeleteModal();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  }

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Sticky header ──────────────────────────────────────── */}
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 px-4 py-3 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="min-w-0">
            <h1 className="text-base font-bold text-gray-900 sm:text-lg">
              Admin Dashboard
            </h1>
            <p className="truncate text-xs text-gray-500">{user?.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="ml-3 flex shrink-0 items-center gap-2 rounded-xl border border-gray-300 bg-gray-50
                       px-3 py-2 text-xs font-semibold text-gray-600
                       hover:bg-gray-100 disabled:opacity-50 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            {signingOut ? "…" : "Sign Out"}
          </button>
        </div>
      </header>

      {/* ── Content ──────────────────────────────────────────────── */}
      <div className="mx-auto max-w-4xl px-4 py-6">

        {/* Tab switcher */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab("inventory")}
            className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "inventory"
                ? "border-red-600 text-red-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Inventory
          </button>
          <button
            onClick={() => setActiveTab("leads")}
            className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "leads"
                ? "border-red-600 text-red-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Leads
            {newLeadsCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-600 text-white text-xs font-bold">
                {newLeadsCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("marketing")}
            className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "marketing"
                ? "border-red-600 text-red-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Marketing
          </button>
        </div>

        {/* ── Inventory tab ──────────────────────────────────────── */}
        {activeTab === "inventory" && (
          <>
            {/* Stats bar — only show when data is loaded */}
            {!loading && cars.length > 0 && <StatsBar cars={cars} />}

            {/* Section header + Add button */}
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                Inventory
                {!loading && (
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({cars.length})
                  </span>
                )}
              </h2>
              <button
                onClick={() => setShowAddForm((s) => !s)}
                className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold
                           text-white hover:bg-red-500 active:bg-red-700 transition-colors"
              >
                {showAddForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {showAddForm ? "Cancel" : "Add Vehicle"}
              </button>
            </div>

            {/* Add vehicle form */}
            {showAddForm && (
              <AddVehicleForm
                featuredCount={featuredCount}
                onAdd={addCar}
                onClose={() => setShowAddForm(false)}
                uploading={uploading}
                uploadProgress={uploadProgress}
              />
            )}

            {/* Loading skeletons */}
            {loading && (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-28 rounded-2xl skeleton" />
                ))}
              </div>
            )}

            {/* Error state */}
            {!loading && error && (
              <div className="flex items-start gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
                <p className="text-sm text-red-300">Failed to load inventory: {error}</p>
              </div>
            )}

            {/* Empty state */}
            {!loading && !error && cars.length === 0 && !showAddForm && (
              <div className="py-16 text-center">
                <Car className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                <p className="text-gray-500">No vehicles yet.</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="mt-4 text-sm font-semibold text-red-600 hover:text-red-500 transition-colors"
                >
                  Add your first vehicle →
                </button>
              </div>
            )}

            {/* Car list */}
            {!loading && !error && cars.length > 0 && (
              <div className="space-y-3">
                {cars.map((car) => (
                  <AdminCarCard
                    key={car.id}
                    car={car}
                    featuredCount={featuredCount}
                    onMarkSold={() => markAsSold(car.id)}
                    onToggleFeatured={() => toggleFeatured(car.id, car.isFeatured)}
                    onDelete={() => deleteCar(car.id)}
                    onEdit={() => setEditingCar(car)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Leads tab ──────────────────────────────────────────── */}
        {activeTab === "leads" && (
          <>
            {/* Loading */}
            {leadsLoading && (
              <div className="flex items-center justify-center py-16">
                <Spinner />
              </div>
            )}

            {/* Error */}
            {!leadsLoading && leadsError && (
              <div className="flex items-start gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
                <p className="text-sm text-red-300">Failed to load leads: {leadsError}</p>
              </div>
            )}

            {/* Empty state */}
            {!leadsLoading && !leadsError && leads.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <Mail className="w-7 h-7 text-gray-400" />
                </div>
                <p className="font-semibold text-gray-700">No leads yet</p>
                <p className="text-sm text-gray-400">Test drive requests will appear here.</p>
              </div>
            )}

            {/* Leads list */}
            {!leadsLoading && !leadsError && leads.length > 0 && (
              <>
                <p className="text-sm text-gray-500 mb-4">
                  {leads.length} {leads.length === 1 ? "lead" : "leads"} total
                  {newLeadsCount > 0 && ` · ${newLeadsCount} new`}
                </p>
                <div className="space-y-4">
                  {leads.map((lead) => (
                    <div key={lead.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
                      {/* Header row */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-gray-900 text-lg">{lead.name}</h3>
                          {isNew(lead) && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-red-100 border border-red-200 text-red-700 text-xs font-semibold">
                              New
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => openDeleteModal(lead)}
                          className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          aria-label="Delete lead"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Vehicle requested */}
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <Car className="w-4 h-4 text-red-600 shrink-0" />
                        <span className="text-sm font-semibold text-gray-800">{lead.vehicleTitle}</span>
                        <span className="text-xs text-gray-400 font-mono ml-auto">{lead.vehicleVin}</span>
                      </div>

                      {/* Info grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                          <a href={`mailto:${lead.email}`} className="text-red-600 hover:underline truncate">{lead.email}</a>
                        </div>
                        {lead.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                            <a href={`tel:${lead.phone}`} className="text-red-600 hover:underline">{lead.phone}</a>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                          <span>{formatLeadDateTime(lead.preferredDate, lead.preferredTime)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                          <span>Submitted: {formatDate(lead.createdAt)}</span>
                        </div>
                      </div>

                      {/* Message */}
                      {lead.message && (
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                          <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">Message</p>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{lead.message}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* ── Marketing tab ───────────────────────────────────────── */}
        {activeTab === "marketing" && (
          <MarketingTab cars={cars} />
        )}

      </div>

      {/* Edit vehicle modal */}
      {editingCar && (
        <EditVehicleModal
          car={editingCar}
          featuredCount={featuredCount}
          onUpdate={updateCar}
          onDeleteImage={deleteImage}
          onClose={() => setEditingCar(null)}
          uploading={uploading}
          uploadProgress={uploadProgress}
        />
      )}

      {/* Delete lead confirmation modal */}
      {leadToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={closeDeleteModal}
        >
          <div
            className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Delete Lead?</h3>
                <p className="text-sm text-gray-500">This action cannot be undone.</p>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-700">
              <span className="font-semibold">{leadToDelete.name}</span> —{" "}
              {leadToDelete.vehicleTitle}
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeDeleteModal}
                className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteLead}
                disabled={deleting}
                className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {deleting ? "Deleting…" : "Delete Lead"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
