import { motion } from "framer-motion";
import React from "react";

export function LoadingDots() {
  return (
    <div className="flex justify-center items-center h-8">
      <div className="relative w-24 h-8">
        {[0, 1, 2].map((index) => (
          <React.Fragment key={index}>
            <motion.div
              className="absolute w-3 h-3 bg-white rounded-full"
              style={{
                left: `${index * 40}%`,
                transform: "translateX(-50%)"
              }}
              initial={{ y: "100%" }}
              animate={{
                y: ["100%", "-20%", "100%"],
                scaleY: [0.3, 1, 0.3],
                scaleX: [1.3, 1, 1.3]
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: index * 0.15,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute w-3 h-1 bg-white/30 rounded-full blur-[1px]"
              style={{
                left: `${index * 40}%`,
                bottom: "-4px",
                transform: "translateX(-50%)"
              }}
              initial={{ opacity: 0.7, scaleX: 1.3 }}
              animate={{
                opacity: [0.7, 0.2, 0.7],
                scaleX: [1.3, 0.8, 1.3]
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: index * 0.15,
                ease: "easeInOut"
              }}
            />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
} 