import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";

const poppins = Poppins({
  subsets: ["latin"],
  weight: [
    "400",
    "500",
    "600",
    "700",
    "800",
  ],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "BuildTracker | Project Management Made Simple",
    template: "%s | BuildTracker"
  },
  description: "The most intuitive project management platform for modern teams. Track builds, manage tasks, and collaborate seamlessly.",
  keywords: ["project management", "build tracker", "team collaboration", "task management", "productivity"],
  authors: [{ name: "BuildTracker Team" }],
  creator: "BuildTracker",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://buildtrackerapp.com",
    title: "BuildTracker | Project Management Made Simple",
    description: "The most intuitive project management platform for modern teams.",
    siteName: "BuildTracker",
  },
  twitter: {
    card: "summary_large_image",
    title: "BuildTracker | Project Management Made Simple",
    description: "The most intuitive project management platform for modern teams.",
    creator: "@buildtracker",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

import QueryProvider from "./providers/QueryProvider";

import { AuthProvider } from "@/libs/hooks/useAuth";

import { Toaster } from 'sonner';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${poppins.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="light">
          <QueryProvider>
            <AuthProvider>
              {children}
              <Toaster position="top-right" richColors />
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
