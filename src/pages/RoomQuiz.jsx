import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Loader2, AlertCircle, CheckCircle2, Clock, 
  ChevronRight, ChevronLeft, Send, User, 
  Info, Award, BarChart3, RotateCcw,
  Home, Share2, Eye, Sparkles, LogIn, Lock
} from "lucide-react";
import { getRoomPublic, submitRoomQuiz, validateRoom } from "../api/examApi";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { cn } from "../lib/utils";
import { toast } from "react-hot-toast";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  // Load data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getRoomPublic(roomId);
        const roomData = res.data.room;
        let questionsData = res.data.questions || [];
        const isShuffled = res.data.shuffled;
        
        if (isShuffled) {
          const shuffleArray = (arr) => {
            const newArr = [...arr];
            for (let i = newArr.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
            }
            return newArr;
          };
          
          questionsData = shuffleArray(questionsData).map(q => {
            if (q.choices && q.choices.length > 0) {
              return { ...q, choices: shuffleArray(q.choices) };
            }
            return q;
          });
        }
        
        setRoom(roomData);
        setQuestions(questionsData);

        // Check persistent timer
        const savedTimer = localStorage.getItem(`examify_timer_${roomId}`);
        if (savedTimer) {
          try {
            const { endTime, savedStudentId, savedStudentName } = JSON.parse(savedTimer);
            const remaining = Math.floor((endTime - Date.now()) / 1000);
            
            if (remaining > 0) {
              setStudentId(savedStudentId);
              setStudentName(savedStudentName);
              setTimeLeft(remaining);
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
      } catch (err) {
        toast.error(err.response?.data?.message || "Không thể tải phòng thi");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [roomId, navigate]);

  // Timer logic
  useEffect(() => {
    let timer;
    if (step === "quiz" && timeLeft > 0 && !isSubmitting) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            // Time out: submit directly
            handleSubmit(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, timeLeft, isSubmitting]);

  const handleNextStep = async () => {
    if (welcomeStep === 1) {
      if (room?.requireStudentList && !studentId.trim()) {
        toast.error("Vui lòng nhập Mã số học sinh");
        return;
      }
      setWelcomeStep(2);
    } else if (welcomeStep === 2) {
      if (!studentName.trim()) {
        toast.error("Vui lòng nhập Họ và tên");
        return;
      }
      setWelcomeStep(3);
    } else if (welcomeStep === 3) {
      if (!roomCode.trim()) {
        toast.error("Vui lòng nhập Mã phòng thi");
        return;
      }
      
      setIsValidating(true);
      try {
        await validateRoom(roomId, {
          studentId,
          studentName,
          roomCode
        });
        
        // Start Quiz
        const endTime = Date.now() + timeLeft * 1000;
        localStorage.setItem(`examify_timer_${roomId}`, JSON.stringify({
          endTime,
          savedStudentId: studentId,
          savedStudentName: studentName
        }));
        
        setStep("quiz");
      } catch (err) {
        toast.error(err.response?.data?.message || "Xác thực không thành công");
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
      if (type === "multiple_choice") {
        return { ...prev, [questionId]: [choiceKey] };
      } else {
        if (current.includes(choiceKey)) {
          return { ...prev, [questionId]: current.filter(k => k !== choiceKey) };
        } else {
          return { ...prev, [questionId]: [...current, choiceKey] };
        }
      }
    });

    if (autoAdvance && type === "multiple_choice") {
      setTimeout(() => {
        setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1));
      }, 300);
    }
  };

  const unansweredCount = questions.length - Object.keys(answers).filter(key => answers[key]?.length > 0).length;

  const handleSubmitClick = () => {
    setShowConfirmSubmit(true);
  };

  const handleSubmit = async (force = false) => {
    if (isSubmitting) return;
    if (!force && showConfirmSubmit) setShowConfirmSubmit(false);
    
    setIsSubmitting(true);
    try {
      const res = await submitRoomQuiz(roomId, {
        studentName,
        studentId,
        answers
      });
      setResult(res.data);
      setStep("result");
      localStorage.removeItem(`examify_timer_${roomId}`);
      toast.success("Nộp bài thành công!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi nộp bài");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
      <Loader2 className="w-12 h-12 text-primary animate-spin" />
      <p className="text-muted-foreground font-bold animate-pulse">Đang chuẩn bị phòng thi...</p>
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
              {room?.mode === "practice" ? "Luyện tập" : "Kiểm tra chính thức"}
            </span>
            <h1 className="text-3xl font-black tracking-tight text-foreground leading-tight">
              {room?.name}
            </h1>
            <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest">
              Đề thi: {room?.examTitle}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/30 p-5 rounded-2xl border border-border/50 text-center space-y-1">
            <Clock className="w-4 h-4 text-primary mx-auto mb-1" />
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Thời gian</p>
            <p className="text-lg font-black">{room?.durationMinutes} phút</p>
          </div>
          <div className="bg-muted/30 p-5 rounded-2xl border border-border/50 text-center space-y-1">
            <Info className="w-4 h-4 text-primary mx-auto mb-1" />
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Số câu hỏi</p>
            <p className="text-lg font-black">{questions.length} câu</p>
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
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2 flex items-center gap-2">
                      <LogIn className="w-3.5 h-3.5 text-primary" /> 1. Nhập Mã số học sinh (MSSV)
                    </label>
                    <input 
                      type="text"
                      placeholder="MSSV của bạn..."
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      className="w-full h-12 bg-muted/50 border-2 border-border rounded-xl px-5 font-bold text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-center"
                    />
                    {!room?.requireStudentList && (
                      <p className="text-[10px] text-muted-foreground px-2 italic text-center">
                        (Phòng thi này không bắt buộc MSSV, bạn có thể để trống)
                      </p>
                    )}
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
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2 flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-primary" /> 2. Nhập Họ và tên của bạn
                    </label>
                    <input 
                      type="text"
                      placeholder="Ví dụ: Nguyễn Văn A"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="w-full h-12 bg-muted/50 border-2 border-border rounded-xl px-5 font-bold text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-center"
                    />
                  </div>
                </motion.div>
              )}

              {welcomeStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2 flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-primary" /> 3. Nhập Mã phòng thi
                    </label>
                    <input 
                      type="text"
                      placeholder="Nhập 6 ký tự mã phòng..."
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                      className="w-full h-12 bg-muted/50 border-2 border-border rounded-xl px-5 font-bold text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-center tracking-[0.2em] uppercase"
                    />
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
                Quay lại
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
                  {welcomeStep === 3 ? "Bắt đầu làm bài" : "Tiếp theo"}
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
    const currentQ = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
      <div className="min-h-screen bg-background flex flex-col">
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
                disabled={isSubmitting}
                className="hidden md:flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-full font-black hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Nộp bài
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
                  <span className="inline-block px-2.5 py-0.5 bg-muted rounded-md text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                    Câu hỏi {currentQuestionIndex + 1} / {questions.length}
                  </span>
                  <h3 className="text-lg md:text-xl font-bold leading-snug text-foreground">
                    {currentQ.content}
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {currentQ.type === "essay" ? (
                    <div className="space-y-4">
                      <textarea
                        value={answers[currentQ.id]?.[0] || ""}
                        onChange={(e) => setAnswers(prev => ({ ...prev, [currentQ.id]: [e.target.value] }))}
                        placeholder="Nhập câu trả lời của bạn tại đây..."
                        className="w-full h-64 p-6 bg-card border-2 border-border rounded-[2rem] font-medium text-lg focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-none shadow-sm"
                      />
                      <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-xl border border-primary/10">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Câu hỏi này sẽ được AI chấm điểm tự động</span>
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
                          className={cn(
                            "group relative flex items-center gap-4 p-3.5 rounded-xl border-2 text-left transition-all duration-200",
                            isSelected 
                              ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                              : "bg-card border-border hover:border-primary/40"
                          )}
                        >
                          <div className={cn(
                            "w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm transition-all",
                            isSelected ? "bg-white text-primary" : "bg-muted text-muted-foreground"
                          )}>
                            {label}
                          </div>
                          <span className="flex-1 font-bold text-base leading-tight">{choice.content}</span>
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
              <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Danh sách câu hỏi</h4>
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
                  Tự động chuyển câu
                </label>
              </div>
            </div>

            <button 
              onClick={handleSubmitClick}
              disabled={isSubmitting}
              className="w-full h-12 bg-primary text-white rounded-xl font-black flex items-center justify-center gap-3 shadow-xl shadow-primary/20 md:hidden"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Nộp bài
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
                  <h3 className="text-xl font-black text-foreground">Xác nhận nộp bài</h3>
                  {unansweredCount > 0 ? (
                    <p className="text-sm font-bold text-rose-500">
                      Bạn vẫn còn <span className="text-lg">{unansweredCount}</span> câu hỏi chưa hoàn thành.
                    </p>
                  ) : (
                    <p className="text-sm font-bold text-emerald-500">
                      Bạn đã hoàn thành tất cả câu hỏi!
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    Bạn có chắc chắn muốn nộp bài lúc này? Sau khi nộp sẽ không thể sửa lại.
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirmSubmit(false)}
                    className="flex-1 h-12 bg-muted hover:bg-muted/80 text-foreground font-black rounded-xl transition-all"
                  >
                    Làm tiếp
                  </button>
                  <button
                    onClick={() => handleSubmit(true)}
                    disabled={isSubmitting}
                    className="flex-1 h-12 bg-primary text-white font-black rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-wait disabled:hover:scale-100"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" /> Đang chấm...
                      </span>
                    ) : (
                      "Nộp bài ngay"
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
            
            <div className="space-y-3 relative">
              <h2 className="text-2xl font-black">Kết quả phòng thi</h2>
              <p className="text-primary font-bold uppercase tracking-widest text-[10px]">{room?.name}</p>
              <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">{studentName} {studentId && `• ${studentId}`}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Tổng điểm</p>
                <p className={cn("text-5xl font-black tabular-nums", scoreColor)}>{result.score.toFixed(1)}</p>
                <p className="text-[10px] font-bold text-muted-foreground">Thang điểm 10</p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Đúng / Tổng</p>
                <p className="text-3xl font-black mt-2">{result.correctCount} / {result.totalQuestions}</p>
                <div className="w-full bg-muted h-1.5 rounded-full mt-3 overflow-hidden">
                  <div className="bg-emerald-500 h-full" style={{ width: `${(result.correctCount/result.totalQuestions)*100}%` }} />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Trạng thái</p>
                <div className="mt-3 inline-flex items-center gap-2 px-5 py-2 bg-primary/10 text-primary rounded-xl border border-primary/20 font-black text-xs">
                  <CheckCircle2 className="w-4 h-4" /> HOÀN THÀNH
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button 
                onClick={() => setIsReviewMode(true)}
                className="px-6 py-3.5 bg-primary text-white font-black rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] uppercase tracking-wide text-[10px]"
              >
                <Eye className="w-3.5 h-3.5" /> Xem lại bài
              </button>
              <button 
                onClick={() => navigate('/')}
                className="px-6 py-3.5 bg-primary/10 text-primary font-black rounded-xl flex items-center gap-2 transition-all hover:bg-primary/20 uppercase tracking-wide text-[10px]"
              >
                <Home className="w-3.5 h-3.5" /> Về trang chủ
              </button>
            </div>
            
            {result.gradingStatus === "ai_graded_essay" && (
              <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-left">
                <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-black text-amber-900 uppercase tracking-tight">Lưu ý về chấm điểm AI</p>
                  <p className="text-[11px] text-amber-700 leading-relaxed font-medium">
                    Bài thi của bạn có câu hỏi tự luận được chấm điểm tự động bởi AI. 
                    Kết quả này mang tính chất tham khảo và có thể có sai sót so với ý đồ của giáo viên.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Review Section */}
          <AnimatePresence>
            {isReviewMode && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 pt-6 border-t border-border"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-black flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-primary" /> Chi tiết từng câu hỏi
                  </h3>
                  <button onClick={() => setIsReviewMode(false)} className="text-[10px] font-bold text-muted-foreground hover:text-foreground uppercase tracking-widest">Đóng xem lại</button>
                </div>

                {questions.map((q, idx) => {
                  const studentAns = answers[q.id] || [];
                  const isEssay = q.type === "essay";
                  const isEssayEmpty = isEssay && (!studentAns[0] || !studentAns[0].trim());
                  
                  // Safe sort without mutating original array
                  const isCorrect = isEssay 
                    ? false // Essay cannot be 'correct' by exact match
                    : JSON.stringify([...studentAns].sort()) === JSON.stringify([...(q.correctAnswers || [])].sort());
                  
                  let badgeText = isCorrect ? "Đúng" : "Sai";
                  let badgeColor = isCorrect ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500";
                  
                  if (isEssay) {
                    if (isEssayEmpty) {
                      badgeText = "Sai (Bỏ trống)";
                    } else {
                      badgeText = "Chờ chấm";
                      badgeColor = "bg-amber-500/10 text-amber-500";
                    }
                  }

                  return (
                    <div key={q.id} className="bg-card border border-border rounded-[1.5rem] p-6 space-y-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 bg-muted rounded-md text-[9px] font-black uppercase tracking-widest text-muted-foreground">Câu {idx + 1}</span>
                        <span className={cn(
                          "px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest",
                          badgeColor
                        )}>
                          {badgeText}
                        </span>
                      </div>
                      <h4 className="text-lg font-bold leading-tight">{q.content}</h4>
                      
                      {q.type === "essay" ? (
                        <div className="space-y-4">
                          <div className="p-4 bg-muted/30 border-2 border-border rounded-2xl">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Câu trả lời của bạn:</p>
                            <p className="text-sm font-medium whitespace-pre-wrap">{studentAns[0] || "(Không có câu trả lời)"}</p>
                          </div>
                          <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl">
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2 flex items-center gap-2">
                              <Sparkles className="w-3 h-3" /> Đánh giá từ AI:
                            </p>
                            <p className="text-sm text-muted-foreground italic leading-relaxed">
                              Kết quả tự luận đã được tích hợp vào tổng điểm. 
                              Bạn có thể xem nhận xét chi tiết sau khi giáo viên công bố kết quả chính thức.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {q.choices?.map(choice => {
                            const isStudentChoice = studentAns.includes(choice.key);
                            const isRightChoice = q.correctAnswers?.includes(choice.key);
                            
                            return (
                              <div 
                                key={choice.key}
                                className={cn(
                                  "p-3 rounded-xl border-2 flex items-center gap-3 text-sm",
                                  isRightChoice ? "bg-emerald-50 border-emerald-500 text-emerald-900" :
                                  isStudentChoice ? "bg-rose-50 border-rose-500 text-rose-900" : "bg-muted/30 border-transparent text-muted-foreground"
                                )}
                              >
                                <div className={cn(
                                  "w-7 h-7 rounded-lg flex items-center justify-center font-black text-[10px]",
                                  isRightChoice ? "bg-emerald-500 text-white" :
                                  isStudentChoice ? "bg-rose-500 text-white" : "bg-muted text-muted-foreground"
                                )}>
                                  {choice.key}
                                </div>
                                <span className="font-bold">{choice.content}</span>
                                {isRightChoice && <CheckCircle2 className="w-3.5 h-3.5 ml-auto text-emerald-500" />}
                              </div>
                            );
                          })}
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
