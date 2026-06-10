import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/LegalLayout";
import { TableOfContents } from "./TableOfContents";
import { LAST_UPDATED } from "./sections";

export const metadata: Metadata = {
  title: "Privacy Policy — CricketIQ",
  description:
    "How CricketIQ collects, uses, and protects your account information and cricket performance data, including your rights and our use of third-party services.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Privacy Policy — CricketIQ",
    description:
      "How CricketIQ collects, uses, and protects your account information and cricket performance data.",
    type: "website",
  },
};

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated={LAST_UPDATED} toc={<TableOfContents />}>
      <section id="introduction">
        <p>
          CricketIQ (&ldquo;CricketIQ,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or
          &ldquo;our&rdquo;) is an AI-powered cricket analytics platform that lets you create
          an account, record cricket match statistics, track your performance over time, and
          receive AI-generated coaching insights. This Privacy Policy explains what information
          we collect, how we use it, who we share it with, and the choices and rights you have.
        </p>
        <p>
          By creating an account or using CricketIQ, you agree to the practices described in
          this policy. If you do not agree, please do not use the platform.
        </p>
      </section>

      <section id="data-we-collect">
        <h2>Data We Collect</h2>
        <p>We collect the following categories of information:</p>
        <ul>
          <li>
            <strong>Name.</strong> The name you provide when you create your account or complete
            your profile, used to personalize your experience.
          </li>
          <li>
            <strong>Email address.</strong> Used to identify your account, authenticate you, and
            send important service communications.
          </li>
          <li>
            <strong>Authentication information.</strong> Credentials used to secure your account.
            Passwords are stored in hashed form, and if you sign in through a third-party provider
            we receive a unique identifier and basic profile details from that provider.
          </li>
          <li>
            <strong>Profile information.</strong> Optional details you add such as age, batting and
            bowling style, team name, and biography.
          </li>
          <li>
            <strong>Cricket performance statistics.</strong> The batting, bowling, and fielding data
            you enter, including runs, wickets, economy, dismissals, and related figures.
          </li>
          <li>
            <strong>Match history.</strong> Records of the matches you log, including opponents,
            dates, venues, formats, and results.
          </li>
          <li>
            <strong>User-submitted content.</strong> Notes, comments, and other content you choose
            to add to your matches or profile.
          </li>
          <li>
            <strong>Device and usage information.</strong> Technical data such as browser type,
            device type, IP address, and how you interact with the platform, collected to operate
            and improve the service.
          </li>
          <li>
            <strong>Cookies and analytics data.</strong> Where applicable, we and our analytics
            providers use cookies and similar technologies to keep you signed in, remember your
            preferences, and understand aggregate usage.
          </li>
        </ul>
      </section>

      <section id="how-we-use">
        <h2>How We Use Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Provide, operate, and maintain the CricketIQ platform and its core functionality.</li>
          <li>Generate analytics, performance trends, and your CricketIQ Rating.</li>
          <li>Create AI-powered coaching insights and recommendations based on your data.</li>
          <li>Monitor, troubleshoot, and improve platform performance and reliability.</li>
          <li>Communicate with you about your account, updates, and support requests.</li>
          <li>Maintain the security of the platform and prevent fraud, abuse, and misuse.</li>
        </ul>
      </section>

      <section id="third-party">
        <h2>Third-Party Services</h2>
        <p>
          To operate CricketIQ we rely on trusted third-party service providers who may process
          your information on our behalf, only as needed to provide their services to us. These
          include providers in the following categories:
        </p>
        <ul>
          <li>
            <strong>Authentication providers.</strong> Services that help verify your identity and
            manage secure sign-in.
          </li>
          <li>
            <strong>Database providers.</strong> Services that securely store your account and
            cricket data.
          </li>
          <li>
            <strong>Hosting providers.</strong> Services that host and deliver the application.
          </li>
          <li>
            <strong>AI providers.</strong> Services such as OpenAI or Google that process the
            statistics we send in order to generate coaching insights. We send only the data
            needed to produce your analysis.
          </li>
          <li>
            <strong>Analytics providers.</strong> Services that help us understand aggregate usage
            and improve the platform.
          </li>
        </ul>
        <p>
          We may add, remove, or change providers over time as the platform evolves. Each provider
          is expected to handle your information in accordance with applicable law and their own
          privacy and security commitments.
        </p>
      </section>

      <section id="data-security">
        <h2>Data Security</h2>
        <p>
          We take the security of your information seriously and use reasonable technical and
          organizational measures designed to protect it, including encryption in transit, hashed
          password storage, and access controls. However, no method of transmission over the
          internet or method of electronic storage is completely secure, and we cannot guarantee
          absolute security. You are responsible for keeping your account credentials confidential.
        </p>
      </section>

      <section id="data-retention">
        <h2>Data Retention</h2>
        <p>
          We retain your information for as long as your account remains active or as needed to
          provide you with the service. You may request deletion of your account and associated
          data at any time, and we will delete or anonymize it except where we are required to
          retain certain information to comply with legal obligations, resolve disputes, or enforce
          our agreements.
        </p>
      </section>

      <section id="your-rights">
        <h2>Your Rights</h2>
        <p>Depending on your jurisdiction, you may have the right to:</p>
        <ul>
          <li><strong>Access</strong> the personal data we hold about you.</li>
          <li><strong>Correct</strong> inaccurate or incomplete information.</li>
          <li><strong>Delete</strong> your account and the data associated with it.</li>
          <li>
            <strong>Contact us</strong> with any questions or concerns about how your data is
            handled.
          </li>
        </ul>
        <p>
          To exercise any of these rights, contact us using the details in the{" "}
          <a href="#contact">Contact Us</a> section below.
        </p>
      </section>

      <section id="childrens-privacy">
        <h2>Children&apos;s Privacy</h2>
        <p>
          CricketIQ is not directed to children below the minimum age required to consent to the
          processing of personal data in their jurisdiction. If you are under that age, you should
          obtain consent from a parent or legal guardian before creating an account or using the
          platform. If we learn that we have collected personal data from a child without the
          appropriate consent, we will take steps to delete that information.
        </p>
      </section>

      <section id="changes">
        <h2>Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time to reflect changes to our practices,
          technology, legal requirements, or other factors. When we do, we will revise the
          &ldquo;Last updated&rdquo; date at the top of this page. We encourage you to review this
          policy periodically. Your continued use of CricketIQ after an update means you accept the
          revised policy.
        </p>
      </section>

      <section id="contact">
        <h2>Contact Us</h2>
        <p>
          If you have any questions, concerns, or requests regarding this Privacy Policy or your
          personal data, please contact us at:
        </p>
        <p>
          <a href="mailto:privacy@cricketiq.app" className="text-[#10B981]">
            privacy@cricketiq.app
          </a>
        </p>
      </section>
    </LegalLayout>
  );
}
