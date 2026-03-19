"use client";

import type { Variants } from "framer-motion";
import { motion, useAnimation } from "framer-motion";
import type { HTMLAttributes } from "react";
import { forwardRef, useEffect, useImperativeHandle } from "react";

import { cn } from "../../lib/utils";

export interface ClipboardCheckIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface ClipboardCheckIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
  isAnimating?: boolean;
}

const CHECK_VARIANTS: Variants = {
  animate: {
    pathLength: [0, 1, 1, 0],
    opacity: [0, 1, 1, 0],
    transition: {
      pathLength: { duration: 2, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.5 },
      opacity: { duration: 2, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.5 },
    },
  },
};

const ClipboardCheckIcon = forwardRef<
  ClipboardCheckIconHandle,
  ClipboardCheckIconProps
>(({ className, size = 28, isAnimating, ...props }, ref) => {
  const controls = useAnimation();

  useEffect(() => {
    if (isAnimating) {
      controls.start("animate");
    } else {
      controls.stop();
    }
  }, [controls, isAnimating]);

  return (
    <div
      className={cn(className)}
      {...props}
    >
      <svg
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
        <rect height="4" rx="1" ry="1" width="8" x="8" y="2" />
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <motion.path
          d="m9 14 2 2 4-4"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={isAnimating ? "animate" : ""}
          style={{ transformOrigin: "center" }}
          variants={CHECK_VARIANTS}
        />
      </svg>
    </div>
  );
});

ClipboardCheckIcon.displayName = "ClipboardCheckIcon";

export { ClipboardCheckIcon };
