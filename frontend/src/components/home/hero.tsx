"use client"

import { motion } from "framer-motion"
import { ArrowDown, Play, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useChatStore } from "@/lib/store"
import Image from "next/image"

export function Hero() {
  const { openChat } = useChatStore()

  const scrollToGallery = () => {
    const gallery = document.getElementById("gallery")
    gallery?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
          poster="/atmospheric/high-res-wide-shot-with-negative-text.png"
        >
          <source src="/atmospheric/4k-cinematic-loop-livestock-grazing.mp4" type="video/mp4" />
        </video>
        {/* Overlay gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/40 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-background/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-8 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          <span className="text-sm font-medium text-foreground/80">
            Premium Livestock Marketplace
          </span>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-serif tracking-tight mb-6"
        >
          <span className="block">Invest in</span>
          <span className="block text-gradient-primary">
            Africa&apos;s Finest Livestock
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
        >
          Discover verified genetics, documented health histories, and premium breeds.
          Your journey to quality livestock investment starts here.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button
            size="lg"
            onClick={scrollToGallery}
            className="min-w-[180px] h-12 text-base shadow-glow"
          >
            Explore Livestock
            <ArrowDown size={18} className="ml-2" />
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={openChat}
            className="min-w-[180px] h-12 text-base glass hover:bg-primary/10"
          >
            <Sparkles size={18} className="mr-2" />
            Ask AI Guide
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="grid grid-cols-3 gap-8 mt-16 max-w-lg mx-auto"
        >
          {[
            { value: "500+", label: "Livestock Listed" },
            { value: "98%", label: "Health Verified" },
            { value: "24/7", label: "AI Support" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-gradient-primary">
                {stat.value}
              </div>
              <div className="text-xs md:text-sm text-muted-foreground mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.button
          onClick={scrollToGallery}
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <span className="text-xs uppercase tracking-widest">Scroll to explore</span>
          <ArrowDown size={20} />
        </motion.button>
      </motion.div>
    </section>
  )
}
