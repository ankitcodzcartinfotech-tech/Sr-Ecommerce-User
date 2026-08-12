"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────
   HoverExpand_001
   Exact skiper52 animation:
   • All panels same height, same rounded-3xl shape
   • Active  → width: "24rem"
   • Inactive → width: "2.5rem"  (slim strip)
   • Smooth easeInOut 300ms
   Each image object: { src, alt, code? }
   Content overlay (icon, title, desc) is optional via renderOverlay()
───────────────────────────────────────────────────────────── */
export function HoverExpand_001({ images, className, renderOverlay }) {
  const [activeImage, setActiveImage] = useState(1);

  return (
    <motion.div
      initial={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ duration: 0.3, delay: 0.5 }}
      className={cn("relative w-full max-w-6xl px-5", className)}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        <div className="flex w-full items-center justify-center gap-1">
          {images.map((image, index) => {
            const isActive = activeImage === index;

            return (
              <motion.div
                key={index}
                className="relative cursor-pointer overflow-hidden rounded-3xl"
                initial={{ width: "2.5rem", height: "20rem" }}
                animate={{
                  width:  isActive ? "24rem" : "2.5rem",
                  height: "20rem",
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                onClick={() => setActiveImage(index)}
                onHoverStart={() => setActiveImage(index)}
              >
                {/* Gradient overlay on active */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      key={`grad-${index}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-10 bg-linear-to-t from-black/60 to-transparent"
                    />
                  )}
                </AnimatePresence>

                {/* Custom content overlay (rendered by parent) */}
                <AnimatePresence>
                  {isActive && renderOverlay && (
                    <motion.div
                      key={`overlay-${index}`}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.28, delay: 0.1 }}
                      className="absolute inset-0 z-20 flex flex-col justify-end p-5"
                    >
                      {renderOverlay(image, index)}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Fallback code tag when no custom overlay */}
                {!renderOverlay && (
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        key={`code-${index}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute z-20 flex h-full w-full flex-col items-end justify-end p-4"
                      >
                        <p className="text-left text-xs text-white/50">{image.code}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}

                <Image
                  src={image.src}
                  className="object-cover object-top"
                  alt={image.alt}
                  loading="lazy"
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Default demo export ─────────────────────────────────── */
const DEMO_IMAGES = [
  { src: "/images/saree1.jpg", alt: "Saree 1", code: "# 01" },
  { src: "/images/saree2.jpg", alt: "Saree 2", code: "# 02" },
  { src: "/images/saree3.jpg", alt: "Saree 3", code: "# 03" },
  { src: "/images/saree4.jpg", alt: "Saree 4", code: "# 04" },
  { src: "/images/saree5.jpg", alt: "Saree 5", code: "# 05" },
  { src: "/images/saree6.jpg", alt: "Saree 6", code: "# 06" },
  { src: "/images/saree7.jpg", alt: "Saree 7", code: "# 07" },
];

const Skiper52 = () => (
  <div className="flex h-full w-full items-center justify-center overflow-hidden bg-[#f5f4f3]">
    <HoverExpand_001 images={DEMO_IMAGES} />
  </div>
);

export { Skiper52 };
export default Skiper52;
