import { Sidebar } from "./Sidebar";
import { DashboardHeader } from "./DashboardHeader";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Outlet } from "react-router-dom";

export function DashboardLayout({ user }) {
  const { i18n } = useTranslation();

  try {
    return (
      <div className="flex min-h-screen bg-background text-foreground">
        {/* Sidebar - Fixed width */}
        <Sidebar role={user?.role} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-x-hidden relative">
          {/* Header */}
          <DashboardHeader user={user} />

          {/* Dynamic Content */}
          <main className="flex-1 p-8 bg-muted/20">
            <AnimatePresence mode="wait">
              <motion.div
                key={i18n?.language || "vi"}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="max-w-7xl mx-auto"
              >
                <Outlet context={{ user }} />
              </motion.div>
            </AnimatePresence>
          </main>

          {/* Dashboard Footer (Optional) */}
          <footer className="p-6 border-t border-border bg-card text-center text-xs text-muted-foreground">
            &copy; 2025 SynDe System. All rights reserved.
          </footer>
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
