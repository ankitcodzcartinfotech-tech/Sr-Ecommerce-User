"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/Button";
import { getBanners } from "@/Api/AllApi";
import { normalizeBannerList, resolveMediaSrc } from "@/lib/storefront";

const DEFAULT_HERO = {
  title: "Luxury Sarees Crafted for Every Occasion",
  description:
    "Discover handcrafted sarees that balance tradition, texture, and modern ease.",
};

// Helper function to get appropriate banner image based on screen size
function getResponsiveBannerImage(banner) {
  // Check if we're in a browser environment to use window matchMedia
  if (typeof window !== "undefined") {
    // Use mobile banner on small screens (<768px) if available
    if (window.matchMedia("(max-width: 767.98px)").matches && banner.mobileImage) {
      return resolveMediaSrc(banner.mobileImage);
    }
  }
  // Default to desktop banner
  return resolveMediaSrc(banner.desktopImage || banner.image);
}

export default function HeroSection() {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(1);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive screen size
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.matchMedia("(max-width: 767.98px)").matches);
    checkMobile(); // Initial check
    const resizeListener = window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    async function fetchBanners() {
      try {
        const response = await getBanners();
        setBanners(normalizeBannerList(response));
      } catch (error) {
        console.error("Failed to fetch banners:", error);
        setBanners([]);
      } finally {
        setLoading(false);
      }
    }

    fetchBanners();
  }, []);

  function goTo(index) {
    if (index === active || banners.length === 0) {
      return;
    }

    setDirection(index > active ? 1 : -1);
    setActive(index);
  }

  function navigate(dir) {
    if (banners.length === 0) {
      return;
    }

    setDirection(dir);
    setActive((previous) => (previous + dir + banners.length) % banners.length);
  }

  useEffect(() => {
    if (banners.length < 2) {
      return undefined;
    }

    const interval = setInterval(() => {
      setDirection(1);
      setActive((previous) => (previous + 1) % banners.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [banners.length, active]);

  const currentBanner = banners[active] || DEFAULT_HERO;
  
  // Get both desktop and mobile images for the <picture> element approach
  const desktopImage = resolveMediaSrc(currentBanner.desktopImage || currentBanner.image);
  const mobileImage = resolveMediaSrc(currentBanner.mobileImage);

  return (
    <section className="relative isolate h-[85svh] md:h-[90svh] min-h-[550px] overflow-hidden bg-stone-900">
      {desktopImage ? (
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentBanner._id || active}
            custom={direction}
            className="absolute inset-0"
            initial={{ opacity: 0, x: direction > 0 ? 36 : -36, scale: 1.03 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: direction > 0 ? -36 : 36, scale: 1.02 }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Use responsive images with <picture> and Next.js Image */}
            {mobileImage ? (
              <div className="absolute inset-0">
                <picture className="block w-full h-full relative">
                  <source 
                    srcSet={mobileImage} 
                    media="(max-width: 767.98px)" 
                  />
                  <Image
                    src={desktopImage}
                    alt={currentBanner.title || "Keshrag hero banner"}
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover object-center"
                  />
                </picture>
              </div>
            ) : (
              <Image
                src={desktopImage}
                alt={currentBanner.title || "Keshrag hero banner"}
                fill
                priority
                sizes="100vw"
                className="object-cover object-center"
              />
            )}
          </motion.div>
        </AnimatePresence>
      ) : (
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(182,123,69,0.35),transparent_55%),linear-gradient(160deg,#2a1a14_0%,#1a1210_100%)]"
          aria-hidden
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent mix-blend-multiply" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(200,154,90,0.35),transparent_40%)] mix-blend-overlay" />
      {/* Fine grain noise */}
      <div className="pointer-events-none absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.05]" />
      <div className="relative z-10 mx-auto flex h-full w-full max-w-[1440px] flex-col justify-center pb-[8vh] md:pb-0 px-4 pt-16 sm:px-6 sm:pt-20 md:px-10 lg:items-start lg:px-14 lg:pt-24">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={`${currentBanner._id || active}-content`}
            custom={direction}
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
            className="w-full max-w-2xl text-center lg:text-left"
          >
            <div className="mb-4 inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[9px] sm:px-5 sm:py-2.5 sm:text-[11px] font-bold uppercase tracking-[0.3em] text-[#e3cdab] shadow-lg backdrop-blur-md sm:mb-6">
              <Sparkles size={12} className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              Timeless Indian Drapes
            </div>
            
            <h1 className="mx-auto max-w-4xl whitespace-pre-line font-serif text-[2rem] leading-[1.15] sm:text-[clamp(2.25rem,6vw,4.5rem)] font-light sm:leading-[1.1] tracking-tight text-white drop-shadow-md">
              {currentBanner.title || DEFAULT_HERO.title}
            </h1>
            
            <p className="mx-auto mt-4 max-w-[300px] sm:max-w-2xl text-xs sm:text-base leading-relaxed text-stone-200 drop-shadow sm:mt-6 sm:leading-8 lg:mx-0">
              {currentBanner.description || currentBanner.subtitle || DEFAULT_HERO.description}
            </p>

            <div className="mx-auto mt-6 flex max-w-[260px] flex-col gap-3 sm:max-w-none sm:mt-10 sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start lg:mx-0">
              <Button href="/shop" size="lg" className="max-sm:min-h-[44px] max-sm:px-5 max-sm:py-2 max-sm:text-[10px] w-full sm:w-auto hover:scale-[1.02] active:scale-95" style={{ backgroundColor: "#e88436", boxShadow: "0 15px 30px -10px rgba(232,132,54,0.5)" }} icon>
                Shop Now
              </Button>
              <Button href="/collections" variant="glass" size="lg" className="max-sm:min-h-[44px] max-sm:px-5 max-sm:py-2 max-sm:text-[10px] w-full sm:w-auto border-white/30 backdrop-blur-xl hover:border-white/50 hover:bg-white/20 hover:scale-[1.02] active:scale-95">
                Browse Collections
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      {loading && (
        <div className="absolute right-4 top-24 z-20 rounded-full border border-white/16 bg-black/18 px-3 py-1.5 text-[10px] uppercase tracking-[0.28em] text-white/70 backdrop-blur-md sm:right-6 sm:top-28 sm:px-4 sm:py-2 sm:text-[11px]">
          Loading banners
        </div>
      )}
      {banners.length > 1 && (
        <div className="absolute inset-x-0 bottom-6 z-20 px-4 sm:bottom-8 sm:px-6 md:px-10 lg:px-14">
          <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 sm:gap-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Previous banner"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/18 bg-white/10 text-white backdrop-blur-md transition-all duration-300 hover:bg-white/18 active:bg-white/24 cursor-pointer"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="flex items-center justify-center gap-2 sm:gap-3">
              {banners.map((banner, index) => (
                <button
                  key={banner._id || index}
                  type="button"
                  onClick={() => goTo(index)}
                  aria-label={`Show banner ${index + 1}`}
                  aria-current={index === active ? "true" : undefined}
                  className={`rounded-full transition-all duration-300 ${index === active
                      ? "h-2.5 w-10 bg-white"
                      : "h-2.5 w-2.5 bg-white/38 hover:bg-white/65"
                    } cursor-pointer`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => navigate(1)}
              aria-label="Next banner"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/18 bg-white/10 text-white backdrop-blur-md transition-all duration-300 hover:bg-white/18 active:bg-white/24 cursor-pointer"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
