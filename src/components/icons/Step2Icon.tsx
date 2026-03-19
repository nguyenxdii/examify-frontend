"use client";

import { motion } from "framer-motion";
import type { HTMLAttributes } from "react";
import { forwardRef } from "react";

import { cn } from "../../lib/utils";

interface BotMessageSquareProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
  isAnimating?: boolean;
}

export const BotMessageSquareIcon = forwardRef<
  HTMLDivElement,
  BotMessageSquareProps
>(({ className, size = 28, isAnimating, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("inline-flex items-center justify-center", className)}
      {...props}
    >
      <motion.svg
        animate={isAnimating ? {
          rotate: [0, -3, 3, 0, 0],
          y: [0, 1.5, -1.5, 0],
          scale: [1, 1.03, 1],
        } : {}}
        transition={isAnimating ? {
          duration: 1.5,
          ease: "easeInOut",
          repeat: Infinity,
          repeatDelay: 0.5,
        } : {}}
        fill="none"
        height={size}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        width={size}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M12 6V2H8" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <motion.path
          d="M20 16a2 2 0 0 1-2 2H8.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 4 20.286V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z"
          animate={isAnimating ? { scale: [1, 1.04, 1] } : {}}
          transition={isAnimating ? {
            duration: 0.8,
            ease: "easeInOut",
            repeat: Infinity,
            repeatDelay: 1.2,
          } : {}}
          style={{ originX: 0.5, originY: 0.5 }}
        />
        <motion.path
          d="M9 11v2"
          animate={isAnimating ? { scaleY: [1, 0.1, 1] } : {}}
          transition={isAnimating ? {
            duration: 0.5,
            ease: "easeInOut",
            repeat: Infinity,
            repeatDelay: 1.5,
            delay: 0.1,
          } : {}}
          style={{ originY: 0.5 }}
        />
        <motion.path
          d="M15 11v2"
          animate={isAnimating ? { scaleY: [1, 0.1, 1] } : {}}
          transition={isAnimating ? {
            duration: 0.5,
            ease: "easeInOut",
            repeat: Infinity,
            repeatDelay: 1.5,
            delay: 0.2,
          } : {}}
          style={{ originY: 0.5 }}
        />
        <motion.circle
          cx="10"
          cy="18"
          r="0.5"
          animate={isAnimating ? { opacity: [0.3, 1, 0.3] } : {}}
          transition={isAnimating ? {
            repeat: Infinity,
            duration: 1.2,
            delay: 0,
          } : {}}
        />
        <motion.circle
          cx="12"
          cy="18"
          r="0.5"
          animate={isAnimating ? { opacity: [0.3, 1, 0.3] } : {}}
          transition={isAnimating ? {
            repeat: Infinity,
            duration: 1.2,
            delay: 0.3,
          } : {}}
        />
        <motion.circle
          cx="14"
          cy="18"
          r="0.5"
          animate={isAnimating ? { opacity: [0.3, 1, 0.3] } : {}}
          transition={isAnimating ? {
            repeat: Infinity,
            duration: 1.2,
            delay: 0.6,
          } : {}}
        />
      </motion.svg>
    </div>
  );
});

BotMessageSquareIcon.displayName = "BotMessageSquareIcon";
