"use client"

import Link from "next/link"
import Image from "next/image"
import { Mail, Phone, MapPin, Instagram, Facebook, Linkedin } from "lucide-react"
import { cn } from "@/lib/utils"
import { FarmersTrained } from "@/components/brand"

// lucide-react has no TikTok glyph, so provide one matching the icon interface
// (accepts a `size` prop like the others).
function TikTok({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M16.5 3c.3 2.1 1.5 3.4 3.5 3.6v2.4c-1.2.1-2.3-.3-3.5-.9v5.6c0 3.5-2.5 5.9-5.7 5.3-2.6-.5-4-2.4-3.8-4.9.2-2.4 2.3-4 4.9-3.7v2.5c-.4-.1-.8-.2-1.2-.1-1 .1-1.7.9-1.6 2 .1 1 .9 1.7 1.9 1.6 1.1-.1 1.7-.9 1.7-2.1V3h3.4z" />
    </svg>
  )
}

// Canonical profile URLs only (no share/tracking links).
const socialLinks = [
  {
    icon: Instagram,
    label: "Instagram",
    href: "https://www.instagram.com/greenlivestockafricaa/",
  },
  {
    icon: Facebook,
    label: "Facebook",
    href: "https://www.facebook.com/Greenlivestockafricaa/",
  },
  {
    icon: TikTok,
    label: "TikTok",
    href: "https://www.tiktok.com/@greenlivestockafrica",
  },
  {
    icon: Linkedin,
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/green-livestock-africa-limited/",
  },
]

const exploreLinks = [
  { label: "Learn", href: "/learn" },
  { label: "Livestock", href: "/livestock" },
  { label: "Eggs", href: "/eggs" },
  { label: "Farm Store", href: "/store" },
]

const organisationLinks = [
  { label: "Impact", href: "/impact" },
  { label: "Partner With Us", href: "/partner" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
]

const contactInfo = [
  {
    icon: Mail,
    value: "info@greenlivestockafrica.com",
    href: "mailto:info@greenlivestockafrica.com",
  },
  {
    icon: Phone,
    value: "+234 915 5467 776",
    href: "tel:+2349155467776",
  },
  {
    icon: MapPin,
    value: "Odhiogbor road, IGP checkpoint Ele-uma, Mbiama. Rivers State, Nigeria",
    href: "https://maps.google.com/?q=5.053897,6.4551216",
  },
]

function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="ledger mb-5 text-[11px] uppercase tracking-[0.25em] text-primary">
      {children}
    </h3>
  )
}

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative overflow-hidden border-t border-border/40 bg-gradient-to-b from-background to-muted/30">
      {/* Background glow decoration */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-1/4 bottom-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -right-1/4 top-0 h-72 w-72 rounded-full bg-secondary/5 blur-3xl" />
      </div>

      {/* Main Footer Content */}
      <div className="relative mx-auto max-w-7xl px-5 py-14 sm:px-8 md:py-20 lg:px-12">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.4fr] lg:gap-14">
          {/* Brand Column */}
          <div>
            <Link href="/" className="mb-5 flex items-center gap-3">
              <Image
                src="/logo/logo.svg"
                alt="Green Livestock Africa"
                width={180}
                height={40}
                className="h-10 w-auto"
              />
              <span className="font-display text-lg text-foreground">
                Green Livestock Africa
              </span>
            </Link>
            <p className="mb-5 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Training, equipping, and backing livestock farmers across Africa — open
              knowledge as a working answer to hunger and food insecurity.
            </p>

            {/* Delivered record line */}
            <p className="ledger mb-6 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: "var(--ochre)" }}
              />
              Cohort 01 · <FarmersTrained /> farmers trained
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full",
                      "border border-border/50 bg-card/50 text-muted-foreground backdrop-blur-sm",
                      "transition-all duration-300 hover:border-primary/40 hover:bg-primary hover:text-primary-foreground"
                    )}
                  >
                    <Icon size={17} />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Explore */}
          <div>
            <FooterHeading>Explore</FooterHeading>
            <ul className="space-y-3">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Organisation */}
          <div>
            <FooterHeading>Organisation</FooterHeading>
            <ul className="space-y-3">
              {organisationLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <FooterHeading>Reach Us</FooterHeading>
            <ul className="space-y-4">
              {contactInfo.map((item, index) => {
                const Icon = item.icon
                return (
                  <li key={index}>
                    <a
                      href={item.href}
                      target={item.href.startsWith("http") ? "_blank" : undefined}
                      rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="group flex items-start gap-3 text-sm text-muted-foreground"
                    >
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted/50 text-primary">
                        <Icon size={14} />
                      </span>
                      <span className="leading-relaxed transition-colors group-hover:text-primary">
                        {item.value}
                      </span>
                    </a>
                  </li>
                )
              })}
            </ul>
            <p className="ledger mt-5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">
              We reply within two working days.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative border-t border-border/40">
        <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8 lg:px-12">
          <div className="flex flex-col items-center justify-between gap-4 lg:flex-row">
            <p className="text-center text-sm text-muted-foreground lg:text-left">
              &copy; {currentYear} Green Livestock Africa. All rights reserved.
            </p>

            {/* The model, as the footer's quiet signature */}
            <p className="ledger hidden text-[10px] uppercase tracking-[0.25em] text-muted-foreground/50 md:block">
              01 Enlighten · 02 Equip · 03 Verify · 04 Grow
            </p>

            <div className="flex items-center gap-6">
              <Link
                href="/privacy"
                className="text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
