"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Maximize2, X, Gem } from "lucide-react";

export default function ProductImageGallery({ images = [], productName = "Product" }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  
  // Reset selected image when images array changes
  useEffect(() => {
    setSelectedImage(0);
  }, [images]);
  
  // For hover-to-zoom
  const imageContainerRef = useRef(null);
  const [zoomStyle, setZoomStyle] = useState({ 
    transformOrigin: "center center", 
    transform: "scale(1)" 
  });
  const [isZooming, setIsZooming] = useState(false);

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (images.length <= 1) return;
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "Escape" && fullscreenOpen) setFullscreenOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images.length, fullscreenOpen]);

  // Hover to zoom logic
  const handleMouseMove = (e) => {
    if (!imageContainerRef.current) return;
    setIsZooming(true);
    
    const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: "scale(2.5)", // Adjust scale for zoom level
    });
  };

  const handleMouseLeave = () => {
    setIsZooming(false);
    setZoomStyle({
      transformOrigin: "center center",
      transform: "scale(1)",
    });
  };

  // If there are no images, show placeholder
  if (!images || images.length === 0) {
    return (
      <div className="w-full relative overflow-hidden rounded-[28px] flex items-center justify-center bg-stone-100 text-stone-300 min-h-[420px]" style={{ height: "clamp(420px, 75vw, 820px)" }}>
        <Gem size={48} />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        {/* Vertical thumbnails — only shown for multiple images */}
        {images.length > 1 && (
          <div className="order-2 flex flex-row gap-2 overflow-x-auto pb-1 no-scrollbar sm:order-1 sm:flex-col sm:overflow-y-auto sm:pb-0 sm:max-h-[clamp(420px,75vw,820px)]">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`relative shrink-0 overflow-hidden rounded-2xl border-2 transition-all duration-200 w-16 h-20 sm:w-20 sm:h-24 ${
                  selectedImage === idx
                    ? "border-emerald-500 shadow-md shadow-emerald-500/20 scale-105"
                    : "border-transparent bg-stone-50 opacity-70 hover:opacity-100 hover:border-stone-300"
                } cursor-pointer`}
                aria-label={`View image ${idx + 1}`}
              >
                <Image
                  src={img}
                  alt={`${productName} thumbnail ${idx + 1}`}
                  fill
                  sizes="80px"
                  className="object-contain p-1"
                />
              </button>
            ))}
          </div>
        )}

        {/* Main image container */}
        <div className={`relative order-1 sm:order-2 flex-1 group ${images.length > 1 ? "" : "w-full"}`}>
          <div
            ref={imageContainerRef}
            className="relative overflow-hidden rounded-[28px] cursor-zoom-in hidden md:block"
            style={{ minHeight: "420px", height: "clamp(420px, 75vw, 820px)" }}
            onClick={() => setFullscreenOpen(true)}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0 transition-transform duration-200 ease-out"
                style={zoomStyle}
              >
                <Image
                  src={images[selectedImage]}
                  alt={`${productName} - View ${selectedImage + 1}`}
                  fill
                  priority
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 60vw, 48vw"
                  className="object-contain object-center"
                />
              </motion.div>
            </AnimatePresence>

            {/* Expand icon hint (visible on hover) */}
            <button
              onClick={(e) => { e.stopPropagation(); setFullscreenOpen(true); }}
              className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-stone-500 shadow-md backdrop-blur-sm transition-all hover:bg-white hover:text-stone-800 ${isZooming ? "opacity-0" : "opacity-0 group-hover:opacity-100"} cursor-pointer`}
              aria-label="View fullscreen"
            >
              <Maximize2 size={15} />
            </button>
          </div>

          {/* Mobile Main Image (No hover zoom) */}
          <div
            className="relative overflow-hidden rounded-[28px] md:hidden cursor-pointer"
            style={{ minHeight: "420px", height: "clamp(420px, 75vw, 820px)" }}
            onClick={() => setFullscreenOpen(true)}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0"
              >
                <Image
                  src={images[selectedImage]}
                  alt={`${productName} - View ${selectedImage + 1}`}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-contain object-center"
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Arrows — only for multiple images and visible on desktop hover */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className={`hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 items-center justify-center rounded-full bg-white/90 text-stone-800 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:scale-105 opacity-0 group-hover:opacity-100 sm:h-12 sm:w-12 cursor-pointer ${isZooming ? "!opacity-0 pointer-events-none" : ""}`}
                aria-label="Previous image"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className={`hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 items-center justify-center rounded-full bg-white/90 text-stone-800 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:scale-105 opacity-0 group-hover:opacity-100 sm:h-12 sm:w-12 cursor-pointer ${isZooming ? "!opacity-0 pointer-events-none" : ""}`}
                aria-label="Next image"
              >
                <ChevronRight size={22} />
              </button>
              
              {/* Dot indicators (mostly for mobile/tablet) */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 md:hidden">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => { e.stopPropagation(); setSelectedImage(idx); }}
                    className={`rounded-full transition-all ${selectedImage === idx ? "w-5 h-2 bg-emerald-600" : "w-2 h-2 bg-black/20 hover:bg-black/40"} cursor-pointer`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Fullscreen Modal ── */}
      <AnimatePresence>
        {fullscreenOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm cursor-pointer"
            onClick={() => setFullscreenOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.92 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.92 }}
              className="relative flex h-[90vh] w-[90vw] max-w-4xl items-center justify-center cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={images[selectedImage]}
                alt={productName}
                fill
                sizes="90vw"
                className="object-contain"
                priority
              />

              {/* Close */}
              <button
                onClick={() => setFullscreenOpen(false)}
                className="absolute right-2 top-2 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 cursor-pointer"
              >
                <X size={20} />
              </button>

              {/* Prev / Next */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 cursor-pointer"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 cursor-pointer"
                  >
                    <ChevronRight size={24} />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                    {selectedImage + 1} / {images.length}
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
