import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Layout,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Settings,
  Eye,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileUp,
  Type,
  BrainCircuit,
  BarChart3,
  Wand2,
  Plus,
  Trash2,
  Edit2,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "../../../lib/utils";
import { analyzeContent, generateQuestions } from "../../../api/aiApi";
import { createExam, saveBatchQuestions } from "../../../api/examApi";
import QuestionModal from "../../../components/dashboard/QuestionModal";
import { generateQuestions as generateOneQuestion } from "../../../api/aiApi";

const getSteps = (t) => [
  { id: 1, title: t("wizard.steps.input"), icon: FileText },
  { id: 2, title: t("wizard.steps.analysis"), icon: BrainCircuit },
  { id: 3, title: t("wizard.steps.config"), icon: Settings },
  { id: 4, title: t("wizard.steps.generation"), icon: Wand2 },
  { id: 5, title: t("wizard.steps.preview"), icon: Eye },
  { id: 6, title: t("wizard.steps.finalize"), icon: Save },
];

export default function AiCreateExam() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const steps = getSteps(t);
  const [currentStep, setCurrentStep] = useState(1);
  const [skipConfigStep, setSkipConfigStep] = useState(false); // Track if user skipped Step 3
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Toàn bộ data cho wizard
  const [wizardData, setWizardData] = useState({
    // Step 1
    inputType: "document", // "document" | "topic"
    content: "",

    // Step 2 & 3 (Results from AI analysis & Config)
    analysis: null,
    config: {
      multipleChoice: 0,
      multipleAnswer: 0,
      essay: 0,
      difficulty: "easy", // "easy" | "medium" | "hard" | "mixed"
      easyPercent: 100,
      mediumPercent: 0,
      hardPercent: 0,
    },

    // Step 4 & 5 (Generated items)
    questions: [],

    // Step 6 (Final Metadata)
    metadata: {
      title: "",
      subject: "",
      description: "",
    },
  });

  const [savingStatus, setSavingStatus] = useState({
    exam: "pending", // "pending" | "loading" | "success" | "error"
    questions: "pending",
  });

  const [editingQuestion, setEditingQuestion] = useState(null);
  const [showGenerateMore, setShowGenerateMore] = useState(false);
  const [generateMoreCount, setGenerateMoreCount] = useState(1);
  const [generateMoreConfig, setGenerateMoreConfig] = useState({
    type: "multiple_choice",
    difficulty: "medium",
  });
  const [activePreset, setActivePreset] = useState("custom");
  const [deletingIdx, setDeletingIdx] = useState(null);
  const [regeneratingIdx, setRegeneratingIdx] = useState(null);
  const [isGeneratingMore, setIsGeneratingMore] = useState(false);
  const step4Ref = useRef(null);

  const nextStep = () =>
    setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  const prevStep = () => {
    if (currentStep === 5 && skipConfigStep) {
      setCurrentStep(2);
    } else {
      setCurrentStep((prev) => Math.max(prev - 1, 1));
    }
  };

  // ===== LOGIC TỪNG BƯỚC =====

  // Step 1: Submit Content
  const handleStep1Submit = () => {
    if (!wizardData.content.trim()) return;
    
    // Refresh/Reset data when content changes to avoid using old analysis
    setWizardData(prev => ({
      ...prev,
      analysis: null,
      questions: [],
      config: {
        multipleChoice: 0,
        multipleAnswer: 0,
        essay: 0,
        difficulty: "easy",
        easyPercent: 100,
        mediumPercent: 0,
        hardPercent: 0,
      }
    }));

    if (wizardData.inputType === "topic") {
      setCurrentStep(3); // Topic skip step 2
    } else {
      nextStep();
    }
  };

  // Step 2: AI Analyze logic
  useEffect(() => {
    if (currentStep === 2 && !wizardData.analysis && !loading) {
      handleAnalyze();
    }
  }, [currentStep]);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setSkipConfigStep(false); // Reset on new analysis
    try {
      const res = await analyzeContent({
        inputType: wizardData.inputType,
        content: wizardData.content,
      });
      setWizardData((prev) => ({
        ...prev,
        analysis: res.data,
        config: {
          ...prev.config,
          multipleChoice: Math.min(res.data.suggestedMultipleChoice || 5, 50),
          multipleAnswer: 0,
          essay: Math.min(res.data.suggestedEssay || 0, 10),
          difficulty: res.data.suggestedDifficulty || "medium",
        },
        metadata: {
          ...prev.metadata,
          title: prev.metadata.title || res.data.suggestedTitle || (res.data.detectedTopics?.[0] ? `${t("wizard.step6.examName")} #1: ${res.data.detectedTopics[0]}` : t("wizard.step6.examNamePlaceholder").split(":")[0])
        }
      }));
    } catch (err) {
      setError(t("wizard.step2.error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentStep === 4 && !loading) {
      handleGenerate();
    }
    if (currentStep === 4 || (currentStep === 4 && loading)) {
      setTimeout(() => {
        step4Ref.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 600);
    }
  }, [currentStep, loading]);

  // Step 4: Generate Questions Logic
  const handleGenerate = async () => {
    try {
      setLoading(true);
      // Clear old questions to avoid UI issues and ensure fresh state
      setWizardData(prev => ({ ...prev, questions: [] }));
      
      const res = await generateQuestions({
        content: wizardData.content,
        ...wizardData.config,
      });
      setWizardData((prev) => ({ ...prev, questions: res.data }));
      setCurrentStep(5);
    } catch (err) {
      alert(t("wizard.step4.error"));
      setCurrentStep(3);
    } finally {
      setLoading(false);
    }
  };

  // Step 6: Save logic
  const handleSaveExam = async (status = "published") => {
    setSavingStatus({ exam: "loading", questions: "pending" });
    try {
      // 1. Tạo đề thi
      const examPayload = {
        title: wizardData.metadata.title,
        description: wizardData.metadata.description,
        subject:
          wizardData.metadata.subject ||
          wizardData.analysis?.detectedTopics?.[0] ||
          t("wizard.list.unclassified"),
      };

      const examRes = await createExam(examPayload);
      const examId = examRes.data.id;
      setSavingStatus((prev) => ({
        ...prev,
        exam: "success",
        questions: "loading",
      }));

      // 2. Lưu câu hỏi
      await saveBatchQuestions(examId, wizardData.questions);
      setSavingStatus((prev) => ({ ...prev, questions: "success" }));

      setTimeout(
        () => navigate(`/dashboard/teacher/my-quizzes/${examId}`),
        1500,
      );
    } catch (err) {
      setError(err.response?.data?.message || err.message || t("wizard.step6.saving.error"));
      setSavingStatus((prev) => ({
        ...prev,
        exam: prev.exam === "success" ? "success" : "error",
        questions: prev.questions === "loading" ? "error" : "pending",
      }));
    }
  };

  const handleRegenerateOne = async (idx) => {
    setRegeneratingIdx(idx);
    try {
      const q = wizardData.questions[idx];
      const res = await generateOneQuestion({
        content: wizardData.content,
        multipleChoice: q.type === "multiple_choice" ? 1 : 0,
        multipleAnswer: q.type === "multiple_answer" ? 1 : 0,
        essay: q.type === "essay" ? 1 : 0,
        difficulty: q.difficulty,
      });
      if (res.data && res.data[0]) {
        const newQuestions = [...wizardData.questions];
        newQuestions[idx] = res.data[0];
        setWizardData((prev) => ({ ...prev, questions: newQuestions }));
      }
    } catch (err) {
      alert(t("wizard.step5.modal.error"));
    } finally {
      setRegeneratingIdx(null);
    }
  };

  const handleDeleteQuestion = (idx) => {
    setDeletingIdx(idx);
  };

  const confirmDelete = () => {
    if (deletingIdx === null) return;
    setWizardData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== deletingIdx),
    }));
    setDeletingIdx(null);
  };

  const handleEditSave = (updatedQ) => {
    if (window.confirm(t("wizard.common.editConfirm"))) {
      const newQuestions = [...wizardData.questions];
      const idx = wizardData.questions.findIndex((q) => q === editingQuestion);
      if (idx !== -1) {
        newQuestions[idx] = updatedQ;
        setWizardData((prev) => ({ ...prev, questions: newQuestions }));
      }
      setEditingQuestion(null);
    }
  };

  // ===== RENDER TỪNG STEP =====

  const renderStep1 = () => (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          onClick={() =>
            setWizardData({ ...wizardData, inputType: "document" })
          }
          className={`cursor-pointer p-8 rounded-3xl border-2 transition-all group ${wizardData.inputType === "document" ? "border-primary bg-primary/5 shadow-xl" : "border-border bg-card hover:border-primary/30"}`}
        >
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${wizardData.inputType === "document" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"}`}
          >
            <FileUp className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold mb-2">{t("wizard.step1.document")}</h3>
          <p className="text-muted-foreground">
            {t("wizard.step1.documentDesc")}
          </p>
        </div>
        <div
          onClick={() => setWizardData({ ...wizardData, inputType: "topic" })}
          className={`cursor-pointer p-8 rounded-3xl border-2 transition-all group ${wizardData.inputType === "topic" ? "border-primary bg-primary/5 shadow-xl" : "border-border bg-card hover:border-primary/30"}`}
        >
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${wizardData.inputType === "topic" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"}`}
          >
            <Type className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold mb-2">{t("wizard.step1.topic")}</h3>
          <p className="text-muted-foreground">
            {t("wizard.step1.topicDesc")}
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-3xl p-8 space-y-4 shadow-lg">
        <label className="text-lg font-bold flex items-center gap-2">
          {wizardData.inputType === "document" ? (
            <FileText className="w-5 h-5 text-primary" />
          ) : (
            <Sparkles className="w-5 h-5 text-primary" />
          )}
          {wizardData.inputType === "document"
            ? t("wizard.step1.contentLabel")
            : t("wizard.step1.topicLabel")}
        </label>
        <textarea
          rows={6}
          value={wizardData.content}
          onChange={(e) =>
            setWizardData({ ...wizardData, content: e.target.value })
          }
          placeholder={
            wizardData.inputType === "document"
              ? t("wizard.step1.placeholderDoc")
              : t("wizard.step1.placeholderTopic")
          }
          className="w-full bg-muted/30 border border-border rounded-2xl p-6 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-heading text-lg leading-relaxed resize-none"
        />

        {wizardData.inputType === "document" && (
          <div className="pt-4 border-t border-border border-dashed">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-2xl cursor-pointer hover:bg-muted/30 transition-all group">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <FileUp className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors mb-2" />
                <p className="text-sm font-bold text-muted-foreground group-hover:text-primary transition-colors">
                  {t("wizard.step1.uploadFile")}
                </p>
                <p className="text-[10px] text-muted-foreground/50 uppercase mt-1">
                  {t("wizard.step1.limit")}
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.txt"
                onChange={(e) =>
                  alert(
                    "Tính năng trích xuất văn bản từ file đang được phát triển. Vui lòng dán nội dung trực tiếp.",
                  )
                }
              />
            </label>
          </div>
        )}
        <div className="flex justify-between items-center pt-4">
          <p className="text-sm text-muted-foreground">
            {t("wizard.step1.characters")}: {wizardData.content.length}
          </p>
          <button
            onClick={handleStep1Submit}
            disabled={!wizardData.content.trim()}
            className="bg-primary text-primary-foreground px-8 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 disabled:opacity-50"
          >
            {t("wizard.step1.next")} <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="max-w-4xl mx-auto space-y-8">
      {loading ? (
        <div className="bg-card border border-border rounded-3xl p-20 flex flex-col items-center justify-center space-y-6 text-center">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <BrainCircuit className="w-10 h-10 text-primary absolute inset-0 m-auto animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-black mb-2">
              {t("wizard.step2.analyzing")}
            </h2>
              <p className="text-muted-foreground font-medium animate-pulse">
                {t("wizard.step4.loading")}
              </p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-500/5 border-2 border-red-500/20 rounded-3xl p-12 text-center text-red-500 space-y-4">
          <AlertCircle className="w-16 h-16 mx-auto" />
          <p className="text-xl font-bold">{error}</p>
          <button
            onClick={handleAnalyze}
            className="px-8 py-2 bg-red-500 text-white rounded-xl font-bold"
          >
            {t("wizard.step2.retry")}
          </button>
        </div>
      ) : (
        wizardData.analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
              
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-16">
                <div className="flex flex-col items-center justify-center p-8 bg-primary/10 rounded-[2rem] min-w-[200px]">
                  <p className="text-sm text-primary uppercase tracking-widest font-black mb-2">
                    {t("wizard.step2.suggestedTotal")}
                  </p>
                  <p className="text-6xl font-black text-primary">
                    {wizardData.config.multipleChoice + wizardData.config.multipleAnswer + wizardData.config.essay}
                  </p>
                </div>

                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-8 w-full">
                  <div className="space-y-4">
                    <p className="text-xs font-black uppercase text-muted-foreground tracking-wider border-b border-border pb-2">
                      {t("wizard.questionModal.type")}
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center bg-muted/30 p-3 rounded-xl">
                        <span className="text-sm font-bold">{t("wizard.step5.types.mc")}</span>
                        <span className="bg-primary text-primary-foreground px-3 py-1 rounded-lg text-xs font-black">{wizardData.config.multipleChoice}</span>
                      </div>
                      <div className="flex justify-between items-center bg-muted/30 p-3 rounded-xl text-muted-foreground opacity-60">
                        <span className="text-sm font-bold">{t("wizard.step5.types.ma")}</span>
                        <span className="bg-muted text-muted-foreground px-3 py-1 rounded-lg text-xs font-black">{wizardData.config.multipleAnswer}</span>
                      </div>
                      <div className="flex justify-between items-center bg-muted/30 p-3 rounded-xl">
                        <span className="text-sm font-bold">{t("wizard.step5.types.essay")}</span>
                        <span className="bg-primary text-primary-foreground px-3 py-1 rounded-lg text-xs font-black">{wizardData.config.essay}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-xs font-black uppercase text-muted-foreground tracking-wider border-b border-border pb-2">
                      {t("wizard.step3.difficulty")}
                    </p>
                    <div className="pt-2">
                      <p className="text-3xl font-black text-primary uppercase tracking-tight">
                        {t(`wizard.step3.difficultyLevels.${wizardData.config.difficulty || 'medium'}`)}
                      </p>
                      <p className="text-xs text-muted-foreground italic mt-2">
                        {t("wizard.step2.suggestedDesc")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
              <p className="text-sm text-muted-foreground uppercase tracking-widest font-black mb-2">
                {t("wizard.step2.detectedTopics")}
              </p>
              <div className="flex flex-wrap gap-2">
                {wizardData.analysis.detectedTopics.map((t, i) => (
                  <span
                    key={i}
                    className="px-4 py-1.5 bg-primary/10 text-primary rounded-xl font-bold text-sm"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-3xl p-8 space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-2">{t("wizard.step2.summary")}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {wizardData.analysis.summary}
                </p>
              </div>

              <div className="pt-6 border-t border-border flex justify-end gap-4">
                <button
                  onClick={() => setCurrentStep(3)}
                  className="px-8 py-3 bg-muted rounded-2xl font-bold"
                >
                  {t("wizard.step2.customConfig")}
                </button>
                <button
                  onClick={() => {
                    setSkipConfigStep(true);
                    setWizardData(prev => ({ ...prev, questions: [] }));
                    setCurrentStep(4);
                  }}
                  className="px-8 py-3 bg-primary text-primary-foreground rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                >
                  {t("wizard.step2.useSuggestions")}
                </button>
              </div>
            </div>
          </motion.div>
        )
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            id: "mc",
            title: t("wizard.step3.mc"),
            desc: t("wizard.step3.mcDesc"),
            presets: { mc: 10, ma: 0, es: 0 },
          },
          {
            id: "basic",
            title: t("wizard.step3.basic"),
            desc: t("wizard.step3.basicDesc"),
            presets: { mc: 7, ma: 3, es: 0 },
          },
          {
            id: "adv",
            title: t("wizard.step3.adv"),
            desc: t("wizard.step3.advDesc"),
            presets: { mc: 6, ma: 2, es: 2 },
          },
          {
            id: "custom",
            title: t("wizard.step3.custom"),
            desc: t("wizard.step3.customDesc"),
            presets: null,
          },
        ].map((p) => (
          <div
            key={p.id}
            onClick={() => {
              if (p.presets) {
                setWizardData({
                  ...wizardData,
                  config: {
                    ...wizardData.config,
                    multipleChoice: p.presets.mc,
                    multipleAnswer: p.presets.ma,
                    essay: p.presets.es,
                  },
                });
                setActivePreset(p.id);
              } else {
                setActivePreset("custom");
              }
            }}
            className={cn(
              "bg-card border-2 p-5 rounded-3xl cursor-pointer transition-all text-center space-y-1 hover:shadow-md",
              activePreset === p.id
                ? "border-primary shadow-lg bg-primary/5"
                : "border-border hover:border-primary/30",
            )}
          >
            <p className="font-bold text-sm">{p.title}</p>
            <p className="text-[10px] text-muted-foreground uppercase">
              {p.desc}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card border border-border rounded-3xl p-8 space-y-8 shadow-sm">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" /> {t("wizard.step3.qCount")} ({t("wizard.step3.max")} 50)
          </h3>

          <div className="space-y-6">
            {[
              {
                id: "multipleChoice",
                label: t("wizard.step3.mcLabel"),
                color: "bg-blue-500",
                accent: "accent-blue-500",
              },
              {
                id: "multipleAnswer",
                label: t("wizard.step3.maLabel"),
                color: "bg-amber-500",
                accent: "accent-amber-500",
              },
              {
                id: "essay",
                label: t("wizard.step3.essayLabel"),
                color: "bg-emerald-500",
                accent: "accent-emerald-500",
              },
            ].map((type) => {
              const totalOthers =
                wizardData.config.multipleChoice +
                wizardData.config.multipleAnswer +
                wizardData.config.essay -
                wizardData.config[type.id];
              const maxForThis = 50 - totalOthers;

              return (
                <div key={type.id} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-muted-foreground">
                      {type.label}
                    </label>
                    <span
                      className={`text-lg font-black ${wizardData.config[type.id] > 0 ? "text-primary" : "text-muted-foreground"}`}
                    >
                      {wizardData.config[type.id]} {t("wizard.step3.totalQ").toLowerCase().split(" ")[2]}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={50}
                    value={wizardData.config[type.id]}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (totalOthers + val <= 50) {
                        setWizardData({
                          ...wizardData,
                          config: { ...wizardData.config, [type.id]: val },
                        });
                        setActivePreset("custom");
                      }
                    }}
                    className={`w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer ${type.accent}`}
                  />
                  <div className="flex justify-between text-[10px] font-bold text-muted-foreground/50">
                    <span>0</span>
                    <span>{t("wizard.step3.maxAdd")}: {maxForThis}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-border">
            <div className="flex justify-between items-center mb-2">
              <p className="font-bold">{t("wizard.step3.totalQ")}</p>
              <p
                className={`text-3xl font-black ${wizardData.config.multipleChoice + wizardData.config.multipleAnswer + wizardData.config.essay > 0 ? "text-primary" : "text-muted-foreground"}`}
              >
                {wizardData.config.multipleChoice +
                  wizardData.config.multipleAnswer +
                  wizardData.config.essay}{" "}
                <span className="text-sm text-muted-foreground">/ 50</span>
              </p>
            </div>
            <div className="h-3 w-full bg-muted rounded-full overflow-hidden flex">
              <div
                style={{
                  width: `${(wizardData.config.multipleChoice / 50) * 100}%`,
                }}
                className="bg-blue-500 transition-all duration-500"
              />
              <div
                style={{
                  width: `${(wizardData.config.multipleAnswer / 50) * 100}%`,
                }}
                className="bg-amber-500 transition-all duration-500"
              />
              <div
                style={{ width: `${(wizardData.config.essay / 50) * 100}%` }}
                className="bg-emerald-500 transition-all duration-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-3xl p-8 space-y-8 shadow-sm">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-primary" /> Độ khó
          </h3>

          <div className="flex flex-wrap gap-3">
            {["easy", "medium", "hard", "mixed"].map((d) => (
              <button
                key={d}
                onClick={() => {
                  setWizardData({
                    ...wizardData,
                  config: { ...wizardData.config, difficulty: d },
                  });
                  setActivePreset("custom");
                }}
                className={`flex-1 py-3 rounded-2xl font-bold capitalize transition-all ${wizardData.config.difficulty === d ? "bg-primary text-primary-foreground shadow-lg" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
              >
                {d === "easy"
                  ? t("wizard.step3.difficultyLevels.easy")
                  : d === "medium"
                    ? t("wizard.step3.difficultyLevels.medium")
                    : d === "hard"
                      ? t("wizard.step3.difficultyLevels.hard")
                      : t("wizard.step3.difficultyLevels.mixed")}
              </button>
            ))}
          </div>

          {wizardData.config.difficulty === "mixed" && (
            <div className="space-y-6 pt-4 animate-in slide-in-from-top duration-500">
              {[
                {
                  id: "easyPercent",
                  label: t("wizard.step3.difficultyLevels.easy"),
                  color: "text-green-500",
                  bg: "accent-green-500",
                },
                {
                  id: "mediumPercent",
                  label: t("wizard.step3.difficultyLevels.medium"),
                  color: "text-yellow-500",
                  bg: "accent-yellow-500",
                },
                {
                  id: "hardPercent",
                  label: t("wizard.step3.difficultyLevels.hard"),
                  color: "text-red-500",
                  bg: "accent-red-500",
                },
              ].map((p) => {
                const totalOthers =
                  wizardData.config.easyPercent +
                  wizardData.config.mediumPercent +
                  wizardData.config.hardPercent -
                  wizardData.config[p.id];
                const maxVal = 100 - totalOthers;

                return (
                  <div key={p.id} className="space-y-2">
                    <div className="flex justify-between items-center text-sm font-bold">
                      <span className={p.color}>{p.label}</span>
                      <span className="font-black">
                        {wizardData.config[p.id]}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={100}
                      value={wizardData.config[p.id]}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (totalOthers + val <= 100) {
                          setWizardData({
                            ...wizardData,
                            config: { ...wizardData.config, [p.id]: val },
                          });
                        }
                      }}
                      className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-muted ${p.bg}`}
                    />
                    <div className="flex justify-between px-1 text-[10px] font-bold text-muted-foreground/40">
                      {[0, 20, 40, 60, 80, 100].map((v) => (
                        <span key={v}>{v}%</span>
                      ))}
                    </div>
                  </div>
                );
              })}
              <p
                className={`text-center font-black ${wizardData.config.easyPercent + wizardData.config.mediumPercent + wizardData.config.hardPercent === 100 ? "text-green-500" : "text-red-500"}`}
              >
                {t("wizard.step3.totalRatio")}:{" "}
                {wizardData.config.easyPercent +
                  wizardData.config.mediumPercent +
                  wizardData.config.hardPercent}
                %{" "}
                {wizardData.config.easyPercent +
                  wizardData.config.mediumPercent +
                  wizardData.config.hardPercent !==
                  100 && t("wizard.step3.mustBe100")}
              </p>
            </div>
          )}

          <div className="pt-10 flex gap-4">
            <button
              onClick={prevStep}
              className="flex-1 px-8 py-3 bg-muted rounded-2xl font-bold"
            >
              {t("wizard.step3.back")}
            </button>
            <button
              onClick={() => {
                setWizardData((prev) => ({ ...prev, questions: [] }));
                nextStep();
              }}
              disabled={
                wizardData.config.difficulty === "mixed" &&
                wizardData.config.easyPercent +
                  wizardData.config.mediumPercent +
                  wizardData.config.hardPercent !==
                  100
              }
              className="flex-[2] px-8 py-3 bg-primary text-primary-foreground rounded-2xl font-black shadow-lg shadow-primary/20 transition-all hover:-translate-y-1 active:translate-y-0"
            >
              {t("wizard.step3.generate")} <ChevronRight className="w-5 h-5 inline ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="max-w-4xl mx-auto py-12 scroll-mt-32" ref={step4Ref}>
      <div className="bg-card border border-border rounded-[3rem] p-20 flex flex-col items-center justify-center space-y-8 text-center shadow-2xl">
        <div className="relative">
          <div className="w-32 h-32 border-[6px] border-primary/10 border-t-primary rounded-full animate-spin" />
          <Wand2 className="w-14 h-14 text-primary absolute inset-0 m-auto animate-pulse" />
        </div>
        <div>
          <h2 className="text-3xl font-black mb-3 font-heading tracking-tight">
            {t("wizard.step4.generating")}
          </h2>
          <p className="text-muted-foreground text-xl max-w-md mx-auto">
            {t("wizard.step4.generatingDesc")}
          </p>
        </div>

        <div className="w-72 space-y-4 mx-auto bg-muted/20 p-6 rounded-3xl border border-border">
          {[
            {
              label: t("wizard.step4.generatingContent"),
              done: wizardData.questions.length > 0,
              active: loading
            },
            {
              label: t("wizard.step4.qualityCheck"),
              done: wizardData.questions.length > 0,
            },
          ].map((item, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-3 transition-all duration-500 ${item.done ? "opacity-100 text-green-500" : item.active ? "opacity-100 text-primary" : "opacity-30"}`}
              >
                {item.done ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </motion.div>
                ) : item.active ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-muted border border-border" />
                )}
                <span className="text-sm font-bold">{item.label}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-card border border-border p-6 rounded-3xl sticky top-4 z-[25] shadow-lg">
        <div>
          <h3 className="text-xl font-bold bg-primary/10 text-primary px-6 py-2 rounded-2xl w-fit">
            {t("wizard.step5.generated", { count: wizardData.questions.length })}
          </h3>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setCurrentStep(3)}
            className="px-6 py-2.5 bg-muted rounded-xl font-bold hover:bg-muted/80 transition-all"
          >
            {t("wizard.step5.backEdit")}
          </button>
          <button
            onClick={nextStep}
            className="px-8 py-2.5 bg-primary text-primary-foreground rounded-xl font-black shadow-lg shadow-primary/20"
          >
            {t("wizard.step5.continue")} <ChevronRight className="w-5 h-5 inline ml-1" />
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {wizardData.questions.map((q, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group bg-card border border-border rounded-[2rem] overflow-hidden hover:border-primary transition-all p-8 flex gap-8 shadow-sm relative"
          >
            {/* Regenerate Button Overlay */}
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              {regeneratingIdx === idx ? (
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                </div>
              ) : (
                <button
                  onClick={() => handleRegenerateOne(idx)}
                  className="p-2 bg-card border border-border rounded-xl shadow-sm text-primary hover:bg-primary hover:text-white transition-all opacity-0 group-hover:opacity-100"
                  title={t("common.regenerateOne")}
                >
                  <Wand2 className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={() => setEditingQuestion(q)}
                className="p-2 bg-card border border-border rounded-xl shadow-sm text-blue-600 hover:bg-blue-600 hover:text-white transition-all opacity-0 group-hover:opacity-100"
              >
                <Edit2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleDeleteQuestion(idx)}
                className="p-2 bg-card border border-border rounded-xl shadow-sm text-red-600 hover:bg-red-600 hover:text-white transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            {regeneratingIdx === idx && (
              <div className="absolute inset-0 bg-card/60 backdrop-blur-[1px] z-20 flex items-center justify-center rounded-[2rem]">
                <div className="bg-background/80 p-4 rounded-2xl shadow-xl flex items-center gap-3">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                  <span className="font-bold text-sm">
                    {t("wizard.step5.regenerating")}
                  </span>
                </div>
              </div>
            )}

            <div className="w-12 h-12 flex-shrink-0 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-black text-xl">
              {idx + 1}
            </div>
            <div className="flex-1 space-y-6">
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-muted rounded-lg text-[10px] font-black uppercase tracking-wider">
                  {q.type === "multiple_choice"
                    ? t("wizard.step5.types.mc")
                    : q.type === "multiple_answer"
                      ? t("wizard.step5.types.ma")
                      : t("wizard.step5.types.essay")}
                </span>
                <span
                  className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${q.difficulty === "easy" ? "bg-green-500/10 text-green-500" : q.difficulty === "hard" ? "bg-red-500/10 text-red-500" : "bg-yellow-500/10 text-yellow-500"}`}
                >
                  {t(`wizard.step3.difficultyLevels.${q.difficulty}`)}
                </span>
              </div>

              <h4 className="text-xl font-bold font-heading leading-snug">
                {q.content}
              </h4>

              {q.choices && q.choices.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {q.choices.map((c, i) => (
                    <div
                      key={i}
                      className={`p-4 rounded-[1.5rem] border-2 transition-all flex items-start gap-4 ${q.correctAnswers.includes(c.key) ? "border-green-500/50 bg-green-500/5 shadow-sm shadow-green-500/10" : "border-border hover:border-primary/30"}`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center font-black text-sm transition-colors ${q.correctAnswers.includes(c.key) ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"}`}
                      >
                        {c.key}
                      </div>
                      <div className="flex-1 pt-2 font-medium leading-relaxed">
                        {c.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {q.type === "essay" && q.sampleAnswer && (
                <div className="p-4 bg-muted/30 rounded-2xl border border-dashed border-border italic text-muted-foreground">
                  <span className="font-bold text-primary not-italic">
                    {t("wizard.step5.sampleAnswer")}:
                  </span>{" "}
                  {q.sampleAnswer}
                </div>
              )}

              <div className="pt-6 border-t border-border flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="text-sm text-muted-foreground italic flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />{" "}
                  {q.explanation || t("wizard.step5.noExplanation")}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col items-center py-12 gap-4">
        <button
          onClick={() => setShowGenerateMore(true)}
          className="flex items-center gap-2 px-8 py-4 bg-muted text-foreground rounded-2xl font-black border border-border border-dashed hover:border-primary transition-all"
        >
          <Plus className="w-6 h-6" /> {t("wizard.step5.generateMore")}
        </button>
      </div>

      {/* Popup Sinh thêm */}
      <AnimatePresence>
        {showGenerateMore && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-card border border-border p-8 rounded-[2.5rem] shadow-2xl max-w-md w-full space-y-6"
            >
              <h3 className="text-2xl font-black font-heading tracking-tight text-center">
                {t("wizard.step5.modal.title")}
              </h3>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase text-muted-foreground px-1">
                    {t("wizard.step5.modal.type")}
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { id: "multiple_choice", label: t("wizard.step5.types.mc") },
                      { id: "multiple_answer", label: t("wizard.step5.types.ma") },
                      { id: "essay", label: t("wizard.step5.types.essay") },
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() =>
                          setGenerateMoreConfig({
                            ...generateMoreConfig,
                            type: t.id,
                          })
                        }
                        className={`p-3 rounded-xl border-2 text-sm font-bold transition-all ${generateMoreConfig.type === t.id ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/30"}`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black uppercase text-muted-foreground px-1">
                    {t("wizard.step5.modal.difficulty")}
                  </label>
                  <div className="flex gap-2">
                    {["easy", "medium", "hard"].map((d) => (
                      <button
                        key={d}
                        onClick={() =>
                          setGenerateMoreConfig({
                            ...generateMoreConfig,
                            difficulty: d,
                          })
                        }
                        className={`flex-1 p-3 rounded-xl border-2 text-xs font-bold capitalize transition-all ${generateMoreConfig.difficulty === d ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/30"}`}
                      >
                        {t(`wizard.step3.difficultyLevels.${d}`)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black uppercase text-muted-foreground px-1 flex justify-between">
                    <span>{t("wizard.step5.modal.count")}</span>
                    <span className="text-primary">{generateMoreCount}</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max={Math.max(1, 50 - wizardData.questions.length)}
                    value={generateMoreCount}
                    onChange={(e) =>
                      setGenerateMoreCount(parseInt(e.target.value))
                    }
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowGenerateMore(false)}
                  disabled={isGeneratingMore}
                  className="flex-1 py-4 bg-muted font-bold rounded-2xl"
                >
                  {t("wizard.step5.modal.cancel")}
                </button>
                <button
                  onClick={async () => {
                    if (generateMoreCount > 50 - wizardData.questions.length) {
                      alert(
                        `Chỉ có thể sinh thêm tối đa ${50 - wizardData.questions.length} câu.`,
                      );
                      return;
                    }
                    setIsGeneratingMore(true);
                    try {
                      const res = await generateQuestions({
                        content: wizardData.content,
                        multipleChoice:
                          generateMoreConfig.type === "multiple_choice"
                            ? generateMoreCount
                            : 0,
                        multipleAnswer:
                          generateMoreConfig.type === "multiple_answer"
                            ? generateMoreCount
                            : 0,
                        essay:
                          generateMoreConfig.type === "essay"
                            ? generateMoreCount
                            : 0,
                        difficulty: generateMoreConfig.difficulty,
                      });
                      setWizardData((prev) => ({
                        ...prev,
                        questions: [...prev.questions, ...res.data],
                      }));
                      setShowGenerateMore(false);
                    } catch (err) {
                      alert("Lỗi khi sinh thêm câu hỏi");
                    } finally {
                      setIsGeneratingMore(false);
                    }
                  }}
                  disabled={isGeneratingMore}
                  className="flex-[2] py-4 bg-primary text-primary-foreground font-black rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isGeneratingMore ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    t("wizard.step5.modal.start")
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Sửa câu hỏi */}
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

      {/* Modal Xác nhận xóa */}
      <AnimatePresence>
        {deletingIdx !== null && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-card border border-border p-8 rounded-[2.5rem] shadow-2xl max-w-md w-full text-center space-y-6"
            >
              <div className="w-20 h-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-2xl font-black font-heading mb-2">
                  {t("wizard.step5.deleteConfirm.title")}
                </h3>
                <p className="text-muted-foreground">
                  {t("wizard.step5.deleteConfirm.desc", { index: deletingIdx + 1 })}
                </p>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setDeletingIdx(null)}
                  className="flex-1 py-4 bg-muted rounded-2xl font-bold hover:bg-muted/80 transition-all"
                >
                  {t("wizard.step5.deleteConfirm.cancel")}
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-4 bg-red-600 text-white font-black rounded-2xl shadow-lg shadow-red-200 hover:bg-red-700 transition-all"
                >
                  {t("wizard.step5.deleteConfirm.confirm")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderStep6 = () => (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="bg-card border border-border rounded-[2.5rem] p-10 space-y-8 shadow-sm">
        <h3 className="text-2xl font-black font-heading mb-6 flex items-center gap-3">
          <Save className="w-8 h-8 text-primary" /> {t("wizard.step6.title")}
        </h3>
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-black uppercase text-muted-foreground flex items-center gap-2 px-1">
              {t("wizard.step6.examName")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={wizardData.metadata.title}
              onChange={(e) =>
                setWizardData({
                  ...wizardData,
                  metadata: { ...wizardData.metadata, title: e.target.value },
                })
              }
              placeholder={t("wizard.step6.examNamePlaceholder")}
              className="w-full bg-muted/30 border border-border rounded-2xl p-4 focus:ring-2 focus:ring-primary/50 outline-none font-black text-xl font-heading"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-sm font-black uppercase text-muted-foreground flex items-center gap-2 px-1">
                {t("wizard.step6.subject")}
              </label>
              <input
                type="text"
                value={wizardData.metadata.subject}
                onChange={(e) =>
                  setWizardData({
                    ...wizardData,
                    metadata: {
                      ...wizardData.metadata,
                      subject: e.target.value,
                    },
                  })
                }
                placeholder={t("wizard.step6.subjectPlaceholder")}
                className="w-full bg-muted/30 border border-border rounded-2xl p-4 outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="space-y-3">
              <label className="text-sm font-black uppercase text-muted-foreground flex items-center gap-2 px-1">
                {t("wizard.step6.description")}
              </label>
              <input
                type="text"
                value={wizardData.metadata.description}
                onChange={(e) =>
                  setWizardData({
                    ...wizardData,
                    metadata: {
                      ...wizardData.metadata,
                      description: e.target.value,
                    },
                  })
                }
                placeholder={t("wizard.step6.descriptionPlaceholder")}
                className="w-full bg-muted/30 border border-border rounded-2xl p-4 outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-[2.5rem] p-8 space-y-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />

        <h3 className="text-xl font-bold font-heading">Trạng thái lưu trữ</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl">
            <div className="flex items-center gap-4">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${savingStatus.exam === "success" ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"}`}
              >
                {savingStatus.exam === "loading" ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-5 h-5" />
                )}
              </div>
              <span className="font-bold">{t("wizard.step6.saving.exam")}</span>
            </div>
            {savingStatus.exam === "success" && (
              <span className="text-green-500 font-extrabold text-xs uppercase tracking-tighter">
                {t("wizard.step6.saving.success").split("!")[0]}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl">
            <div className="flex items-center gap-4">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${savingStatus.questions === "success" ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"}`}
              >
                {savingStatus.questions === "loading" ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-5 h-5" />
                )}
              </div>
              <span className="font-bold">
                {t("wizard.step6.saving.questions", { count: wizardData.questions.length })}
              </span>
            </div>
            {savingStatus.questions === "success" && (
              <span className="text-green-500 font-extrabold text-xs uppercase tracking-tighter">
                {t("wizard.step6.saving.success").split("!")[0]}
              </span>
            )}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-600 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-bold">{error}</span>
            <button
              onClick={() => setError("")}
              className="ml-auto p-1 hover:bg-red-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="pt-6 flex flex-col md:flex-row gap-4">
          <button
            onClick={() => handleSaveExam("draft")}
            disabled={
              !wizardData.metadata.title || loading || savingStatus.exam === "loading" || savingStatus.questions === "loading"
            }
            className="flex-1 bg-muted text-foreground py-6 rounded-3xl font-black text-xl hover:bg-muted/80 transition-all disabled:opacity-50"
          >
            {savingStatus.exam === "loading" || savingStatus.questions === "loading"
              ? <Loader2 className="w-6 h-6 animate-spin mx-auto" />
              : t("wizard.step6.saveDraft")}
          </button>
          <button
            onClick={() => handleSaveExam("published")}
            disabled={
              !wizardData.metadata.title || loading || savingStatus.exam === "loading" || savingStatus.questions === "loading" || savingStatus.questions === "success"
            }
            className="flex-[2] bg-primary text-primary-foreground py-6 rounded-3xl font-black text-2xl shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all active:scale-100 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3"
          >
            {savingStatus.exam === "loading" ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                {t("wizard.step6.saving.exam")}
              </>
            ) : savingStatus.questions === "loading" ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                {t("wizard.step6.saving.questions", { count: wizardData.questions.length })}
              </>
            ) : savingStatus.questions === "success" ? (
              <>
                <CheckCircle2 className="w-7 h-7" />
                {t("wizard.step6.saving.success")}
              </>
            ) : (
              t("wizard.step6.saveFinish")
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="pb-20">
      {/* Header with Stepper */}
      <div className="sticky top-0 z-20 py-6 px-4 mb-8">
        <div className="max-w-6xl mx-auto bg-card border border-border rounded-[2.5rem] p-6 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between gap-4 relative z-10">
            {/* Connector Line Background */}
            <div className="absolute top-7 left-[5%] right-[5%] h-[2px] bg-muted z-0 hidden lg:block" />

            {steps.map((step) => (
              <div
                key={step.id}
                className="flex-1 flex flex-col items-center gap-3 relative z-10"
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 border-4 ${currentStep === step.id ? "bg-primary text-primary-foreground border-primary/20 shadow-2xl shadow-primary/30 scale-110" : currentStep > step.id ? "bg-green-500 text-white border-green-500/20" : "bg-card text-muted-foreground border-transparent"}`}
                >
                  <step.icon
                    className={`w-6 h-6 ${currentStep === step.id ? "animate-bounce" : ""}`}
                  />
                </div>
                <span
                  className={`text-[10px] font-black uppercase tracking-[0.2em] hidden lg:block transition-colors ${currentStep === step.id ? "text-primary" : "text-muted-foreground"}`}
                >
                  {step.title}
                </span>

                {/* Active Connector Overlay */}
                {step.id < steps.length && (
                  <div className="absolute top-7 left-[50%] w-full h-[2px] z-[-1] hidden lg:block">
                    <div
                      className={`h-full bg-primary transition-all duration-700 ${currentStep > step.id ? "w-full" : "w-0"}`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
            {currentStep === 5 && renderStep5()}
            {currentStep === 6 && renderStep6()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Basic Navigation */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-background/50 backdrop-blur-md p-2 rounded-2xl border border-border shadow-2xl z-30">
        <button
          onClick={prevStep}
          disabled={
            currentStep === 1 || loading || savingStatus.exam === "loading"
          }
          className="p-3 bg-muted rounded-xl hover:bg-muted/80 disabled:opacity-0 transition-all font-bold group"
        >
          <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
        </button>
        <div className="px-6 font-black tracking-tighter text-sm uppercase text-muted-foreground border-x border-border">
          {t("wizard.common.step")} {currentStep} / 6
        </div>
        <button
          onClick={nextStep}
          disabled={
            currentStep === steps.length ||
            loading ||
            (currentStep === 1 && !wizardData.content.trim()) ||
            (currentStep === 3 &&
              wizardData.config.difficulty === "mixed" &&
              wizardData.config.easyPercent +
                wizardData.config.mediumPercent +
                wizardData.config.hardPercent !==
                100) ||
            (currentStep === 4 && wizardData.questions.length === 0) ||
            currentStep === 6
          }
          className="p-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-0 transition-all font-bold group"
        >
          <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
