"use client";

import { useState, useEffect } from "react";
import { FaWhatsapp, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

export const WhatsAppButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const phoneNumber = "5511940224459";
  const message = "Olá! Gostaria de mais informações.";

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleWhatsAppClick = () => {
    const encodedMessage = encodeURIComponent(message);
    window.open(
      `https://wa.me/${phoneNumber}?text=${encodedMessage}`,
      "_blank"
    );
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50 flex flex-col items-center"
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white text-gray-800 px-1 py-1 rounded-lg shadow-lg mb-2 text-xs md:text-sm font-medium hidden md:block"
          >
            Precisa de ajuda?
          </motion.span>
          
          <div className="relative">
            <button
              onClick={() => setIsVisible(false)}
              className="absolute -top-2 -right-2 bg-gray-800 rounded-full p-0.5 md:p-1 z-10"
            >
              <FaTimes className="text-white text-xs md:text-sm" />
            </button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              animate={{
                y: [-4, 4, -4],
              }}
              transition={{
                y: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
              onClick={handleWhatsAppClick}
              className="bg-green-500 text-white p-3 md:p-4 rounded-full shadow-lg"
            >
              <FaWhatsapp className="text-2xl md:text-3xl" />
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 