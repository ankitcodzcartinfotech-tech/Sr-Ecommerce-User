"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import "swiper/css";
import "swiper/css/effect-creative";
import "swiper/css/pagination";
import "swiper/css/autoplay";

import { cn } from "@/lib/utils";

const Skiper52 = () => {
  const images = [
    {
      src: "/images/saree1.jpg",
      alt: "Keshrag Saree Collection 1",
    },
    {
      src: "/images/saree2.jpg",
      alt: "Keshrag Saree Collection 2",
    },
    {
      src: "/images/saree3.jpg",
      alt: "Keshrag Saree Collection 3",
    },
    {
      src: "/images/saree4.jpg",
      alt: "Keshrag Saree Collection 4",
    },
    {
      src: "/images/saree5.jpg",
      alt: "Keshrag Saree Collection 5",
    },
    {
      src: "/images/saree6.jpg",
      alt: "Keshrag Saree Collection 6",
    },
    {
      src: "/images/saree7.jpg",
      alt: "Keshrag Saree Collection 7",
    },
    {
      src: "/images/saree1.jpg",
      alt: "Keshrag Saree Collection 8",
    },
    {
      src: "/images/saree3.jpg",
      alt: "Keshrag Saree Collection 9",
    },
  ];

  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden bg-[#f5f4f3]">
      <HoverExpand_001 className="" images={images} />{" "}
    </div>
  );
};

export { Skiper52 };
export default Skiper52;

const HoverExpand_001 = ({
  images,
  className,
}) => {
  const [activeImage, setActiveImage] = useState(1);

  return (
    <motion.div
      initial={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        duration: 0.3,
        delay: 0.5,
      }}
      className={cn("relative w-full max-w-6xl px-5", className)}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        <div className="flex w-full items-center justify-center gap-1">
          {images.map((image, index) => (
            <motion.div
              key={index}
              className="relative cursor-pointer overflow-hidden rounded-3xl"
              initial={{ width: "2.5rem", height: "20rem" }}
              animate={{
                width: activeImage === index ? "24rem" : "5rem",
                height: activeImage === index ? "24rem" : "24rem",
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              onClick={() => setActiveImage(index)}
              onHoverStart={() => setActiveImage(index)}
            >
              <AnimatePresence>
                {activeImage === index && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute h-full w-full bg-linear-to-t from-black/40 to-transparent"
                  />
                )}
              </AnimatePresence>
              <AnimatePresence>
                {activeImage === index && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute flex h-full w-full flex-col items-end justify-end p-4"
                  >
                    <p className="text-left text-xs text-white/50">
                      {image.code}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.src}
                className="size-full object-cover"
                alt={image.alt}
                loading={index === 0 ? "eager" : "lazy"}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export { HoverExpand_001 };
