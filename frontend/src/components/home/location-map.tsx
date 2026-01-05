"use client"

import { motion } from "framer-motion"
import { MapPin, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

interface LocationMapProps {
  className?: string
  showHeader?: boolean
}

export function LocationMap({ className, showHeader = true }: LocationMapProps) {
  return (
    <section className={cn("py-16 md:py-24", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {showHeader && (
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <MapPin size={14} />
              Our Location
            </div>
            <h2 className="text-3xl md:text-4xl font-bold font-playfair mb-4">
              Visit Our Farm
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Come experience our premium livestock firsthand at our facility in Rivers State, Nigeria.
            </p>
          </motion.div>
        )}

        <motion.div
          className="relative rounded-2xl overflow-hidden border border-border/50 shadow-lg"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Map Container */}
          <div className="relative aspect-[16/9] md:aspect-[21/9] w-full bg-muted">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3974.30699064573!2d6.4551216!3d5.053897!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x104201f3b9f9a459%3A0x47d55d174a4cf36!2sGreen%20Livestock%20Africa!5e0!3m2!1sen!2sng!4v1767628579181!5m2!1sen!2sng"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0"
              title="Green Livestock Africa Location"
            />
          </div>

          {/* Location Info Overlay */}
          <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-auto md:max-w-sm">
            <div className="glass rounded-xl p-4 md:p-5 border border-white/10 backdrop-blur-md">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 text-primary flex-shrink-0">
                  <MapPin size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground mb-1">
                    Green Livestock Africa
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Odhiogbor road, IGP checkpoint Ele-uma, Mbiama. Rivers State, Nigeria
                  </p>
                  <a
                    href="https://maps.google.com/?q=5.053897,6.4551216"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "inline-flex items-center gap-2 text-sm font-medium",
                      "text-primary hover:text-primary/80 transition-colors"
                    )}
                  >
                    Get Directions
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
