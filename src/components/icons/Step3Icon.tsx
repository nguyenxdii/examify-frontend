"use client";

import type { Variants } from "framer-motion";
import { motion, useAnimation } from "framer-motion";
import type { HTMLAttributes } from "react";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

import { cn } from "../../lib/utils";

export interface FileCogIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

const G_VARIANTS: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

interface FileCogIconProps extends HTMLAttributes<HTMLDivElement> {
  isAnimating?: boolean;
}

const FileCogIcon = forwardRef<
  FileCogIconHandle,
  FileCogIconProps
>(({ className, isAnimating, ...props }, ref) => {
  const controls = useAnimation();
  const isControlledRef = useRef(false);

  useImperativeHandle(ref, () => {
    isControlledRef.current = true;
    return {
      startAnimation: () => controls.start("animate"),
      stopAnimation: () => controls.stop(),
    };
  });

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
        height="28"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        width="28"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M14 2v4a2 2 0 0 0 2 2h4" />
        <path d="M4.677 21.5a2 2 0 0 0 1.313.5H18a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v2.5" />
        <motion.g
          animate={controls}
          variants={G_VARIANTS}
        >
          <path d="m3.2 12.9-.9-.4" />
          <path d="m3.2 15.1-.9.4" />
          <path d="m4.9 11.2-.4-.9" />
          <path d="m4.9 16.8-.4.9" />
          <path d="m7.5 10.3-.4.9" />
          <path d="m7.5 17.7-.4-.9" />
          <path d="m9.7 12.5-.9.4" />
          <path d="m9.7 15.5-.9-.4" />
          <circle cx="6" cy="14" r="3" />
        </motion.g>
      </svg>
    </div>
  );
});

FileCogIcon.displayName = "FileCogIcon";

export { FileCogIcon };
