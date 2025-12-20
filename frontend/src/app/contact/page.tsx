"use client"

import { useRef, useState } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  ArrowRight,
  CheckCircle,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Footer } from "@/components/layout/footer"
import { Navbar } from "@/components/navigation"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"

const contactMethods = [
  {
    icon: Mail,
    title: "Email Us",
    value: "info@greenlivestockafrica.com",
    href: "mailto:info@greenlivestockafrica.com",
    description: "We respond within 24 hours",
  },
  {
    icon: Phone,
    title: "Call Us",
    value: "+234 XXX XXX XXXX",
    href: "tel:+234XXXXXXXX",
    description: "Mon-Fri, 9am - 6pm WAT",
  },
  {
    icon: MapPin,
    title: "Visit Us",
    value: "Odhiogbor road, IGP checkpoint Ele-uma, Mbiama. Rivers State, Nigeria",
    href: null,
    description: "By appointment only",
  },
  {
    icon: Clock,
    title: "Business Hours",
    value: "9:00 AM - 6:00 PM",
    href: null,
    description: "West Africa Time (WAT)",
  },
]

const faqs = [
  {
    question: "How do I purchase livestock?",
    answer:
      "Browse our collection, select your preferred animal, and contact us directly through the listing or this contact form. We'll guide you through the verification and purchase process.",
  },
  {
    question: "Are all animals verified?",
    answer:
      "Yes, every animal on our platform comes with complete documentation including health records, vaccination history, and genetic lineage verification.",
  },
  {
    question: "Do you offer delivery?",
    answer:
      "We coordinate safe and humane transportation for all purchases. Delivery options and costs vary based on location and will be discussed during the purchase process.",
  },
  {
    question: "Can I visit before purchasing?",
    answer:
      "We encourage farm visits for serious buyers. Schedule an appointment through this contact form and we'll arrange a viewing session.",
  },
]

