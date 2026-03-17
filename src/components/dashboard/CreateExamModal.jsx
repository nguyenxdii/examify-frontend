import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Book, FileText, Layout } from "lucide-react";
import { createExam } from "../../api/examApi";
import { useNavigate } from "react-router-dom";

export default function CreateExamModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    description: ""
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) return;

    setLoading(true);
    setError("");
    try {
      const res = await createExam(formData);
      onClose();
      navigate(`/dashboard/teacher/my-quizzes/${res.data.id}`);
    } catch (err) {
      console.error("Create exam error:", err);
      setError(err.response?.data?.message || "Đã có lỗi xảy ra khi tạo đề thi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Plus className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-heading">Tạo đề thi thủ công</h3>
                  <p className="text-sm text-muted-foreground">Nhập thông tin cơ bản để bắt đầu</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium px-1 flex items-center gap-2">
                  <Layout className="w-4 h-4" /> Tiêu đề đề thi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Kiểm tra giữa kỳ môn Toán"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-muted/50 border border-border rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-heading"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium px-1 flex items-center gap-2">
                  <Book className="w-4 h-4" /> Môn học
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Toán học, Tiếng Anh..."
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-muted/50 border border-border rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium px-1 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Mô tả
                </label>
                <textarea
                  rows="3"
                  placeholder="Nhập mô tả ngắn cho đề thi này..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-muted/50 border border-border rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-muted hover:bg-muted/80 text-foreground font-bold py-3 px-4 rounded-2xl transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={loading || !formData.title}
                  className="flex-[2] bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-4 rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    "Tạo đề ngay"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
