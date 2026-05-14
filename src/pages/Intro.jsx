import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Sparkles, Zap, Brain, Globe, Shield, BarChart3, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Intro() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = t("titles.intro");
  }, [t]);

  const features = [
    {
      icon: <Brain className="w-8 h-8 text-purple-500" />,
      title: t("intro.features.ai.title"),
      desc: t("intro.features.ai.desc")
    },
    {
      icon: <Zap className="w-8 h-8 text-yellow-500" />,
      title: t("intro.features.grading.title"),
      desc: t("intro.features.grading.desc")
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-blue-500" />,
      title: t("intro.features.analytics.title"),
      desc: t("intro.features.analytics.desc")
    },
    {
      icon: <Globe className="w-8 h-8 text-emerald-500" />,
      title: t("intro.features.rooms.title"),
      desc: t("intro.features.rooms.desc")
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Intro Hero */}
        <section className="py-24 relative overflow-hidden bg-gradient-to-br from-background via-primary/5 to-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-black text-primary tracking-widest uppercase">{t("intro.badge")}</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-foreground tracking-tight leading-tight">
                  {t("intro.title")} <br />
                  <span className="text-primary">{t("intro.titleAccent")}</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed font-medium">
                  {t("intro.desc")}
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <button 
                    onClick={() => navigate("/register")}
                    className="px-8 py-4 bg-primary text-white rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                  >
                    {t("intro.getStarted")} <ArrowRight className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => navigate("/about")}
                    className="px-8 py-4 bg-card border-2 border-border text-foreground rounded-2xl font-black text-lg hover:bg-muted transition-all"
                  >
                    {t("intro.learnMore")}
                  </button>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-primary/20 rounded-[4rem] blur-[100px] -z-10" />
                <div className="bg-card border-4 border-white dark:border-border p-4 rounded-[4rem] shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-700 overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop" 
                    alt="Platform Preview" 
                    className="rounded-[3rem] w-full h-full object-cover"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl md:text-5xl font-black text-foreground">{t("intro.whyTitle")}</h2>
            <p className="text-muted-foreground text-lg font-medium max-w-2xl mx-auto">{t("intro.whyDesc")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-10 bg-card border border-border rounded-[3rem] hover:border-primary/30 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                <div className="mb-8">{f.icon}</div>
                <h3 className="text-2xl font-black mb-4 text-foreground group-hover:text-primary transition-colors">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed font-medium">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-24 bg-primary text-white overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-12">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight">{t("intro.trust.title")}</h2>
            <div className="flex justify-center items-center gap-12 flex-wrap">
              <div className="text-center">
                <p className="text-5xl font-black mb-2">10k+</p>
                <p className="text-primary-foreground/80 font-bold uppercase tracking-widest text-xs">{t("intro.trust.stats.users")}</p>
              </div>
              <div className="text-center">
                <p className="text-5xl font-black mb-2">50k+</p>
                <p className="text-primary-foreground/80 font-bold uppercase tracking-widest text-xs">{t("intro.trust.stats.exams")}</p>
              </div>
              <div className="text-center">
                <p className="text-5xl font-black mb-2">100+</p>
                <p className="text-primary-foreground/80 font-bold uppercase tracking-widest text-xs">{t("intro.trust.stats.partners")}</p>
              </div>
            </div>
            <div className="pt-8">
              <button 
                onClick={() => navigate("/register")}
                className="px-12 py-5 bg-white text-primary rounded-2xl font-black text-xl shadow-2xl hover:scale-110 active:scale-95 transition-all"
              >
                {t("intro.trust.cta")}
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
