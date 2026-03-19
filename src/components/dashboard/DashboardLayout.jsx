import { Sidebar } from "./Sidebar";
import { DashboardHeader } from "./DashboardHeader";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";

export function DashboardLayout({ user }) {
  const { i18n } = useTranslation();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(user);
  const [showFooter, setShowFooter] = useState(false);
  const mainRef = useRef(null);

  useEffect(() => {
    setCurrentUser(user);
  }, [user?.email]);

  useEffect(() => {
    const syncUserFromStorage = () => {
      try {
        const nextUser = JSON.parse(localStorage.getItem("user") || "{}");
        setCurrentUser(nextUser);
      } catch {
        setCurrentUser({});
      }
    };

    syncUserFromStorage();
    window.addEventListener("settingsChanged", syncUserFromStorage);
    window.addEventListener("authChanged", syncUserFromStorage);
    return () => {
      window.removeEventListener("settingsChanged", syncUserFromStorage);
      window.removeEventListener("authChanged", syncUserFromStorage);
    };
  }, [location.pathname]);

  // Handle scroll to show footer only at bottom
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    setShowFooter(isAtBottom);
  };

  try {
    return (
      <div className="flex h-screen bg-background text-foreground">
        {/* Sidebar - Fixed width */}
        <Sidebar role={currentUser?.role} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Header */}
          <DashboardHeader user={currentUser} />

          {/* Dynamic Content */}
          <main
            ref={mainRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-8 bg-muted/20"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={i18n?.language || "vi"}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="max-w-7xl mx-auto min-h-[calc(100vh-200px)]"
              >
                <Outlet context={{ user }} />
              </motion.div>
            </AnimatePresence>

            {/* Dashboard Footer - only visible at bottom */}
            <footer
              className={`mt-8 p-6 border-t border-border bg-card text-center text-xs text-muted-foreground transition-all duration-300 ${showFooter ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}
            >
              &copy; 2025 SynDe System. All rights reserved.
            </footer>
          </main>
        </div>
      </div>
    );
  } catch (err) {
    console.error("DashboardLayout critical crash:", err);
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white text-black p-10 text-center">
        <h1 className="text-3xl font-bold mb-4">Rendering Error</h1>
        <p className="mb-4">The dashboard layout failed to render. Please check the browser console for details.</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-primary text-white rounded-lg">Retry</button>
        <pre className="mt-6 text-left bg-gray-100 p-4 rounded text-xs overflow-auto max-w-full">
          {err.stack}
        </pre>
      </div>
    );
  }
}
