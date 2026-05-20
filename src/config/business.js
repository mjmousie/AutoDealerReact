/**
 * BUSINESS CONFIGURATION
 * ──────────────────────
 * To deploy this template for a new business, only edit this file.
 * All business name, contact, location, hours, and SEO information
 * is pulled from here automatically across the entire application.
 */

// ─────────────────────────────────────────────────────────────
// src/config/business.js
// Central configuration for all business-specific information.
// This is the ONLY file that needs to be edited when deploying
// this template for a new business.
// ─────────────────────────────────────────────────────────────

const business = {
  // Business identity
  name: "Auto",                // First part of name (plain)
  nameBold: "Nation",            // Second part (displayed in red/accent color)
  fullName: "Auto Nation", // Used in page titles, SEO, footer copyright
  tagline: "Your trusted local dealership for quality pre-owned vehicles. We put transparency and value first — every car, every customer.",

  // Contact
  phone: "(330) 550-4280",
  phoneHref: "tel:+13305504280",    // Used in href="tel:..." links
  email: "mike@mikemousie.com",  // Contact email

  // Location
  address: "5560 W Webb Road",
  city: "Youngstown",
  state: "OH",
  zip: "44515",
  fullAddress: "5560 W Webb Road, Youngstown, OH 44515", // Pre-combined for display

  // Hours
  hours: [
    { days: "Mon – Fri", hours: "9:00 AM – 6:00 PM" },
    { days: "Sat",       hours: "9:00 AM – 3:00 PM" },
    { days: "Sun",       hours: "Closed" },
  ],

  // Social media (set to null to hide)
  social: {
    facebook:  "https://facebook.com/dickfrostautos",
    instagram: "https://instagram.com/dickfrostautos",
  },

  // SEO & Meta
  // Note: VITE_SITE_URL in .env is no longer required but still takes priority
  // if set — the env var override is handled here so no file needs to change.
  siteUrl: import.meta.env.VITE_SITE_URL || "https://dickfrostautos.com",
  metaDescription: "Browse quality pre-owned vehicles at Dick Frost Auto Sales in Youngstown, OH. Competitive pricing, low mileage, and no-pressure sales.",
  ogImage: "/og-image.jpg",

  // Dealer info (shown in footer)
  licenseNumber: "IL-4820",
  dealerState: "OH",
};

export default business;
