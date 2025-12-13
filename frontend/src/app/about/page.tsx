import { Metadata } from "next"
import Image from "next/image"
import { CheckCircle, Users, Shield, Sparkles } from "lucide-react"

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Green Livestock Africa - Africa's premier platform for premium livestock investment.",
}

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/atmospheric/high-res-wide-shot-with-negative-text.png"
            alt="African landscape"
            fill
            className="object-cover opacity-20"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif mb-6">
            The Future of{" "}
            <span className="text-gradient-primary">Livestock Investment</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Green Livestock Africa connects discerning investors with Africa&apos;s
            finest livestock. We combine tradition with technology to make
            agricultural investment accessible, transparent, and profitable.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold font-serif mb-6">
                Our Mission
              </h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                We believe that quality livestock investment should be accessible
                to everyone. Our platform bridges the gap between traditional
                farming practices and modern technology, creating a marketplace
                where trust, quality, and transparency are paramount.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Every animal on our platform undergoes rigorous verification.
                We document genetics, health histories, and vaccination records
                to ensure you&apos;re making an informed investment decision.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Shield, label: "Verified Quality", value: "100%" },
                { icon: Users, label: "Happy Investors", value: "500+" },
                { icon: CheckCircle, label: "Successful Sales", value: "1,000+" },
                { icon: Sparkles, label: "AI-Powered", value: "24/7" },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-background border shadow-sm"
                >
                  <stat.icon className="w-8 h-8 text-primary mb-3" />
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <h2 className="text-3xl md:text-4xl font-bold font-serif mb-12 text-center">
            What Sets Us Apart
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Verified Genetics",
                description:
                  "Every animal comes with documented lineage and genetic information, ensuring you know exactly what you're investing in.",
              },
              {
                title: "Health Transparency",
                description:
                  "Complete vaccination histories and health records are available for every listing. No surprises, just confidence.",
              },
              {
                title: "AI-Powered Discovery",
                description:
                  "Our intelligent assistant helps you find the perfect animals based on your investment goals and preferences.",
              },
              {
                title: "Premium Selection",
                description:
                  "We curate only the finest livestock. Our strict quality standards mean you're choosing from the best of the best.",
              },
              {
                title: "Secure Transactions",
                description:
                  "Protected payments and verified sellers ensure your investment is safe from start to finish.",
              },
              {
                title: "Expert Support",
                description:
                  "Our team of agricultural experts is always available to guide you through your livestock investment journey.",
              },
            ].map((value, i) => (
              <div key={i} className="p-6 rounded-2xl bg-muted/30 border">
                <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-primary/5">
        <div className="max-w-3xl mx-auto px-4 md:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-serif mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of investors who trust Green Livestock Africa for
            their agricultural investments.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/browse"
              className="inline-flex items-center justify-center h-12 px-8 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Browse Livestock
            </a>
            <a
              href="/search"
              className="inline-flex items-center justify-center h-12 px-8 bg-background border rounded-lg font-medium hover:bg-muted transition-colors"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Try AI Search
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
