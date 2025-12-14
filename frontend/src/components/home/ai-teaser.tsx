"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Sparkles, Bot, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useChatStore } from "@/lib/store"
import { cn } from "@/lib/utils"

export function AITeaser() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const { openChat } = useChatStore()

  return (
    <section
      ref={ref}
      className="relative py-20 md:py-32 overflow-hidden"
    >
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />

      {/* Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
            >
              <Sparkles size={16} />
              AI-Powered
            </motion.div>

            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
              Meet Your Livestock{" "}
              <span className="text-gradient-primary">Investment Advisor</span>
            </h2>

            <p className="text-muted-foreground text-base md:text-lg mb-8 max-w-xl">
              Get instant answers about breeds, pricing, health records, and
              investment potential. Our AI understands livestock like an expert
              breeder and is available 24/7 to guide your decisions.
            </p>

            <Button
              onClick={openChat}
              size="lg"
              className="rounded-full px-8 hover:shadow-lg hover:shadow-primary/25 transition-all duration-300"
            >
              <Sparkles size={18} className="mr-2" />
              Try It Now
            </Button>
          </motion.div>

          {/* Mock Chat Visual */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div
              className={cn(
                "relative p-6 rounded-2xl",
                "bg-background/80 backdrop-blur-sm border border-border/50",
                "shadow-2xl shadow-black/10"
              )}
            >
              {/* Chat Header */}
              <div className="flex items-center gap-3 pb-4 border-b border-border/50 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot size={20} className="text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-sm">GL Africa Assistant</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    Online
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="space-y-4">
                {/* User Message */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.5 }}
                  className="flex justify-end"
                >
                  <div className="flex items-end gap-2 max-w-[80%]">
                    <div className="px-4 py-3 rounded-2xl rounded-br-md bg-primary text-primary-foreground text-sm">
                      What are the best goat breeds for investment in Nigeria?
                    </div>
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <User size={14} className="text-muted-foreground" />
                    </div>
                  </div>
                </motion.div>

                {/* AI Response */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.8 }}
                  className="flex justify-start"
                >
                  <div className="flex items-end gap-2 max-w-[85%]">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot size={14} className="text-primary" />
                    </div>
                    <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-muted text-foreground text-sm">
                      <p className="mb-2">
                        Great question! For Nigerian investors, I recommend:
                      </p>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>
                          <strong className="text-foreground">Boer Goats</strong> - Excellent meat yield, high market demand
                        </li>
                        <li>
                          <strong className="text-foreground">Kalahari Red</strong> - Hardy, disease-resistant, premium pricing
                        </li>
                        <li>
                          <strong className="text-foreground">Savanna</strong> - Fast growth, adaptable to local climate
                        </li>
                      </ul>
                      <p className="mt-2 text-primary">
                        Would you like me to show you available listings?
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Typing Indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.3, delay: 1.2 }}
                className="mt-4 pt-4 border-t border-border/50"
              >
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span>AI is typing...</span>
                </div>
              </motion.div>
            </div>

            {/* Floating Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.4, delay: 1 }}
              className="absolute -bottom-4 -right-4 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium shadow-lg"
            >
              Powered by GPT-4
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
