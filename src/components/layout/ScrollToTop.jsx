// ═══════════════════════════════════════════════════════════════
// Scrolls to top of page on every route change.
// Drop this inside <BrowserRouter> once.
// ═══════════════════════════════════════════════════════════════

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}