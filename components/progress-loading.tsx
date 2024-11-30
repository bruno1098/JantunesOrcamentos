import { motion } from "framer-motion";

export function ProgressLoading() {
  return (
    <div className="w-full flex items-center justify-center">
      <div className="relative w-full h-full">
        <motion.div
          className="absolute inset-0 bg-green-500/40"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{
            duration: 3,
            ease: "easeInOut",
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white font-medium text-sm">
            Enviando orçamento...
          </span>
        </div>
      </div>
    </div>
  );
} 