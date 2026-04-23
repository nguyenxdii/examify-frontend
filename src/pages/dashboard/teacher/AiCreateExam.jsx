import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Settings,
  Save,
  Loader2,
  Trash2,
  Edit2,
  X,
  CheckCircle2,
  CheckCircle,
  AlertCircle,
  FileUp,
  BarChart3,
  Plus,
  BrainCircuit,
  Wand2,
  RotateCw,
  Rocket,
  Target,
  Info,
  Clock,
  Pencil,
  Database,
  ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "../../../lib/utils";
import { toast } from "react-hot-toast";
import axiosInstance from "../../../api/axiosInstance";
import { generateQuestions, analyzeFile } from "../../../api/aiApi";
import { createExam, saveBatchQuestions, getQuestionBank, suggestTopic } from "../../../api/examApi";
import QuestionModal from "../../../components/dashboard/QuestionModal";
import { KeyboardIcon as Step1Icon } from "../../../components/icons/Step1Icon";
import { BotMessageSquareIcon as Step2Icon } from "../../../components/icons/Step2Icon";
import { FileCogIcon as Step3Icon } from "../../../components/icons/Step3Icon";

const getSteps = (t) => [
  { id: 1, title: t("wizard.steps.config") || "Cấu hình", icon: Step1Icon },
  { id: 2, title: t("wizard.steps.generation") || "Đang tạo", icon: Step2Icon },
  { id: 3, title: t("wizard.steps.preview") || "Kết quả", icon: Step3Icon },
];

