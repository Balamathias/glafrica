"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { MobileNav } from "./mobile-nav"
import { ModeToggle } from "@/components/ui/mode-toggle"

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/livestock", label: "Livestock" },
  { href: "/eggs", label: "Eggs" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
]

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      {/* Desktop Navbar */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500 hidden md:block",
          isScrolled
            ? "bg-background/70 backdrop-blur-xl shadow-lg"
            : "bg-transparent"
        )}
      >
        <nav className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="relative z-10 flex items-center gap-3 group">
              <div className="relative w-10 h-10 overflow-hidden">
                <Image
                  src="/logo/logomark.png"
                  alt="Green Livestock Africa"
                  fill
                  className="object-contain transition-transform duration-300 group-hover:scale-110"
                  priority
                />
              </div>
              <span className="font-serif font-bold text-xl tracking-tight">
                <span className="text-primary">Green</span>
                <span className={cn(
                  "transition-colors duration-300",
                  isScrolled ? "text-foreground" : "text-white"
                )}>Livestock</span>
                <span className="text-primary hidden sm:inline">Africa</span>
              </span>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative px-4 py-2 text-sm font-medium transition-colors duration-300",
                    "group",
                    isScrolled
                      ? "text-foreground/70 hover:text-foreground"
                      : "text-white/80 hover:text-white"
                  )}
                >
                  {link.label}
                  {/* Hover underline effect */}
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </div>

            {/* CTA Button & Mode Toggle */}
            <div className="flex items-center gap-3">
              <ModeToggle
                variant={isScrolled ? "outline" : "default"}
                size="sm"
              />
              <Link
                href="/livestock"
                className={cn(
                  "relative px-6 py-2.5 text-sm font-semibold rounded-full overflow-hidden transition-all duration-300",
                  "bg-primary text-primary-foreground",
                  "hover:shadow-lg hover:shadow-primary/25 hover:scale-105",
                  "active:scale-95"
                )}
              >
                <span className="relative z-10">Explore Now</span>
                {/* Shine effect */}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-700" />
              </Link>
            </div>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Navigation */}
      <MobileNav
        isOpen={isMobileMenuOpen}
        onToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        links={NAV_LINKS}
      />
    </>
  )
}
