// ═══════════════════════════════════════════════════════════════
// Route guard for /admin.
// • Shows a loading state while Firebase resolves auth.
// • Renders an inline login form for unauthenticated users
//   (avoids a separate /login route and page load).
// • Renders children when authenticated.
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export function ProtectedRoute({ children }) {
  const { user, signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Authenticated — render the protected content
  if (user) return children;

  // ── Inline login form ────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signIn(email, password);
      // Auth state update will cause re-render above
    } catch (err) {
      // Map Firebase error codes to friendly messages
      const msg =
        err.code === "auth/invalid-credential" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/user-not-found"
          ? "Incorrect email or password."
          : err.code === "auth/too-many-requests"
          ? "Too many attempts. Try again in a few minutes."
          : "Sign-in failed. Check your connection and try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-600/10 border border-red-600/20 mb-4">
            <Lock className="w-6 h-6 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Access</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to manage inventory</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="admin-email" className="block text-sm font-medium text-gray-700 mb-1.5">
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-300
                         text-gray-900 placeholder-gray-400 text-sm
                         focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50
                         transition-colors"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label htmlFor="admin-password" className="block text-sm font-medium text-gray-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 rounded-xl bg-gray-50 border border-gray-300
                           text-gray-900 placeholder-gray-400 text-sm
                           focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50
                           transition-colors"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <p className="text-xs text-red-300">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-red-600 text-white font-semibold text-sm
                       hover:bg-red-500 active:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors duration-150"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProtectedRoute;
