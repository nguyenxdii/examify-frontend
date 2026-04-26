import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Globe, Check, ExternalLink } from "lucide-react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { QRCodeSVG } from "qrcode.react";
import syndeIcon from "../../assets/synde_S_icon.svg";

export default function ShareExamModal({ isOpen, onClose, examId, examTitle }) {
  const { t } = useTranslation();
  const [copied, setCopied] = React.useState(false);
  
  // Generate the public quiz link
  const shareLink = `${window.location.origin}/public-quiz/${examId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    toast.success(t("share.copy_success") || "Đã sao chép link chia sẻ");
    setTimeout(() => setCopied(false), 2000);
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
            className="relative w-full max-w-md bg-card border border-border rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-8 pb-0 text-center">
              <h3 className="text-3xl font-black text-foreground mb-2 tracking-tight">
                {t("share.title") || "Chia sẻ đề thi"}
              </h3>
              <p className="text-sm font-bold text-primary mb-6">
                {examTitle}
              </p>
              
              {/* QR Code Section */}
              <div className="flex flex-col items-center justify-center py-4">
                <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-primary/10 border border-primary/10 transform hover:scale-105 transition-transform duration-300">
                  <QRCodeSVG 
                    value={shareLink}
                    size={180}
                    level="H"
                    includeMargin={false}
                    fgColor="#000000"
                    imageSettings={{
                      src: syndeIcon,
                      x: undefined,
                      y: undefined,
                      height: 40,
                      width: 40,
                      excavate: true,
                    }}
                  />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mt-4">
                  {t("share.qr_desc") || "Quét mã để bắt đầu làm bài"}
                </p>
              </div>
            </div>

            {/* Link Box */}
            <div className="p-8 pt-6 space-y-6">
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground px-1 flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5" /> {t("share.url_label") || "Đường dẫn làm bài công khai"}
                </label>
                <div className="relative group">
                  <input
                    readOnly
                    value={shareLink}
                    className="w-full bg-muted/50 border border-border rounded-2xl p-4 pr-12 text-sm font-bold focus:outline-none transition-all group-hover:bg-muted group-hover:border-primary/30"
                  />
                  <button
                    onClick={handleCopy}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-primary text-white shadow-lg shadow-primary/20 hover:scale-110 active:scale-95 transition-all"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-1 gap-3 pt-2">
                <button
                  onClick={() => window.open(shareLink, '_blank')}
                  className="w-full py-4.5 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 text-sm uppercase tracking-wide"
                >
                  <ExternalLink className="w-4 h-4" /> {t("share.preview_btn") || "Xem thử giao diện (Preview)"}
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-4 bg-muted text-muted-foreground font-bold rounded-2xl transition-all hover:bg-muted/80 text-xs uppercase tracking-widest"
                >
                  {t("common.cancel") || "Đóng"}
                </button>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 hover:bg-muted rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
