import { useState, useEffect } from "react";
import {
  Mail,
  Lock,
  Sparkles,
  ArrowLeft,
  Eye,
  EyeOff,
  Check,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import authBg from "../assets/auth/auth.jpg";
import { login } from "../api/authApi";
import logo from "../assets/synde_logo.svg";

export default function Login() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (token && user) {
      navigate("/dashboard");
    }
  }, [navigate]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [modalType, setModalType] = useState(null); // 'success', 'error'
  const [shouldAnimate] = useState(
    () => !sessionStorage.getItem("auth_animated"),
  );

  useEffect(() => {
    if (shouldAnimate) {
      sessionStorage.setItem("auth_animated", "true");
    }
  }, [shouldAnimate]);

  const currentLang = i18n.language.startsWith("vi") ? "vi" : "en";

  const toggleLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await login({ email, password });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: response.data.id,
          email: response.data.email,
          fullName: response.data.fullName,
          role: response.data.role,
        }),
      );

      setModalType("success");

      // Smooth delay before dashboard
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      setModalType("error");
    }
  };

  return (
    <div className="h-screen flex bg-background text-foreground selection:bg-primary/30 overflow-hidden">
      {/* Left Side - Animated Grid & Branding (Fixed) */}
      <div className="hidden lg:flex lg:w-1/2 bg-black relative overflow-hidden items-center justify-center h-full">
        {/* Background Image with Blur */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110"
          style={{
            backgroundImage: `url(${authBg})`,
            filter: "blur(4px) brightness(0.4)",
          }}
        />

        {/* Animated Grid overlay */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `
                linear-gradient(0deg, transparent 24%, rgba(126, 69, 241, 0.4) 25%, rgba(126, 69, 241, 0.4) 26%, transparent 27%, transparent 74%, rgba(126, 69, 241, 0.4) 75%, rgba(126, 69, 241, 0.4) 76%, transparent 77%, transparent),
                linear-gradient(90deg, transparent 24%, rgba(126, 69, 241, 0.4) 25%, rgba(126, 69, 241, 0.4) 26%, transparent 27%, transparent 74%, rgba(126, 69, 241, 0.4) 75%, rgba(126, 69, 241, 0.4) 76%, transparent 77%, transparent)
              `,
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        {/* Brand Identity */}
        <div className="relative z-10 text-center">
          <motion.div
            initial={
              shouldAnimate
                ? { opacity: 0, filter: "blur(20px)", scale: 0.8 }
                : { opacity: 1, filter: "blur(0px)", scale: 1 }
            }
            animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
            transition={{
              delay: 0.5,
              type: "spring",
              stiffness: 150,
              damping: 25,
            }}
            className="mb-8 flex justify-center"
          >
            <div className="flex items-center gap-2">
              <img
                src={logo}
                alt="SynDe Logo"
                className="h-24 w-auto drop-shadow-2xl"
              />
            </div>
          </motion.div>

          <motion.p
            initial={
              shouldAnimate ? { y: 30, opacity: 0 } : { y: 0, opacity: 1 }
            }
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="mt-6 text-gray-400 text-lg tracking-widest uppercase font-light"
          >
            Ultimate Quiz Experience
          </motion.p>
        </div>

        {/* Bottom indicator */}
        {/* <div className="absolute bottom-12 left-12 right-12 flex justify-between text-white/40 text-sm font-mono">
          <span>SECURE_ACCESS_v2.0</span>
          <span>SYSTEM_READY</span>
        </div> */}
      </div>

      {/* Right Side - Form (Scrollable) */}
      <div className="w-full lg:w-1/2 flex flex-col relative overflow-y-auto h-full">
        {/* Navigation/Tools Header */}
        <div className="p-6 flex items-center justify-between z-20">
          <motion.button
            whileHover={{ x: -5 }}
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("nav.home")}
          </motion.button>

          {/* Language Toggle Pill */}
          <div className="flex bg-border/30 p-1 rounded-full relative border border-border/50 backdrop-blur-sm">
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
        </div>

        <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={i18n.language}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md"
            >
              {/* Header */}
              <div className="mb-8">
                <motion.h2
                  initial={
                    shouldAnimate
                      ? { opacity: 0, x: -20 }
                      : { opacity: 1, x: 0 }
                  }
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="text-4xl font-bold bg-gradient-to-r from-primary via-primary to-transparent bg-clip-text text-transparent mb-3 tracking-tight leading-tight pb-2"
                  style={{
                    maskImage:
                      "linear-gradient(to right, black 30%, transparent 95%)",
                    WebkitMaskImage:
                      "linear-gradient(to right, black 30%, transparent 95%)",
                  }}
                >
                  {t("login.welcome")}
                </motion.h2>
                <motion.p
                  initial={shouldAnimate ? { opacity: 0 } : { opacity: 1 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="text-muted-foreground"
                >
                  {t("login.desc")}
                </motion.p>
              </div>

              {/* Social Login */}
              <div className="flex gap-4 mb-8">
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 flex items-center justify-center gap-2 border border-border rounded-xl py-3 hover:bg-border/50 transition-colors shadow-sm"
                >
                  <img
                    src="https://www.svgrepo.com/show/475656/google-color.svg"
                    className="w-5 h-5"
                    alt="Google"
                  />
                  <span className="text-foreground font-medium">Google</span>
                </motion.button>
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 flex items-center justify-center gap-2 border border-border rounded-xl py-3 hover:bg-border/50 transition-colors shadow-sm"
                >
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg"
                    className="w-5 h-5"
                    alt="Facebook"
                  />
                  <span className="text-foreground font-medium">Facebook</span>
                </motion.button>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-8">
                <div className="flex-1 border-t border-border" />
                <span className="text-muted-foreground text-xs font-bold uppercase tracking-widest">
                  {t("login.or")}
                </span>
                <div className="flex-1 border-t border-border" />
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-foreground mb-2 ml-1"
                  >
                    {t("login.email")}
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                      id="email"
                      type="email"
                      placeholder={t("login.placeholders.email")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-border/20 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/50"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-foreground mb-2 ml-1"
                  >
                    {t("login.password")}
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={t("login.placeholders.password")}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-3 bg-border/20 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-3.5 text-muted-foreground hover:text-primary transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <div className="flex justify-end mt-2 mr-1">
                    <a
                      href="#"
                      className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
                    >
                      {t("login.forgotPassword")}
                    </a>
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  whileHover={{
                    scale: 1.02,
                    shadow: "0 10px 15px -3px rgba(126, 69, 241, 0.3)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full py-4 px-4 bg-primary text-white rounded-xl font-bold transition-all duration-200 shadow-lg shadow-primary/20"
                >
                  {t("login.signIn")}
                </motion.button>
              </form>

              {/* Sign Up Link */}
              <div className="mt-8 text-center pt-8 border-t border-border/50">
                <span className="text-muted-foreground">
                  {t("login.noAccount")}{" "}
                </span>
                <Link
                  to="/register"
                  className="font-bold text-primary hover:underline transition-all"
                >
                  {t("login.signUp")}
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <AnimatePresence>
        {modalType && (
          <FeedbackModal type={modalType} onClose={() => setModalType(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

const FeedbackModal = ({ type, onClose }) => {
  const { t } = useTranslation();

  const config = {
    success: {
      icon: <Check className="w-12 h-12 text-green-500" />,
      title: t("login.modal.successTitle"),
      desc: t("login.modal.successDesc"),
      btnText: null,
    },
    error: {
      icon: <X className="w-12 h-12 text-red-500" />,
      title: t("login.modal.errorTitle"),
      desc: t("login.modal.errorDesc"),
      btnText: t("login.modal.btnClose"),
    },
  };

  const { icon, title, desc, btnText } = config[type] || {};

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={type !== "success" ? onClose : undefined}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative bg-background border border-border w-full max-w-sm rounded-3xl p-8 shadow-2xl text-center"
      >
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-primary/10 rounded-full">{icon}</div>
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground mb-8 text-sm">{desc}</p>

        {btnText && (
          <button
            onClick={onClose}
            className="w-full py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            {btnText}
          </button>
        )}
      </motion.div>
    </div>
  );
};
