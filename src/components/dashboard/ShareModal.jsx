import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Share2, QrCode, Link as LinkIcon, Eye, EyeOff } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import syndeIcon from "../../assets/synde_S_icon.svg";

export default function ShareModal({ isOpen, onClose, roomId, roomCode, roomName }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const shareUrl = `${window.location.origin}/room/${roomId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success(t("share.copy_success") || "Đã sao chép đường dẫn");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Không thể sao chép");
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-background/80 backdrop-blur-md"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md bg-card border border-border rounded-[2.5rem] shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-black tracking-tight">{t("share.title") || "Chia sẻ phòng thi"}</h3>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">{roomName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Content */}
          <div className="p-8 space-y-8">
            {/* QR Code Section */}
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="p-6 bg-white rounded-3xl shadow-inner border-2 border-primary/5">
                <QRCodeSVG
                  id="room-qr-code"
                  value={shareUrl}
                  size={200}
                  level="H"
                  includeMargin={false}
                  fgColor="#000000"
                  imageSettings={{
                    src: syndeIcon,
                    x: undefined,
                    y: undefined,
                    height: 46,
                    width: 46,
                    excavate: true,
                  }}
                />
              </div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{t("share.qr_desc") || "Quét để vào phòng thi"}</p>
            </div>

            {/* Link Section */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1 flex items-center gap-2">
                <LinkIcon className="w-3.5 h-3.5 text-primary" /> {t("share.url_label") || "Đường dẫn tham gia"}
              </label>
              <div className="relative group">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="w-full h-14 bg-muted/50 border-2 border-border rounded-2xl pl-5 pr-14 font-bold text-sm focus:outline-none focus:border-primary transition-all truncate"
                />
                <button
                  onClick={handleCopy}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Room Code Info */}
            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                  <QrCode className="w-4 h-4" />
                </div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-tight">Mã phòng thi</p>
              </div>
              <div className="flex items-center gap-3">
                <p 
                  className="text-lg font-mono font-black text-primary tracking-tighter cursor-pointer hover:scale-110 transition-transform active:scale-95"
                  onClick={() => {
                    if (showCode) {
                      navigator.clipboard.writeText(roomCode);
                      toast.success("Đã copy mã phòng!");
                    }
                  }}
                  title="Click để copy mã"
                >
                  {showCode ? roomCode : "••••••"}
                </p>
                <button 
                  onClick={() => setShowCode(!showCode)}
                  className="p-1.5 hover:bg-primary/10 rounded-lg text-primary transition-colors"
                >
                  {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Footer Hint */}
          <div className="p-4 bg-muted/30 text-center border-t border-border">
            <p className="text-[10px] text-muted-foreground font-medium italic">
              Học sinh có thể vào phòng bằng mã QR hoặc liên kết trực tiếp này.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
