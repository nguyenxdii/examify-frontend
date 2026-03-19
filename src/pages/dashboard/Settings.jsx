import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Settings as SettingsIcon, 
  Sparkles, 
  User, 
  Bell, 
  Shield, 
  Moon, 
  Smartphone,
  Check
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";

export default function Settings() {
  const { t } = useTranslation();
  
  // Settings state
  const [currentUser] = useState(() => {
    return JSON.parse(localStorage.getItem("user") || "{}");
  });

  const getSettingsKey = (email) => `ai_greeting_enabled_${email || "guest"}`;

  const [aiGreetingEnabled, setAiGreetingEnabled] = useState(() => {
    const saved = localStorage.getItem(getSettingsKey(currentUser?.email));
    return saved === null ? true : saved === "true";
  });

  const handleToggleAiGreeting = () => {
    const newValue = !aiGreetingEnabled;
    setAiGreetingEnabled(newValue);
    localStorage.setItem(getSettingsKey(currentUser?.email), newValue.toString());
    window.dispatchEvent(new Event("settingsChanged"));
    toast.success(
      newValue 
        ? t("settings.ai_greeting_enabled") || "Đã bật câu chào AI" 
        : t("settings.ai_greeting_disabled") || "Đã tắt câu chào AI"
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-heading tracking-tight">
          {t("dashboard.sidebar.settings") || "Cài đặt"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t("settings.subtitle") || "Quản lý tùy chọn trải nghiệm và bảo mật của bạn"}
        </p>
      </div>

      {/* Sections */}
      <div className="grid gap-6">
        {/* UI Section */}
        <section className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-border bg-muted/30">
            <h2 className="text-lg font-bold flex items-center gap-2 font-heading">
              <Smartphone className="w-5 h-5 text-primary" />
              {t("settings.interface_title") || "Giao diện & Trải nghiệm"}
            </h2>
          </div>
          
          <div className="p-6 space-y-6">
            {/* AI Greeting Toggle */}
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border/50 group hover:border-primary/30 transition-all">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">
                    {t("settings.ai_greeting") || "Câu chào AI thông minh"}
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    {t("settings.ai_greeting_desc") || "Sử dụng AI để tạo lời chào cá nhân hóa dựa trên thời gian và hoạt động của bạn."}
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleToggleAiGreeting}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${
                  aiGreetingEnabled ? "bg-primary" : "bg-muted-foreground/30"
                }`}
              >
                <motion.span
                  animate={{ x: aiGreetingEnabled ? 24 : 4 }}
                  className="inline-block h-5 w-5 transform rounded-full bg-white shadow-md"
                />
              </button>
            </div>

            {/* Other Placeholders to make it look real */}
            <div className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl border border-transparent opacity-60 grayscale cursor-not-allowed">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">
                    {t("settings.dark_mode") || "Chế độ tối tự động"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t("settings.coming_soon") || "Sắp ra mắt"}
                  </p>
                </div>
              </div>
              <div className="h-7 w-12 bg-muted rounded-full" />
            </div>
          </div>
        </section>

        {/* Account Section */}
        <section className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-border bg-muted/30">
            <h2 className="text-lg font-bold flex items-center gap-2 font-heading">
              <User className="w-5 h-5 text-primary" />
              {t("settings.account_title") || "Tài khoản & Bảo mật"}
            </h2>
          </div>
          <div className="p-6">
            <p className="text-sm text-muted-foreground italic">
              {t("settings.account_managed") || "Thông tin tài khoản được đồng bộ với hệ thống xác thực trung tâm."}
            </p>
          </div>
        </section>
      </div>
    </motion.div>
  );
}
