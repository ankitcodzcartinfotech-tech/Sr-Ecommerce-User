"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export default function SmoothScrolling({ children }) {
  useEffect(() => {
    let lenis;
    let rafId;

    // Use smooth scrolling globally
    lenis = new Lenis({
      lerp: 0.08,
      smoothWheel: true,
      smoothTouch: false, // Prevents hijacking native touch scroll for better performance
    });

    const raf = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };

    rafId = requestAnimationFrame(raf);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (lenis) lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
