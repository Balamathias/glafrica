"use client"

import Link from "next/link"
import Image from "next/image"
import { Mail, Phone, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Livestock", href: "/livestock" },
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
    value: "+234 XXX XXX XXXX",
    href: "tel:+234XXXXXXXX",
  },
  {
    icon: MapPin,
    value: "Lagos, Nigeria",
    href: null,
  },
]

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-background border-t border-border/50">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-16">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Image
                src="/logo/logo.svg"
                alt="Green Livestock Africa"
                width={180}
                height={40}
                className="h-10 w-auto"
              />
              <h2 className="text-xl font-bold hidden md:block">Green Livestock Africa</h2>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              Your gateway to premium African livestock investments. Verified
              genetics, documented health, transparent transactions.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "text-muted-foreground text-sm",
                      "hover:text-primary transition-colors"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Contact Us</h3>
            <ul className="space-y-3">
              {contactInfo.map((item, index) => {
                const Icon = item.icon
                const content = (
                  <div className="flex items-center gap-3 text-muted-foreground text-sm group">
                    <Icon
                      size={16}
                      className="text-primary/70 group-hover:text-primary transition-colors flex-shrink-0"
                    />
                    <span
                      className={cn(
                        item.href && "group-hover:text-primary transition-colors"
                      )}
                    >
                      {item.value}
                    </span>
                  </div>
                )

                if (item.href) {
                  return (
                    <li key={index}>
                      <a href={item.href} className="inline-block">
                        {content}
                      </a>
                    </li>
                  )
                }

                return <li key={index}>{content}</li>
              })}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-muted-foreground text-sm text-center sm:text-left">
              &copy; {currentYear} Green Livestock Africa. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/privacy"
                className="text-muted-foreground text-sm hover:text-primary transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-muted-foreground text-sm hover:text-primary transition-colors"
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