export default function ContactPage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  })

  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.15])
  const imageOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.3])
  const contentY = useTransform(scrollYProgress, [0, 0.5], [0, -60])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`${API_URL}/contact/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formState),
      })

      if (!response.ok) {
        const data = await response.json()
        // Handle validation errors
        if (data.name) throw new Error(`Name: ${data.name[0]}`)
        if (data.email) throw new Error(`Email: ${data.email[0]}`)
        if (data.message) throw new Error(`Message: ${data.message[0]}`)
        if (data.subject) throw new Error(`Subject: ${data.subject[0]}`)
        throw new Error(data.detail || "Failed to send message. Please try again.")
      }

      setIsSubmitted(true)
      setFormState({ name: "", email: "", phone: "", subject: "", message: "" })

      // Reset success message after 5 seconds
      setTimeout(() => setIsSubmitted(false), 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormState((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative h-[50vh] min-h-[400px] overflow-hidden"
      >
        {/* Background Image with Parallax */}
        <motion.div
          style={{ scale: imageScale, opacity: imageOpacity }}
          className="absolute inset-0"
        >
          <Image
            src="/atmospheric/high-res-wide-shot-with-negative-text.png"
            alt="Contact Green Livestock Africa"
            fill
            className="object-cover"
            priority
          />
          {/* Overlays */}
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-background" />
        </motion.div>

        {/* Content */}
        <motion.div
          style={{ y: contentY }}
          className="relative z-10 h-full flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8"
        >
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6"
            >
              <MessageSquare className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-white/90">
                Get in Touch
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-6"
            >
              Let&apos;s Start a{" "}
              <span className="text-primary">Conversation</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed"
            >
              Have questions about our livestock or investment opportunities?
              We&apos;re here to help.
            </motion.p>
          </div>
        </motion.div>

        {/* Scroll fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Contact Methods */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
          >
            {contactMethods.map((method, index) => {
              const Icon = method.icon
              const content = (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={cn(
                    "group relative p-5 md:p-6 rounded-2xl",
                    "bg-background border border-border/50",
                    "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
                    "transition-all duration-300",
                    method.href && "cursor-pointer"
                  )}
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 md:mb-4 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground text-sm md:text-base mb-1">
                    {method.title}
                  </h3>
                  <p className="text-primary font-medium text-sm md:text-base mb-1 break-all">
                    {method.value}
                  </p>
                  <p className="text-muted-foreground text-xs md:text-sm">
                    {method.description}
                  </p>
                </motion.div>
              )

              if (method.href) {
                return (
                  <a key={method.title} href={method.href}>
                    {content}
                  </a>
                )
              }

              return <div key={method.title}>{content}</div>
            })}
          </motion.div>
        </div>
      </section>

      {/* Main Content: Form + Map/Info */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-3"
            >
              <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2">
                Send us a <span className="text-primary">Message</span>
              </h2>
              <p className="text-muted-foreground mb-8">
                Fill out the form below and we&apos;ll get back to you as soon as
                possible.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name & Email Row */}
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formState.name}
                      onChange={handleChange}
                      required
                      className={cn(
                        "w-full px-4 py-3 rounded-xl",
                        "bg-muted/50 border border-border/50",
                        "text-foreground placeholder:text-muted-foreground",
                        "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50",
                        "transition-all duration-200"
                      )}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formState.email}
                      onChange={handleChange}
                      required
                      className={cn(
                        "w-full px-4 py-3 rounded-xl",
                        "bg-muted/50 border border-border/50",
                        "text-foreground placeholder:text-muted-foreground",
                        "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50",
                        "transition-all duration-200"
                      )}
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                {/* Phone & Subject Row */}
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formState.phone}
                      onChange={handleChange}
                      className={cn(
                        "w-full px-4 py-3 rounded-xl",
                        "bg-muted/50 border border-border/50",
                        "text-foreground placeholder:text-muted-foreground",
                        "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50",
                        "transition-all duration-200"
                      )}
                      placeholder="+234 XXX XXX XXXX"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      Subject *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formState.subject}
                      onChange={handleChange}
                      required
                      className={cn(
                        "w-full px-4 py-3 rounded-xl",
                        "bg-muted/50 border border-border/50",
                        "text-foreground",
                        "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50",
                        "transition-all duration-200"
                      )}
                    >
                      <option value="">Select a topic</option>
                      <option value="purchase">Livestock Purchase</option>
                      <option value="investment">Investment Inquiry</option>
                      <option value="partnership">Partnership Opportunity</option>
                      <option value="visit">Schedule a Visit</option>
                      <option value="support">General Support</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formState.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className={cn(
                      "w-full px-4 py-3 rounded-xl resize-none",
                      "bg-muted/50 border border-border/50",
                      "text-foreground placeholder:text-muted-foreground",
                      "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50",
                      "transition-all duration-200"
                    )}
                    placeholder="Tell us about your inquiry..."
                  />
                </div>

                {/* Submit Button */}
                <div className="flex items-center gap-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={cn(
                      "group inline-flex items-center justify-center gap-2",
                      "px-8 py-4 rounded-full",
                      "bg-primary text-primary-foreground font-semibold",
                      "shadow-lg shadow-primary/30",
                      "hover:shadow-xl hover:shadow-primary/40 hover:scale-105",
                      "transition-all duration-300",
                      "active:scale-95",
                      "disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                    )}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <Send
                          size={18}
                          className="group-hover:translate-x-1 transition-transform"
                        />
                      </>
                    )}
                  </button>

                  {/* Success Message */}
                  {isSubmitted && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2 text-primary"
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">
                        Message sent successfully!
                      </span>
                    </motion.div>
                  )}
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20"
                  >
                    <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-destructive">
                        Failed to send message
                      </p>
                      <p className="text-sm text-destructive/80 mt-1">{error}</p>
                    </div>
                  </motion.div>
                )}
              </form>
            </motion.div>

            {/* Info Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-2 space-y-8"
            >
              {/* Map Placeholder */}
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted/30 border border-border/50">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center p-6">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <MapPin className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">
                      Odhiogbor road, IGP checkpoint Ele-uma, Mbiama. Rivers State, Nigeria
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Our headquarters and main showroom
                    </p>
                  </div>
                </div>
                {/* Decorative grid */}
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage:
                      "linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                  }}
                />
              </div>

              {/* Quick Response */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-primary/20">
                <h3 className="font-semibold text-foreground mb-2">
                  Need Immediate Assistance?
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Use our AI assistant for quick answers about our livestock
                  collection.
                </p>
                <Link
                  href="/livestock"
                  className={cn(
                    "inline-flex items-center gap-2 text-primary text-sm font-medium",
                    "hover:gap-3 transition-all duration-200"
                  )}
                >
                  Browse Livestock
                  <ArrowRight size={16} />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
              Frequently Asked <span className="text-primary">Questions</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Quick answers to common questions
            </p>
          </motion.div>

          {/* FAQ Grid */}
          <div className="grid sm:grid-cols-2 gap-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-6 rounded-2xl bg-background border border-border/50"
              >
                <h3 className="font-semibold text-foreground mb-2">
                  {faq.question}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
