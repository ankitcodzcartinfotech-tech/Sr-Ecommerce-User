"use client";

import React, { useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const FloatingWhatsApp = ({ message = "Hey! I want to book an appointment." }) => {
  // Use Next.js process.env instead of import.meta.env for Next.js app
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919876543210";
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  const [hovered, setHovered] = useState(false);

  const openWhatsApp = () => {
    window.open(url, "_blank");
  };

  return (
    <div className="fixed bottom-24 sm:bottom-6 right-4 sm:right-6 z-50 flex items-center">
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="mr-2 bg-black text-white text-sm px-3 py-1 rounded-lg shadow-lg whitespace-nowrap"
          >
            WhatsApp
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={openWhatsApp}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label="Chat on WhatsApp"
        className="cursor-pointer p-3 rounded-full shadow-lg flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        style={{ backgroundColor: "#25D366", color: "white", width: 50, height: 50 }}
      >
        <FaWhatsapp size={23} />
      </motion.button>
    </div>
  );
};

export default FloatingWhatsApp;
