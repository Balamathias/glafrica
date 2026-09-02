"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, BookOpen, GraduationCap, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { MobileNav } from "./mobile-nav"
import { ModeToggle } from "@/components/ui/mode-toggle"

// "Learn" is a grouping: the open-knowledge hub plus the youth academy.
const LEARN_MENU = [
  {
    href: "/learn",
    label: "Learn Hub",
    description: "Open training & free course material",
    icon: BookOpen,
  },
  {
    href: "/academy",
    label: "Future Farmers Academy",
    description: "Growing the farmers of tomorrow",
    icon: GraduationCap,
  },
  {
    href: "/certificates",
    label: "Certificate Directory",
    description: "Verify & download a training certificate",
    icon: ShieldCheck,
  },
]

const NAV_LINKS = [
  { href: "/livestock", label: "Livestock" },
  { href: "/eggs", label: "Eggs" },
  { href: "/store", label: "Farm Store" },
  { href: "/impact", label: "Impact" },
  { href: "/about", label: "About" },
]

// Flat list handed to the mobile menu (academy sits right after Learn).
const MOBILE_LINKS = [
  { href: "/learn", label: "Learn" },
  { href: "/academy", label: "Future Farmers Academy" },
  { href: "/certificates", label: "Certificate Directory" },
  ...NAV_LINKS,
]

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLearnOpen, setIsLearnOpen] = useState(false)
  const learnRef = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close the dropdown on outside click / Escape.
  useEffect(() => {
    if (!isLearnOpen) return
    const onDown = (e: MouseEvent) => {
      if (learnRef.current && !learnRef.current.contains(e.target as Node)) setIsLearnOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsLearnOpen(false)
    document.addEventListener("mousedown", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [isLearnOpen])

  const openLearn = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setIsLearnOpen(true)
  }
  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setIsLearnOpen(false), 120)
  }

  const linkColor = isScrolled
    ? "text-foreground/70 hover:text-foreground"
    : "text-white/80 hover:text-white"

  return (
    <>
      {/* Desktop Navbar */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 hidden transition-all duration-500 md:block",
          isScrolled ? "bg-background/70 shadow-lg backdrop-blur-xl" : "bg-transparent"
        )}
      >
        <nav className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="group relative z-10 flex items-center gap-3">
              <div className="relative h-10 w-10 overflow-hidden">
                <Image
                  src="/logo/logomark.png"
                  alt="Green Livestock Africa"
                  fill
                  className="object-contain transition-transform duration-300 group-hover:scale-110"
                  priority
                />
              </div>
              <span className="font-serif text-xl font-bold tracking-tight">
                <span className="text-primary">Green</span>
                <span className={cn("transition-colors duration-300", isScrolled ? "text-foreground" : "text-white")}>
                  Livestock
                </span>
                <span className="hidden text-primary sm:inline">Africa</span>
              </span>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center gap-1">
              {/* Learn dropdown */}
              <div
                ref={learnRef}
                className="relative"
                onMouseEnter={openLearn}
                onMouseLeave={scheduleClose}
              >
                <button
                  type="button"
                  onClick={() => setIsLearnOpen((o) => !o)}
                  aria-expanded={isLearnOpen}
                  aria-haspopup="true"
                  className={cn(
                    "group relative flex items-center gap-1 px-4 py-2 text-sm font-medium transition-colors duration-300",
                    linkColor
                  )}
                >
                  Learn
                  <ChevronDown
                    size={14}
                    className={cn("transition-transform duration-300", isLearnOpen && "rotate-180")}
                  />
                  <span className="absolute bottom-0 left-1/2 h-0.5 w-0 -translate-x-1/2 bg-primary transition-all duration-300 group-hover:w-[calc(100%-2rem)]" />
                </button>

                <AnimatePresence>
                  {isLearnOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.16, ease: "easeOut" }}
                      className="glass-strong absolute left-0 top-full mt-2 w-72 overflow-hidden rounded-2xl p-1.5 shadow-premium-lg"
                    >
                      {LEARN_MENU.map((item) => {
                        const Icon = item.icon
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsLearnOpen(false)}
                            className="flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-primary/10"
                          >
                            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                              <Icon size={17} />
                            </span>
                            <span className="min-w-0">
                              <span className="block text-sm font-semibold text-foreground">{item.label}</span>
                              <span className="block text-xs text-muted-foreground">{item.description}</span>
                            </span>
                          </Link>
                        )
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "group relative px-4 py-2 text-sm font-medium transition-colors duration-300",
                    linkColor
                  )}
                >
                  {link.label}
                  <span className="absolute bottom-0 left-1/2 h-0.5 w-0 -translate-x-1/2 bg-primary transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </div>

            {/* CTA Button & Mode Toggle */}
            <div className="flex items-center gap-3">
              <ModeToggle variant={isScrolled ? "outline" : "default"} size="sm" />
              <Link
                href="/partner"
                className={cn(
                  "group relative overflow-hidden rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-300",
                  "bg-primary text-primary-foreground",
                  "hover:scale-105 hover:shadow-lg hover:shadow-primary/25",
                  "active:scale-95"
                )}
              >
                <span className="relative z-10">Partner With Us</span>
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </Link>
            </div>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Navigation */}
      <MobileNav
        isOpen={isMobileMenuOpen}
        onToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        links={MOBILE_LINKS}
      />
    </>
  )
}
