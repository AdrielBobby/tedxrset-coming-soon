import type { ReactNode } from "react";
import { motion } from "framer-motion";

// Reveal-once: animates in the first time it enters the viewport, then stays put
// (no rewind on scroll-back). Reduced motion is handled by <MotionConfig reducedMotion="user"> on the page.
const EASE = [0.16, 1, 0.3, 1] as const;
const VIEWPORT = { once: true, margin: "0px 0px -10% 0px" } as const;

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.55, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

// Section titles start grey and turn white as they arrive.
export function RevealHeading({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <motion.h2
      id={id}
      className={className}
      initial={{ opacity: 0, y: 20, color: "#6f6d6d" }}
      whileInView={{ opacity: 1, y: 0, color: "#ffffff" }}
      viewport={VIEWPORT}
      transition={{ duration: 0.6, ease: EASE }}
    >
      {children}
    </motion.h2>
  );
}
