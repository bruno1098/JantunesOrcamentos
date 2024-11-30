import { motion } from "framer-motion";

export function ProgressLoading() {
  return (
    <div className="w-full flex items-center justify-center">
      <div className="relative w-32 h-7 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="absolute h-full bg-green-500/40 rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{
            duration: 3,
            ease: "easeInOut",
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-sm text-white">
          Enviando...
        </div>
      </div>
    </div>
  );
} 