import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans, Space_Mono } from "next/font/google";
import Providers from "./providers";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const spaceMono = Space_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "DevCollab — Good Developers Are Waiting For You",
  description: "Connect with developers, explore real repositories, collaborate in real time, and turn bold ideas into production reality.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${plusJakartaSans.variable} ${spaceMono.variable}`}>
      <body className={`${outfit.className} min-h-screen bg-[#FAFAFA] text-[#111827] antialiased selection:bg-[#FFB800] selection:text-[#111827]`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
