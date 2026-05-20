const colorMap = {
  "Excellent": "bg-green-100 border-green-300 text-green-800",
  "Very Good": "bg-emerald-50 border-emerald-200 text-emerald-700",
  "Good":      "bg-yellow-100 border-yellow-300 text-yellow-800",
  "Fair":      "bg-orange-100 border-orange-300 text-orange-800",
};

export function ConditionBadge({ condition }) {
  if (!condition) return null;
  const colorClasses = colorMap[condition];
  if (!colorClasses) return null;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${colorClasses}`}>
      {condition}
    </span>
  );
}
