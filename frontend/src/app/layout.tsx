import type { Metadata } from "next";
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";

import Providers from "@/app/providers";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { ToastNotifications } from "@/components/feedback/ToastNotifications";
import "../styles/globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "iOpsData",
  description:
    "AI-native data workspace - Query, analyze, and visualize your data with natural language",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${plusJakarta.variable} ${jetBrainsMono.variable} min-h-screen bg-background text-foreground`}
      >
        <Providers>
          <ErrorBoundary>{children}</ErrorBoundary>
          <ToastNotifications />
        </Providers>
      </body>
    </html>
  );
}
