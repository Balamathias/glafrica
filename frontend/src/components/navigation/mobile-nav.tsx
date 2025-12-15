"use client"

import { useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence, useAnimation } from "framer-motion"
import { cn } from "@/lib/utils"
import { Sparkles } from "lucide-react"

interface NavLink {
  href: string
  label: string
}

interface MobileNavProps {
  isOpen: boolean
  onToggle: () => void
  links: NavLink[]
}

export function MobileNav({ isOpen, onToggle, links }: MobileNavProps) {
  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  return (
    <div className="md:hidden">
      {/* Mobile Header Bar */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 px-4 py-3"
      >
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="relative z-50 flex items-center gap-2">
            <div className="relative w-8 h-8">
              <Image
                src="/logo/logomark.png"
                alt="GLAfrica"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className={cn(
              "font-serif font-bold text-lg transition-colors duration-300",
              isOpen ? "text-foreground" : "text-white"
            )}>
              Green Livestock Africa
            </span>
          </Link>

          {/* Hamburger Button - Custom animated design */}
          <button
            onClick={onToggle}
            className="relative z-50 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20"
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            <div className="w-5 h-4 flex flex-col justify-between">
              <motion.span
                animate={{
                  rotate: isOpen ? 45 : 0,
                  y: isOpen ? 7 : 0,
                  backgroundColor: isOpen ? "hsl(var(--primary))" : "#ffffff",
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="block w-full h-0.5 rounded-full origin-center"
              />
              <motion.span
                animate={{
                  opacity: isOpen ? 0 : 1,
                  scaleX: isOpen ? 0 : 1,
                }}
                transition={{ duration: 0.2 }}
                className="block w-full h-0.5 bg-white rounded-full"
              />
              <motion.span
                animate={{
                  rotate: isOpen ? -45 : 0,
                  y: isOpen ? -7 : 0,
                  backgroundColor: isOpen ? "hsl(var(--primary))" : "#ffffff",
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="block w-full h-0.5 rounded-full origin-center"
              />
            </div>
          </button>
        </div>
      </motion.div>

      {/* Full Screen Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-background"
          >
            {/* Animated background pattern */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.05 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute -top-1/2 -right-1/2 w-full h-full bg-primary rounded-full blur-3xl"
              />
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.03 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-secondary rounded-full blur-3xl"
              />
            </div>

            {/* Menu Content */}
            <div className="relative h-full flex flex-col justify-center px-8 pt-20 pb-8">
              {/* Navigation Links */}
              <nav className="space-y-2">
                {links.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.1,
                      ease: "easeOut",
                    }}
                  >
                    <Link
                      href={link.href}
                      onClick={onToggle}
                      className="group block py-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-4xl font-serif font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                          {link.label}
                        </span>
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          whileHover={{ scale: 1, opacity: 1 }}
                          className="w-3 h-3 rounded-full bg-primary"
                        />
                      </div>
                      {/* Animated underline */}
                      <motion.div
                        className="h-px bg-border mt-4 origin-left"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                      />
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Bottom Section */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mt-auto space-y-6"
              >
                {/* CTA Button */}
                <Link
                  href="/livestock"
                  onClick={onToggle}
                  className="flex items-center justify-center gap-3 w-full py-4 bg-primary text-primary-foreground rounded-2xl font-semibold text-lg shadow-lg shadow-primary/25"
                >
                  <Sparkles size={20} />
                  Start Exploring
                </Link>

                {/* Contact Info */}
                <div className="text-center text-sm text-muted-foreground">
                  <p>Need help? Contact us</p>
                  <a
                    href="mailto:hello@glafrica.com"
                    className="text-primary font-medium"
                  >
                    hello@glafrica.com
                  </a>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
