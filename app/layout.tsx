import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "sonner";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "CricketIQ — AI Cricket Analytics",
  description: "Track, analyze, and improve your cricket performance with AI-powered insights.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0A0F1E] text-[#F9FAFB] min-h-screen`}
      >
        {children}
        <Toaster
          theme="dark"
          toastOptions={{
            style: {
              background: "#111827",
              border: "1px solid #1F2937",
              color: "#F9FAFB",
            },
          }}
        />
      </body>
    </html>
  );
}
