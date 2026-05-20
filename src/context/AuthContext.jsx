// ═══════════════════════════════════════════════════════════════
// Firebase Authentication provider.
// Exposes: user, loading, signIn(), signOut() via useAuth() hook.
//
// Auth is lazy-loaded so the 85KB firebase/auth chunk is never
// fetched on public pages (Home, Inventory, CarDetail).
// ═══════════════════════════════════════════════════════════════

import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

// Guard: connectAuthEmulator throws if called more than once per auth instance
let _emulatorConnected = false;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe = () => {};
    let mounted = true;

    import("../firebase.config").then(({ default: app }) => {
      import("firebase/auth").then(({ getAuth, onAuthStateChanged, connectAuthEmulator }) => {
        if (!mounted) return;

        const auth = getAuth(app);

        if (import.meta.env.VITE_USE_EMULATOR === "true" && import.meta.env.DEV && !_emulatorConnected) {
          connectAuthEmulator(auth, "http://localhost:9099");
          _emulatorConnected = true;
        }

        unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
          if (!mounted) return;
          setUser(firebaseUser);
          setLoading(false);
        });
      });
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  /**
   * Sign in with email + password.
   * Throws on failure — callers should catch and display the error.
   */
  async function signIn(email, password) {
    const { default: app } = await import("../firebase.config");
    const { getAuth, signInWithEmailAndPassword } = await import("firebase/auth");
    const auth = getAuth(app);
    await signInWithEmailAndPassword(auth, email, password);
  }

  /** Sign out and clear user state. */
  async function signOut() {
    const { default: app } = await import("../firebase.config");
    const { getAuth, signOut: firebaseSignOut } = await import("firebase/auth");
    const auth = getAuth(app);
    await firebaseSignOut(auth);
  }

  const value = { user, loading, signIn, signOut };

  // Don't render children until Firebase has resolved the auth state.
  // This prevents a flash of the login screen for authenticated admins.
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

/** Hook — must be used inside <AuthProvider> */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
