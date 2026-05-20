// src/App.jsx
// ─────────────────────────────────────────────────────────────
// Root application component.
// Sets up:
//   • React Router v6 with lazy-loaded pages
//   • Context providers (Auth, Global)
//   • Protected /admin route
//   • React Helmet Async for SEO
//   • Scroll restoration on route change
// ─────────────────────────────────────────────────────────────

import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

import { AuthProvider } from "./context/AuthContext";
import { GlobalProvider } from "./context/GlobalContext";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { Spinner } from "./components/ui/Spinner";
import { ScrollToTop } from "./components/layout/ScrollToTop";

// ── Lazy-loaded pages (code-split per route) ─────────────────
const Home = lazy(() => import("./pages/Home"));
const Inventory = lazy(() => import("./pages/Inventory"));
const CarDetail = lazy(() => import("./pages/CarDetail"));
const Admin = lazy(() => import("./pages/Admin"));
const NotFound = lazy(() => import("./pages/NotFound"));

// ── Full-page loading fallback ────────────────────────────────
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900">
      <Spinner size="lg" />
    </div>
  );
}

// ── Layout — needs useLocation so it lives inside BrowserRouter ──
function Layout({ children }) {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900">
      {!isAdmin && <Navbar />}
      <main className={`flex-1 ${isAdmin ? "" : "pt-16"}`}>
        {children}
      </main>
      {!isAdmin && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <GlobalProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Layout>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/inventory/:vin" element={<CarDetail />} />
                <Route
                  path="/admin/*"
                  element={
                    <AuthProvider>
                      <ProtectedRoute>
                        <Admin />
                      </ProtectedRoute>
                    </AuthProvider>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </Layout>
        </BrowserRouter>
      </GlobalProvider>
    </HelmetProvider>
  );
}
