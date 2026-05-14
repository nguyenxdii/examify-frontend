import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Book, FileText, Layout, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { createExam } from "../../../api/examApi";

export default function ManualCreateExam() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = t("titles.create_exam_manual");
  }, [t]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    description: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title?.trim()) return;
    setLoading(true);
    try {
      const res = await createExam(formData);
      toast.success(t("common.create_success") || "Đã tạo đề thi");
      navigate(`/dashboard/teacher/my-quizzes/${res.data.id}`);
    } catch (err) {
      console.error("Create exam error:", err);
      toast.error(err.response?.data?.message || t("common.error") || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="space-y-1">
        <h1 className="text-3xl font-black tracking-tight text-foreground">
          {t("wizard.createTitle") || t("wizard.create.manual") || "Tạo đề thi thủ công"}
        </h1>
        <p className="text-muted-foreground">
          {t("wizard.subtitle") || "Nhập thông tin cơ bản để bắt đầu"}
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="max-w-4xl"
      >
        <div className="bg-card border border-border rounded-[2.5rem] shadow-xl overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold px-1 flex items-center gap-2">
                <Layout className="w-4 h-4 text-primary/70" />
                {t("wizard.steps.basicInfo.title")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder={t("wizard.steps.basicInfo.titlePlaceholder")}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-muted/30 border border-border rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold px-1 flex items-center gap-2">
                  <Book className="w-4 h-4 text-primary/70" />
                  {t("wizard.steps.basicInfo.subject")}
                </label>
                <input
                  type="text"
                  placeholder={t("wizard.steps.basicInfo.subjectPlaceholder")}
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-muted/30 border border-border rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold px-1 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary/70" />
                  {t("wizard.steps.basicInfo.description")}
                </label>
                <input
                  type="text"
                  placeholder={t("wizard.steps.basicInfo.descriptionPlaceholder")}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-muted/30 border border-border rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium"
                />
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => navigate("/dashboard/teacher/create-quiz")}
                className="group flex items-center gap-2 px-5 py-2.5 bg-card hover:bg-primary hover:text-white border-2 border-primary/20 hover:border-primary rounded-xl transition-all shadow-sm"
              >
                <ChevronLeft className="w-5 h-5 text-primary group-hover:-translate-x-1 transition-transform group-hover:text-white" />
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground group-hover:text-white">
                  {t("common.back") || "Quay lại"}
                </span>
              </button>
              <button
                type="submit"
                disabled={loading || !formData.title?.trim()}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-black py-3.5 px-5 rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {t("wizard.createButton") || "Tạo đề ngay"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

