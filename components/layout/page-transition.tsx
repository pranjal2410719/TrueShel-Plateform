"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";

const pageVariants = {
  initial: { opacity: 0, y: 6 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.18,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: {
      duration: 0.12,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
};

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div
      key={pathname}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full min-w-0"
    >
      {children}
    </motion.div>
  );
}
