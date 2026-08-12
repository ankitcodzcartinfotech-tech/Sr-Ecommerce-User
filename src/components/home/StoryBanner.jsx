"use client";

import Image from "next/image";
import Button from "@/components/Button";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function StoryBanner() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.8, 1, 1, 0.8]);

  return (
    <section ref={containerRef} className="px-4 py-16 md:px-10 lg:px-14 lg:py-24 bg-[#FAF9F6]">
      <div className="relative mx-auto min-h-[560px] max-w-[1280px] overflow-hidden rounded-[2.5rem] md:rounded-[4rem] lg:min-h-[700px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)]">
        
        {/* Parallax Image Background */}
        <motion.div style={{ y, opacity }} className="absolute -inset-[15%] h-[130%] w-[130%]">
          <Image
            src="/images/add.jpg"
            alt="Keshrag story"
            fill
            sizes="100vw"
            className="object-cover object-center"
            quality={95}
            priority
          />
        </motion.div>

        {/* Elegant Dark Gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(200,154,90,0.35),transparent_50%)] mix-blend-overlay" />
        
        {/* Fine Grain Texture */}
        <div className="pointer-events-none absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.05]" />

        <div className="relative z-10 flex h-full min-h-[560px] flex-col justify-end px-8 py-16 md:px-16 lg:min-h-[700px] lg:justify-center lg:px-24">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex items-center gap-4"
            >
              <div className="h-px w-8 bg-[#e88436]" />
              <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-[#e88436]">
                The Keshrag Story
              </p>
            </motion.div>
            
            <motion.h3
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
              className="mt-8 font-serif text-[2.5rem] font-light leading-[1.15] text-white sm:text-6xl lg:text-[4.5rem]"
            >
              Crafted by tradition. <br className="hidden md:block" />
              <span className="italic text-stone-300">
                Styled for the pace and confidence of modern women.
              </span>
            </motion.h3>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              className="mt-12 flex flex-wrap items-center gap-5"
            >
              <Button href="/about" variant="white" size="lg" className="hover:scale-[1.02] active:scale-95" icon>
                Explore Our Story
              </Button>
              <Button href="/contact" variant="glass" size="lg" className="hover:scale-[1.02] active:scale-95 border-white/30 hover:bg-white/20 hover:border-white/50 backdrop-blur-2xl">
                Talk to a Stylist
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
