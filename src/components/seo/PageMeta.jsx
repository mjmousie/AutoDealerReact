// ═══════════════════════════════════════════════════════════════
// src/components/seo/PageMeta.jsx
// React Helmet Async wrapper for per-page SEO.
// Usage:
//   <PageMeta
//     title="2021 Honda Civic"
//     description="Low mileage, one owner..."
//     image="https://..."
//     url="/inventory/1HGBH41JXMN109186"
//   />
// ═══════════════════════════════════════════════════════════════

import { Helmet } from "react-helmet-async";
import business from "../../config/business";

const SITE_NAME    = business.fullName;
const BASE_URL     = business.siteUrl;
const DEFAULT_IMAGE = `${BASE_URL}${business.ogImage}`;

export function PageMeta({
  title,
  description = business.metaDescription,
  image = DEFAULT_IMAGE,
  url,
  type = "website",
}) {
  const fullTitle    = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const canonicalUrl = url ? `${BASE_URL}${url}` : BASE_URL;

  return (
    <Helmet>
      {/* Primary */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph (Facebook, LinkedIn, iMessage) */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Performance hints */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#fbbf24" />
    </Helmet>
  );
}

export default PageMeta;
