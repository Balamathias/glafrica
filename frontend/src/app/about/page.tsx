"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  Shield,
  Leaf,
  Users,
  TrendingUp,
  Award,
  Heart,
  Globe,
  CheckCircle2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Footer } from "@/components/layout/footer"

const values = [
  {
    icon: Shield,
    title: "Trust & Transparency",
    description:
      "Every animal comes with verified documentation, health records, and genetic lineage you can trust.",
  },
  {
    icon: Leaf,
    title: "Sustainable Practices",
    description:
      "We partner with farmers who prioritize ethical breeding, animal welfare, and environmental stewardship.",
  },
  {
    icon: TrendingUp,
    title: "Investment Grade",
    description:
      "Our rigorous selection ensures you access only the finest livestock suitable for serious investors.",
  },
  {
    icon: Users,
    title: "Community First",
    description:
      "Building bridges between traditional farming and modern investment, empowering local communities.",
  },
]

const stats = [
  { value: "2019", label: "Founded" },
  { value: "500+", label: "Livestock Listed" },
  { value: "98%", label: "Verified Animals" },
  { value: "15+", label: "Partner Farms" },
]

const team = [
  {
    name: "Eromosele Edward Ozah",
    role: "Chief Executive Officer",
    image: "/people/ceo.jpeg",
    bio: "Visionary leader driving Green Livestock Africa's mission to transform livestock investment across the continent.",
  },
  {
    name: "Balogun Sofihullah Esq.",
    role: "Legal Advisor / General Counsel",
    image: "/people/balogun.jpeg",
    bio: "Ensuring legal compliance and protecting stakeholder interests across all operations.",
  },
  {
    name: "Abdulfatai Yussuf",
    role: "Chief Finance Officer",
    image: "/people/yussuf.jpeg",
    bio: "Managing financial strategy and ensuring sustainable growth for Green Livestock Africa.",
  },
  {
    name: "Sodiq Bello",
    role: "Business Development Manager",
    image: "/people/sodiq.jpeg",
    bio: "Driving partnerships and expanding Green Livestock Africa's reach across new markets.",
  },
]

export default function AboutPage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  })

  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.15])
  const imageOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.3])
  const contentY = useTransform(scrollYProgress, [0, 0.5], [0, -60])

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative h-[70vh] min-h-[500px] overflow-hidden"
      >
        {/* Background Image with Parallax */}
        <motion.div
          style={{ scale: imageScale, opacity: imageOpacity }}
          className="absolute inset-0"
        >
          <Image
            src="/atmospheric/high-res-wide-shot-with-negative-text.png"
            alt="African landscape with livestock"
            fill
            className="object-cover"
            priority
          />
          {/* Overlays */}
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
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
              <Heart className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-white/90">
                Our Story
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-6"
            >
              Redefining{" "}
              <span className="text-primary">Livestock</span>
              <br />
              Investment in Africa
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed"
            >
              Bridging tradition with innovation to create Africa&apos;s most
              trusted livestock marketplace.
            </motion.p>
          </div>
        </motion.div>

        {/* Scroll fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Mission Section */}
      <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative aspect-[4/3] rounded-3xl overflow-hidden"
            >
              <Image
                src="/atmospheric/high-res-wide-shot-with-negative-text.png"
                alt="Our mission"
                fill
                className="object-cover"
              />
              {/* Glassmorphic overlay card */}
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">Pan-African Reach</p>
                    <p className="text-white/60 text-sm">
                      Connecting farmers across the continent
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                Our <span className="text-primary">Mission</span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                Green Livestock Africa was born from a simple vision: to transform
                how Africa trades and invests in livestock. We saw an industry
                rich in tradition but lacking in transparency, accessibility, and
                trust.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                Our platform bridges this gap, connecting discerning investors
                with premium, verified livestock while empowering local farmers
                with access to a broader market. Every animal on our platform
                comes with complete documentation—health records, genetic
                lineage, and quality certifications.
              </p>
              <div className="flex flex-wrap gap-3">
                {["Verified Genetics", "Health Certified", "Ethical Sourcing"].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {tag}
                    </span>
                  )
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center p-6 rounded-2xl bg-background border border-border/50"
              >
                <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground text-sm md:text-base">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Our <span className="text-primary">Values</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </motion.div>

          {/* Values Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={cn(
                    "group relative p-6 rounded-2xl",
                    "bg-background border border-border/50",
                    "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
                    "transition-all duration-300"
                  )}
                >
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground text-lg mb-2">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {value.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Meet the <span className="text-primary">Team</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              The passionate people behind Green Livestock Africa
            </p>
          </motion.div>

          {/* Team Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={cn(
                  "group relative overflow-hidden rounded-2xl",
                  "bg-background border border-border/50",
                  "hover:shadow-xl hover:shadow-primary/5",
                  "transition-all duration-300"
                )}
              >
                {/* Team member image */}
                <div className="aspect-[4/3] bg-gradient-to-br from-primary/20 via-primary/10 to-background relative overflow-hidden">
                  {member.image ? (
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover object-top"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
                        <Users className="w-12 h-12 text-primary/50" />
                      </div>
                    </div>
                  )}
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                </div>
                {/* Content */}
                <div className="p-6">
                  <h3 className="font-semibold text-foreground text-lg">
                    {member.name}
                  </h3>
                  <p className="text-primary text-sm font-medium mb-2">
                    {member.role}
                  </p>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={cn(
              "relative overflow-hidden rounded-3xl p-8 md:p-12 lg:p-16",
              "bg-gradient-to-br from-primary/20 via-primary/10 to-background",
              "border border-primary/20"
            )}
          >
            {/* Background decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-6">
                <Award className="w-8 h-8 text-primary" />
              </div>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Ready to Invest?
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
                Discover our curated selection of premium livestock and start
                your agricultural investment journey today.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/livestock"
                  className={cn(
                    "group inline-flex items-center justify-center gap-2",
                    "px-8 py-4 rounded-full",
                    "bg-primary text-primary-foreground font-semibold",
                    "shadow-lg shadow-primary/30",
                    "hover:shadow-xl hover:shadow-primary/40 hover:scale-105",
                    "transition-all duration-300",
                    "active:scale-95"
                  )}
                >
                  Browse Livestock
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </Link>
                <Link
                  href="/contact"
                  className={cn(
                    "inline-flex items-center justify-center gap-2",
                    "px-8 py-4 rounded-full",
                    "bg-background/50 backdrop-blur-sm text-foreground font-semibold",
                    "border border-border/50",
                    "hover:bg-background/80 hover:border-primary/30",
                    "transition-all duration-300"
                  )}
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
