import { Link } from "react-router-dom";
import { MapPin, Phone, Clock } from "lucide-react";
import business from "../../config/business";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-zinc-900 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Column 1 — Brand */}
          <div className="flex flex-col gap-4">
            <Link to="/" className="w-fit">
              <span className="text-white font-bold tracking-tight text-lg">
                {business.name}{" "}
                <span className="text-red-500">{business.nameBold}</span>
              </span>
            </Link>
            <p className="text-sm text-zinc-500 leading-relaxed max-w-xs">
              {business.tagline}
            </p>
          </div>

          {/* Column 2 — Quick links */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-300">
              Quick Links
            </h3>
            <nav className="flex flex-col gap-2">
              {[
                { label: "Home", to: "/" },
                { label: "Browse Inventory", to: "/inventory" },
                { label: "Schedule a Test Drive", to: "/inventory" },
              ].map(({ label, to }) => (
                <Link
                  key={label}
                  to={to}
                  className="text-sm text-zinc-500 hover:text-red-400 transition-colors w-fit"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 3 — Contact + hours */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-300">
              Contact Us
            </h3>

            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(business.fullAddress)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 text-sm text-zinc-500 hover:text-red-400 transition-colors"
            >
              <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{business.fullAddress}</span>
            </a>

            <a
              href={business.phoneHref}
              className="flex items-center gap-3 text-sm text-zinc-500 hover:text-red-400 transition-colors"
            >
              <Phone className="w-4 h-4 shrink-0" />
              {business.phone}
            </a>

            <div className="flex items-start gap-3 text-sm text-zinc-500">
              <Clock className="w-4 h-4 mt-0.5 shrink-0" />
              <div className="flex flex-col gap-0.5">
                {business.hours.map(({ days, hours }) => (
                  <span key={days}>{days}: {hours}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4
                        flex flex-col sm:flex-row items-center justify-between gap-2
                        text-xs text-zinc-600">
          <span>© {year} {business.fullName}. All rights reserved.</span>
          <span>Developed and Deployed by Mike Mousie Marketing</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
