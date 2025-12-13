"use client"

import { useRef, useEffect } from "react"
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
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useChatStore } from "@/lib/store"
import { useChatSend } from "@/lib/hooks"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

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

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
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

  return (
    <>
      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn(
              "fixed z-50 bg-background border shadow-premium-lg rounded-2xl flex flex-col overflow-hidden",
              isExpanded
                ? "inset-4 md:inset-8"
                : "bottom-24 right-4 md:right-6 w-[calc(100%-2rem)] md:w-[400px] h-[550px] max-h-[80vh]"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/5 to-secondary/5">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                  <Image
                    src="/logo/logomark.png"
                    alt="AI Assistant"
                    width={24}
                    height={24}
                    className="object-contain"
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Green AI</h3>
                  <p className="text-xs text-muted-foreground">
                    Expert Livestock Advisor
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={clearMessages}
                  className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                  title="Clear chat"
                >
                  <Trash2 size={16} />
                </button>
                <button
                  onClick={toggleExpanded}
                  className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                  title={isExpanded ? "Minimize" : "Maximize"}
                >
                  {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
                <button
                  onClick={closeChat}
                  className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                  title="Close"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
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
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    {msg.role === "user" ? (
                      <User size={16} />
                    ) : (
                      <Bot size={16} />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={cn(
                      "max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted rounded-bl-sm"
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
                            <strong className="font-semibold">{children}</strong>
                          ),
                          a: ({ href, children }) => (
                            <a
                              href={href}
                              className="text-primary underline hover:no-underline"
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
                  <div className="shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <Bot size={16} />
                  </div>
                  <div className="bg-muted px-4 py-3 rounded-2xl rounded-bl-sm">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce animate-delay-100" />
                      <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce animate-delay-200" />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Suggestions */}
            {messages.length === 1 && (
              <div className="px-4 pb-2">
                <p className="text-xs text-muted-foreground mb-2">
                  Suggested questions:
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "What breeds do you have?",
                    "Tell me about Boer Goats",
                    "Best cattle for investment?",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        if (inputRef.current) {
                          inputRef.current.value = suggestion
                          inputRef.current.form?.requestSubmit()
                        }
                      }}
                      className="px-3 py-1.5 text-xs bg-muted hover:bg-muted/80 rounded-full transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t bg-background">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  name="message"
                  type="text"
                  placeholder="Ask about livestock..."
                  className="flex-1 bg-muted rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                  disabled={isTyping}
                  autoComplete="off"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={isTyping}
                  className="shrink-0 rounded-full h-11 w-11"
                >
                  <Send size={18} />
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={openChat}
            className="fixed bottom-6 right-4 md:right-6 z-50 bg-primary text-primary-foreground p-4 rounded-full shadow-lg shadow-primary/30 flex items-center gap-2 group"
          >
            <Sparkles size={24} className="group-hover:animate-pulse" />
            <span className="font-semibold hidden md:inline pr-2">Ask AI</span>

            {/* Pulse Ring */}
            <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  )
}
