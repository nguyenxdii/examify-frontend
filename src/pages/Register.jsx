import { useState, useEffect } from "react";
import {
  Mail,
  Lock,
  Sparkles,
  ArrowLeft,
  Eye,
  EyeOff,
  User,
  Building2,
  BookOpen,
  Check,
  X,
  Info,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import authBg from "../assets/auth/auth.jpg";
import { register } from "../api/authApi";
import CustomSelect from "../components/CustomSelect";
import logo from "../assets/synde_logo.svg";

export default function Register() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (token && user) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const [formData, setFormData] = useState({
    fullName: "",
    gender: "male",
    email: "",
    password: "",
    confirmPassword: "",
    institution: "",
    teachingField: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [modalType, setModalType] = useState(null); // 'success', 'error', 'exists'
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

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }

    try {
      await register({
        fullName: formData.fullName,
        gender: formData.gender,
        email: formData.email,
        password: formData.password,
        school: formData.institution,
        field: formData.teachingField,
      });

      setModalType("success");

      // Auto redirect after 3s
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      const message = error.response?.data?.message || "";
      const isExists =
        message.toLowerCase().includes("exists") ||
        message.toLowerCase().includes("tồn tại") ||
        message.toLowerCase().includes("đã được sử dụng") ||
        message.toLowerCase().includes("already");

      if (isExists) {
        setModalType("exists");
      } else {
        setModalType("error");
      }
    }
  };

  const teachingFields = [
    "math",
    "vietnamese",
    "english",
    "ethics",
    "nature_society",
    "music",
    "arts",
    "physical_ed",
    "literature",
    "physics",
    "chemistry",
    "biology",
    "history",
    "geography",
    "civics",
    "informatics",
    "technology",
    "national_defense",
    "lecturer_general",
    "engineering",
    "economics",
    "medicine",
    "law",
    "pedagogy",
    "it",
    "languages",
    "other",
  ];

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
              <img src={logo} alt="SynDe Logo" className="h-24 w-auto drop-shadow-2xl" />
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
      </div>

      {/* Right Side - Form (Scrollable) */}
      <div className="w-full lg:w-1/2 flex flex-col relative overflow-y-auto h-full">
        {/* Navigation/Tools Header */}
        <div className="p-6 flex items-center justify-between z-20 sticky top-0 bg-background/80 backdrop-blur-md">
          <motion.button
            whileHover={{ x: -5 }}
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("nav.home")}
          </motion.button>

          <div className="flex bg-border/30 p-1 rounded-full relative border border-border/50 backdrop-blur-sm">
            <motion.div
              className="absolute inset-y-1 bg-primary rounded-full shadow-lg z-0"
              initial={false}
              animate={{ x: currentLang === "vi" ? 0 : 36, width: 36 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
            <button
              onClick={() => toggleLanguage("vi")}
              className={`relative z-10 w-9 h-7 flex items-center justify-center text-xs font-bold transition-colors ${currentLang === "vi" ? "text-white" : "text-muted-foreground hover:text-foreground"}`}
            >
              VI
            </button>
            <button
              onClick={() => toggleLanguage("en")}
              className={`relative z-10 w-9 h-7 flex items-center justify-center text-xs font-bold transition-colors ${currentLang === "en" ? "text-white" : "text-muted-foreground hover:text-foreground"}`}
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
              className="w-full max-w-md my-8"
            >
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
                  {t("register.title")}
                </motion.h2>
                <motion.p
                  initial={shouldAnimate ? { opacity: 0 } : { opacity: 1 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="text-muted-foreground"
                >
                  {t("register.desc")}
                </motion.p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-semibold text-foreground mb-2 ml-1"
                  >
                    {t("register.fullName")}
                  </label>
                  <div className="relative group">
                    <User className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                      id="fullName"
                      type="text"
                      placeholder={t("register.placeholders.fullName")}
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 bg-border/20 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                </div>

                {/* Gender Selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-foreground ml-1">
                    {t("register.gender") || "Giới tính (Xưng hô)"}
                  </label>
                  <div className="flex bg-border/20 p-1 rounded-xl border border-border gap-1 relative overflow-hidden group">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, gender: "male" }))}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all relative z-10 ${
                        formData.gender === "male" 
                          ? "text-white" 
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {t("register.male") || "Nam"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, gender: "female" }))}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all relative z-10 ${
                        formData.gender === "female" 
                          ? "text-white" 
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {t("register.female") || "Nữ"}
                    </button>
                    <motion.div
                      className="absolute inset-y-1 bg-primary rounded-lg shadow-lg"
                      initial={false}
                      animate={{
                        left: formData.gender === "male" ? "4px" : "50%",
                        right: formData.gender === "male" ? "50%" : "4px",
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 28 }}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-foreground mb-2 ml-1"
                  >
                    {t("register.email")}
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                      id="email"
                      type="email"
                      placeholder={t("login.placeholders.email")}
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 bg-border/20 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                </div>

                {/* Institution */}
                <div>
                  <label
                    htmlFor="institution"
                    className="block text-sm font-semibold text-foreground mb-2 ml-1"
                  >
                    {t("register.institution")}
                  </label>
                  <div className="relative group">
                    <Building2 className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                      id="institution"
                      type="text"
                      placeholder={t("register.placeholders.institution")}
                      value={formData.institution}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 bg-border/20 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                </div>

                {/* Teaching Field */}
                <div>
                  <label
                    htmlFor="teachingField"
                    className="block text-sm font-semibold text-foreground mb-2 ml-1"
                  >
                    {t("register.teachingField")}
                  </label>
                  <div className="relative group">
                    <BookOpen className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors z-10 pointer-events-none" />
                    <CustomSelect
                      value={formData.teachingField}
                      onChange={handleChange}
                      options={teachingFields}
                      placeholder={t("register.placeholders.teachingField")}
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
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-12 pr-12 py-3 bg-border/20 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
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
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-semibold text-foreground mb-2 ml-1"
                  >
                    {t("register.confirmPassword")}
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder={t("login.placeholders.password")}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full pl-12 pr-12 py-3 bg-border/20 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-4 top-3.5 text-muted-foreground hover:text-primary transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full py-4 px-4 bg-primary text-white rounded-xl font-bold transition-all shadow-lg shadow-primary/20"
                >
                  {t("register.btn")}
                </motion.button>
              </form>

              <div className="mt-8 text-center pt-8 border-t border-border/50">
                <span className="text-muted-foreground">
                  {t("register.haveAccount")}{" "}
                </span>
                <Link
                  to="/login"
                  className="font-bold text-primary hover:underline"
                >
                  {t("register.signIn")}
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <AnimatePresence>
        {modalType && (
          <FeedbackModal
            type={modalType}
            onClose={() => setModalType(null)}
            onAction={() => {
              if (modalType === "exists" || modalType === "success") {
                navigate("/login");
              }
              setModalType(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

const FeedbackModal = ({ type, onClose, onAction }) => {
  const { t } = useTranslation();

  const config = {
    success: {
      icon: <Check className="w-12 h-12 text-green-500" />,
      title: t("register.modal.successTitle"),
      desc: t("register.modal.successDesc"),
      btnText: null,
    },
    error: {
      icon: <X className="w-12 h-12 text-red-500" />,
      title: t("register.modal.errorTitle"),
      desc: t("register.modal.errorDesc"),
      btnText: t("register.modal.btnRetry"),
    },
    exists: {
      icon: <Info className="w-12 h-12 text-blue-500" />,
      title: t("register.modal.existsTitle"),
      desc: t("register.modal.existsDesc"),
      btnText: t("register.modal.btnOk"),
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
            onClick={onAction}
            className="w-full py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            {btnText}
          </button>
        )}

        {type !== "success" && (
          <button
            onClick={onClose}
            className="mt-4 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {type === "exists"
              ? t("register.modal.btnNo")
              : t("register.modal.btnClose")}
          </button>
        )}
      </motion.div>
    </div>
  );
};
