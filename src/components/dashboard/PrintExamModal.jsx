import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Printer, 
  X, 
  Check, 
  EyeOff, 
  Eye, 
  MessageSquare, 
  Sparkles,
  FileText,
  Layers,
  Shuffle,
  Download,
  Settings2
} from "lucide-react";
import { cn } from "../../lib/utils";

export default function PrintExamModal({ isOpen, onClose, onPrint, onExport, examTitle, currentSubject, currentDuration }) {
  const { t } = useTranslation();
  const [options, setOptions] = useState({
    numVersions: 1,
    shuffleQuestions: true,
    shuffleAnswers: true,
    formats: ["pdf"], // "pdf", "docx"
    showExplanations: true,
    hideAnswers: true, // Only for frontend preview/print
    showBranding: true,
    showNote: true,
    subject: currentSubject || "",
    duration: currentDuration || "",
  });

  // Update options when props change
  React.useEffect(() => {
    if (isOpen) {
      setOptions(prev => ({
        ...prev,
        subject: currentSubject || prev.subject,
        duration: currentDuration || prev.duration
      }));
    }
  }, [isOpen, currentSubject, currentDuration]);

  if (!isOpen) return null;

  const toggleOption = (key) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFormatToggle = (format) => {
    setOptions(prev => {
      const newFormats = prev.formats.includes(format)
        ? prev.formats.filter(f => f !== format)
        : [...prev.formats, format];
      return { ...prev, formats: newFormats.length ? newFormats : prev.formats };
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-card border-2 border-border rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-8 pb-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <Printer className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black tracking-tight">Xuất bản & In ấn</h2>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Cấu hình xuất file đa phiên bản</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-muted rounded-xl transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="p-8 pt-0 space-y-6 overflow-y-auto">
                <div className="bg-muted/30 p-6 rounded-3xl border-2 border-border border-dashed space-y-4">
                  <p className="text-sm font-black text-foreground truncate flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    {examTitle}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Môn thi</label>
                      <input 
                        type="text" 
                        value={options.subject}
                        onChange={(e) => setOptions({...options, subject: e.target.value})}
                        className="w-full px-4 py-2 bg-card border-2 border-border rounded-xl focus:border-primary outline-none font-bold text-sm"
                        placeholder="Nhập môn thi..."
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Thời gian (phút)</label>
                      <input 
                        type="number" 
                        value={options.duration}
                        onChange={(e) => setOptions({...options, duration: e.target.value})}
                        className="w-full px-4 py-2 bg-card border-2 border-border rounded-xl focus:border-primary outline-none font-bold text-sm"
                        placeholder="Nhập thời gian..."
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Version & Shuffle */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Settings2 className="w-4 h-4" /> Cấu hình đề
                    </h3>
                    
                    <div className="p-4 rounded-2xl border-2 border-border bg-card space-y-3">
                      <label className="text-xs font-bold uppercase text-muted-foreground">Số lượng mã đề</label>
                      <div className="flex items-center gap-4">
                        <input 
                          type="range" min="1" max="10" 
                          value={options.numVersions} 
                          onChange={(e) => setOptions({...options, numVersions: parseInt(e.target.value)})}
                          className="flex-1 accent-primary"
                        />
                        <span className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center font-black text-lg shadow-lg">
                          {options.numVersions}
                        </span>
                      </div>
                    </div>

                    <OptionItem 
                      icon={<Shuffle className="w-5 h-5" />}
                      label="Trộn câu hỏi"
                      description="Xáo trộn thứ tự các câu hỏi"
                      active={options.shuffleQuestions}
                      onClick={() => toggleOption("shuffleQuestions")}
                    />
                    <OptionItem 
                      icon={<Layers className="w-5 h-5" />}
                      label="Trộn đáp án"
                      description="Xáo trộn thứ tự A, B, C, D"
                      active={options.shuffleAnswers}
                      onClick={() => toggleOption("shuffleAnswers")}
                    />
                  </div>

                  {/* Right Column: Format & Details */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Download className="w-4 h-4" /> Định dạng & Nội dung
                    </h3>

                    <div className="flex gap-4">
                      <button
                        onClick={() => handleFormatToggle("pdf")}
                        className={cn(
                          "flex-1 p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                          options.formats.includes("pdf") ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"
                        )}
                      >
                        <FileText className="w-6 h-6" />
                        <span className="font-bold text-xs uppercase">PDF</span>
                      </button>
                      <button
                        onClick={() => handleFormatToggle("docx")}
                        className={cn(
                          "flex-1 p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                          options.formats.includes("docx") ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"
                        )}
                      >
                        <FileText className="w-6 h-6" />
                        <span className="font-bold text-xs uppercase">WORD</span>
                      </button>
                    </div>

                    <OptionItem 
                      icon={<MessageSquare className="w-5 h-5" />}
                      label="Bao gồm giải thích"
                      description="In kèm đáp án chi tiết & giải thích"
                      active={options.showExplanations}
                      onClick={() => toggleOption("showExplanations")}
                    />
                    
                    <div className="p-4 rounded-2xl border-2 border-primary/20 bg-primary/5">
                      <p className="text-[10px] font-bold text-primary uppercase tracking-widest leading-tight">
                        * Hệ thống sẽ tự động tạo file ZIP bao gồm: Các mã đề, Đáp án chi tiết và Bảng đáp án tổng hợp (Matrix).
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-8 pt-4 flex gap-4 shrink-0 border-t border-border">
                <button
                  onClick={() => onPrint(options)}
                  className="flex-1 py-4 bg-muted text-foreground font-black rounded-2xl hover:bg-muted/80 transition-all flex items-center justify-center gap-2"
                >
                  <Printer className="w-5 h-5" />
                  Xem thử & In
                </button>
                <button
                  onClick={() => onExport(options)}
                  className="flex-2 py-4 px-8 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-100 transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Đóng gói & Tải về (.zip)
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function OptionItem({ icon, label, description, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left",
        active 
          ? "border-primary bg-primary/5 shadow-sm" 
          : "border-border bg-card hover:border-primary/30"
      )}
    >
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
        active ? "bg-primary text-white" : "bg-muted text-muted-foreground"
      )}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("font-bold text-sm", active ? "text-primary" : "text-foreground")}>{label}</p>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{description}</p>
      </div>
      <div className={cn(
        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
        active ? "bg-primary border-primary text-white" : "border-border"
      )}>
        {active && <Check className="w-4 h-4" />}
      </div>
    </button>
  );
}
