import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText, 
  cancelText,
  type = "warning", // "warning", "danger", "success"
  loading = false
}) {
  const { t } = useTranslation();
  
  const colors = {
    warning: "text-orange-500 bg-orange-500/10",
    danger: "text-red-500 bg-red-500/10",
    success: "text-green-500 bg-green-500/10"
  };

  const btnColors = {
    warning: "bg-orange-500 hover:bg-orange-600 shadow-orange-500/20",
    danger: "bg-red-500 hover:bg-red-600 shadow-red-500/20",
    success: "bg-green-500 hover:bg-green-600 shadow-green-500/20"
  };

  const finalConfirmText = confirmText || t("common.ok") || "Confirm";
  const finalCancelText = cancelText || t("common.cancel") || "Cancel";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/60 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            className="relative w-full max-w-sm bg-card border border-border/50 rounded-[2rem] shadow-2xl p-8 text-center"
          >
            <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-6 shadow-inner ${colors[type]}`}>
              {type === "success" ? <CheckCircle2 className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
            </div>

            <h3 className="text-xl font-bold mb-2 tracking-tight">{title}</h3>
            <p className="text-muted-foreground text-sm mb-8 leading-relaxed px-2">{message}</p>

            <div className="flex gap-3">
              <button
                disabled={loading}
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-muted-foreground hover:bg-muted transition-all active:scale-95 disabled:opacity-50"
              >
                {finalCancelText}
              </button>
              <button
                disabled={loading}
                onClick={onConfirm}
                className={`flex-[1.5] text-white text-xs font-bold uppercase tracking-widest py-3 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 ${btnColors[type]}`}
              >
                {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {finalConfirmText}
              </button>
            </div>

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-muted rounded-full transition-colors opacity-40 hover:opacity-100"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
