export function formatCurrency(value) {
  if (value == null || isNaN(value)) return "Price TBD";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatMileage(value) {
  if (value == null || isNaN(value)) return "—";
  return `${new Intl.NumberFormat("en-US").format(value)} mi`;
}

export function formatDate(timestamp) {
  if (!timestamp) return "—";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatFileSize(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function carSlug(year, make, model) {
  return `${year}-${make}-${model}`
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export function truncate(str, maxLen = 100) {
  if (!str) return "";
  return str.length > maxLen ? `${str.slice(0, maxLen)}…` : str;
}

export function carTitle({ year, make, model } = {}) {
  return [year, make, model].filter(Boolean).join(" ");
}

export function formatLeadDateTime(dateStr, timeStr) {
  if (!dateStr) return "—";

  const [year, month, day] = dateStr.split("-").map(Number);
  // Use noon to avoid timezone date-shift issues
  const date = new Date(year, month - 1, day, 12, 0, 0);

  const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(date);
  const monthName = new Intl.DateTimeFormat("en-US", { month: "long" }).format(date);

  const suffix = (d) => {
    if (d >= 11 && d <= 13) return "th";
    switch (d % 10) {
      case 1: return "st";
      case 2: return "nd";
      case 3: return "rd";
      default: return "th";
    }
  };

  const time = timeStr ? timeStr.replace(" ", "") : "";
  return `${weekday}, ${monthName} ${day}${suffix(day)} at ${time}`;
}