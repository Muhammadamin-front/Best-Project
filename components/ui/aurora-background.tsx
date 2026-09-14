"use client";

import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "framer-motion";
import type { HTMLProps, ReactNode } from "react";

export interface AuroraBackgroundProps extends HTMLProps<HTMLDivElement> {
  children: ReactNode;
  showRadialGradient?: boolean;
}

export function AuroraBackground({
  className,
  children,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      className={cn(
        "relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-zinc-50 text-slate-950",
        className,
      )}
      {...props}
    >
      <motion.div
        className="aurora-background__overflow"
        initial={prefersReducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.15, ease: "easeOut" }}
        aria-hidden="true"
      >
        <div
          className={cn(
            "aurora-background__lights",
            showRadialGradient && "aurora-background__lights--radial",
          )}
        />
      </motion.div>
      {children}
    </div>
  );
}
