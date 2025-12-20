"use client"

import { useRef } from "react"
import Link from "next/link"
import { motion, useInView } from "framer-motion"
import { ArrowRight, Mail, Phone, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const contactInfo = [
  {
    icon: Mail,
    label: "Email",
    value: "info@greenlivestockafrica.com",
    href: "mailto:info@greenlivestockafrica.com",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+234 XXX XXX XXXX",
    href: "tel:+234XXXXXXXX",
  },
  {
    icon: MapPin,
    label: "Location",
    value: "Odhiogbor road, IGP checkpoint Ele-uma, Mbiama. Rivers State, Nigeria.",
    href: null,
  },
]

export function CTASection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section
      ref={ref}
      className="relative py-20 md:py-32 bg-muted/20 overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4"
        >
          Ready to Invest in{" "}
          <span className="text-gradient-primary">Quality</span>?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-muted-foreground text-base md:text-lg mb-10 max-w-2xl mx-auto"
        >
          Get in touch with our team or explore our full collection of premium
          livestock. Your next great investment awaits.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
        >
          <Button
            asChild
            size="lg"
            className="rounded-full px-8 w-full sm:w-auto hover:shadow-lg hover:shadow-primary/25 transition-all duration-300"
          >
            <Link href="/livestock">
              Browse Livestock
              <ArrowRight size={18} className="ml-2" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-full px-8 w-full sm:w-auto"
          >
            <a href="mailto:info@greenlivestockafrica.com">Contact Us</a>
          </Button>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex items-center justify-center gap-4 mb-10"
        >
          <div className="h-px w-16 bg-border" />
          <span className="text-muted-foreground text-sm">or reach us at</span>
          <div className="h-px w-16 bg-border" />
        </motion.div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10"
        >
          {contactInfo.map((item) => {
            const Icon = item.icon
            const content = (
              <div className="flex items-center gap-3 group">
                <div className="p-2 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Icon size={18} />
                </div>
                <div className="text-left">
                  <div className="text-xs text-muted-foreground">{item.label}</div>
                  <div
                    className={cn(
                      "text-sm font-medium text-foreground",
                      item.href && "group-hover:text-primary transition-colors"
                    )}
                  >
                    {item.value}
                  </div>
                </div>
              </div>
            )

            if (item.href) {
              return (
                <a key={item.label} href={item.href} className="cursor-pointer">
                  {content}
                </a>
              )
            }

            return <div key={item.label}>{content}</div>
          })}
        </motion.div>
      </div>
    </section>
  )
}
