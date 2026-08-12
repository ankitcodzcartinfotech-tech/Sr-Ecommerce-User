"use client";

import React, { useState, useEffect } from "react";
import { FaArrowUp } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Show button when page is scrolled up to given distance
  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed bottom-40 sm:bottom-24 right-4 sm:right-6 z-50 flex items-center group">
          <div
            className="mr-2 bg-stone-900 text-white text-sm font-medium px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap opacity-0 pointer-events-none transition-all duration-300 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
          >
            Scroll to top
          </div>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={scrollToTop}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Scroll to top"
            className="cursor-pointer p-3 rounded-full shadow-lg flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 bg-stone-800 text-white hover:bg-stone-700 transition-colors"
            style={{ width: 50, height: 50 }}
          >
            <FaArrowUp size={20} />
          </motion.button>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTop;
