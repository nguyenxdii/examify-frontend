import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Mail, Phone, MapPin, Send, MessageSquare, Clock } from "lucide-react";

export default function Contact() {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = t("titles.contact");
  }, [t]);

  const contactInfo = [
    {
      icon: <Mail className="w-6 h-6 text-primary" />,
      label: t("contact.info.email"),
      value: "nguyexndii.2003@gmail.com",
      link: "mailto:nguyexndii.2003@gmail.com"
    },
    {
      icon: <Phone className="w-6 h-6 text-emerald-500" />,
      label: t("contact.info.phone"),
      value: "+84 348 345 248",
      link: "tel:+84348345248"
    },
    {
      icon: <MapPin className="w-6 h-6 text-rose-500" />,
      label: t("contact.info.office"),
      value: "Quận 6, TP. Hồ Chí Minh",
      link: "#"
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full"
            >
              <MessageSquare className="w-4 h-4 text-primary" />
              <span className="text-xs font-black text-primary tracking-widest uppercase">{t("contact.badge")}</span>
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-black text-foreground tracking-tight">
              {t("contact.title")} <br /> <span className="text-primary">{t("contact.titleAccent")}</span>
            </h1>
            <p className="text-muted-foreground text-lg font-medium max-w-2xl mx-auto">{t("contact.desc")}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Details */}
            <div className="space-y-8">
              <div className="bg-card border border-border p-10 rounded-[2.5rem] shadow-xl space-y-10">
                <h3 className="text-2xl font-black text-foreground">{t("contact.info.title")}</h3>
                
                <div className="space-y-8">
                  {contactInfo.map((item, i) => (
                    <motion.a
                      key={i}
                      href={item.link}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-6 group cursor-pointer"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300">
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{item.label}</p>
                        <p className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{item.value}</p>
                      </div>
                    </motion.a>
                  ))}
                </div>

                <div className="pt-10 border-t border-border flex items-start gap-4">
                  <div className="p-2 bg-amber-500/10 rounded-lg">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{t("contact.info.hours")}</p>
                    <p className="text-sm text-muted-foreground">{t("contact.info.hoursDetail")}</p>
                    <p className="text-sm text-muted-foreground">{t("contact.info.closed")}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border-2 border-primary/20 p-10 md:p-14 rounded-[3rem] shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                
                <form className="space-y-8 relative z-10" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-sm font-black text-foreground uppercase tracking-widest ml-1">{t("contact.form.name")}</label>
                      <input 
                        type="text" 
                        placeholder={t("contact.form.placeholders.name")}
                        className="w-full bg-muted/50 border-2 border-transparent focus:border-primary focus:bg-card rounded-2xl p-5 font-bold transition-all outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-black text-foreground uppercase tracking-widest ml-1">{t("contact.form.email")}</label>
                      <input 
                        type="email" 
                        placeholder={t("contact.form.placeholders.email")}
                        className="w-full bg-muted/50 border-2 border-transparent focus:border-primary focus:bg-card rounded-2xl p-5 font-bold transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-black text-foreground uppercase tracking-widest ml-1">{t("contact.form.subject")}</label>
                    <input 
                      type="text" 
                      placeholder={t("contact.form.placeholders.subject")}
                      className="w-full bg-muted/50 border-2 border-transparent focus:border-primary focus:bg-card rounded-2xl p-5 font-bold transition-all outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-black text-foreground uppercase tracking-widest ml-1">{t("contact.form.message")}</label>
                    <textarea 
                      rows="5"
                      placeholder={t("contact.form.placeholders.message")}
                      className="w-full bg-muted/50 border-2 border-transparent focus:border-primary focus:bg-card rounded-2xl p-5 font-bold transition-all outline-none resize-none"
                    ></textarea>
                  </div>

                  <button className="w-full md:w-auto px-12 py-5 bg-primary text-white rounded-2xl font-black text-lg shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
                    {t("contact.form.submit")} <Send className="w-5 h-5" />
                  </button>
                </form>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
