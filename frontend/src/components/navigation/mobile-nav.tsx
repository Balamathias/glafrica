"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Handshake } from "lucide-react"
import { ModeToggle } from "@/components/ui/mode-toggle"

interface NavLink {
  href: string
  label: string
}

interface MobileNavProps {
  isOpen: boolean
  onToggle: () => void
  links: NavLink[]
}

const menuTransition = { type: "spring" as const, stiffness: 380, damping: 36 }

export function MobileNav({ isOpen, onToggle, links }: MobileNavProps) {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)

  // Glass header once the page scrolls — the bar must never float transparent
  // over content.
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 24)
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  return (
    <div className="md:hidden">
      {/* Mobile Header Bar */}
      <motion.div
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={menuTransition}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 px-4 py-3 transition-colors duration-300",
          isScrolled && !isOpen && "bg-background/75 shadow-lg backdrop-blur-xl"
        )}
      >
        <div className="flex items-center justify-between gap-2">
          {/* Logo */}
          <Link href="/" className="relative z-50 flex min-w-0 items-center gap-2">
            <div className="relative h-8 w-8 shrink-0">
              <Image
                src="/logo/logomark.png"
                alt="GLAfrica"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span
              className={cn(
                "truncate font-serif text-sm font-bold transition-colors duration-300 min-[380px]:text-base",
                isOpen || isScrolled ? "text-foreground" : "text-white"
              )}
            >
              Green Livestock Africa
            </span>
          </Link>

          {/* Right side - Mode Toggle & Hamburger */}
          <div className="flex shrink-0 items-center gap-2">
            <ModeToggle
              variant={isOpen || isScrolled ? "outline" : "default"}
              size="sm"
              className="relative z-50"
            />

            {/* Hamburger */}
            <button
              onClick={onToggle}
              className={cn(
                "relative z-50 flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur-md transition-colors duration-300",
                isOpen || isScrolled
                  ? "border-border/60 bg-muted/60"
                  : "border-white/20 bg-white/10"
              )}
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
            >
              <div className="flex h-4 w-5 flex-col justify-between">
                <motion.span
                  animate={{
                    rotate: isOpen ? 45 : 0,
                    y: isOpen ? 7 : 0,
                  }}
                  transition={menuTransition}
                  className={cn(
                    "block h-0.5 w-full origin-center rounded-full",
                    isOpen
                      ? "bg-primary"
                      : isScrolled
                        ? "bg-foreground"
                        : "bg-white"
                  )}
                />
                <motion.span
                  animate={{ opacity: isOpen ? 0 : 1, scaleX: isOpen ? 0 : 1 }}
                  transition={{ duration: 0.15 }}
                  className={cn(
                    "block h-0.5 w-full rounded-full",
                    isScrolled ? "bg-foreground" : "bg-white"
                  )}
                />
                <motion.span
                  animate={{
                    rotate: isOpen ? -45 : 0,
                    y: isOpen ? -7 : 0,
                  }}
                  transition={menuTransition}
                  className={cn(
                    "block h-0.5 w-full origin-center rounded-full",
                    isOpen
                      ? "bg-primary"
                      : isScrolled
                        ? "bg-foreground"
                        : "bg-white"
                  )}
                />
              </div>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Full Screen Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.18 } }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-2xl"
          >
            {/* Background glow decoration */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -right-1/3 -top-1/3 h-2/3 w-2/3 rounded-full bg-primary/[0.06] blur-3xl" />
              <div className="absolute -bottom-1/3 -left-1/3 h-2/3 w-2/3 rounded-full bg-secondary/[0.05] blur-3xl" />
            </div>

            {/* Menu Content */}
            <div className="relative flex h-full flex-col overflow-y-auto px-7 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-24">
              {/* Navigation Links */}
              <nav className="my-auto space-y-0.5">
                {links.map((link, index) => {
                  const active = pathname === link.href
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, transition: { duration: 0.1 } }}
                      transition={{ ...menuTransition, delay: 0.05 + index * 0.045 }}
                    >
                      <Link
                        href={link.href}
                        onClick={onToggle}
                        className="group flex items-center justify-between border-b border-border/40 py-3.5 active:opacity-70"
                      >
                        <span
                          className={cn(
                            "font-display text-[1.7rem] font-medium transition-colors duration-200 min-[380px]:text-3xl",
                            active ? "text-primary" : "text-foreground"
                          )}
                        >
                          {link.label}
                        </span>
                        <span
                          className={cn(
                            "ledger text-[10px] uppercase tracking-[0.2em] transition-colors",
                            active ? "text-primary" : "text-muted-foreground/40"
                          )}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </Link>
                    </motion.div>
                  )
                })}
              </nav>

              {/* Bottom Section */}
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, transition: { duration: 0.1 } }}
                transition={{ ...menuTransition, delay: 0.05 + links.length * 0.045 }}
                className="mt-8 space-y-5"
              >
                {/* CTA Button */}
                <Link
                  href="/partner"
                  onClick={onToggle}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl bg-primary py-4 text-lg font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-transform active:scale-[0.98]"
                >
                  <Handshake size={20} />
                  Partner With Us
                </Link>

                {/* Contact Info */}
                <div className="text-center text-sm text-muted-foreground">
                  <p>Need help? Contact us</p>
                  <a
                    href="mailto:info@greenlivestockafrica.com"
                    className="font-medium text-primary"
                  >
                    info@greenlivestockafrica.com
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
