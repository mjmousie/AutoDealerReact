import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Phone } from "lucide-react";
import business from "../../config/business";

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Inventory", to: "/inventory" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  const isActive = (to) =>
    to === "/" ? pathname === "/" : pathname.startsWith(to);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-zinc-900 border-b border-zinc-800">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">

        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          onClick={() => setOpen(false)}
        >
          <span className="text-lg font-bold tracking-tight text-white">
            {business.name}{" "}
            <span className="text-red-500">{business.nameBold}</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              className={`text-sm font-medium transition-colors ${
                isActive(to)
                  ? "text-red-400"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {label}
            </Link>
          ))}

          <a
            href={business.phoneHref}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-red-600 text-white text-sm font-semibold
                       hover:bg-red-500 active:bg-red-700 transition-colors"
          >
            <Phone className="w-4 h-4" strokeWidth={2} />
            {business.phone}
          </a>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-zinc-900 border-b border-zinc-800 ${
          open ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="flex flex-col px-4 pb-4 pt-2 gap-1">
          {NAV_LINKS.map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive(to)
                  ? "text-red-400 bg-zinc-800"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
            >
              {label}
            </Link>
          ))}

          <a
            href={business.phoneHref}
            onClick={() => setOpen(false)}
            className="mt-2 flex items-center justify-center gap-2 px-4 py-2 rounded-md
                       bg-red-600 text-white text-sm font-semibold hover:bg-red-500 transition-colors"
          >
            <Phone className="w-4 h-4" strokeWidth={2} />
            {business.phone}
          </a>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
