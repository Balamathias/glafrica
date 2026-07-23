import { Metadata } from "next"
import Link from "next/link"
import { LegalLayout, LegalSection } from "@/components/legal/legal-layout"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Green Livestock Africa collects, uses, and protects your information across our education, marketplace, and partnership services.",
}

export default function PrivacyPage() {
  return (
    <LegalLayout
      eyebrow="Legal"
      title="Privacy Policy"
      lastUpdated="23 July 2026"
      intro="Green Livestock Africa (“we”, “us”, “our”) trains, equips, and supports livestock farmers across Africa. This policy explains what information we collect when you use our website and services, why we collect it, and the choices you have. We keep it plainly stated, the same way we report our outcomes."
    >
      <LegalSection heading="Information we collect">
        <p>We only collect what we need to run our services:</p>
        <ul>
          <li>
            <strong>Information you give us.</strong> When you send an inquiry, request
            availability of livestock, eggs, or inputs, contact us, or ask to partner,
            we collect the details you submit — typically your name, email, phone
            number, and message.
          </li>
          <li>
            <strong>Usage information.</strong> Like most websites, we record basic
            visit analytics — pages viewed, approximate location derived from IP
            address, device type, and referring site — to understand how the platform
            is used and improve it.
          </li>
          <li>
            <strong>Tools you use.</strong> When you generate a schedule with the Herd
            Health Card, the species and any date you enter are processed to produce
            your result; we do not require an account to use it.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="How we use your information">
        <ul>
          <li>To respond to your inquiries and provide the services you request.</li>
          <li>To connect farmers, sponsors, and partners where you have asked us to.</li>
          <li>To operate, maintain, and improve the website and its tools.</li>
          <li>To understand aggregate usage and measure the reach of our work.</li>
          <li>To meet legal, accounting, and reporting obligations.</li>
        </ul>
        <p>
          We do not sell your personal information, and we do not use it for advertising.
        </p>
      </LegalSection>

      <LegalSection heading="How we share information">
        <p>
          We share personal information only in limited cases: with service providers
          who help us operate the platform (for example, hosting, media storage, and
          email delivery) under obligations to protect it; where you have asked us to
          introduce you to a partner or sponsor; and where required by law. Aggregated,
          non-identifying statistics may appear in our impact reporting.
        </p>
      </LegalSection>

      <LegalSection heading="Service providers we rely on">
        <p>
          Our platform is delivered with the help of third parties, including cloud
          hosting and deployment, media hosting and image delivery, transactional email,
          and AI features that help draft catalogue records and power our farming
          assistant. These providers process data on our behalf under their own security
          and privacy commitments.
        </p>
      </LegalSection>

      <LegalSection heading="Data retention">
        <p>
          We keep inquiry and contact records for as long as needed to follow up and to
          maintain a record of our engagements, and analytics data for a limited period
          to understand trends. You may ask us to delete information we hold about you,
          subject to any legal obligations to retain it.
        </p>
      </LegalSection>

      <LegalSection heading="Your choices and rights">
        <ul>
          <li>You can ask what information we hold about you and request a copy.</li>
          <li>You can ask us to correct or delete your information.</li>
          <li>You can opt out of non-essential communications at any time.</li>
        </ul>
        <p>
          To exercise any of these, contact us using the details below. We will respond
          within a reasonable time.
        </p>
      </LegalSection>

      <LegalSection heading="Security">
        <p>
          We take reasonable technical and organisational measures to protect your
          information. No method of transmission or storage is completely secure, but we
          work to safeguard the data entrusted to us and to limit access to those who
          need it.
        </p>
      </LegalSection>

      <LegalSection heading="Children">
        <p>
          Our services are intended for adults and for farming businesses. We do not
          knowingly collect personal information from children.
        </p>
      </LegalSection>

      <LegalSection heading="Changes to this policy">
        <p>
          We may update this policy as our services evolve. When we do, we will revise
          the “last updated” date above. Significant changes will be highlighted on this
          page.
        </p>
      </LegalSection>

      <LegalSection heading="Contact us">
        <p>
          Questions about this policy or your information? Reach us at{" "}
          <a href="mailto:info@greenlivestockafrica.com">info@greenlivestockafrica.com</a>,
          call +234 915 5467 776, or write to Green Livestock Africa, Odhiogbor Road, IGP
          Checkpoint Ele-uma, Mbiama, Rivers State, Nigeria. You can also reach us through
          our <Link href="/contact">contact page</Link>.
        </p>
      </LegalSection>
    </LegalLayout>
  )
}
