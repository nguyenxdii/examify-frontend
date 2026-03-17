import { useState, useEffect } from "react";
import {
  Sparkles,
  Trophy,
  Zap,
  Languages,
  FlaskConical,
  Calculator,
  Beaker,
  Dna,
  Globe,
  Tv,
  GraduationCap,
  BarChart3,
  TrendingUp,
  Smartphone,
  ArrowRight,
  User,
  LayoutDashboard,
  Settings,
  LogOut,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import logo from "../assets/synde_logo.svg";

export default function Home() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    // Clear animation flag when returning to home,
    // so it triggers again when navigating back to auth pages
    sessionStorage.removeItem("auth_animated");
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsUserMenuOpen(false);
    navigate("/");
  };

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const toggleLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  const currentLang = i18n.language.startsWith("vi") ? "vi" : "en";
  const categories = [
    {
      id: 1,
      name: t("categories.names.science"),
      icon: <FlaskConical className="w-6 h-6 text-blue-400" />,
      color: "bg-blue-400/10",
      borderColor: "border-blue-500",
      iconColor: "text-blue-400",
      rgb: "59, 130, 246",
    },
    {
      id: 2,
      name: t("categories.names.math"),
      icon: <Calculator className="w-6 h-6 text-emerald-400" />,
      color: "bg-emerald-400/10",
      borderColor: "border-emerald-500",
      iconColor: "text-emerald-400",
      rgb: "16, 185, 129",
    },
    {
      id: 3,
      name: t("categories.names.chemistry"),
      icon: <Beaker className="w-6 h-6 text-purple-400" />,
      color: "bg-purple-400/10",
      borderColor: "border-purple-500",
      iconColor: "text-purple-400",
      rgb: "168, 85, 247",
    },
    {
      id: 4,
      name: t("categories.names.biology"),
      icon: <Dna className="w-6 h-6 text-pink-400" />,
      color: "bg-pink-400/10",
      borderColor: "border-pink-500",
      iconColor: "text-pink-400",
      rgb: "236, 72, 153",
    },
    {
      id: 5,
      name: t("categories.names.general"),
      icon: <Globe className="w-6 h-6 text-orange-400" />,
      color: "bg-orange-400/10",
      borderColor: "border-orange-500",
      iconColor: "text-orange-400",
      rgb: "249, 115, 22",
    },
    {
      id: 6,
      name: t("categories.names.current"),
      icon: <Tv className="w-6 h-6 text-red-500" />,
      color: "bg-red-500/10",
      borderColor: "border-red-500",
      iconColor: "text-red-500",
      rgb: "239, 68, 68",
    },
  ];

  const features = [
    {
      id: 1,
      title: t("features.items.personalized.title"),
      desc: t("features.items.personalized.desc"),
      icon: <GraduationCap className="w-6 h-6 text-primary" />,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      id: 2,
      title: t("features.items.rewards.title"),
      desc: t("features.items.rewards.desc"),
      icon: <Trophy className="w-6 h-6 text-yellow-500" />,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      id: 3,
      title: t("features.items.teacher.title"),
      desc: t("features.items.teacher.desc"),
      icon: <BarChart3 className="w-6 h-6 text-emerald-500" />,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      id: 4,
      title: t("features.items.tracking.title"),
      desc: t("features.items.tracking.desc"),
      icon: <TrendingUp className="w-6 h-6 text-blue-500" />,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      id: 5,
      title: t("features.items.leaders.title"),
      desc: t("features.items.leaders.desc"),
      icon: <Zap className="w-6 h-6 text-purple-500" />,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      id: 6,
      title: t("features.items.mobile.title"),
      desc: t("features.items.mobile.desc"),
      icon: <Smartphone className="w-6 h-6 text-pink-500" />,
      color: "text-pink-500",
      bgColor: "bg-pink-500/10",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <a
            href="#"
            className="flex items-center gap-2 opacity-90 hover:opacity-100 transition-opacity"
          >
            <img src={logo} alt="SynDe Logo" className="h-10 w-auto" />
          </a>

          <div className="hidden md:flex items-center gap-8">
            <a
              href="#"
              className="text-muted-foreground hover:text-foreground transition"
            >
              {t("nav.quizzes")}
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-foreground transition"
            >
              {t("nav.weekly")}
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-foreground transition"
            >
              {t("nav.rewards")}
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-foreground transition"
            >
              {t("nav.about")}
            </a>
          </div>

          <div className="flex items-center gap-4">
            {/* Language Toggle Pill */}
            <div className="flex bg-border/30 p-1 rounded-full relative border border-border/50">
              <motion.div
                className="absolute inset-y-1 bg-primary rounded-full shadow-lg z-0"
                initial={false}
                animate={{
                  x: currentLang === "vi" ? 0 : 36,
                  width: 36,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
              <button
                onClick={() => toggleLanguage("vi")}
                className={`relative z-10 w-9 h-7 flex items-center justify-center text-xs font-bold transition-colors duration-200 ${
                  currentLang === "vi"
                    ? "text-white"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                VI
              </button>
              <button
                onClick={() => toggleLanguage("en")}
                className={`relative z-10 w-9 h-7 flex items-center justify-center text-xs font-bold transition-colors duration-200 ${
                  currentLang === "en"
                    ? "text-white"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                EN
              </button>
            </div>
            {/* User Profile or Auth Buttons */}
            {localStorage.getItem("token") && localStorage.getItem("user") ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl font-bold hover:bg-primary/20 transition-all group"
                >
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                    <User className="w-5 h-5" />
                  </div>
                  <span className="max-w-[100px] truncate">{user.fullName || t("dashboard.header.account")}</span>
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <>
                      {/* Backdrop for click outside */}
                      <div 
                        className="fixed inset-0 z-0" 
                        onClick={() => setIsUserMenuOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-56 bg-white dark:bg-card border border-border rounded-2xl shadow-2xl p-2 z-50 overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-border/50 mb-1">
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">
                            {t("dashboard.header.account")}
                          </p>
                          <p className="text-sm font-bold truncate text-foreground">
                            {user.email}
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            navigate("/dashboard");
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl transition-all group"
                        >
                          <div className="p-2 rounded-lg bg-border/50 group-hover:bg-primary/20 transition-colors">
                            <LayoutDashboard className="w-4 h-4" />
                          </div>
                          {t("dashboard.sidebar.overview")}
                        </button>

                        <button
                          onClick={() => {
                            navigate("/dashboard/profile");
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl transition-all group"
                        >
                          <div className="p-2 rounded-lg bg-border/50 group-hover:bg-primary/20 transition-colors">
                            <User className="w-4 h-4" />
                          </div>
                          {t("dashboard.sidebar.profile")}
                        </button>

                        <button
                          onClick={() => {
                            navigate("/dashboard/settings");
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl transition-all group"
                        >
                          <div className="p-2 rounded-lg bg-border/50 group-hover:bg-primary/20 transition-colors">
                            <Settings className="w-4 h-4" />
                          </div>
                          {t("dashboard.sidebar.settings")}
                        </button>

                        <div className="h-px bg-border/50 my-1" />

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/5 rounded-xl transition-all"
                        >
                          <div className="p-2 rounded-lg bg-destructive/10">
                            <LogOut className="w-4 h-4" />
                          </div>
                          {t("dashboard.sidebar.logout")}
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
      <>
        <button
          onClick={() => navigate("/login")}
          className="px-6 py-2 text-foreground hover:text-primary transition border border-primary rounded-lg"
        >
          {t("nav.signIn")}
        </button>
        <button
          onClick={() => navigate("/register")}
          className="px-6 py-2 bg-primary text-white border-2 border-primary rounded-lg font-medium hover:opacity-90 transition"
        >
          {t("nav.register")}
        </button>
      </>
    )}
  </div>
</div>
</nav>

      <AnimatePresence mode="wait">
        <motion.section
          key={i18n.language}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="relative overflow-hidden bg-gradient-to-b from-background via-background to-background"
        >
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(147,51,234,0.1)_25%,rgba(147,51,234,0.1)_50%,transparent_50%,transparent_75%,rgba(147,51,234,0.1)_75%,rgba(147,51,234,0.1))] bg-[length:40px_40px]"></div>
          </div>

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32 text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-8">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                {t("hero.badge")}
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-6">
              {t("hero.title")}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t("hero.earn")}
              </span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              {t("hero.desc")}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <button
                onClick={() => navigate("/register")}
                className="px-8 py-3 bg-primary text-white rounded-lg font-medium hover:opacity-90 hover:scale-105 active:scale-95 transition-all duration-200 shadow-md hover:shadow-primary/20"
              >
                {t("hero.getStarted")}
              </button>
              <button className="px-8 py-3 bg-white border border-border text-foreground rounded-lg font-medium hover:bg-border/10 hover:border-primary/50 hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm hover:shadow-lg">
                {t("hero.tryDemo")}
              </button>
            </div>

            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 border-2 border-background"></div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 border-2 border-background"></div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-background"></div>
              </div>
              <span>
                <strong className="text-foreground">3,000+</strong>{" "}
                {t("hero.stats")}
              </span>
            </div>
          </div>
        </motion.section>
      </AnimatePresence>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          key={i18n.language}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col"
        >
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                {t("categories.badge")}
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              {t("categories.titlePrefix")}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t("categories.titleSuffix")}
              </span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("categories.desc")}
            </p>
          </div>

          {/* Categories Grid */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {categories.map((cat) => (
              <motion.div
                key={cat.id}
                variants={{
                  hidden: { opacity: 0, y: 15 },
                  show: { opacity: 1, y: 0 },
                }}
                className="group relative p-6 rounded-2xl border-2 bg-white dark:bg-card hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 cursor-pointer overflow-hidden transition-colors"
                style={{ 
                  borderColor: `rgba(${cat.rgb}, 0.2)` 
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `rgba(${cat.rgb}, 0.6)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = `rgba(${cat.rgb}, 0.2)`;
                }}
              >

                <div className="flex gap-5 items-start">
                  <div
                    className={`shrink-0 w-14 h-14 rounded-full ${cat.color} flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}
                  >
                    {cat.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 leading-relaxed line-clamp-2">
                      {t("categories.cardDesc", { name: cat.name })}
                    </p>
                    <div className="flex items-center gap-2 text-primary text-sm font-bold opacity-80 group-hover:opacity-100 transition-opacity">
                      <span>{t("categories.explore")}</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
            <Trophy className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              {t("features.badge")}
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            {t("features.titlePrefix")}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              SynDe
            </span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("features.desc")}
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.id}
              variants={{
                hidden: { opacity: 0, y: 15 },
                show: { opacity: 1, y: 0 },
              }}
              whileHover={{ y: -5 }}
              className="p-8 rounded-3xl bg-primary/5 dark:bg-primary/[0.03] border-2 border-primary/10 hover:border-primary/30 transition-all duration-300 group shadow-lg"
            >
              <div
                className={`w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 group-hover:bg-primary/20 transition-colors`}
              >
                <div className="scale-110">{feature.icon}</div>
              </div>

              <h3 className="text-xl font-bold text-foreground mb-3 tracking-tight group-hover:text-primary transition-colors">
                {feature.title}
              </h3>

              <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 mb-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
          className="rounded-2xl overflow-hidden bg-gradient-to-r from-primary via-purple-600 to-secondary p-12 text-center relative"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="relative z-10">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              {t("cta.title")}
            </h2>
            <p className="text-white/90 max-w-2xl mx-auto mb-8">
              {t("cta.desc")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate("/register")}
                className="px-8 py-3 bg-white text-primary rounded-lg font-medium hover:scale-110 active:scale-95 transition-all duration-300 shadow-xl hover:shadow-white/20"
              >
                {t("cta.createAccount")}
              </button>
              <button className="px-8 py-3 border-2 border-white text-white rounded-lg font-medium hover:bg-white/20 hover:scale-110 active:scale-95 transition-all duration-300">
                {t("cta.browseLibrary")}
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4 opacity-90 hover:opacity-100 transition-opacity cursor-pointer">
                <img src={logo} alt="SynDe Logo" className="h-10 w-auto" />
              </div>
              <p className="text-muted-foreground text-sm">
                {t("footer.desc")}
              </p>
            </div>

            <div>
              <h4 className="font-bold text-foreground mb-4">
                {t("footer.quickLinks")}
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition"
                  >
                    {t("nav.home")}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition"
                  >
                    {t("nav.aboutUs")}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition"
                  >
                    {t("nav.features")}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition"
                  >
                    {t("nav.pricing")}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-foreground mb-4">
                {t("footer.forTeachers")}
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition"
                  >
                    {t("footer.links.about")}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition"
                  >
                    {t("footer.links.contact")}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition"
                  >
                    {t("footer.links.careers")}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition"
                  >
                    {t("footer.links.culture")}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-foreground mb-4">
                {t("footer.contact")}
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="text-muted-foreground">
                  <a
                    href="mailto:nguyexndii.2003@gmail.com"
                    className="hover:text-foreground transition"
                  >
                    nguyexndii.2003@gmail.com
                  </a>
                </li>
                {/* <li className="text-muted-foreground">
                  <a
                    href="tel:+1234567890"
                    className="hover:text-foreground transition"
                  >
                    +1 (234) 567-890
                  </a>
                </li> */}
                <li className="text-muted-foreground">+84 348 345 248</li>
                <li className="text-muted-foreground">
                  Quận 6, Thành phố Hồ Chí Minh
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between">
            <p className="text-muted-foreground text-sm">
              {t("footer.copyright")}
            </p>
            <div className="flex gap-4 mt-4 sm:mt-0">
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition"
              >
                {t("footer.terms")}
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition"
              >
                {t("footer.privacy")}
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
