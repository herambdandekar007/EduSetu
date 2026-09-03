import { useScreenReader } from "@/hooks/useScreenReader";
import { Mic, MicOff, Eye, EyeOff, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ScreenReader = () => {
  const {
    isActive, isListening, lastSpoken,
    transcript, activate, deactivate,
  } = useScreenReader();

  return (
    <>
      {/* Skip to main content — first tab stop */}
      <a href="#main-content" className="skip-to-main">
        Skip to main content
      </a>

      {/* Floating toggle button */}
      <div
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 99999,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 10,
        }}
      >
        {/* Status panel — shows when active */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              style={{
                background: "rgba(10,16,35,0.97)",
                border: "1px solid rgba(0,255,136,0.4)",
                borderRadius: 16,
                padding: "12px 16px",
                maxWidth: 280,
                boxShadow: "0 8px 32px rgba(0,255,136,0.2)",
              }}
            >
              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <Volume2 style={{ width: 14, height: 14, color: "#00ff88" }} />
                <span style={{ color: "#00ff88", fontSize: 12, fontWeight: 700 }}>
                  SCREEN READER ON
                </span>
                {/* Listening indicator */}
                <div style={{
                  marginLeft: "auto",
                  width: 8, height: 8,
                  borderRadius: "50%",
                  background: isListening ? "#ef4444" : "#555",
                  ...(isListening ? { animation: "voice-pulse 1.2s infinite" } : {}),
                }} />
              </div>

              {/* Last spoken */}
              {lastSpoken && (
                <div style={{
                  background: "rgba(0,255,136,0.08)",
                  borderRadius: 8,
                  padding: "6px 10px",
                  marginBottom: 8,
                }}>
                  <p style={{ fontSize: 10, color: "#888", margin: "0 0 2px" }}>Speaking:</p>
                  <p style={{
                    fontSize: 12, color: "#fff", margin: 0,
                    overflow: "hidden", textOverflow: "ellipsis",
                    whiteSpace: "nowrap", maxWidth: 220,
                  }}>
                    {lastSpoken}
                  </p>
                </div>
              )}

              {/* Last voice command */}
              {transcript && (
                <div style={{
                  background: "rgba(239,68,68,0.08)",
                  borderRadius: 8,
                  padding: "6px 10px",
                  marginBottom: 8,
                }}>
                  <p style={{ fontSize: 10, color: "#888", margin: "0 0 2px" }}>
                    {isListening ? "🎤 Listening..." : "Last command:"}
                  </p>
                  <p style={{ fontSize: 12, color: "#fff", margin: 0 }}>
                    {transcript}
                  </p>
                </div>
              )}

              {/* Quick commands hint */}
              <div style={{
                fontSize: 10, color: "#666",
                borderTop: "1px solid rgba(255,255,255,0.08)",
                paddingTop: 8,
                lineHeight: 1.6,
              }}>
                <p style={{ margin: 0 }}>⌨️ Tab — navigate elements</p>
                <p style={{ margin: 0 }}>🎤 Say "help" for all commands</p>
                <p style={{ margin: 0 }}>🔇 Say "stop" to silence</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main toggle button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={isActive ? deactivate : activate}
          aria-label={isActive ? "Disable screen reader" : "Enable screen reader for blind users"}
          title={isActive ? "Disable screen reader" : "Enable screen reader"}
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            border: isActive ? "2px solid #00ff88" : "2px solid #555",
            background: isActive ? "rgba(0,255,136,0.15)" : "rgba(10,16,35,0.9)",
            color: isActive ? "#00ff88" : "#fff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: isActive
              ? "0 0 20px rgba(0,255,136,0.4)"
              : "0 4px 16px rgba(0,0,0,0.4)",
            ...(isListening ? { animation: "voice-pulse 1.2s infinite" } : {}),
          }}
        >
          {isActive
            ? <Eye style={{ width: 22, height: 22 }} />
            : <EyeOff style={{ width: 22, height: 22 }} />
          }
        </motion.button>

        {/* Label below button */}
        <span style={{
          fontSize: 10, color: "#888",
          textAlign: "center",
          background: "rgba(10,16,35,0.8)",
          padding: "2px 8px",
          borderRadius: 99,
        }}>
          {isActive ? "Screen Reader ON" : "Screen Reader"}
        </span>
      </div>
    </>
  );
};

export default ScreenReader;