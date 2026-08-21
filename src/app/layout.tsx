import type { Metadata, Viewport } from "next";
import { Inter, Lexend, JetBrains_Mono } from "next/font/google";

import { Providers } from "@/app/providers";
import { APP_NAME, APP_DESCRIPTION } from "@/constants";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-inter", display: "swap" });
const lexend = Lexend({ subsets: ["latin", "latin-ext"], variable: "--font-lexend", display: "swap" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono", display: "swap" });

export const metadata: Metadata = {
  title: { default: APP_NAME, template: `%s | ${APP_NAME}` },
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: APP_NAME },
  icons: {
    icon: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F8FAFC" },
    { media: "(prefers-color-scheme: dark)", color: "#0F172A" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <html lang="cs" suppressHydrationWarning>
      <body className={`${inter.variable} ${lexend.variable} ${jetbrainsMono.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
