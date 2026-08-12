"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const STAGGER = 0.035;

export function TextRoll({
  children,
  className,
  center = false,
  stagger = STAGGER,
}) {
  return (
    <motion.span
      initial="initial"
      whileHover="hovered"
      className={cn("relative block overflow-hidden cursor-default", className)}
      style={{ lineHeight: 0.85 }}
    >
      {/* Row 1 — visible, rolls out upward */}
      <div>
        {children.split("").map((l, i) => {
          const delay = center
            ? stagger * Math.abs(i - (children.length - 1) / 2)
            : stagger * i;
          return (
            <motion.span
              key={i}
              variants={{
                initial: { y: 0 },
                hovered: { y: "-100%" },
              }}
              transition={{ ease: "easeInOut", delay }}
              className="inline-block"
            >
              {l === " " ? "\u00A0" : l}
            </motion.span>
          );
        })}
      </div>

      {/* Row 2 — hidden below, rolls in */}
      <div className="absolute inset-0">
        {children.split("").map((l, i) => {
          const delay = center
            ? stagger * Math.abs(i - (children.length - 1) / 2)
            : stagger * i;
          return (
            <motion.span
              key={i}
              variants={{
                initial: { y: "100%" },
                hovered: { y: 0 },
              }}
              transition={{ ease: "easeInOut", delay }}
              className="inline-block"
            >
              {l === " " ? "\u00A0" : l}
            </motion.span>
          );
        })}
      </div>
    </motion.span>
  );
}
