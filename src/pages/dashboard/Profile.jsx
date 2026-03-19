import React, { useState, useEffect } from "react";
import {
  User,
  Pencil,
  Mail,
  School,
  BookOpen,
  Save,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { useNavigate, useBlocker } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import CustomSelect from "../../components/CustomSelect";

export default function Profile() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmSave, setShowConfirmSave] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false);

  const [currentUser, setCurrentUser] = useState(() => {
    return JSON.parse(localStorage.getItem("user") || "{}");
  });

  const [formData, setFormData] = useState({
    fullName: currentUser.fullName || "",
    gender: currentUser.gender || "male",
    school: currentUser.school || "",
    field: currentUser.field || "",
  });

  const [originalData, setOriginalData] = useState({ ...formData });

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);

  // Fetch fresh profile data on mount to resolve sync issues
  useEffect(() => {
    if (!currentUser?.email) return;

    const fetchProfile = async () => {
      try {
        const { data } = await axiosInstance.get(
          `/auth/profile?email=${currentUser.email}`,
        );
        // data is AuthResponse
        localStorage.setItem("user", JSON.stringify(data));
        setCurrentUser(data);
        const updatedFormData = {
          fullName: data.fullName || "",
          gender: data.gender || "male",
          school: data.school || "",
          field: data.field || "",
        };
        setFormData(updatedFormData);
        setOriginalData(updatedFormData);
      } catch (error) {
        console.error("Failed to fetch fresh profile", error);
        toast.error(t("wizard.list.fetchError") || "Lỗi khi tải dữ liệu hồ sơ");
      }
    };
    fetchProfile();
  }, [currentUser?.email]);

  // Sync state if localStorage changes from elsewhere
  useEffect(() => {
    const handleStorageChange = () => {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (
        user.email !== currentUser?.email ||
        user.fullName !== currentUser?.fullName
      ) {
        setCurrentUser(user);
      }
    };
    window.addEventListener("settingsChanged", handleStorageChange);
    return () => window.removeEventListener("settingsChanged", handleStorageChange);
  }, [currentUser]);

  // Router-level blocker (SPA navigation)
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasChanges && currentLocation.pathname !== nextLocation.pathname,
  );

  // Sync blocker state with our warning popup
  useEffect(() => {
    if (blocker.state === "blocked") {
      setShowExitWarning(true);
    }
  }, [blocker.state]);

  // Browser-level unsaved changes warning (Tab close/reload)
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasChanges]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleGenderChange = (val) => {
    if (!isEditing) return;
    setFormData((prev) => ({ ...prev, gender: val }));
  };

  const handleSaveClick = () => {
    if (!formData.fullName.trim()) {
      toast.error(t("register.validation.fullName") || "Họ tên không được để trống");
      return;
    }
    setShowConfirmSave(true);
  };

  const confirmSave = async () => {
    setShowConfirmSave(false);
    setIsLoading(true);
    try {
      // Use profile update API
      const { data } = await axiosInstance.patch(
        `/auth/profile?email=${currentUser.email}`,
        formData,
      );

      // Update local state and localStorage
      // data contains AuthResponse with token, id, email, fullName, role, gender, school, field
      localStorage.setItem("user", JSON.stringify(data));
      setCurrentUser(data);
      setOriginalData({
        fullName: data.fullName,
        gender: data.gender,
        school: data.school,
        field: data.field,
      });

      window.dispatchEvent(new Event("settingsChanged"));

      toast.success(t("settings.profile_updated") || "Cập nhật hồ sơ thành công!");
      setIsEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Cập nhật thất bại, vui lòng thử lại");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData({ ...originalData });
    setIsEditing(false);
  };

  return (
    <div className="space-y-8">
      {/* Header - Standardized with Overview page */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              {t("dashboard.header.profile")}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">{t("profile.subtitle")}</p>
        </div>

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary/10 text-primary rounded-2xl font-bold hover:bg-primary/20 transition-all shadow-sm"
          >
            <Pencil className="w-4 h-4" />
            {t("profile.edit")}
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={handleCancelEdit}
              className="px-5 py-2.5 text-muted-foreground font-bold hover:text-foreground transition-all"
            >
              {t("common.cancel")}
            </button>
            <button
              onClick={handleSaveClick}
              disabled={!hasChanges || isLoading}
              className="flex items-center gap-2 px-7 py-2.5 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {t("profile.save")}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Summary */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card border border-border rounded-[2rem] p-8 text-center space-y-6 shadow-sm relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative inline-block mt-4">
              <div className="w-32 h-32 bg-gradient-to-tr from-primary/20 to-purple-500/20 rounded-[40px] flex items-center justify-center text-primary border-2 border-primary/20 shadow-inner overflow-hidden">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.fullName || currentUser.fullName}`}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 p-2 bg-background border border-border rounded-xl text-primary shadow-lg">
                <User className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-foreground line-clamp-1">
                {formData.fullName || currentUser.fullName}
              </h2>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] bg-muted/50 py-1.5 px-3 rounded-full inline-block">
                {currentUser.role?.replace("ROLE_", "")}
              </p>
            </div>

            <div className="pt-2">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-muted/30 px-4 py-3 rounded-2xl border border-transparent">
                <Mail className="w-4 h-4 shrink-0 text-primary/60" />
                <span className="truncate font-medium">{currentUser.email}</span>
              </div>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/10 rounded-[2rem] p-8 space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-widest">
                {t("profile.verification_status")}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed italic opacity-80 font-medium">
              {t("profile.security_note")}
            </p>
          </div>
        </div>

        {/* Right Column: Profile Form */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-[2rem] p-8 lg:p-10 shadow-sm space-y-10">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-3 opacity-90">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <User className="w-4 h-4" />
              </div>
              {t("profile.basic_info")}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {/* Full Name */}
              <div className="space-y-3 col-span-full sm:col-span-1">
                <label
                  htmlFor="fullName"
                  className="block text-sm font-semibold text-foreground/70 ml-1"
                >
                  {t("register.fullName")}
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-3.5 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    id="fullName"
                    type="text"
                    disabled={!isEditing}
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3.5 bg-muted/20 border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium disabled:opacity-50 disabled:grayscale"
                  />
                </div>
              </div>

              {/* Gender */}
              <div className="space-y-3 col-span-full sm:col-span-1">
                <label className="block text-sm font-semibold text-foreground/70 ml-1">
                  {t("register.gender")}
                </label>
                <div
                  className={`flex p-1.5 rounded-2xl border border-border gap-1.5 relative h-[52px] ${
                    isEditing
                      ? "bg-muted/20 shadow-inner"
                      : "bg-muted/10 opacity-70"
                  }`}
                >
                  <button
                    type="button"
                    disabled={!isEditing}
                    onClick={() => handleGenderChange("male")}
                    className={`flex-1 rounded-xl text-sm font-bold transition-all relative z-10 ${
                      formData.gender === "male"
                        ? "text-white"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t("register.male")}
                  </button>
                  <button
                    type="button"
                    disabled={!isEditing}
                    onClick={() => handleGenderChange("female")}
                    className={`flex-1 rounded-xl text-sm font-bold transition-all relative z-10 ${
                      formData.gender === "female"
                        ? "text-white"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t("register.female")}
                  </button>
                  <motion.div
                    className="absolute inset-y-1.5 bg-primary rounded-xl shadow-lg shadow-primary/30"
                    animate={{
                      left: formData.gender === "male" ? "6px" : "50%",
                      right: formData.gender === "male" ? "50%" : "6px",
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                </div>
              </div>

              {/* School */}
              <div className="space-y-3 col-span-full sm:col-span-1">
                <label
                  htmlFor="school"
                  className="block text-sm font-semibold text-foreground/70 ml-1"
                >
                  {t("register.institution")}
                </label>
                <div className="relative group">
                  <School className="absolute left-4 top-3.5 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    id="school"
                    type="text"
                    disabled={!isEditing}
                    value={formData.school}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3.5 bg-muted/20 border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Field */}
              <div className="space-y-3 col-span-full sm:col-span-1">
                <label
                  htmlFor="field"
                  className="block text-sm font-semibold text-foreground/70 ml-1"
                >
                  {t("register.teachingField")}
                </label>
                <div className="relative group">
                  <BookOpen className="absolute left-4 top-3.5 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors z-10 pointer-events-none" />
                  <div className={!isEditing ? "opacity-50 grayscale pointer-events-none" : ""}>
                    <CustomSelect
                      id="field"
                      value={formData.field}
                      onChange={handleChange}
                      options={[
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
                      ]}
                      placeholder={t("register.placeholders.teachingField")}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popups */}
      <AnimatePresence>
        {/* Save Confirmation */}
        {showConfirmSave && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmSave(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-card border border-border rounded-[2.5rem] p-8 shadow-2xl relative z-10 max-w-sm w-full space-y-6"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mx-auto">
                <Save className="w-8 h-8" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-black text-foreground">
                  {t("profile.confirm_save_title")}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("profile.confirm_save_desc")}
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowConfirmSave(false)}
                  className="flex-1 px-4 py-3 rounded-2xl font-bold text-muted-foreground hover:bg-muted transition-colors"
                >
                  {t("common.cancel")}
                </button>
                <button
                  onClick={confirmSave}
                  className="flex-1 px-4 py-3 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                >
                  {t("common.confirm")}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Exit Warning */}
        {showExitWarning && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowExitWarning(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-card border border-border rounded-[2.5rem] p-8 shadow-2xl relative z-10 max-w-sm w-full space-y-6"
            >
              <div className="w-16 h-16 bg-amber-500/10 rounded-3xl flex items-center justify-center text-amber-500 mx-auto">
                <ArrowLeft className="w-8 h-8" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-black text-foreground">
                  {t("profile.exit_warning_title")}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("profile.exit_warning_desc")}
                </p>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => {
                    setShowExitWarning(false);
                    if (blocker.state === "blocked") blocker.reset();
                  }}
                  className="flex-1 px-4 py-3 rounded-2xl font-bold text-muted-foreground hover:bg-muted transition-colors underline decoration-2 underline-offset-4"
                >
                  {t("profile.stay")}
                </button>
                <button
                  onClick={() => {
                    if (blocker.state === "blocked") {
                      blocker.proceed();
                    } else {
                      navigate(-1);
                    }
                  }}
                  className="flex-1 px-6 py-3 bg-destructive text-destructive-foreground rounded-2xl font-black shadow-lg shadow-destructive/20 hover:scale-105 transition-all"
                >
                  {t("profile.leave")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

