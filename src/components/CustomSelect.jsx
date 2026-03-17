import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function CustomSelect({ value, onChange, options, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef(null);
  const { t } = useTranslation();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setActiveIndex(options.indexOf(value));
      } else if (activeIndex >= 0) {
        onChange({ target: { id: "teachingField", value: options[activeIndex] } });
        setIsOpen(false);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setActiveIndex(0);
      } else {
        setActiveIndex((prev) => (prev + 1) % options.length);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (isOpen) {
        setActiveIndex((prev) => (prev - 1 + options.length) % options.length);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative group w-full" ref={containerRef}>
      <div
        tabIndex="0"
        onKeyDown={handleKeyDown}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full pl-12 pr-10 py-3 bg-border/20 border border-border rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all cursor-pointer flex items-center justify-between outline-none"
      >
        <span className={`${!value ? "text-muted-foreground/50" : "text-foreground"}`}>
          {value ? t(`register.fields.${value}`) : placeholder}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        </motion.div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 5, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute z-50 w-full bg-background/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl overflow-hidden max-h-[300px] flex flex-col"
          >
            <div className="overflow-y-auto custom-scrollbar p-2 space-y-1">
              {options.map((opt, index) => (
                <motion.div
                  key={opt}
                  whileHover={{ x: 4, backgroundColor: "rgba(126, 69, 241, 0.1)" }}
                  onClick={() => {
                    onChange({ target: { id: "teachingField", value: opt } });
                    setIsOpen(false);
                  }}
                  className={`px-4 py-3 rounded-lg cursor-pointer flex items-center justify-between transition-colors ${
                    (value === opt || activeIndex === index)
                      ? "bg-primary/20 text-primary font-bold"
                      : "text-muted-foreground hover:text-foreground hover:bg-primary/5"
                  }`}
                >
                  <span>{t(`register.fields.${opt}`)}</span>
                  {value === opt && <Check className="w-4 h-4" />}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
