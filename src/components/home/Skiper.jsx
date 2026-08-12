"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const images = [
  "/images/saree1.jpg",
  "/images/saree2.jpg",
  "/images/saree3.jpg",
  "/images/saree4.jpg",
  "/images/saree5.jpg",
  "/images/saree6.jpg",
  "/images/saree7.jpg",
  "/images/saree8.jpg",
  "/images/saree9.jpg",
  "/images/saree10.jpg",
  "/images/hero.jpg",
  "/images/hero-1.jpg",
  "/images/hero-2.jpg",
];

const Skiper = () => {
  const gallery = useRef(null);
  const [dimension, setDimension] = useState({ width: 0, height: 0 });

  const { scrollYProgress } = useScroll({
    target: gallery,
    offset: ["start end", "end start"],
  });

  const { height } = dimension;
  // Use a smaller multiplier on mobile to make it less aggressive
  const isMobile = dimension.width > 0 && dimension.width < 768;
  const mult1 = isMobile ? 0.6 : 2;
  const mult2 = isMobile ? 0.8 : 3.3;
  const mult3 = isMobile ? 0.8 : 1.25;
  const mult4 = isMobile ? 1.4 : 3;

  // Link directly to scrollYProgress (useSpring freezes on iOS during touch-scroll)
  const y = useTransform(scrollYProgress, [0, 1], [0, height * mult1]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, height * mult2]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, height * mult3]);
  const y4 = useTransform(scrollYProgress, [0, 1], [0, height * mult4]);

  useEffect(() => {
    let currentWidth = window.innerWidth;
    
    const resize = () => {
      // On mobile, the URL bar hiding triggers a resize (changing height).
      // We ONLY want to update and recalculate parallax if the WIDTH changes (e.g., rotating the phone),
      // otherwise scrolling will cause massive lag from constant re-renders.
      if (window.innerWidth !== currentWidth || currentWidth === 0) {
        currentWidth = window.innerWidth;
        setDimension({ width: window.innerWidth, height: window.innerHeight });
      } else if (dimension.height === 0) {
        // Initial setup
        setDimension({ width: window.innerWidth, height: window.innerHeight });
      }
    };

    window.addEventListener("resize", resize);
    // Initial call to set dimensions
    setDimension({ width: window.innerWidth, height: window.innerHeight });

    return () => {
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <section className="w-full overflow-hidden bg-white">
      {/* Top hint section */}
      <div className="flex h-40 items-center justify-center gap-2 bg-[#FAF9F6]">
        <div className="grid content-start justify-items-center gap-6 text-center">
          <span className="relative max-w-[12ch] text-xs uppercase leading-tight text-[#4A4A4A] opacity-70 after:absolute after:left-1/2 after:top-full after:mt-4 after:h-10 after:w-px after:bg-gradient-to-b after:from-[#e88436] after:to-transparent after:content-['']">
            Scroll to explore
          </span>
        </div>
      </div>

      {/* Gallery section */}
      <div
        ref={gallery}
        className="relative flex h-[175vh] gap-[2vw] overflow-hidden bg-[#FAF9F6] p-[2vw]"
      >
        {isMobile ? (
          <>
            <Column images={images.slice(0, 6)} y={y} isMobile={isMobile} />
            <Column images={images.slice(6, 12)} y={y2} isMobile={isMobile} />
          </>
        ) : (
          <>
            <Column images={images.slice(0, 3)} y={y} isMobile={isMobile} />
            <Column images={images.slice(3, 6)} y={y2} isMobile={isMobile} />
            <Column images={images.slice(6, 9)} y={y3} isMobile={isMobile} />
            <Column images={images.slice(9, 12)} y={y4} isMobile={isMobile} />
          </>
        )}
      </div>

      {/* Bottom hint section */}
      <div className="flex h-40 items-center justify-center gap-2 bg-[#FAF9F6]">
        <div className="grid content-start justify-items-center gap-6 text-center">
          <span className="relative max-w-[12ch] text-xs uppercase leading-tight text-[#4A4A4A] opacity-70">
            Keep exploring
          </span>
        </div>
      </div>
    </section>
  );
};

const Column = ({ images, y, isMobile }) => {
  return (
    <motion.div
      className={
        isMobile
          ? "relative flex h-full w-1/2 flex-col gap-[3vw] top-[-15%]"
          : "relative flex h-full w-1/4 flex-col gap-[2vw] first:top-[-45%] nth-2:top-[-95%] nth-3:top-[-45%] nth-4:top-[-75%]"
      }
      style={{ y, willChange: "transform" }}
    >
      {images.map((src, i) => (
        <div key={i} className="relative h-full w-full overflow-hidden rounded-[14px] md:rounded-[20px]">
          <img
            src={src}
            alt="Premium saree"
            className="h-full w-full object-cover object-top"
            loading="lazy"
          />
        </div>
      ))}
    </motion.div>
  );
};

export default Skiper;
