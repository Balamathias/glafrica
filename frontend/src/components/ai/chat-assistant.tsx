"use client"

import { useRef, useEffect, useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import {
  X,
  Send,
  Sparkles,
  Maximize2,
  Minimize2,
  Trash2,
  Bot,
  User,
  MessageCircle,
  Leaf,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useChatStore } from "@/lib/store"
import { useChatSend } from "@/lib/hooks"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

const SUGGESTED_QUESTIONS = [
  "What breeds do you have?",
  "Best cattle for investment?",
  "Tell me about Boer Goats",
]

export function ChatAssistant() {
  const {
    isOpen,
    isExpanded,
    messages,
    isTyping,
    openChat,
    closeChat,
    toggleExpanded,
    addMessage,
    setTyping,
    clearMessages,
  } = useChatStore()

  const { mutateAsync: sendMessage } = useChatSend()
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  const handleSend = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const input = form.elements.namedItem("message") as HTMLInputElement
    const query = input.value.trim()

    if (!query) return

    input.value = ""
    addMessage("user", query)
    setTyping(true)

    try {
      const response = await sendMessage(query)
      addMessage("assistant", response.response)
    } catch {
      addMessage(
        "assistant",
        "I apologize, but I'm having trouble connecting right now. Please try again in a moment."
      )
    } finally {
      setTyping(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    if (inputRef.current) {
      inputRef.current.value = suggestion
      inputRef.current.form?.requestSubmit()
    }
  }

  return (
    <>
      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
              onClick={closeChat}
            />

            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className={cn(
                "fixed z-50 flex flex-col overflow-hidden",
                "bg-background/95 backdrop-blur-xl",
                "border border-border/50 shadow-2xl shadow-black/20",
                "rounded-2xl md:rounded-3xl",
                isExpanded
                  ? "inset-4 md:inset-8"
                  : "bottom-4 right-4 left-4 md:left-auto md:right-6 md:bottom-24 md:w-[420px] h-[70vh] md:h-[600px] max-h-[85vh]"
              )}
            >
              {/* Premium gradient border effect */}
              <div className="absolute inset-0 rounded-2xl md:rounded-3xl p-[1px] pointer-events-none">
                <div className="absolute inset-0 rounded-2xl md:rounded-3xl bg-gradient-to-br from-primary/20 via-transparent to-primary/10 opacity-50" />
              </div>

              {/* Header */}
              <div className="relative flex items-center justify-between p-4 border-b border-border/50">
                {/* Subtle gradient background */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />

                <div className="relative flex items-center gap-3">
                  {/* Avatar with glow */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/30 rounded-full blur-lg" />
                    <div className="relative w-11 h-11 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center overflow-hidden">
                      <Image
                        src="/logo/logomark.png"
                        alt="AI Assistant"
                        width={26}
                        height={26}
                        className="object-contain"
                      />
                    </div>
                    {/* Online indicator */}
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-background">
                      <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75" />
                    </span>
                  </div>

                  <div>
                    <h3 className="font-semibold text-sm flex items-center gap-1.5">
                      <Leaf size={14} className="text-primary" />
                      Green AI Advisor
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Your livestock investment expert
                    </p>
                  </div>
                </div>

                <div className="relative flex items-center gap-1">
                  <button
                    onClick={clearMessages}
                    className="p-2.5 hover:bg-muted/80 rounded-xl text-muted-foreground hover:text-foreground transition-all duration-200"
                    title="Clear chat"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button
                    onClick={toggleExpanded}
                    className="p-2.5 hover:bg-muted/80 rounded-xl text-muted-foreground hover:text-foreground transition-all duration-200 hidden md:flex"
                    title={isExpanded ? "Minimize" : "Maximize"}
                  >
                    {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                  </button>
                  <button
                    onClick={closeChat}
                    className="p-2.5 hover:bg-destructive/10 hover:text-destructive rounded-xl text-muted-foreground transition-all duration-200"
                    title="Close"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 overscroll-contain"
              >
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      "flex gap-3",
                      msg.role === "user" ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    {/* Avatar */}
                    <div
                      className={cn(
                        "shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                        msg.role === "user"
                          ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20"
                          : "bg-muted/80 border border-border/50"
                      )}
                    >
                      {msg.role === "user" ? (
                        <User size={14} />
                      ) : (
                        <Bot size={14} className="text-primary" />
                      )}
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={cn(
                        "max-w-[80%] px-4 py-3 text-sm leading-relaxed",
                        msg.role === "user"
                          ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-2xl rounded-br-md shadow-lg shadow-primary/10"
                          : "bg-muted/50 border border-border/50 rounded-2xl rounded-bl-md"
                      )}
                    >
                      {msg.role === "assistant" ? (
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                            ul: ({ children }) => (
                              <ul className="list-disc ml-4 mb-2 space-y-1">{children}</ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="list-decimal ml-4 mb-2 space-y-1">{children}</ol>
                            ),
                            strong: ({ children }) => (
                              <strong className="font-semibold text-foreground">{children}</strong>
                            ),
                            a: ({ href, children }) => (
                              <a
                                href={href}
                                className="text-primary underline decoration-primary/30 hover:decoration-primary transition-colors"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {children}
                              </a>
                            ),
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      ) : (
                        msg.content
                      )}
                    </div>
                  </motion.div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3"
                  >
                    <div className="shrink-0 w-8 h-8 rounded-full bg-muted/80 border border-border/50 flex items-center justify-center">
                      <Bot size={14} className="text-primary" />
                    </div>
                    <div className="bg-muted/50 border border-border/50 px-4 py-3 rounded-2xl rounded-bl-md">
                      <div className="flex gap-1.5">
                        {[0, 1, 2].map((i) => (
                          <motion.span
                            key={i}
                            className="w-2 h-2 bg-primary/60 rounded-full"
                            animate={{ y: [0, -6, 0] }}
                            transition={{
                              duration: 0.6,
                              repeat: Infinity,
                              delay: i * 0.1,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Suggestions - Show when only welcome message */}
              {messages.length === 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="px-4 pb-3"
                >
                  <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Sparkles size={12} className="text-primary" />
                    Suggested questions
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTED_QUESTIONS.map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className={cn(
                          "px-3 py-1.5 text-xs rounded-full transition-all duration-200",
                          "bg-muted/50 hover:bg-primary/10 border border-border/50 hover:border-primary/30",
                          "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Input */}
              <form onSubmit={handleSend} className="p-4 border-t border-border/50 bg-muted/20">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      ref={inputRef}
                      name="message"
                      type="text"
                      placeholder="Ask about livestock investments..."
                      className={cn(
                        "w-full bg-background/80 backdrop-blur-sm rounded-xl px-4 py-3 text-sm",
                        "border border-border/50 focus:border-primary/50",
                        "focus:outline-none focus:ring-2 focus:ring-primary/20",
                        "placeholder:text-muted-foreground/60",
                        "transition-all duration-200"
                      )}
                      disabled={isTyping}
                      autoComplete="off"
                    />
                  </div>
                  <Button
                    type="submit"
                    size="icon"
                    disabled={isTyping}
                    className={cn(
                      "shrink-0 rounded-xl h-11 w-11",
                      "bg-gradient-to-br from-primary to-primary/90",
                      "hover:from-primary/90 hover:to-primary/80",
                      "shadow-lg shadow-primary/20 hover:shadow-primary/30",
                      "transition-all duration-200"
                    )}
                  >
                    <Send size={18} />
                  </Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Premium Floating Trigger Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="fixed bottom-6 right-4 md:right-6 z-50"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Ambient glow effect */}
            <motion.div
              className="absolute inset-0 bg-primary/40 rounded-full blur-xl"
              animate={{
                scale: isHovered ? 1.5 : 1.2,
                opacity: isHovered ? 0.6 : 0.4,
              }}
              transition={{ duration: 0.3 }}
            />

            {/* Pulse rings */}
            <span className="absolute inset-0 rounded-full">
              <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
            </span>
            <span className="absolute inset-2 rounded-full">
              <span
                className="absolute inset-0 rounded-full bg-primary/20 animate-ping"
                style={{ animationDelay: "0.3s" }}
              />
            </span>

            {/* Main button */}
            <motion.button
              onClick={openChat}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "relative flex items-center gap-2.5",
                "bg-gradient-to-br from-primary via-primary to-primary/90",
                "text-primary-foreground font-semibold",
                "rounded-full shadow-xl shadow-primary/30",
                "transition-all duration-300",
                isHovered ? "pr-5 pl-4 py-3.5" : "p-4"
              )}
            >
              <motion.div
                animate={{ rotate: isHovered ? 15 : 0 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <MessageCircle size={22} className="fill-current" />
              </motion.div>

              <AnimatePresence>
                {isHovered && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden whitespace-nowrap text-sm"
                  >
                    Ask AI
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Sparkle decorations */}
              <motion.div
                className="absolute -top-1 -right-1"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Sparkles size={14} className="text-primary-foreground/80" />
              </motion.div>
            </motion.button>

            {/* Tooltip on desktop */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, x: 10, y: "-50%" }}
                  animate={{ opacity: 1, x: 0, y: "-50%" }}
                  exit={{ opacity: 0, x: 10 }}
                  className="absolute right-full top-1/2 mr-3 hidden md:block"
                >
                  <div className="bg-background/95 backdrop-blur-sm border border-border/50 rounded-xl px-3 py-2 shadow-lg">
                    <p className="text-xs font-medium whitespace-nowrap">
                      Chat with our AI advisor
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Get expert livestock insights
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
