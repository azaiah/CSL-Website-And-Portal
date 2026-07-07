"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";

/**
 * Branded full-screen loader shown on first load, then fades into the site.
 * If `public/loader.mp4` exists it plays; otherwise the logo animates via
 * framer-motion (graceful fallback — the site never looks broken).
 */
export function PageLoader() {
  const [visible, setVisible] = useState(true);
  const [hasVideo, setHasVideo] = useState(false);

  useEffect(() => {
    // Probe for an optional loader video without breaking if it's absent.
    let active = true;
    fetch("/loader.mp4", { method: "HEAD" })
      .then((res) => {
        if (active && res.ok) setHasVideo(true);
      })
      .catch(() => {});

    const done = () => setVisible(false);
    // Hide once the window has loaded, with a minimum brand-moment.
    const minTimer = setTimeout(done, 1400);
    window.addEventListener("load", done);
    return () => {
      active = false;
      clearTimeout(minTimer);
      window.removeEventListener("load", done);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="loader"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-navy-deep"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          aria-hidden="true"
        >
          {hasVideo ? (
            <video
              className="h-40 w-40 object-contain"
              autoPlay
              muted
              loop
              playsInline
            >
              <source src="/loader.mp4" type="video/mp4" />
            </video>
          ) : (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col items-center gap-5"
            >
              <motion.div
                animate={{ rotate: [0, 3, -3, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="relative"
              >
                <Image
                  src="/logo.png"
                  alt=""
                  width={96}
                  height={96}
                  className="h-24 w-24 object-contain"
                  priority
                />
              </motion.div>
              <motion.div
                className="h-0.5 w-28 overflow-hidden rounded-full bg-white/15"
                aria-hidden
              >
                <motion.div
                  className="h-full w-1/2 rounded-full bg-gold"
                  animate={{ x: ["-100%", "220%"] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                />
              </motion.div>
              <span className="text-xs font-medium uppercase tracking-[0.3em] text-gold-light">
                Capital Solutions &amp; Logistics
              </span>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
