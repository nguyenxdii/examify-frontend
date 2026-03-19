"use client";

import type { Variants } from "framer-motion";
import { motion } from "framer-motion";
import type { HTMLAttributes } from "react";
import { forwardRef } from "react";

import { cn } from "../../lib/utils";

interface LaptopMinimalCheckIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
  isAnimating?: boolean;
}

const CHECK_VARIANTS: Variants = {
  animate: {
    pathLength: [0, 1, 1, 0],
    opacity: [0, 1, 1, 0],
    transition: {
      duration: 2.5,
      ease: "easeInOut",
      repeat: Infinity,
      repeatDelay: 0.5,
    },
  },
};

const FLOAT_VARIANTS: Variants = {
  animate: {
    y: [0, -6, 0],
    transition: {
      duration: 3,
      ease: "easeInOut",
      repeat: Infinity,
    },
  },
};

const STAR_TWINKLE_VARIANTS: Variants = {
  animate: (i: number) => ({
    opacity: [0.2, 1, 0.2],
    scale: [0.8, 1.2, 0.8],
    transition: {
      duration: 1.5 + i * 0.3,
      ease: "easeInOut",
      repeat: Infinity,
      delay: i * 0.2,
    },
  }),
};



const LaptopMinimalCheckIcon = forwardRef<
  HTMLDivElement,
  LaptopMinimalCheckIconProps
>(({ className, size = 28, isAnimating, ...props }, ref) => {
  const starPositions = [
    { x: -24, y: -14, size: 7 },
    { x: 26, y: -10, size: 6 },
    { x: -20, y: 12, size: 5 },
  ];

  return (
    <div ref={ref} className={cn("relative", className)} {...props}>
      {/* Subtle dark glow */}
      <motion.div
        className="absolute rounded-full bg-foreground/5"
        style={{
          width: size * 3,
          height: size * 3,
          left: "50%",
          top: "50%",
          x: "-50%",
          y: "-50%",
          filter: "blur(20px)",
        }}
        animate={isAnimating ? {
          opacity: [0.3, 0.5, 0.3],
          scale: [1, 1.1, 1],
        } : {}}
        transition={isAnimating ? {
          duration: 3,
          ease: "easeInOut",
          repeat: Infinity,
        } : {}}
      />

      {/* Twinkling stars */}
      {starPositions.map((pos, i) => (
        <motion.div
          key={`star-${i}`}
          className="absolute"
          style={{
            left: `calc(50% + ${pos.x}px)`,
            top: `calc(50% + ${pos.y}px)`,
          }}
          custom={i}
          variants={STAR_TWINKLE_VARIANTS}
          animate={isAnimating ? "animate" : ""}
        >
          <svg
            width={pos.size}
            height={pos.size}
            viewBox="0 0 10 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5 0L5.7 3.5L10 5L5.7 6.5L5 10L4.3 6.5L0 5L4.3 3.5L5 0Z"
              className="fill-foreground"
            />
          </svg>
        </motion.div>
      ))}



      {/* Floating laptop icon */}
      <motion.div variants={FLOAT_VARIANTS} animate={isAnimating ? "animate" : ""} className="relative z-10">
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
          <path d="M2 20h20" />
          <rect height="12" rx="2" width="18" x="3" y="4" />
          <motion.path
            d="m9 10 2 2 4-4"
            variants={CHECK_VARIANTS}
            animate={isAnimating ? "animate" : ""}
            style={{ transformOrigin: "center" }}
          />
        </svg>
      </motion.div>
    </div>
  );
});

LaptopMinimalCheckIcon.displayName = "LaptopMinimalCheckIcon";

export { LaptopMinimalCheckIcon };
