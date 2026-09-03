import React from "react";
import { useScreenReader } from "@/contexts/ScreenReaderContext";
import ScreenReaderCommandBoard from "./ScreenReaderCommandBoard";
import { Mic, Eye, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ScreenReader: React.FC = () => {
  const {
    isActive,
    isListening,
    isCommandBoardOpen,
    setIsCommandBoardOpen,
    activate,
  } = useScreenReader();

  return (
    <>
      <ScreenReaderCommandBoard />

      <AnimatePresence>
        {isActive && !isCommandBoardOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-[9998] flex items-center gap-2"
          >
            <button
              onClick={() => setIsCommandBoardOpen(true)}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-slate-950/90 text-emerald-400 border border-emerald-500/50 shadow-[0_4px_20px_rgba(0,255,136,0.35)] hover:scale-105 hover:bg-slate-900 transition-all font-medium text-xs backdrop-blur-md"
              title="Open Voice Command Board"
              aria-label="Open Voice Command Board"
            >
              <div className="relative flex items-center justify-center">
                <Mic className="w-4 h-4 text-emerald-400" />
                {isListening && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                )}
              </div>
              <span className="font-semibold tracking-wide">Show Voice Commands</span>
              <ChevronLeft className="w-3.5 h-3.5 text-emerald-400" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {!isActive && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 9990,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 6,
          }}
        >
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
            onClick={activate}
            aria-label="Enable Screen Reader and Voice Command Board"
            title="Enable Screen Reader & Command Board (Alt+S)"
            className="group flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-slate-950/90 hover:bg-slate-900 text-slate-200 hover:text-emerald-400 border border-slate-700/60 hover:border-emerald-500/60 shadow-lg backdrop-blur-md transition-all text-xs font-semibold cursor-pointer"
          >
            <Eye className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span>Screen Reader</span>
          </motion.button>
        </div>
      )}
    </>
  );
};

export default ScreenReader;
