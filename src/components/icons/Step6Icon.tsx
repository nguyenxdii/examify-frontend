"use client";

import { motion } from "framer-motion";
import type { HTMLAttributes } from "react";
import { forwardRef } from "react";

import { cn } from "../../lib/utils";

interface CloudUploadIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
  isAnimating?: boolean;
}

const CloudUploadIcon = forwardRef<HTMLDivElement, CloudUploadIconProps>(
  ({ className, size = 28, isAnimating, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(className)} {...props}>
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
          <path d="M4.2 15.1A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.2" />
          <motion.g
            animate={isAnimating ? {
              y: [0, -3, 0],
            } : {}}
            transition={isAnimating ? {
              duration: 1,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "loop",
            } : {}}
          >
            <path d="M12 13v8" />
            <path d="m8 17 4-4 4 4" />
          </motion.g>
        </svg>
      </div>
    );
  }
);

CloudUploadIcon.displayName = "CloudUploadIcon";

export { CloudUploadIcon };
