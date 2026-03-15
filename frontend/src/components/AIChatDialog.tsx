import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send, Loader2, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = import.meta.env.VITE_AI_ASSISTANT_URL;

const AIChatDialog = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hello! I'm your DivyangConnectAI AI Assistant. I can help you find jobs, check scheme eligibility, suggest courses, and provide career guidance. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { profile } = useAuth();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: Msg = { role: "user", content: input };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: allMessages, userProfile: profile }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "AI service error" }));
        throw new Error(err.error || "Failed to connect");
      }

      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantSoFar += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant" && prev.length > allMessages.length) {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
                }
                return [...prev, { role: "assistant", content: assistantSoFar }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (e: any) {
      setMessages(prev => [...prev, { role: "assistant", content: `Sorry, I encountered an error: ${e.message}` }]);
    }
    setIsLoading(false);
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.94 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed bottom-24 right-6 z-50 flex w-96 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
            style={{ height: "520px" }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3.5"
              style={{ background: "linear-gradient(135deg, hsl(248,62%,16%), hsl(265,78%,28%))" }}
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "rgba(255,255,255,0.15)" }}>
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <span className="text-sm font-bold text-white">AI Assistant</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-[10px] text-white/60">Online • Llama 4 Maverick (NVIDIA)</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-white/15 text-white/70 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && (
                    <div
                      className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full"
                      style={{ background: "linear-gradient(135deg, hsl(250,84%,54%), hsl(278,80%,60%))" }}
                    >
                      <Bot className="h-3.5 w-3.5 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "rounded-tr-sm text-white"
                        : "rounded-tl-sm bg-muted text-foreground"
                    }`}
                    style={
                      msg.role === "user"
                        ? { background: "linear-gradient(135deg, hsl(250,84%,54%), hsl(278,80%,60%))" }
                        : undefined
                    }
                  >
                    {msg.content}
                  </div>
                  {msg.role === "user" && (
                    <div
                      className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full"
                      style={{ background: "linear-gradient(135deg, hsl(248,58%,20%), hsl(265,56%,28%))" }}
                    >
                      <User className="h-3.5 w-3.5 text-white" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex gap-2">
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-full"
                    style={{ background: "linear-gradient(135deg, hsl(250,84%,54%), hsl(278,80%,60%))" }}
                  >
                    <Bot className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-muted px-4 py-3">
                    <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-border p-3">
              <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about jobs, schemes, courses…"
                  className="flex-1 rounded-xl border-border/60 bg-muted/50 focus-visible:ring-primary/40"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={isLoading || !input.trim()}
                  className="h-9 w-9 flex-shrink-0 rounded-xl text-white disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, hsl(250,84%,54%), hsl(278,80%,60%))" }}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB toggle button */}
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-xl"
        style={{
          background: "linear-gradient(135deg, hsl(250,84%,54%), hsl(278,80%,60%))",
          boxShadow: "0 4px 24px hsl(265 80% 56% / 0.45)",
        }}
        aria-label="AI Assistant"
      >
        <Sparkles className="h-6 w-6" />
      </motion.button>
    </>
  );
};

export default AIChatDialog;
