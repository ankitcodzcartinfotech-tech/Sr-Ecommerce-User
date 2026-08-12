"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const images = [
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80",
];

const Skiper = () => {
  const gallery = useRef(null);
  const [height, setHeight] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const { scrollYProgress } = useScroll({
    target: gallery,
    offset: ["start end", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, height * 1.8]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, height * 3]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, height * 1.1]);
  const y4 = useTransform(scrollYProgress, [0, 1], [0, height * 2.7]);

  const yM1 = useTransform(scrollYProgress, [0, 1], [0, height * 0.6]);
  const yM2 = useTransform(scrollYProgress, [0, 1], [0, height * 0.9]);

  useEffect(() => {
    const update = () => {
      setHeight(window.innerHeight);
      setIsMobile(window.innerWidth < 768);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <section className="w-full bg-white py-4">
      {/* "Scroll to explore" hint */}
      <div className="flex h-10 items-center justify-center">
        <span className="text-[10px] uppercase tracking-[0.25em] text-stone-400">
          Scroll to explore
        </span>
      </div>

      {/* Gallery — big horizontal margin */}
      <div className="mx-auto max-w-[1440px] px-16 sm:px-24 md:px-32 lg:px-40">
        <div
          ref={gallery}
          className="relative flex h-[90vh] gap-3 overflow-hidden rounded-2xl"
        >
          {isMobile ? (
            <>
              <Column images={images.slice(0, 6)} y={yM1} />
              <Column images={images.slice(6, 12)} y={yM2} />
            </>
          ) : (
            <>
              <Column images={images.slice(0, 3)} y={y1} topOffset="-45%" />
              <Column images={images.slice(3, 6)} y={y2} topOffset="-95%" />
              <Column images={images.slice(6, 9)} y={y3} topOffset="-45%" />
              <Column images={images.slice(9, 12)} y={y4} topOffset="-75%" />
            </>
          )}
        </div>
      </div>

      {/* Bottom hint */}
      <div className="flex h-10 items-center justify-center mt-3">
        <span className="text-[10px] uppercase tracking-[0.25em] text-stone-400">
          Keep exploring
        </span>
      </div>
    </section>
  );
};

const Column = ({ images, y, topOffset = "0%" }) => {
  return (
    <motion.div
      className="relative flex h-full w-1/4 flex-col gap-3"
      style={{ y, top: topOffset, willChange: "transform" }}
    >
      {images.map((src, i) => (
        <div
          key={i}
          className="relative w-full overflow-hidden rounded-xl"
          style={{ height: "33.33%" }}
        >
          <img
            src={src}
            alt="Curated product"
            className="h-full w-full object-cover object-center"
            loading="lazy"
          />
        </div>
      ))}
    </motion.div>
  );
};

export default Skiper;
