import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "JARVIS — AI Command Center",
  description:
    "Just A Rather Very Intelligent System — your personal AI command center. Monitor agents, execute commands, and oversee all systems in real time.",
  keywords: ["JARVIS", "AI", "dashboard", "command center", "automation", "agents"],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${jetBrainsMono.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="h-full antialiased overflow-hidden">{children}</body>
    </html>
  );
}
