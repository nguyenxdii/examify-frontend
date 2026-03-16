import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Ghost } from "lucide-react";

export default function NotFound() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[120px]"
        />
      </div>

      <div className="relative z-10 text-center max-w-2xl w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
          }}
          className="relative inline-block w-full"
        >
          <h1 className="text-[8rem] sm:text-[12rem] font-black text-primary/10 select-none leading-none">
            {t("notFound.title")}
          </h1>
          <motion.div
            animate={{
              y: [0, -20, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-48 h-48 sm:w-64 sm:h-64 bg-card border-2 border-primary/20 rounded-3xl shadow-2xl flex flex-col items-center justify-center p-8 transform rotate-6 hover:rotate-0 transition-transform duration-500">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <Ghost className="w-10 h-10 text-primary" />
              </div>
              <div className="space-y-3 w-full">
                <div className="h-2 w-3/4 bg-primary/20 rounded-full mx-auto" />
                <div className="h-2 w-1/2 bg-primary/10 rounded-full mx-auto" />
              </div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 space-y-4"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            {t("notFound.sub")}
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            {t("notFound.desc")}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 flex flex-col items-center gap-6"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-10 py-3 bg-primary/5 border-2 border-primary text-primary rounded-2xl font-bold hover:bg-primary/10 hover:scale-105 active:scale-95 transition-all w-full sm:w-auto justify-center shadow-lg shadow-primary/5"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </motion.div>
      </div>

      {/* Decorative floating elements */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute hidden sm:block pointer-events-none"
          initial={{
            x: Math.random() * 100 + "%",
            y: Math.random() * 100 + "%",
            opacity: 0,
          }}
          animate={{
            y: ["0px", "-100px", "0px"],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 5 + Math.random() * 10,
            repeat: Infinity,
            delay: Math.random() * 5,
          }}
        >
          <div
            className={`w-2 h-2 rounded-full ${i % 2 === 0 ? "bg-primary" : "bg-secondary"} blur-sm`}
          />
        </motion.div>
      ))}
    </div>
  );
}
