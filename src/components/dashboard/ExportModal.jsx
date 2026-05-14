import React, { useState } from "react";
import { 
  X, FileText, Download, Settings, 
  CheckCircle2, FileCode, Layers, RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { cn } from "../../lib/utils";
import { exportExam } from "../../api/examApi";
import { toast } from "react-hot-toast";

export default function ExportModal({ isOpen, onClose, examId, examTitle }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState({
    numVersions: 1,
    shuffleQuestions: true,
    shuffleAnswers: true,
    formats: ["pdf"],
    showExplanations: false,
    greeting: ""
  });

  if (!isOpen) return null;

  const handleToggleFormat = (format) => {
    setOptions(prev => {
      const formats = prev.formats.includes(format)
        ? prev.formats.filter(f => f !== format)
        : [...prev.formats, format];
      return { ...prev, formats };
    });
  };

  const handleExport = async () => {
    if (options.formats.length === 0) {
      toast.error("Vui lòng chọn ít nhất một định dạng (PDF hoặc Word)");
      return;
    }

    try {
      setLoading(true);
      const response = await exportExam(examId, options);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${examTitle || 'exam'}_export.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success("Đang chuẩn bị file tải về...");
      onClose();
    } catch (err) {
      toast.error("Lỗi khi xuất đề thi. Vui lòng thử lại sau.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-lg bg-card border border-border rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                <Download className="w-6 h-6 text-primary" />
                {t("common.export_exam")}
              </h2>
              <p className="text-sm text-muted-foreground font-medium">Tùy chỉnh và tải đề thi về máy</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-xl transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Formats Selection */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Định dạng file</label>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'pdf', label: 'PDF', icon: FileText, color: 'text-rose-500', bg: 'bg-rose-500/10' },
                  { id: 'docx', label: 'Word', icon: FileCode, color: 'text-blue-500', bg: 'bg-blue-500/10' }
                ].map(format => (
                  <button
                    key={format.id}
                    onClick={() => handleToggleFormat(format.id)}
                    className={cn(
                      "p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                      options.formats.includes(format.id)
                        ? "border-primary bg-primary/5 shadow-lg shadow-primary/5"
                        : "border-border hover:border-primary/30"
                    )}
                  >
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", format.bg)}>
                      <format.icon className={cn("w-5 h-5", format.color)} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider">{format.label}</span>
                    {options.formats.includes(format.id) && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Versioning & Shuffling */}
            <div className="space-y-4 bg-muted/30 p-6 rounded-[2rem] border border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Layers className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{t("common.num_versions")}</p>
                    <p className="text-[10px] text-muted-foreground font-medium">Tạo nhiều phiên bản xáo trộn</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="number"
                    min="1"
                    max="10"
                    value={options.numVersions}
                    onChange={(e) => setOptions({...options, numVersions: parseInt(e.target.value) || 1})}
                    className="w-16 px-3 py-2 bg-background border border-border rounded-xl text-center font-bold focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
              </div>

              <div className="h-px bg-border/50" />

              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Settings className="w-3.5 h-3.5" /> Tùy chọn nâng cao
                </p>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { id: 'shuffleQuestions', label: t('common.shuffle_questions'), icon: RefreshCw },
                    { id: 'shuffleAnswers', label: t('common.shuffle_answers'), icon: RefreshCw },
                    { id: 'showExplanations', label: t('common.show_explanations'), icon: FileText }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setOptions({...options, [opt.id]: !options[opt.id]})}
                      className="flex items-center justify-between p-3 hover:bg-background rounded-xl transition-all border border-transparent hover:border-border"
                    >
                      <span className="text-xs font-bold flex items-center gap-2">
                        <opt.icon className="w-3.5 h-3.5 text-primary/60" />
                        {opt.label}
                      </span>
                      <div className={cn(
                        "w-9 h-5 rounded-full transition-all relative",
                        options[opt.id] ? "bg-primary" : "bg-muted-foreground/20"
                      )}>
                        <div className={cn(
                          "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                          options[opt.id] ? "right-1" : "left-1"
                        )} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-px bg-border/50" />

              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                   Lời chúc / Lời dặn
                </p>
                <input 
                  type="text" 
                  placeholder="Ví dụ: Chúc các em làm bài tốt!"
                  value={options.greeting}
                  onChange={(e) => setOptions({...options, greeting: e.target.value})}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleExport}
            disabled={loading || options.formats.length === 0}
            className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/25 hover:scale-[1.02] active:scale-100 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                {t("common.download")} ZIP
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
