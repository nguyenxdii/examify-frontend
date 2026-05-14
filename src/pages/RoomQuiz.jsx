import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Loader2, AlertCircle, CheckCircle2, Clock, 
  ChevronRight, ChevronLeft, Send, User, 
  Info, Award, BarChart3, RotateCcw,
  Home, Share2, Eye, Sparkles, LogIn, Lock, QrCode, ArrowRight,
  Search, ArrowUpRight
} from "lucide-react";
import { getRoomPublic, submitRoomQuiz, validateRoom } from "../api/examApi";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { cn } from "../lib/utils";
import { toast } from "react-hot-toast";
import MarkdownRenderer from "../components/MarkdownRenderer";

export default function RoomQuiz() {
  const { t } = useTranslation();
  const { roomId } = useParams();
  const navigate = useNavigate();

  // State management
  const [loading, setLoading] = useState(true);
  const [room, setRoom] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [step, setStep] = useState("welcome"); // welcome, quiz, result
  const [welcomeStep, setWelcomeStep] = useState(1); // 1: StudentID, 2: Name, 3: RoomCode
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // questionId -> list of keys
  const [timeLeft, setTimeLeft] = useState(0);
  const [endTime, setEndTime] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  useEffect(() => {
    if (room) {
      document.title = t("titles.room_quiz", { name: room.examTitle || room.title || "..." });
    } else {
      document.title = t("titles.quiz");
    }
  }, [room, t]);
  const [roomClosed, setRoomClosed] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(5);

  // Refs for stale closure protection
  const stateRef = React.useRef({ studentName, studentId, answers, isSubmitting, questions });
  useEffect(() => {
    stateRef.current = { studentName, studentId, answers, isSubmitting, questions };
  }, [studentName, studentId, answers, isSubmitting, questions]);

  // Anti-copy logic
  useEffect(() => {
    if (step === "quiz") {
      const handleCopy = (e) => {
        e.preventDefault();
        toast.error(t("room_quiz.toast.copy_blocked") || "Hành động sao chép bị chặn để đảm bảo tính công bằng!");
      };
      const handleContextMenu = (e) => e.preventDefault();

      document.addEventListener("copy", handleCopy);
      document.addEventListener("cut", handleCopy);
      document.addEventListener("contextmenu", handleContextMenu);

      return () => {
        document.removeEventListener("copy", handleCopy);
        document.removeEventListener("cut", handleCopy);
        document.removeEventListener("contextmenu", handleContextMenu);
      };
    }
  }, [step]);

  const fetchData = useCallback(async (sId = null, sName = null) => {
    try {
      const params = {};
      if (sId) params.studentId = sId;
      if (sName) params.studentName = sName;
      
      const res = await getRoomPublic(roomId, params);
      const roomData = res.data.room;
      let questionsData = res.data.questions || [];
      
      setRoom(roomData);
      setQuestions(questionsData);
      return { roomData, questionsData };
    } catch (err) {
      if (err.response?.data?.message?.includes("đã đóng") || err.response?.data?.message?.includes("chưa mở") || err.response?.data?.message?.includes("closed") || err.response?.data?.message?.includes("not open")) {
        setRoomClosed(true);
      } else {
        toast.error(t("room_quiz.toast.fetch_error") || "Không thể tải phòng thi");
        navigate("/");
      }
      return null;
    }
  }, [roomId, navigate, t]);

  // Initial load
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const result = await fetchData();
      if (!result) {
        setLoading(false);
        return;
      }
      
      const { roomData } = result;

      // Check persistent timer
      const savedTimer = localStorage.getItem(`examify_timer_${roomId}`);
      if (savedTimer) {
        try {
          const { endTime, savedStudentId, savedStudentName } = JSON.parse(savedTimer);
          const remaining = Math.floor((endTime - Date.now()) / 1000);
          
          if (remaining > 0) {
            setStudentId(savedStudentId);
            setStudentName(savedStudentName);
            setEndTime(endTime);
            setTimeLeft(remaining);
            
            // Re-fetch questions with student info to get correct shuffle
            await fetchData(savedStudentId, savedStudentName);
            
            // Load saved answers
            const savedAnswers = localStorage.getItem(`examify_answers_${roomId}`);
            if (savedAnswers) {
              setAnswers(JSON.parse(savedAnswers));
            }
            
            setStep("quiz");
          } else {
            localStorage.removeItem(`examify_timer_${roomId}`);
            setTimeLeft((roomData.durationMinutes || 10) * 60);
          }
        } catch (e) {
          setTimeLeft((roomData.durationMinutes || 10) * 60);
        }
      } else {
        setTimeLeft((roomData.durationMinutes || 10) * 60);
      }
      setLoading(false);
    };
    init();
  }, [fetchData, roomId]);

  // Handle redirect countdown
  useEffect(() => {
    if (roomClosed && redirectCountdown > 0) {
      const timer = setInterval(() => {
        setRedirectCountdown(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (roomClosed && redirectCountdown === 0) {
      navigate("/");
    }
  }, [roomClosed, redirectCountdown, navigate]);

  // Timer logic - Precise timing using Date.now()
  useEffect(() => {
    let timer;
    if (step === "quiz" && timeLeft > 0 && !isSubmitting && endTime) {
      timer = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
        setTimeLeft(remaining);
        
        if (remaining <= 0) {
          clearInterval(timer);
          handleSubmit(true);
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, isSubmitting, endTime]);

  const handleNextStep = async () => {
    if (welcomeStep === 1) {
      if (room?.requireStudentList && !studentId.trim()) {
        toast.error(t("rooms.quiz_result.student_id") + " " + t("common.required"));
        return;
      }
      if (!studentName.trim()) {
        toast.error(t("rooms.quiz_result.student_name") + " " + t("common.required"));
        return;
      }
      
      // Step 1 validation: Check student info on server
      setIsValidating(true);
      try {
        await validateRoom(roomId, { studentId, studentName, roomCode: "" });
        setWelcomeStep(2);
      } catch (error) {
        toast.error(t("room_quiz.toast.invalid_student") || "Thông tin sinh viên không hợp lệ");
      } finally {
        setIsValidating(false);
      }
    } else if (welcomeStep === 2) {
      if (!roomCode.trim()) {
        toast.error(t("rooms.card.code") + " " + t("common.required"));
        return;
      }
      
      setIsValidating(true);
      try {
        const res = await validateRoom(roomId, {
          studentId,
          studentName,
          roomCode
        });
        
        // Sync with Server-side timer
        const serverEndTime = new Date(res.data.endTime).getTime();
        const now = Date.now();
        const remaining = Math.max(0, Math.floor((serverEndTime - now) / 1000));
        
        setEndTime(serverEndTime);
        setTimeLeft(remaining);
        
        // Start Quiz
        localStorage.setItem(`examify_timer_${roomId}`, JSON.stringify({
          endTime: serverEndTime,
          savedStudentId: studentId,
          savedStudentName: studentName
        }));
        
        // Re-fetch questions with student info to get correct shuffle
        const resQuiz = await getRoomPublic(roomId, { studentId, studentName });
        setQuestions(resQuiz.data.questions || []);
        
        setStep("quiz");
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message;
        toast.error(errorMsg || t("room_quiz.toast.auth_failed"));
      } finally {
        setIsValidating(false);
      }
    }
  };

  const handleStart = () => {
    handleNextStep();
  };

  const handleAnswerChange = (questionId, choiceKey, type) => {
    setAnswers(prev => {
      const current = prev[questionId] || [];
      let newAnswers;
      
      if (type === "multiple_choice" || type === "boolean") {
        // Single choice logic
        newAnswers = { ...prev, [questionId]: [choiceKey] };
      } else if (type === "essay") {
        // Essay logic
        newAnswers = { ...prev, [questionId]: [choiceKey] };
      } else {
        // Multiple answers logic (type === "multiple_answer")
        if (current.includes(choiceKey)) {
          newAnswers = { ...prev, [questionId]: current.filter(k => k !== choiceKey) };
        } else {
          newAnswers = { ...prev, [questionId]: [...current, choiceKey] };
        }
      }
      
      localStorage.setItem(`examify_answers_${roomId}`, JSON.stringify(newAnswers));
      return newAnswers;
    });

    // Only auto-advance for single choice types
    if (autoAdvance && (type === "multiple_choice" || type === "boolean")) {
      if (isAdvancing) return;
      setIsAdvancing(true);
      setTimeout(() => {
        setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1));
        setIsAdvancing(false);
      }, 600);
    }
  };

  const unansweredCount = questions.length - Object.keys(answers).filter(key => answers[key]?.length > 0).length;

  const handleSubmitClick = () => {
    setShowConfirmSubmit(true);
  };

  const handleSubmit = useCallback(async (force = false) => {
    const { isSubmitting: currentIsSubmitting, studentName: sName, studentId: sId, answers: curAnswers, questions: qs } = stateRef.current;
    
    if (currentIsSubmitting) return;
    if (!force && showConfirmSubmit) setShowConfirmSubmit(false);
    
    setIsSubmitting(true);
    try {
      // Create orders for snapshotting
      const questionOrder = qs.map(q => q.id);
      const choiceOrder = {};
      qs.forEach(q => {
        if (q.choices) {
          choiceOrder[q.id] = q.choices.map(c => c.key);
        }
      });

      const res = await submitRoomQuiz(roomId, {
        studentName: sName,
        studentId: sId,
        answers: curAnswers,
        questionOrder,
        choiceOrder
      });
      setResult(res.data);
      setStep("result");
      localStorage.removeItem(`examify_timer_${roomId}`);
      localStorage.removeItem(`examify_answers_${roomId}`);
      toast.success(t("room_quiz.toast.submit_success") || "Nộp bài thành công!");
    } catch (err) {
      toast.error(t("room_quiz.toast.submit_error") || "Lỗi khi nộp bài");
      setIsSubmitting(false); // Only reset if failed so they can try again
    }
  }, [roomId]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (roomClosed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card border-2 border-border p-12 rounded-[3rem] shadow-2xl text-center max-w-lg w-full relative overflow-hidden"
        >
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-rose-500/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
          
          <div className="relative z-10 space-y-8">
            <div className="w-24 h-24 bg-rose-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Lock className="w-12 h-12 text-rose-500" />
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl font-black tracking-tight font-heading">{t("room_quiz.closed.title")}</h1>
              <p className="text-muted-foreground font-medium leading-relaxed">
                {t("room_quiz.closed.desc")}
              </p>
            </div>

            <div className="p-6 bg-muted/50 rounded-2xl border border-border/50">
              <div className="flex items-center justify-center gap-3 text-lg font-bold text-primary">
                <RotateCcw className="w-5 h-5 animate-spin" />
                {t("room_quiz.closed.redirect", { count: redirectCountdown })}
              </div>
            </div>

            <button 
              onClick={() => navigate("/")}
              className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-widest hover:bg-primary/90 transition-all flex items-center justify-center gap-3 shadow-lg shadow-primary/25"
            >
              <Home className="w-5 h-5" />
              {t("room_quiz.closed.home_btn")}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
      <Loader2 className="w-12 h-12 text-primary animate-spin" />
      <p className="text-muted-foreground font-bold animate-pulse">{t("common.loading")}</p>
    </div>
  );

  // --- WELCOME SCREEN ---
  if (step === "welcome") return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full bg-card border border-border rounded-[2.5rem] shadow-2xl p-8 md:p-10 space-y-8"
      >
        <div className="text-center space-y-5">
          <div className="space-y-2">
            <span className={cn(
              "px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full border",
              room?.mode === "practice" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-primary/10 text-primary border-primary/20"
            )}>
              {room?.mode === "practice" ? t("room_quiz.welcome.practice_badge") : t("room_quiz.welcome.official_badge")}
            </span>
            <h1 className="text-3xl font-black tracking-tight text-foreground leading-tight">
              {room?.name}
            </h1>
            <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest">
              {t("room_quiz.welcome.exam_label")}: {room?.examTitle}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/30 p-5 rounded-2xl border border-border/50 text-center space-y-1">
            <Clock className="w-4 h-4 text-primary mx-auto mb-1" />
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{t("room_quiz.welcome.time_label")}</p>
            <p className="text-lg font-black">{room?.durationMinutes} {t("common.minutes")}</p>
          </div>
          <div className="bg-muted/30 p-5 rounded-2xl border border-border/50 text-center space-y-1">
            <Info className="w-4 h-4 text-primary mx-auto mb-1" />
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{t("room_quiz.welcome.questions_label")}</p>
            <p className="text-lg font-black">{questions.length} {t("common.questions")}</p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="relative min-h-[140px]">
            <AnimatePresence mode="wait">
              {welcomeStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2 flex items-center gap-2">
                      <LogIn className="w-3.5 h-3.5 text-primary" /> {t("room_quiz.welcome.step_info")}
                    </label>
                    {room?.requireStudentList && (
                      <input 
                        type="text"
                        placeholder={t("room_quiz.welcome.student_id_placeholder")}
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        className="w-full h-12 bg-muted/50 border-2 border-border rounded-xl px-5 font-bold text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-center mb-2"
                      />
                    )}
                    <input 
                      type="text"
                      placeholder={t("room_quiz.welcome.name_placeholder")}
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="w-full h-12 bg-muted/50 border-2 border-border rounded-xl px-5 font-bold text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-center"
                    />
                  </div>
                </motion.div>
              )}

              {welcomeStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="space-y-4">
                    <div className="text-center">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center justify-center gap-2 mb-2">
                        <QrCode className="w-3.5 h-3.5 text-primary" /> {t("room_quiz.welcome.room_code_title")}
                      </label>
                      <p className="text-[11px] text-muted-foreground mb-4 italic">{t("room_quiz.welcome.room_code_desc")}</p>
                    </div>
                    
                    <div className="max-w-[280px] mx-auto">
                      <input 
                        type="text"
                        placeholder={t("room_quiz.welcome.room_code_placeholder")}
                        value={roomCode}
                        onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                        className="w-full h-14 bg-muted/50 border-2 border-border rounded-2xl px-5 font-black text-2xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-center tracking-[0.2em] placeholder:tracking-normal placeholder:font-bold placeholder:text-muted-foreground/30 shadow-inner"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex gap-3">
            {welcomeStep > 1 && (
              <button 
                onClick={() => setWelcomeStep(prev => prev - 1)}
                className="flex-1 h-12 bg-muted text-foreground font-black rounded-xl hover:bg-muted/80 transition-all text-base uppercase tracking-wider"
              >
                {t("room_quiz.welcome.back_btn")}
              </button>
            )}
            <button 
              onClick={handleNextStep}
              disabled={isValidating}
              className="flex-[2] h-12 bg-primary text-primary-foreground font-black rounded-xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-base flex items-center justify-center gap-3 uppercase tracking-wider disabled:opacity-70"
            >
              {isValidating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {welcomeStep === 2 ? t("room_quiz.welcome.start_btn") : t("room_quiz.welcome.next_btn")}
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  // --- QUIZ PLAYER --- (Same as PublicQuiz)
  if (step === "quiz") {
    const currentQ = questions?.[currentQuestionIndex];
    const progress = questions?.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

    if (!currentQ) return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <p className="text-muted-foreground font-bold">{t("room_quiz.toast.no_questions")}</p>
        <button onClick={() => window.location.reload()} className="bg-primary text-white px-4 py-2 rounded-xl">{t("wizard.step2.retry")}</button>
      </div>
    );

    return (
      <div className="min-h-screen bg-background flex flex-col select-none">
        {/* Header bar */}
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b border-border p-3">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-6">
            <div className="flex-1 min-w-0">
              <h2 className="font-black text-[11px] truncate uppercase tracking-widest text-muted-foreground">
                {room?.name} • {room?.examTitle}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <div className={cn(
                "flex items-center gap-2 px-5 py-2 rounded-full border-2 font-black transition-all",
                timeLeft < 60 ? "bg-red-500/10 border-red-500 text-red-500 animate-pulse" : "bg-primary/10 border-primary/20 text-primary"
              )}>
                <Clock className="w-4 h-4" />
                <span className="text-lg tabular-nums">{formatTime(timeLeft)}</span>
              </div>
              <button 
                onClick={handleSubmitClick}
                disabled={isSubmitting || timeLeft <= 0}
                className="hidden md:flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-full font-black hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:hover:scale-100"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {timeLeft <= 0 ? t("room_quiz.quiz.submitting_btn") : t("room_quiz.quiz.submit_btn")}
              </button>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
        </header>

        <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 flex flex-col md:flex-row gap-6 overflow-hidden">
          <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar pb-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestionIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-block px-2.5 py-0.5 bg-muted rounded-md text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                      {t("room_quiz.quiz.progress", { current: currentQuestionIndex + 1, total: questions.length })}
                    </span>
                    {currentQ.type === "multiple_answer" && (
                      <span className="inline-block px-2.5 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-md text-[9px] font-black uppercase tracking-widest animate-pulse">
                        {t("room_quiz.quiz.multiple_answer_badge")}
                      </span>
                    )}
                  </div>
                  <MarkdownRenderer content={currentQ.content} className="text-lg md:text-xl font-bold leading-snug text-foreground" />
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {currentQ.type === "essay" ? (
                    <div className="space-y-4">
                      <textarea
                        value={answers[currentQ.id]?.[0] || ""}
                        onChange={(e) => handleAnswerChange(currentQ.id, e.target.value, "essay")}
                        disabled={timeLeft <= 0 || isSubmitting}
                        placeholder={timeLeft <= 0 ? t("room_quiz.quiz.essay_placeholder_timeout") : t("room_quiz.quiz.essay_placeholder")}
                        className="w-full h-64 p-6 bg-card border-2 border-border rounded-[2rem] font-medium text-lg focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-none shadow-sm disabled:opacity-70 disabled:bg-muted/50"
                      />
                      <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-xl border border-primary/10">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{t("room_quiz.quiz.essay_ai_note")}</span>
                      </div>
                    </div>
                  ) : (
                    currentQ.choices?.map((choice, index) => {
                      const label = String.fromCharCode(65 + index); // A, B, C, D dynamically
                      const isSelected = answers[currentQ.id]?.includes(choice.key);
                      return (
                        <button
                          key={choice.key}
                          onClick={() => handleAnswerChange(currentQ.id, choice.key, currentQ.type)}
                          disabled={timeLeft <= 0 || isSubmitting}
                          className={cn(
                            "group relative flex items-center gap-4 p-3.5 rounded-xl border-2 text-left transition-all duration-200",
                            isSelected 
                              ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                              : "bg-card border-border hover:border-primary/40",
                            (timeLeft <= 0 || isSubmitting) && "opacity-60 cursor-not-allowed"
                          )}
                        >
                          <div className={cn(
                            "w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm transition-all",
                            isSelected ? "bg-white text-primary" : "bg-muted text-muted-foreground"
                          )}>
                            {label}
                          </div>
                          <MarkdownRenderer content={choice.content} className="flex-1 font-bold text-base leading-tight" />
                          {isSelected && (
                            <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                              <CheckCircle2 className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <aside className="w-full md:w-72 flex flex-col gap-5">
            <div className="bg-card border border-border rounded-[2rem] p-5 shadow-xl space-y-5">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">{t("room_quiz.quiz.question_list")}</h4>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, idx) => {
                  const answered = answers[q.id]?.length > 0;
                  const active = currentQuestionIndex === idx;
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={cn(
                        "aspect-square rounded-lg flex items-center justify-center text-[11px] font-black transition-all",
                        active ? "bg-primary text-white ring-2 ring-primary/20" : 
                        answered ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="flex-1 h-10 bg-muted rounded-xl flex items-center justify-center hover:bg-muted/80 disabled:opacity-30 transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                  disabled={currentQuestionIndex === questions.length - 1}
                  className="flex-1 h-10 bg-muted rounded-xl flex items-center justify-center hover:bg-muted/80 disabled:opacity-30 transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="pt-2 border-t border-border flex items-center gap-2 px-1">
                <input 
                  type="checkbox" 
                  id="autoAdvance"
                  checked={autoAdvance}
                  onChange={(e) => setAutoAdvance(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                />
                <label htmlFor="autoAdvance" className="text-[11px] font-bold text-muted-foreground select-none cursor-pointer">
                  {t("room_quiz.quiz.auto_advance")}
                </label>
              </div>
            </div>

            <button 
              onClick={handleSubmitClick}
              disabled={isSubmitting || timeLeft <= 0}
              className="w-full h-12 bg-primary text-white rounded-xl font-black flex items-center justify-center gap-3 shadow-xl shadow-primary/20 md:hidden disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {timeLeft <= 0 ? t("room_quiz.quiz.submitting_btn") : t("room_quiz.quiz.submit_btn")}
            </button>
          </aside>
        </main>
        
        {/* Submit Confirmation Modal */}
        <AnimatePresence>
          {showConfirmSubmit && (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-background/80 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-card border border-border w-full max-w-sm rounded-[2rem] p-6 shadow-2xl space-y-6"
              >
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-black text-foreground">{t("room_quiz.confirm.title")}</h3>
                  {unansweredCount > 0 ? (
                    <p className="text-sm font-bold text-rose-500">
                      {t("room_quiz.confirm.unanswered", { count: unansweredCount })}
                    </p>
                  ) : (
                    <p className="text-sm font-bold text-emerald-500">
                      {t("room_quiz.confirm.all_answered")}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    {t("room_quiz.confirm.desc")}
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirmSubmit(false)}
                    className="flex-1 h-12 bg-muted hover:bg-muted/80 text-foreground font-black rounded-xl transition-all"
                  >
                    {t("room_quiz.confirm.continue_btn")}
                  </button>
                  <button
                    onClick={() => handleSubmit(true)}
                    disabled={isSubmitting}
                    className="flex-1 h-12 bg-primary text-white font-black rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-wait disabled:hover:scale-100"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" /> {t("room_quiz.confirm.grading_ai")}
                      </span>
                    ) : (
                      t("room_quiz.confirm.submit_now")
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // --- RESULT SCREEN --- (Same as PublicQuiz but showing room title)
  if (step === "result") {
    const scoreColor = result.score >= 8 ? "text-emerald-500" : result.score >= 5 ? "text-amber-500" : "text-rose-500";
    
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-3xl w-full space-y-6 py-8"
        >
          <div className="bg-card border border-border rounded-[2.5rem] shadow-2xl p-6 md:p-10 text-center space-y-8 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1.5 bg-primary/20" />
            
            <div className="space-y-4 relative text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-black">{t("rooms.quiz_result.title")}</h2>
                <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest">{t("rooms.quiz_result.subtitle")}</p>
              </div>
              
              {/* Thêm thông báo chi tiết */}
              <div className="max-w-md w-full bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 mt-4">
                <p className="text-sm font-medium text-amber-700 leading-relaxed text-justify">
                  <span className="font-black uppercase tracking-widest text-[10px] block mb-1 opacity-60">{t("rooms.quiz_result.notes.label")} </span>
                  {room?.showScoreAfterSubmission ? (
                    room?.showAnswersAfterSubmission 
                      ? t("rooms.quiz_result.notes.score_only_mc")
                      : t("rooms.quiz_result.notes.score_mc_no_answers")
                  ) : t("rooms.quiz_result.notes.submission_success")}
                </p>
              </div>

              <div className="h-px w-12 bg-border my-2" />
              <div className="space-y-1.5">
                <p className="text-primary font-black uppercase tracking-widest text-[10px]">{room?.name}</p>
                <div className="flex flex-col items-center gap-1">
                  <p className="text-foreground font-black text-sm uppercase tracking-tight">{t("rooms.quiz_result.student_name")}: {studentName}</p>
                  {studentId && <p className="text-muted-foreground font-black text-[10px] uppercase tracking-widest opacity-60">{t("rooms.quiz_result.student_id")}: {studentId}</p>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{t("rooms.quiz_result.total_score")}</p>
                {room?.showScoreAfterSubmission ? (
                   <>
                    <p className={cn("text-5xl font-black tabular-nums", scoreColor)}>{result.score.toFixed(1)}</p>
                    <p className="text-[10px] font-bold text-muted-foreground">{t("rooms.quiz_result.score_scale")}</p>
                  </>
                ) : (
                  <p className="text-xl font-bold text-muted-foreground pt-4 italic">{t("rooms.quiz_result.pending_announcement")}</p>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{t("rooms.quiz_result.correct_total")}</p>
                {room?.showScoreAfterSubmission ? (
                  <>
                    <p className="text-3xl font-black mt-2">{result.correctCount} / {result.totalQuestions}</p>
                    <div className="w-full bg-muted h-1.5 rounded-full mt-3 overflow-hidden">
                      <div className="bg-emerald-500 h-full" style={{ width: `${(result.correctCount/result.totalQuestions)*100}%` }} />
                    </div>
                  </>
                ) : (
                  <p className="text-xl font-bold text-muted-foreground pt-4 italic">{t("rooms.quiz_result.pending_announcement")}</p>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{t("rooms.quiz_result.status")}</p>
                <div className={cn(
                  "mt-3 inline-flex items-center gap-2 px-5 py-2 rounded-xl border font-black text-xs uppercase tracking-widest",
                  (!room?.showScoreAfterSubmission || result.gradingStatus !== "fully_graded")
                    ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                    : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                )}>
                  {(!room?.showScoreAfterSubmission || result.gradingStatus !== "fully_graded") ? (
                    <><Clock className="w-4 h-4" /> {t("rooms.detail.grading.status_pending")}</>
                  ) : (
                    <><CheckCircle2 className="w-4 h-4" /> {t("rooms.detail.grading.status_graded")}</>
                  )}
                </div>
              </div>
            </div>

            {/* Nút chuyển đến trang tra cứu */}
            <div className="pt-6 border-t border-border mt-8">
            <div className="grid grid-cols-2 gap-3 max-w-[320px] mx-auto">
                <button 
                  onClick={() => navigate(`/lookup?roomCode=${room.roomCode}&studentId=${studentId}`)}
                  className="group relative flex flex-col items-center justify-center gap-1.5 p-2.5 bg-white dark:bg-card border border-primary/20 rounded-2xl hover:border-primary hover:bg-primary/5 transition-all duration-300 shadow-md hover:scale-[1.02] active:scale-95"
                >
                  <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Search className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="space-y-0">
                    <span className="block text-[7px] font-black uppercase tracking-widest text-primary/60">{t("lookup.btn")}</span>
                    <span className="block text-[10px] font-bold leading-tight">{t("rooms.quiz_result.history")}</span>
                  </div>
                </button>

                <button 
                  onClick={() => navigate("/")}
                  className="group relative flex flex-col items-center justify-center gap-1.5 p-2.5 bg-card border border-border rounded-2xl hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 shadow-md hover:scale-[1.02] active:scale-95"
                >
                  <div className="w-8 h-8 bg-background/80 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Home className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="space-y-0">
                    <span className="block text-[7px] font-black uppercase tracking-widest text-primary/60">{t("nav.home")}</span>
                    <span className="block text-[10px] font-bold leading-tight">{t("lookup.backHome")}</span>
                  </div>
                </button>
              </div>

              {(room?.showAnswersAfterSubmission || room?.showSubmissionAfterSubmission) && (
                <div className="pt-6">
                  <button 
                    onClick={() => setIsReviewMode(!isReviewMode)}
                    className={cn(
                      "w-full h-14 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 border-2",
                      isReviewMode 
                        ? "bg-muted text-foreground border-border hover:bg-muted/80" 
                        : "bg-primary text-white border-primary shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.98] hover:bg-primary/90"
                    )}
                  >
                    <BarChart3 className="w-5 h-5" />
                    {isReviewMode ? (t("rooms.quiz_result.close_review")) : (t("rooms.quiz_result.review_btn"))}
                    {!isReviewMode && <ChevronRight className="w-5 h-5 animate-pulse" />}
                  </button>
                </div>
              )}
            </div>
            

          </div>

          {/* Review Section */}
          <AnimatePresence>
            {isReviewMode && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 pt-6 border-t border-border"
              >
                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-primary/10">
                    <h3 className="text-xl font-black flex items-center gap-3 text-primary">
                      <div className="p-2 bg-primary/10 rounded-xl">
                        <BarChart3 className="w-6 h-6" />
                      </div>
                      {t("rooms.quiz_result.detail_questions")}
                    </h3>
                    <button 
                      onClick={() => setIsReviewMode(false)} 
                      className="px-4 py-2 text-[10px] font-black text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl border-2 border-transparent hover:border-primary/20 transition-all uppercase tracking-widest"
                    >
                      {t("rooms.quiz_result.close_review")}
                    </button>
                  </div>

                {result.answers?.map((ans, idx) => {
                  const isEssay = ans.questionType === "essay";
                  const studentAns = ans.selectedAnswer || (ans.essayAnswer ? [ans.essayAnswer] : []);
                  const isEssayEmpty = isEssay && !ans.essayAnswer?.trim();
                  
                  let badgeText = ans.correct ? t("common.correct") || "Đúng" : t("common.wrong") || "Sai";
                  let badgeColor = ans.correct ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500";
                  
                  if (isEssay) {
                    if (isEssayEmpty) {
                      badgeText = t("common.wrong_empty") || "Sai (Bỏ trống)";
                    } else if (result.gradingStatus === "fully_graded") {
                      badgeText = ans.finalScore > 0 ? t("common.correct") || "Đúng" : t("common.wrong") || "Sai";
                    } else {
                      badgeText = t("rooms.detail.grading.status_pending") || "Chờ chấm";
                      badgeColor = "bg-amber-500/10 text-amber-500";
                    }
                  }

                  // If submission visibility is on but answers are off, we might not have 'correct' flag or 'correctAnswers'
                  // The backend now handles filtering these fields.
                  const showResultStatus = result.showAnswers;

                  return (
                    <div key={ans.questionId} className="bg-card border border-border rounded-[1.5rem] p-6 space-y-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-violet-500/20">
                          {t("rooms.detail.question_num", { num: idx + 1 })}
                        </span>
                        {showResultStatus && (
                          <span className={cn(
                            "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                            badgeColor.replace("bg-", "border-").replace("/10", "/20"),
                            badgeColor
                          )}>
                            {badgeText}
                          </span>
                        )}
                      </div>
                      <MarkdownRenderer content={ans.questionContent} className="text-lg font-bold leading-tight" />
                      
                      {isEssay ? (
                        <div className="space-y-4">
                          <div className="p-4 bg-muted/30 border-2 border-border rounded-2xl">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">{t("rooms.quiz_result.student_answer") || "Câu trả lời của bạn:"}</p>
                            <p className="text-sm font-medium whitespace-pre-wrap">{ans.essayAnswer || t("rooms.quiz_result.no_answer") || "(Không có câu trả lời)"}</p>
                          </div>
                          {ans.aiComment && (
                             <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl">
                              <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Sparkles className="w-3 h-3" /> {t("rooms.detail.grading.ai_comment") || "Nhận xét từ AI:"}
                              </p>
                              <p className="text-sm text-muted-foreground italic leading-relaxed">
                                {ans.aiComment}
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {ans.choices?.map(choice => {
                            const isStudentChoice = ans.selectedAnswer?.includes(choice.key);
                            const isRightChoice = ans.correctAnswers?.includes(choice.key);
                            
                            return (
                              <div 
                                key={choice.key}
                                className={cn(
                                  "p-3 rounded-xl border-2 flex items-center gap-3 text-sm transition-all",
                                  isRightChoice ? "bg-emerald-50 border-emerald-500 text-emerald-900" :
                                  (isStudentChoice && showResultStatus) ? "bg-rose-50 border-rose-500 text-rose-900" : 
                                  isStudentChoice ? "bg-primary/5 border-primary/30 text-primary" :
                                  "bg-muted/30 border-transparent text-muted-foreground"
                                )}
                              >
                                <div className={cn(
                                  "w-7 h-7 rounded-lg flex items-center justify-center font-black text-[10px]",
                                  isRightChoice ? "bg-emerald-500 text-white" :
                                  (isStudentChoice && showResultStatus) ? "bg-rose-500 text-white" : 
                                  isStudentChoice ? "bg-primary text-white" :
                                  "bg-muted text-muted-foreground"
                                )}>
                                  {choice.key}
                                </div>
                                <MarkdownRenderer content={choice.content} className="font-bold" />
                                {isRightChoice && <CheckCircle2 className="w-3.5 h-3.5 ml-auto text-emerald-500" />}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {ans.explanation && (
                        <div className="mt-4 p-4 bg-amber-50/50 border border-amber-200 rounded-2xl">
                           <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1">{t("rooms.form.explanation") || "Giải thích"}</p>
                           <MarkdownRenderer content={ans.explanation} className="text-sm text-amber-900 leading-relaxed" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    );
  }

  return null;
}
