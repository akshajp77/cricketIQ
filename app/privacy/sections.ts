// Shared section definitions for the Privacy Policy — used by both the
// rendered page and the sticky table of contents so they never drift apart.

export const LAST_UPDATED = "June 7, 2026";

export interface PolicySection {
  id: string;
  title: string;
}

export const SECTIONS: PolicySection[] = [
  { id: "introduction", title: "Introduction" },
  { id: "data-we-collect", title: "Data We Collect" },
  { id: "how-we-use", title: "How We Use Information" },
  { id: "third-party", title: "Third-Party Services" },
  { id: "data-security", title: "Data Security" },
  { id: "data-retention", title: "Data Retention" },
  { id: "your-rights", title: "Your Rights" },
  { id: "childrens-privacy", title: "Children's Privacy" },
  { id: "changes", title: "Changes to This Policy" },
  { id: "contact", title: "Contact Us" },
];
