"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";

/**
 * True on phone-sized screens.
 * We use this to calm the on-scroll animation, because a vertical slide that
 * fires on every section is what makes a page feel like it is shifting around
 * while you scroll on a phone.
 */
function useIsSmallScreen(): boolean {
  const [isSmall, setIsSmall] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 640px)");
    const update = () => setIsSmall(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return isSmall;
}

/** Subtle on-scroll fade. Slides up on desktop only; fades in place on phones. */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  // Note: framer-motion animates via inline styles, so the global
  // `prefers-reduced-motion` CSS rule does not reach it. We have to check here.
  const prefersReducedMotion = useReducedMotion();
  const isSmall = useIsSmallScreen();

  const noMotion = prefersReducedMotion === true;
  // No vertical travel on phones or for reduced-motion users — fade only.
  const offset = noMotion || isSmall ? 0 : 16;
  const duration = noMotion ? 0 : isSmall ? 0.3 : 0.5;

  return (
    <motion.div
      className={className}
      initial={{ opacity: noMotion ? 1 : 0, y: offset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration, ease: "easeOut", delay: noMotion ? 0 : delay }}
    >
      {children}
    </motion.div>
  );
}
