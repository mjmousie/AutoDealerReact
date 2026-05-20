export function Spinner({ size = "md" }) {
  const sizeClass = size === "lg" ? "w-12 h-12" : "w-8 h-8";
  return (
    <div className={`${sizeClass} border-2 border-red-600 border-t-transparent rounded-full animate-spin`} />
  );
}

export default Spinner;