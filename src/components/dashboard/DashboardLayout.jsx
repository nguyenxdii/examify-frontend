import { Sidebar } from "./Sidebar";
import { DashboardHeader } from "./DashboardHeader";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

export function DashboardLayout({ children, user }) {
  const { i18n } = useTranslation();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar - Fixed width */}
      <Sidebar role={user?.role} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-x-hidden">
        {/* Header */}
        <DashboardHeader user={user} />

        {/* Dynamic Content */}
        <main className="flex-1 p-8 bg-muted/20">
          <AnimatePresence mode="wait">
            <motion.div
              key={i18n.language}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-7xl mx-auto"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Dashboard Footer (Optional) */}
        <footer className="p-6 border-t border-border bg-card text-center text-xs text-muted-foreground">
          &copy; 2025 SynDe Examify System. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
