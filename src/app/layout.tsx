import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { QueryProvider } from "@/components/providers/query-provider";
import { FeedbackWidget } from "@/components/feedback-widget";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nexus AI — Autonomous Engineering Teams",
  description:
    "Nexus AI deploys a team of autonomous AI agents that plan, code, build-verify and ship your features in parallel — one clean pull request.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-[#08080a] text-white antialiased`}
      >
        <QueryProvider>
          {children}
          <FeedbackWidget />
          <Toaster theme="dark" position="top-right" toastOptions={{ style: { background: "#161619", border: "1px solid #232328", color: "#fafafa" } }} />
        </QueryProvider>
      </body>
    </html>
  );
}
