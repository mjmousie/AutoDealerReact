// ═══════════════════════════════════════════════════════════════
// Lead-gen form on the Car Detail page.
// Features: date picker (blocks past dates), time slot selector,
// phone input, message textarea, success state.
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { Calendar, Clock, User, Mail, Phone, MessageSquare, CheckCircle2, Send } from "lucide-react";
import { useLeadForm } from "../../hooks/useLeadForm";
import { TIME_SLOTS } from "../../utils/constants";

// Today's date in YYYY-MM-DD format (min value for date picker)
const todayISO = new Date().toISOString().split("T")[0];

const EMPTY_FORM = {
  name: "", email: "", phone: "",
  preferredDate: "", preferredTime: "",
  message: "",
};

function Field({ label, icon: Icon, error, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
        <span className="flex items-center gap-1.5">
          <Icon className="w-3.5 h-3.5" />
          {label}
        </span>
      </label>
      {children}
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}

/**
 * @param {Object} car - { vin, year, make, model, id }
 */
export function TestDriveForm({ car }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [touched, setTouched] = useState({});
  const { submit, loading, success, error } = useLeadForm();

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleBlur(e) {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  }

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required.";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Valid email is required.";
    if (!form.preferredDate) errs.preferredDate = "Please select a date.";
    if (!form.preferredTime) errs.preferredTime = "Please select a time.";
    return errs;
  }

  const validationErrors = validate();
  const isValid = Object.keys(validationErrors).length === 0;

  async function handleSubmit(e) {
    e.preventDefault();
    // Touch all fields to show errors
    setTouched({ name: true, email: true, preferredDate: true, preferredTime: true });
    if (!isValid) return;
    await submit(form, car);
  }

  // ── Success state ─────────────────────────────────────────
  if (success) {
    return (
      <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-8 text-center space-y-3">
        <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
        <h3 className="text-lg font-bold text-gray-900">Request Received!</h3>
        <p className="text-sm text-gray-500">
          We'll confirm your test drive for the{" "}
          <span className="text-gray-700 font-medium">
            {car.year} {car.make} {car.model}
          </span>{" "}
          shortly.
        </p>
        <p className="text-xs text-gray-500">
          Check your email at <span className="text-gray-700">{form.email}</span>
        </p>
      </div>
    );
  }

  const inputClass = `
    w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-300
    text-gray-900 placeholder-gray-400 text-sm
    focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/50
    transition-colors duration-150
  `;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-red-600" />
        Request a Test Drive
      </h3>

      {/* Name + Email row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="Full Name"
          icon={User}
          error={touched.name && validationErrors.name}
        >
          <input
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Jane Smith"
            value={form.name}
            onChange={handleChange}
            onBlur={handleBlur}
            className={inputClass}
          />
        </Field>

        <Field
          label="Email"
          icon={Mail}
          error={touched.email && validationErrors.email}
        >
          <input
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            onBlur={handleBlur}
            className={inputClass}
          />
        </Field>
      </div>

      {/* Phone (optional) */}
      <Field label="Phone (optional)" icon={Phone}>
        <input
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="(555) 000-0000"
          value={form.phone}
          onChange={handleChange}
          className={inputClass}
        />
      </Field>

      {/* Date + Time row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="Preferred Date"
          icon={Calendar}
          error={touched.preferredDate && validationErrors.preferredDate}
        >
          <input
            name="preferredDate"
            type="date"
            min={todayISO}
            value={form.preferredDate}
            onChange={handleChange}
            onBlur={handleBlur}
            className={inputClass}
          />
        </Field>

        <Field
          label="Preferred Time"
          icon={Clock}
          error={touched.preferredTime && validationErrors.preferredTime}
        >
          <select
            name="preferredTime"
            value={form.preferredTime}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`${inputClass} cursor-pointer`}
          >
            <option value="">Select a time…</option>
            {TIME_SLOTS.map((slot) => (
              <option key={slot} value={slot}>{slot}</option>
            ))}
          </select>
        </Field>
      </div>

      {/* Message */}
      <Field label="Message (optional)" icon={MessageSquare}>
        <textarea
          name="message"
          rows={3}
          placeholder="Any questions about this vehicle?"
          value={form.message}
          onChange={handleChange}
          className={`${inputClass} resize-none`}
        />
      </Field>

      {/* API error */}
      {error && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3.5 px-6
                   rounded-xl bg-red-600 text-white font-bold text-sm
                   hover:bg-red-500 active:bg-red-700
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors duration-150"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Submitting…
          </span>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Request Test Drive
          </>
        )}
      </button>

      <p className="text-sm text-gray-400 text-center">
        We'll contact you within 1 business hour to confirm.
      </p>
    </form>
  );
}

export default TestDriveForm;
