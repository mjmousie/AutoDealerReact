// ═══════════════════════════════════════════════════════════════
// App-wide UI state that multiple unrelated components need.
// Currently manages: active inventory filters, UI theme, toast queue.
// Extend as the app grows — avoid prop drilling.
// ═══════════════════════════════════════════════════════════════

import { createContext, useContext, useState, useCallback } from "react";

const GlobalContext = createContext(null);

const DEFAULT_FILTERS = {
  make: "",
  maxPrice: null,
  maxMileage: null,
};

export function GlobalProvider({ children }) {
  // Inventory filter state (shared between FilterBar and Inventory page)
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  // Toast notifications
  const [toasts, setToasts] = useState([]);

  /** Update one or more filter fields. */
  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  /** Reset all filters to defaults. */
  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  /**
   * Show a toast notification.
   * @param {string} message
   * @param {'success'|'error'|'info'} type
   * @param {number} duration - ms before auto-dismiss (default 4000)
   */
  const addToast = useCallback((message, type = "info", duration = 4000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = {
    filters,
    updateFilter,
    clearFilters,
    toasts,
    addToast,
    dismissToast,
  };

  return (
    <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
  );
}

/** Hook — must be used inside <GlobalProvider> */
export function useGlobal() {
  const ctx = useContext(GlobalContext);
  if (!ctx) throw new Error("useGlobal must be used within GlobalProvider");
  return ctx;
}