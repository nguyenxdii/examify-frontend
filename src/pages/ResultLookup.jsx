import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  User, 
  Key, 
  ArrowRight, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  Calendar,
  Award,
  FileText,
  ChevronRight,
  ArrowLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { lookupResult } from "../api/examApi";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { cn } from "../lib/utils";

export default function ResultLookup() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [studentId, setStudentId] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  React.useEffect(() => {
    document.title = t("titles.lookup");
  }, [t]);
  const [error, setError] = useState(null);

  // Load state from localStorage on mount
  React.useEffect(() => {
    document.title = t("titles.lookup");
    
    const savedStudentId = localStorage.getItem("examify_lookup_studentId");
    const savedRoomCode = localStorage.getItem("examify_lookup_roomCode");
    if (savedStudentId) setStudentId(savedStudentId);
    if (savedRoomCode) setRoomCode(savedRoomCode);
    
    if (savedStudentId && savedRoomCode) {
      // Auto trigger lookup if both exist
      const triggerLookup = async () => {
        setLoading(true);
        try {
          const res = await lookupResult(savedStudentId, savedRoomCode);
          const grouped = res.data.reduce((acc, sub) => {
            const key = sub.roomCode || sub.roomId;
            if (!acc[key] || new Date(sub.submittedAt) > new Date(acc[key].submittedAt)) acc[key] = sub;
            return acc;
          }, {});
          setResults(Object.values(grouped));
        } catch (err) {
          setError(err.response?.data?.message || t("lookup.noResult"));
        } finally {
          setLoading(false);
        }
      };
      triggerLookup();
    }
  }, []);

  const handleLookup = async (e) => {
    if (e) e.preventDefault();
    if (!studentId || !roomCode) return;

    // Save to localStorage
    localStorage.setItem("examify_lookup_studentId", studentId);
    localStorage.setItem("examify_lookup_roomCode", roomCode);

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const res = await lookupResult(studentId, roomCode);
      const grouped = res.data.reduce((acc, sub) => {
        const key = sub.roomCode || sub.roomId;
        if (!acc[key] || new Date(sub.submittedAt) > new Date(acc[key].submittedAt)) {
          acc[key] = sub;
        }
        return acc;
      }, {});
      setResults(Object.values(grouped));
    } catch (err) {
      setError(err.response?.data?.message || t("lookup.noResult"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] animate-pulse delay-700" />
        </div>

        <div className="w-full max-w-lg mx-auto">
          <div className="text-center mb-6">
              <h1 className="text-lg font-bold tracking-tight">
                {t("lookup.title")}
              </h1>
          </div>

          <div className="flex flex-col gap-6">
            {/* Form Side - Now Centered */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card border border-border p-5 rounded-[1.2rem] shadow-lg relative overflow-hidden max-w-sm mx-auto w-full"
            >
              <form onSubmit={handleLookup} className="space-y-3 relative z-10">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider ml-1">
                    {t("lookup.studentId")}
                  </label>
                  <div className="relative group">
                    <div className="absolute left-2.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-muted rounded-lg flex items-center justify-center group-focus-within:bg-primary/10 group-focus-within:text-primary transition-colors">
                      <User className="w-3 h-3" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder={t("lookup.placeholderStudentId")}
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      className="w-full pl-11 pr-3 py-2 bg-muted/20 border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider ml-1">
                    {t("lookup.roomCode")}
                  </label>
                  <div className="relative group">
                    <div className="absolute left-2.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-muted rounded-lg flex items-center justify-center group-focus-within:bg-primary/10 group-focus-within:text-primary transition-colors">
                      <Key className="w-3 h-3" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder={t("lookup.placeholderRoomCode")}
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value)}
                      className="w-full pl-11 pr-3 py-2 bg-muted/20 border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium text-xs tracking-widest uppercase"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-primary text-white rounded-lg font-bold text-xs shadow-md shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      {t("lookup.searching")}
                    </>
                  ) : (
                    <>
                      {t("lookup.btn")}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            </motion.div>

            {/* Results Section */}
            <div className="min-h-[300px] relative">
              <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center py-20 gap-4"
                    >
                      <div className="relative">
                        <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
                        <Search className="absolute inset-0 m-auto w-4 h-4 text-primary animate-pulse" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">{t("lookup.searching")}</p>
                    </motion.div>
                  ) : error ? (
                    <motion.div
                      key="error"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-rose-500/5 border border-rose-500/10 rounded-[1.5rem] p-8 text-center"
                    >
                      <div className="w-14 h-14 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-6 h-6 text-rose-500" />
                      </div>
                      <h3 className="text-lg font-black text-rose-500 mb-1">{t("lookup.noResult")}</h3>
                      <p className="text-xs text-muted-foreground font-medium">{t("lookup.noResultDesc")}</p>
                    </motion.div>
                  ) : results ? (
                    <motion.div
                      key="results"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between px-2 mb-2">
                        <h3 className="font-black text-[10px] uppercase tracking-widest flex items-center gap-2 text-muted-foreground">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          {t("lookup.resultFound", { count: results.length })}
                        </h3>
                      </div>

                      <div className="space-y-3">
                        {results.map((result, idx) => (
                          <motion.div
                            key={result.submissionId}
                            layout
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05, type: "spring", stiffness: 100 }}
                            onClick={() => navigate(`/lookup/submission/${result.submissionId}?roomCode=${roomCode}&studentId=${studentId}`)}
                            className="group bg-card border-2 border-border/50 p-5 rounded-[1.5rem] hover:border-primary/50 hover:bg-primary/[0.02] transition-all shadow-sm hover:shadow-xl hover:shadow-primary/5 cursor-pointer active:scale-[0.99] flex items-center gap-5 relative overflow-hidden"
                          >
                            <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors" />
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 bg-primary/10 text-primary rounded-lg border border-primary/20">
                                  {result.examTitle || t("lookup.examName")}
                                </span>
                                <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-bold">
                                  <Calendar className="w-3.5 h-3.5" />
                                  {new Date(result.submittedAt).toLocaleDateString()}
                                </div>
                              </div>
                              
                              <h4 className="text-base md:text-lg font-black truncate group-hover:text-primary transition-colors mb-2">
                                {result.roomName || t("rooms.detail.tab_submissions")}
                              </h4>
                              
                              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-bold text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <User className="w-3.5 h-3.5 opacity-50" />
                                  <span className="truncate max-w-[150px] text-foreground/80">{result.studentName}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Award className="w-3.5 h-3.5 opacity-50" />
                                  <span className={cn(
                                    "font-black",
                                    result.gradingStatus === "pending_announcement" ? "text-amber-500 italic font-medium" : "text-primary"
                                  )}>
                                    {result.gradingStatus === "pending_announcement" ? t("common.pending_announcement") : `${result.score.toFixed(1)}/10`}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-muted group-hover:bg-primary group-hover:text-white group-hover:rotate-12 transition-all duration-300">
                              <ChevronRight className="w-5 h-5" />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center py-16 text-center"
                    >
                      <div className="relative mb-6">
                        <div className="w-24 h-24 bg-primary/5 rounded-[2rem] flex items-center justify-center rotate-6 group-hover:rotate-12 transition-transform">
                          <Award className="w-12 h-12 text-primary/40" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-background border-2 border-border rounded-xl flex items-center justify-center shadow-lg">
                          <Search className="w-5 h-5 text-muted-foreground" />
                        </div>
                      </div>
                      <p className="text-sm font-black text-muted-foreground/60 max-w-[240px] leading-relaxed">
                        {t("lookup.readyDesc")}
                      </p>
                    </motion.div>
                  )}
              </AnimatePresence>
            </div>
            </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