export default function AiCreateExam() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const steps = getSteps(t);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [wizardData, setWizardData] = useState({
    inputType: "topic", // "topic" | "document"
    content: "",
    analysis: null,
    config: {
      multipleChoice: 30,
      multipleAnswer: 15,
      essay: 5,
      easyCount: 20,
      mediumCount: 20,
      hardCount: 10,
      language: "vi",
      detailedExplanation: true
    },
    questions: [],
    metadata: {
      title: "",
      subject: "",
      description: "",
    },
    saveToBank: false,
    globalTopic: "",
  });

  const [savingStatus, setSavingStatus] = useState({
    exam: "pending",
    questions: "pending",
  });

  const [editingQuestion, setEditingQuestion] = useState(null);
  const [deletingIdx, setDeletingIdx] = useState(null);
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);
  const [isAnalyzingFile, setIsAnalyzingFile] = useState(false);
  const [suggestingGlobalTopic, setSuggestingGlobalTopic] = useState(false);
  const [bankTopics, setBankTopics] = useState([]);
  const [inlineError, setInlineError] = useState("");
  const [regeneratingIdx, setRegeneratingIdx] = useState(null);
  const topRef = useRef(null);

  // Auto scroll to top on step change
  useEffect(() => {
    // Fetch bank topics
    const fetchTopics = async () => {
      try {
        const res = await getQuestionBank();
        const topics = [...new Set(res.data.map(q => q.topic).filter(Boolean))];
        setBankTopics(topics);
      } catch (err) {
        console.error("Failed to fetch topics", err);
      }
    };
    if (currentStep === 3) fetchTopics();
  }, [currentStep]);

  // Step 1: Handlers
  const handleStep1Submit = async () => {
    const content = wizardData.content.trim();
    if (!content) {
        setInlineError("Vui lòng nhập nội dung hoặc tải tài liệu.");
        return;
    }
    
    if (wizardData.inputType === "topic") {
        const wordCount = content.split(/\s+/).filter(Boolean).length;
        if (wordCount < 3) {
          setInlineError(t("wizard.step1.tooShortError") || "Nội dung quá ngắn, vui lòng nhập ít nhất 3 từ.");
          return;
        }
    }

    const totalTypes = wizardData.config.multipleChoice + wizardData.config.multipleAnswer + wizardData.config.essay;
    const totalDiff = wizardData.config.easyCount + wizardData.config.mediumCount + wizardData.config.hardCount;

    if (totalTypes === 0) {
      setInlineError("Vui lòng nhập ít nhất 1 câu hỏi.");
      return;
    }

    if (totalTypes > 50) {
      setInlineError("Tổng số lượng câu hỏi không được vượt quá 50.");
      return;
    }

    if (totalTypes !== totalDiff) {
      setInlineError(`Tổng số lượng loại câu (${totalTypes}) và phân bổ độ khó (${totalDiff}) phải bằng nhau.`);
      return;
    }

    setInlineError("");
    handleStartGeneration();
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setInlineError(t("wizard.step1.fileTooLarge") || "File quá lớn, tối đa 10MB.");
      return;
    }

    setInlineError("");
    setIsAnalyzingFile(true);
    try {
      const res = await analyzeFile(file);
      const isSufficient = res.data.isSufficient !== undefined ? res.data.isSufficient : res.data.sufficient;
      if (isSufficient) {
        setWizardData(prev => ({
          ...prev,
          content: file.name,
          analysis: res.data,
          config: {
            ...prev.config,
            multipleChoice: res.data.suggestedMultipleChoice || 30,
            multipleAnswer: res.data.suggestedMultipleAnswer || 15,
            essay: res.data.suggestedEssay || 5,
            easyCount: res.data.suggestedEasy || 20,
            mediumCount: res.data.suggestedMedium || 20,
            hardCount: res.data.suggestedHard || 10
          },
          metadata: {
            ...prev.metadata,
            title: res.data.suggestedTitle || prev.metadata.title,
            description: res.data.suggestedDescription || res.data.summary || prev.metadata.description,
          }
        }));
      } else {
        setError(res.data.message || "Tài liệu không phù hợp để tạo câu hỏi.");
      }
    } catch (err) {
      console.error("File analysis error:", err);
      setError("Có lỗi khi phân tích file: " + (err.response?.data?.message || err.message));
    } finally {
      setIsAnalyzingFile(false);
    }
  };

  const handleStartGeneration = async () => {
    setCurrentStep(2);
    setLoading(true);
    setLoadingTextIndex(0);

    const timer = setInterval(() => {
      setLoadingTextIndex(prev => (prev < 1 ? prev + 1 : prev));
    }, 2000);

    try {
      const res = await generateQuestions({
        content: wizardData.content,
        inputType: wizardData.inputType,
        ...wizardData.config,
        language: i18n.language,
      });

      const isValid = res.data.isValid !== undefined ? res.data.isValid : res.data.valid;
      if (isValid && res.data.questions?.length > 0) {
        setWizardData(prev => ({
          ...prev,
          questions: res.data.questions,
          globalTopic: res.data.suggestedTopic || "",
          metadata: {
            ...prev.metadata,
            title: prev.metadata.title || res.data.suggestedTitle,
          }
        }));
        setLoadingTextIndex(2); // Hoàn tất bản thảo
        setTimeout(() => {
          setCurrentStep(3);
          setLoading(false);
          clearInterval(timer);
        }, 1000);
      } else {
        const errorMsg = res.data.reason || "AI không thể tạo được câu hỏi từ nội dung này.";
        setError(errorMsg);
        setCurrentStep(1);
        setLoading(false);
        clearInterval(timer);
      }
    } catch (err) {
      console.error("Generation error:", err);
      let errorMsg = "Có lỗi khi tạo câu hỏi: " + (err.response?.data?.message || err.message);
      if (err.response?.status === 503) {
        errorMsg = "Hệ thống AI hiện đang quá tải do nhu cầu cao. Vui lòng thử lại sau vài giây.";
      }
      setError(errorMsg);
      setCurrentStep(1);
      setLoading(false);
      clearInterval(timer);
    }
  };

  const handleRegenerateQuestion = async (index) => {
    const q = wizardData.questions[index];
    setRegeneratingIdx(index);
    try {
      const res = await axiosInstance.post("/ai/generate", {
        content: `Hãy sinh lại câu hỏi sau đây (giữ cùng chủ đề, độ khó và loại câu hỏi): ${q.content}.`,
        inputType: "topic",
        language: i18n.language,
        multipleChoice: q.type === "multiple_choice" ? 1 : 0,
        multipleAnswer: q.type === "multiple_answer" ? 1 : 0,
        essay: q.type === "essay" ? 1 : 0,
        easyCount: q.difficulty === "easy" ? 1 : 0,
        mediumCount: q.difficulty === "medium" || !q.difficulty ? 1 : 0,
        hardCount: q.difficulty === "hard" ? 1 : 0
      });
      
      if (res.data.isValid && res.data.questions?.length > 0) {
        const newQuestions = [...wizardData.questions];
        newQuestions[index] = res.data.questions[0];
        setWizardData(prev => ({ ...prev, questions: newQuestions }));
      } else {
        setError(res.data.reason || t("wizard.step5.modal.error"));
      }
    } catch (err) {
      let errorMsg = t("wizard.step5.modal.error");
      if (err.response?.status === 503) {
        errorMsg = "Hệ thống AI hiện đang quá tải. Vui lòng thử lại sau vài giây.";
      }
      setError(errorMsg);
    } finally {
      setRegeneratingIdx(null);
    }
  };

  const handleSuggestGlobalTopic = async () => {
    if (wizardData.questions.length === 0) return;
    try {
      setSuggestingGlobalTopic(true);
      const allContent = wizardData.questions.map(q => q.content).join("\n");
      const res = await suggestTopic(allContent);
      setWizardData(prev => ({ ...prev, globalTopic: res.data.topic }));
      toast.success(t("wizard.ai_suggest_topic_success") || "AI đã gợi ý chủ đề chung cho bộ đề!");
    } catch (err) {
      toast.error(t("wizard.ai_suggest_topic_error") || "Lỗi khi gợi ý chủ đề");
    } finally {
      setSuggestingGlobalTopic(false);
    }
  };

  const handleSaveExam = async (status = "published") => {
    if (!wizardData.metadata.title) return;
    setSavingStatus({ exam: "loading", questions: "pending" });
    try {
      const examPayload = {
        title: wizardData.metadata.title,
        description: wizardData.metadata.description,
        subject: wizardData.metadata.subject || "Chưa phân loại",
        status: status
      };

      const examRes = await createExam(examPayload);
      const examId = examRes.data.id;
      setSavingStatus(prev => ({ ...prev, exam: "success", questions: "loading" }));

      const finalQuestions = wizardData.questions.map(q => ({
        ...q,
        topic: wizardData.saveToBank ? wizardData.globalTopic : q.topic,
        saveToBank: wizardData.saveToBank
      }));

      await saveBatchQuestions(examId, finalQuestions);
      setSavingStatus(prev => ({ ...prev, questions: "success" }));

      setTimeout(() => navigate(`/dashboard/teacher/my-quizzes/${examId}`), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi lưu đề thi.");
      setSavingStatus({ exam: "error", questions: "error" });
    }
  };

  const handleDeleteQuestion = (idx) => {
    setDeletingIdx(idx);
  };

  const confirmDelete = () => {
    if (deletingIdx === null) return;
    setWizardData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== deletingIdx)
    }));
    setDeletingIdx(null);
  };

  const handleEditSave = (updatedQ) => {
    const newQuestions = [...wizardData.questions];
    const idx = wizardData.questions.findIndex(q => q === editingQuestion);
    if (idx !== -1) {
      newQuestions[idx] = updatedQ;
      setWizardData(prev => ({ ...prev, questions: newQuestions }));
    }
    setEditingQuestion(null);
  };

  // ===== RENDER STEPS =====

  const renderStep1 = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          onClick={() => setWizardData({ ...wizardData, inputType: "topic" })}
          className={`cursor-pointer p-6 rounded-2xl border-2 transition-all group ${wizardData.inputType === "topic" ? "border-primary bg-primary/5 shadow-lg" : "border-border bg-card hover:border-primary/30"}`}
        >
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-colors ${wizardData.inputType === "topic" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"}`}>
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold mb-1">{t("wizard.step1.topic")}</h3>
          <p className="text-sm text-muted-foreground">{t("wizard.step1.topicDesc")}</p>
        </div>
        <div
          onClick={() => setWizardData({ ...wizardData, inputType: "document" })}
          className={`cursor-pointer p-6 rounded-2xl border-2 transition-all group ${wizardData.inputType === "document" ? "border-primary bg-primary/5 shadow-lg" : "border-border bg-card hover:border-primary/30"}`}
        >
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-colors ${wizardData.inputType === "document" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"}`}>
            <FileUp className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold mb-1">{t("wizard.step1.document")}</h3>
          <p className="text-sm text-muted-foreground">{t("wizard.step1.documentDesc")}</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 space-y-5 shadow-lg relative overflow-hidden">
        {wizardData.inputType === "topic" ? (
          <div className="space-y-4">
            <label className="text-base font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              {t("wizard.step1.topicLabel")}
            </label>
            <textarea
              rows={4}
              value={wizardData.content}
              onChange={(e) => {
                setWizardData({ ...wizardData, content: e.target.value });
                if (inlineError) setInlineError("");
              }}
              placeholder={t("wizard.step1.placeholderTopic")}
              className={cn(
                "w-full bg-muted/30 border rounded-xl p-4 focus:outline-none focus:ring-2 transition-all font-heading text-base leading-relaxed resize-none",
                inlineError ? "border-red-500 focus:ring-red-500/50" : "border-border focus:ring-primary/50"
              )}
            />
          </div>
        ) : (
          <>
            <label className="text-lg font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Tài liệu học tập
            </label>
            
            {!wizardData.analysis ? (
              <label className={cn(
                "flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-2xl cursor-pointer transition-all group",
                isAnalyzingFile ? "bg-primary/5 border-primary animate-pulse" : "border-border bg-muted/20 hover:bg-primary/5 hover:border-primary/30"
              )}>
                <div className="flex flex-col items-center justify-center pt-4 pb-5">
                  {isAnalyzingFile ? (
                    <Loader2 className="w-10 h-10 text-primary animate-spin mb-3" />
                  ) : (
                    <FileUp className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors mb-3" />
                  )}
                  <p className="text-base font-bold text-muted-foreground group-hover:text-primary transition-colors">
                    {isAnalyzingFile ? "Đang trích xuất nội dung..." : t("wizard.step1.uploadFile")}
                  </p>
                  <p className="text-[10px] text-muted-foreground/50 uppercase mt-1">
                    PDF, DOCX, TXT (MAX 10MB)
                  </p>
                </div>
                {!isAnalyzingFile && (
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.docx,.txt"
                    onChange={(e) => handleFileUpload(e.target.files[0])}
                  />
                )}
              </label>
            ) : (
              <div className="space-y-4">
                <div className="bg-muted p-6 rounded-2xl border border-border relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => setWizardData(prev => ({ ...prev, analysis: null, content: "" }))}
                      className="p-2 bg-white/80 hover:bg-white rounded-full text-red-500 shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h4 className="font-black text-primary mb-3 flex items-center gap-2 text-xs uppercase tracking-widest">
                    <CheckCircle2 className="w-4 h-4" /> Tài liệu đã sẵn sàng
                  </h4>
                  <p className="text-sm font-medium leading-relaxed text-muted-foreground line-clamp-4 italic bg-white/50 p-4 rounded-xl border border-dashed border-primary/20">
                    "{wizardData.analysis.summary || "Chúng tôi đã tóm tắt được nội dung của bạn. Nhấn 'Bắt đầu tạo đề' để tiếp tục."}"
                  </p>
                  <div className="mt-4 flex gap-4">
                     <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-lg uppercase">AI Đã hiểu tài liệu</span>
                     <span className="px-3 py-1 bg-blue-500/10 text-blue-500 text-[10px] font-black rounded-lg uppercase">{wizardData.analysis.suggestedTotal || 50} Câu hỏi gợi ý</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {inlineError && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-red-500 text-sm font-bold bg-red-500/5 p-3 rounded-xl border border-red-500/20">
            <AlertCircle className="w-4 h-4" /> {inlineError}
          </motion.div>
        )}

        <div className="pt-6 space-y-8 border-t border-border border-dashed mt-4">
          {/* Row 1: Question Types (Total 50) */}
          <div className="space-y-4">
            <label className="text-xs font-black uppercase text-muted-foreground flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary" /> Thiết lập số lượng câu hỏi (Tối đa: 50)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { label: "Trắc nghiệm", key: "multipleChoice" },
                { label: "Nhiều đáp án", key: "multipleAnswer" },
                { label: "Tự luận", key: "essay" }
              ].map(type => (
                <div key={type.key} className="bg-muted/30 p-4 rounded-2xl border border-border">
                  <label className="text-[10px] font-black uppercase text-muted-foreground block mb-2">{type.label}</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="number" min="0" max="50"
                      value={wizardData.config[type.key]}
                      onChange={(e) => {
                        const val = Math.max(0, parseInt(e.target.value) || 0);
                        setWizardData(prev => ({...prev, config: { ...prev.config, [type.key]: val }}));
                      }}
                      className="w-full bg-card border border-border rounded-xl px-3 py-2 font-black text-primary focus:ring-2 focus:ring-primary/50 outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
            {wizardData.config.multipleChoice + wizardData.config.multipleAnswer + wizardData.config.essay > 50 && (
              <p className="text-[10px] text-red-500 font-bold italic">
                * Tổng loại câu đang là {wizardData.config.multipleChoice + wizardData.config.multipleAnswer + wizardData.config.essay}. Vui lòng giảm bớt để không vượt quá 50.
              </p>
            )}
            {wizardData.config.multipleChoice + wizardData.config.multipleAnswer + wizardData.config.essay !== (wizardData.config.easyCount + wizardData.config.mediumCount + wizardData.config.hardCount) && (
              <p className="text-[10px] text-orange-500 font-bold italic">
                * Tổng loại câu ({wizardData.config.multipleChoice + wizardData.config.multipleAnswer + wizardData.config.essay}) đang khác tổng độ khó ({wizardData.config.easyCount + wizardData.config.mediumCount + wizardData.config.hardCount}).
              </p>
            )}
          </div>

          {/* Row 2: Difficulty (Total 50) */}
          <div className="space-y-4">
            <label className="text-xs font-black uppercase text-muted-foreground flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" /> Phân bổ độ khó (Tổng phải khớp với loại câu)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { label: "Dễ", key: "easyCount" },
                { label: "Vừa", key: "mediumCount" },
                { label: "Khó", key: "hardCount" }
              ].map(diff => (
                <div key={diff.key} className="bg-muted/30 p-4 rounded-2xl border border-border">
                  <label className="text-[10px] font-black uppercase text-muted-foreground block mb-2">{diff.label}</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="number" min="0" max="50"
                      value={wizardData.config[diff.key]}
                      onChange={(e) => {
                        const val = Math.max(0, parseInt(e.target.value) || 0);
                        setWizardData(prev => ({...prev, config: { ...prev.config, [diff.key]: val }}));
                      }}
                      className="w-full bg-card border border-border rounded-xl px-3 py-2 font-black text-blue-500 focus:ring-2 focus:ring-blue-500/50 outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
            {wizardData.config.easyCount + wizardData.config.mediumCount + wizardData.config.hardCount > 50 && (
              <p className="text-[10px] text-red-500 font-bold italic">
                * Tổng độ khó đang là {wizardData.config.easyCount + wizardData.config.mediumCount + wizardData.config.hardCount}. Vui lòng giảm bớt để không vượt quá 50.
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end items-center pt-6">
          <button
            onClick={handleStep1Submit}
            disabled={!wizardData.content.trim() || loading || isAnalyzingFile}
            className="bg-primary text-primary-foreground px-10 py-3.5 rounded-2xl font-black flex items-center gap-2 hover:bg-primary/90 transition-all shadow-xl shadow-primary/25 disabled:opacity-50"
          >
            Bắt đầu tạo đề <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => {
    const loadingSteps = [
      { text: "Đang phân tích chủ đề...", icon: Sparkles },
      { text: "Đang soạn câu hỏi...", icon: Edit2 },
      { text: "Hoàn tất bản thảo...", icon: CheckCircle2 },
    ];

    return (
      <div className="max-w-xl mx-auto py-10">
        <div className="bg-card border border-border rounded-2xl p-8 flex flex-col items-center justify-center space-y-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-muted">
            <motion.div 
              className="h-full bg-primary shadow-[0_0_8px_#7c3aed]"
              initial={{ width: "0%" }}
              animate={{ width: `${(loadingTextIndex + 1) * 33.33}%` }}
              transition={{ duration: 1 }}
            />
          </div>

          <div className="relative">
            <div className="w-20 h-20 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
            <BrainCircuit className="w-10 h-10 text-primary absolute inset-0 m-auto animate-pulse" />
          </div>

          <div className="space-y-4 w-full max-w-xs">
            {loadingSteps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: loadingTextIndex >= idx ? 1 : 0.3 }}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl transition-all",
                  loadingTextIndex === idx && "bg-primary/5 border border-primary/20"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                  loadingTextIndex >= idx ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                )}>
                  {loadingTextIndex > idx ? <CheckCircle2 className="w-5 h-5" /> : <step.icon className={cn("w-5 h-5", loadingTextIndex === idx && "animate-bounce")} />}
                </div>
                <span className={cn("font-bold text-sm", loadingTextIndex === idx ? "text-primary" : "text-muted-foreground")}>
                  {step.text}
                </span>
              </motion.div>
            ))}
          </div>
          <p className="text-muted-foreground text-xs font-medium italic animate-pulse">Vui lòng chờ trong giây lát...</p>
        </div>
      </div>
    );
  };

  const renderStep3 = () => (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
      <div className="flex flex-col gap-6">
        {/* Exam Settings - Full Width Top */}
        <div className="bg-card border-2 border-primary/10 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold font-heading flex items-center gap-2">
              <Settings className="w-4 h-4 text-primary" /> {t("wizard.detail.config")}
            </h3>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handleSaveExam("draft")} 
                disabled={loading || savingStatus.exam === "loading"} 
                className="px-5 py-2 bg-muted text-muted-foreground hover:bg-muted/80 hover:scale-[1.02] active:scale-100 font-bold rounded-lg text-sm transition-all shadow-sm hover:shadow-md disabled:opacity-50"
              >
                {t("wizard.step6.saveDraft")}
              </button>
              <button 
                onClick={() => handleSaveExam("published")} 
                disabled={loading || savingStatus.exam === "loading" || !wizardData.metadata.title} 
                className="px-5 py-2 bg-primary text-primary-foreground font-black rounded-lg text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-100 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {savingStatus.exam === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />} 
                {t("wizard.step6.saveFinish")}
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">{t("wizard.step6.examName")}</label>
              <input 
                type="text" 
                value={wizardData.metadata.title} 
                onChange={(e) => setWizardData(prev => ({...prev, metadata: {...prev.metadata, title: e.target.value}}))} 
                placeholder={t("wizard.step6.examNamePlaceholder")}
                className="w-full bg-muted/30 border border-border rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-primary/50 outline-none" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">{t("wizard.step6.subject")}</label>
              <input 
                type="text" 
                value={wizardData.metadata.subject} 
                onChange={(e) => setWizardData(prev => ({...prev, metadata: {...prev.metadata, subject: e.target.value}}))} 
                placeholder={t("wizard.step6.subjectPlaceholder")}
                className="w-full bg-muted/30 border border-border rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-primary/50 outline-none" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">{t("wizard.step6.description")}</label>
              <input 
                type="text" 
                value={wizardData.metadata.description} 
                onChange={(e) => setWizardData(prev => ({...prev, metadata: {...prev.metadata, description: e.target.value}}))} 
                placeholder={t("wizard.step6.descriptionPlaceholder")}
                className="w-full bg-muted/30 border border-border rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-primary/50 outline-none" 
              />
            </div>
          </div>
          
          <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
            <p className="text-xs text-muted-foreground italic">
              {t("wizard.detail.noteDesc") || "Bạn có thể chỉnh sửa lại bất kỳ nội dung nào trước khi lưu chính thức."}
            </p>
          </div>

          {/* Question Bank Logic */}
          <div className="pt-4 border-t border-border/50 space-y-4">
            <div 
              onClick={() => setWizardData(prev => ({ ...prev, saveToBank: !prev.saveToBank }))}
              className={cn(
                "flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer",
                wizardData.saveToBank ? "bg-primary/5 border-primary shadow-sm" : "bg-muted/30 border-transparent hover:border-border"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                  wizardData.saveToBank ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                )}>
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-foreground">{t("wizard.saveToBank")}</h4>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">{t("wizard.saveToBankDesc")}</p>
                </div>
              </div>
              <div className={cn(
                "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                wizardData.saveToBank ? "bg-primary border-primary text-white" : "border-muted-foreground/30"
              )}>
                {wizardData.saveToBank && <CheckCircle2 className="w-4 h-4" />}
              </div>
            </div>

            <AnimatePresence>
              {wizardData.saveToBank && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden space-y-3 px-1"
                >
                  <div className="flex items-end gap-3">
                    <div className="flex-1 space-y-2">
                      <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground px-1">{t("wizard.globalTopicLabel")}</label>
                      <div className="relative group">
                        <input 
                          type="text"
                          value={wizardData.globalTopic}
                          onChange={(e) => setWizardData(prev => ({ ...prev, globalTopic: e.target.value }))}
                          placeholder="Ví dụ: Đạo hàm, Lịch sử Đảng,..."
                          className="w-full bg-muted/50 border border-border rounded-xl p-3 focus:ring-2 focus:ring-primary/50 outline-none font-bold text-sm pr-12"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                          {bankTopics.length > 0 && (
                            <div className="relative group/dropdown">
                              <div className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors cursor-pointer text-muted-foreground hover:text-primary">
                                <ChevronDown className="w-4 h-4" />
                              </div>
                              <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-2xl shadow-xl hidden group-hover/dropdown:block z-50 p-2 max-h-48 overflow-y-auto border-t-4 border-t-primary">
                                {bankTopics.map(t => (
                                  <button
                                    key={t}
                                    type="button"
                                    onClick={() => setWizardData(prev => ({ ...prev, globalTopic: t }))}
                                    className="w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-primary/10 rounded-xl transition-colors"
                                  >
                                    {t}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleSuggestGlobalTopic}
                      disabled={suggestingGlobalTopic}
                      className="h-[46px] px-4 bg-secondary text-secondary-foreground rounded-xl font-bold flex items-center gap-2 hover:bg-secondary/80 transition-all text-xs disabled:opacity-50"
                    >
                      {suggestingGlobalTopic ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      {t("wizard.aiSuggestGlobal")}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Questions List Section */}
        <div className="space-y-5">
          <div className="flex items-center justify-between px-2">
            <div>
              <h2 className="text-xl font-black text-foreground font-heading uppercase tracking-tight flex items-center gap-2">
                <span className="w-1.5 h-6 bg-primary rounded-full" />
                {t("wizard.detail.listHeader")}
              </h2>
              <p className="text-xs text-muted-foreground font-medium italic mt-0.5">
                {t("wizard.step5.generated", { count: wizardData.questions.length })}
              </p>
            </div>
            <button
              onClick={() => {
                setEditingQuestion({
                  content: "",
                  type: "multiple_choice",
                  choices: [
                    { key: "A", content: "" },
                    { key: "B", content: "" },
                    { key: "C", content: "" },
                    { key: "D", content: "" }
                  ],
                  correctAnswers: [],
                  difficulty: "medium",
                  topic: wizardData.globalTopic || ""
                });
              }}
              className="flex items-center gap-2 bg-primary text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-primary/20 hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" /> {t("wizard.detail.addQuestion")}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {wizardData.questions.map((q, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group bg-card border border-border rounded-2xl p-6 hover:border-primary/40 hover:shadow-xl transition-all relative overflow-hidden text-left"
              >
                <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/10 group-hover:bg-primary transition-colors" />
                
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-11 h-11 flex-shrink-0 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-black text-lg group-hover:scale-105 transition-transform">
                    {i + 1}
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-[10px] font-black uppercase tracking-wider border border-primary/20">
                          {q.type === "multiple_choice" ? t("wizard.step5.types.mc") : q.type === "essay" ? t("wizard.step5.types.essay") : t("wizard.step5.types.ma")}
                        </span>
                        <span className={cn(
                          "px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border",
                          q.difficulty === 'easy' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                          q.difficulty === 'hard' ? "bg-rose-500/10 text-rose-600 border-rose-500/20" :
                          "bg-amber-500/10 text-amber-600 border-amber-500/20"
                        )}>
                          {t(`wizard.step3.difficultyLevels.${q.difficulty || 'medium'}`)}
                        </span>
                      </div>
                      
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleRegenerateQuestion(i); }} 
                          title={t("common.regenerateOne")}
                          disabled={regeneratingIdx !== null}
                          className="p-2 bg-muted hover:bg-amber-500/10 text-muted-foreground hover:text-amber-500 rounded-lg transition-all border border-border disabled:opacity-50"
                        >
                          <RotateCw className={cn("w-4 h-4", regeneratingIdx === i && "animate-spin")} />
                        </button>
                        <button 
                          onClick={() => setEditingQuestion(q)} 
                          title={t("common.edit")}
                          className="p-2 bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-lg transition-all border border-border"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setDeletingIdx(i)} 
                          title={t("common.delete")}
                          className="p-2 bg-muted hover:bg-red-500/10 text-muted-foreground hover:text-red-500 rounded-lg transition-all border border-border"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <h4 className="text-xl font-bold font-heading leading-relaxed">{q.content}</h4>

                    {q.type !== "essay" && q.choices && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {q.choices.map((c, ci) => {
                          const isCorrect = q.answer === c.key || 
                                          (Array.isArray(q.answer) && q.answer.includes(c.key)) ||
                                          (Array.isArray(q.correctAnswers) && q.correctAnswers.includes(c.key)) ||
                                          q.correctAnswers === c.key;
                          return (
                            <div 
                              key={ci} 
                              className={cn(
                                "relative p-5 rounded-2xl border-2 transition-all duration-300 flex items-center gap-4 group/choice",
                                isCorrect 
                                  ? "border-emerald-500 bg-emerald-50/50 shadow-sm shadow-emerald-500/10" 
                                  : "border-border bg-muted/20 hover:border-primary/30"
                              )}
                            >
                              <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-black transition-all",
                                isCorrect ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 rotate-3" : "bg-card border border-border text-muted-foreground"
                              )}>
                                {c.key}
                              </div>
                              <span className={cn(
                                "text-base leading-relaxed",
                                isCorrect ? "font-bold text-emerald-900" : "text-foreground/80"
                              )}>
                                {c.content}
                              </span>
                              {isCorrect && (
                                <div className="absolute -top-2 -right-2 bg-emerald-500 text-white p-1 rounded-full shadow-lg border-2 border-white animate-in zoom-in duration-300">
                                  <CheckCircle className="w-4 h-4" />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {q.explanation && (
                      <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 flex gap-3 mt-3">
                        <Info className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                        <div className="space-y-0.5">
                          <p className="text-[9px] font-black uppercase tracking-widest text-primary/60">{t("wizard.questionModal.explanation")}</p>
                          <p className="text-sm text-muted-foreground italic leading-relaxed">{q.explanation}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Modal xác nhận xóa */}
      <AnimatePresence>
        {deletingIdx !== null && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-card border border-border p-6 rounded-2xl shadow-xl max-w-sm w-full text-center space-y-5">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto"><AlertCircle className="w-8 h-8" /></div>
              <h3 className="text-xl font-black">Xác nhận xóa câu hỏi?</h3>
              <p className="text-sm text-muted-foreground">Câu hỏi này sẽ bị loại bỏ khỏi đề thi hiện tại.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeletingIdx(null)} className="flex-1 py-3 bg-muted rounded-xl font-bold text-sm">Hủy</button>
                <button onClick={confirmDelete} className="flex-1 py-3 bg-red-600 text-white font-black rounded-xl text-sm">Xóa ngay</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Modal sửa câu hỏi */}
      {editingQuestion && (
        <QuestionModal
          isOpen={!!editingQuestion}
          onClose={() => setEditingQuestion(null)}
          examId="temp"
          question={editingQuestion}
          onSuccess={(updatedQ) => handleEditSave(updatedQ)}
          isAiPreview={true}
        />
      )}
    </div>
  );

  return (
    <div className="pb-20">
      <div ref={topRef} />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-card border border-border rounded-3xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => navigate("/dashboard/teacher/create-quiz")} className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors px-4 py-2 rounded-xl hover:bg-muted/50 bg-card border border-border">
              <ArrowLeft className="w-4 h-4" /> Quay lại
            </button>
            <div className="text-sm font-black text-muted-foreground uppercase tracking-widest">Bước {currentStep} / {steps.length}</div>
          </div>
          <div className="flex items-center justify-center gap-4 relative">
            <div className="absolute top-7 left-[10%] right-[10%] h-[2px] bg-muted z-0 hidden lg:block" />
            {steps.map((step) => (
              <div key={step.id} className="flex-1 flex flex-col items-center gap-1.5 relative z-10">
                <div className={cn(
                  "w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-500 border-2",
                  currentStep === step.id ? "bg-primary text-primary-foreground border-primary/20 scale-105 shadow-lg" : currentStep > step.id ? "bg-green-500 text-white border-green-500/20" : "bg-card text-muted-foreground border-transparent"
                )}>
                  <step.icon size={20} />
                </div>
                <span className={cn("text-[9px] font-black uppercase tracking-tighter hidden lg:block transition-colors", currentStep === step.id ? "text-primary" : "text-muted-foreground")}>{step.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </motion.div>
        </AnimatePresence>
      </div>

      {error && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-card border-2 border-red-500/20 p-8 rounded-[2.5rem] shadow-2xl max-w-md w-full text-center space-y-6">
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mx-auto">
              <AlertCircle className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-red-600">Úi, có lỗi rồi!</h3>
            <p className="text-muted-foreground font-medium leading-relaxed">
              {error}
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => {
                  setError("");
                  if (currentStep === 1) {
                    setWizardData(prev => ({ ...prev, analysis: null, content: "" }));
                  }
                }} 
                className="flex-1 py-4 bg-red-600 text-white font-black rounded-2xl shadow-lg shadow-red-500/20 hover:bg-red-700 transition-all"
              >
                Tải lại / Thử lại
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
