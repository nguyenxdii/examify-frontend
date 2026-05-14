import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Users, Target, Shield, Heart, Sparkles, Award } from "lucide-react";

export default function About() {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = t("titles.about");
  }, [t]);

  const values = [
    {
      icon: <Target className="w-8 h-8 text-blue-500" />,
      title: t("about.values.v1.title"),
      desc: t("about.values.v1.desc")
    },
    {
      icon: <Shield className="w-8 h-8 text-emerald-500" />,
      title: t("about.values.v2.title"),
      desc: t("about.values.v2.desc")
    },
    {
      icon: <Sparkles className="w-8 h-8 text-purple-500" />,
      title: t("about.values.v3.title"),
      desc: t("about.values.v3.desc")
    },
    {
      icon: <Heart className="w-8 h-8 text-rose-500" />,
      title: t("about.values.v4.title"),
      desc: t("about.values.v4.desc")
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-24 overflow-hidden bg-gradient-to-b from-primary/5 to-transparent">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
             <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-[120px]" />
             <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary rounded-full blur-[120px]" />
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-8"
            >
              <Award className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-primary tracking-widest uppercase">{t("about.hero.badge")}</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-black tracking-tight text-foreground mb-8"
            >
              {t("about.hero.title")} <br />
              <span className="bg-gradient-to-r from-primary via-purple-600 to-secondary bg-clip-text text-transparent">
                {t("about.hero.titleAccent")}
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-3xl mx-auto text-xl text-muted-foreground leading-relaxed font-medium"
            >
              {t("about.hero.desc")}
            </motion.p>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <h2 className="text-4xl font-black text-foreground">{t("about.story.title")}</h2>
              <p className="text-lg text-muted-foreground leading-relaxed font-medium">
                {t("about.story.desc")}
              </p>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-1 text-foreground">{t("about.story.feat1.title")}</h4>
                    <p className="text-muted-foreground">{t("about.story.feat1.desc")}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center shrink-0 shadow-lg shadow-secondary/20">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-1 text-foreground">{t("about.story.feat2.title")}</h4>
                    <p className="text-muted-foreground">{t("about.story.feat2.desc")}</p>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative aspect-square rounded-[3rem] bg-gradient-to-br from-primary/20 to-secondary/20 p-8"
            >
              <div className="absolute inset-0 bg-card/50 backdrop-blur-xl rounded-[3rem] border border-border shadow-2xl overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop" 
                  alt="Team working" 
                  className="w-full h-full object-cover opacity-80"
                />
              </div>
              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-primary/20 rounded-full blur-3xl animate-pulse" />
            </motion.div>
          </div>
        </section>

        {/* Values Grid */}
        <section className="py-24 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
            <h2 className="text-4xl font-black mb-4">{t("about.values.title")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto font-medium">{t("about.values.subtitle")}</p>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -10 }}
                className="bg-card border border-border p-8 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all duration-300 group"
              >
                <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">{v.icon}</div>
                <h3 className="text-xl font-black mb-3 text-foreground">{v.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
