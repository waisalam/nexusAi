import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono, Bebas_Neue } from "next/font/google";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider, NO_FLASH_SCRIPT } from "@/components/providers/theme-provider";
import { ThemedToaster } from "@/components/providers/themed-toaster";
import { FeedbackWidget } from "@/components/feedback-widget";
import { ReferralTracker } from "@/components/referral-tracker";
import { SmoothScroll } from "@/components/smooth-scroll";
import { AnimatedNoise } from "@/components/animated-noise";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas",
  weight: "400",
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
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Sets data-theme before paint — avoids a flash of the wrong theme. */}
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH_SCRIPT }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${bebasNeue.variable} relative min-h-screen bg-background text-foreground antialiased`}
      >
        <ThemeProvider>
          <QueryProvider>
            <SmoothScroll>
              <AnimatedNoise opacity={0.02} fixed />
              <Suspense fallback={null}>
                <ReferralTracker />
              </Suspense>
              {children}
              <FeedbackWidget />
              <ThemedToaster />
            </SmoothScroll>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
