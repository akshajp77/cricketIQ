import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Terms of Service — CricketIQ",
  description:
    "The terms and conditions governing your use of the CricketIQ cricket analytics platform.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" lastUpdated="June 7, 2026">
      <section>
        <p>
          These Terms of Service govern your access to and use of CricketIQ. A complete version of
          our terms is being finalized and will be published here soon. In the meantime, the
          following summarizes the principles that apply to your use of the platform.
        </p>
      </section>

      <section>
        <h2>Use of the Platform</h2>
        <p>
          You agree to use CricketIQ only for lawful purposes and in accordance with these terms.
          You are responsible for the accuracy of the data you enter and for maintaining the
          confidentiality of your account credentials.
        </p>
      </section>

      <section>
        <h2>Your Content</h2>
        <p>
          You retain ownership of the cricket statistics and content you submit. You grant us the
          limited rights needed to operate the platform, generate your analytics, and provide
          AI-powered insights.
        </p>
      </section>

      <section>
        <h2>Disclaimer</h2>
        <p>
          CricketIQ is provided &ldquo;as is&rdquo; without warranties of any kind. AI-generated
          insights are for informational purposes only and should not be treated as professional
          coaching advice.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          Questions about these terms can be sent to{" "}
          <a href="mailto:privacy@cricketiq.app">privacy@cricketiq.app</a>. For details on how we
          handle your data, see our <a href="/privacy">Privacy Policy</a>.
        </p>
      </section>
    </LegalLayout>
  );
}
