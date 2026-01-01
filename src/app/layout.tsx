import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LazorkitWrapper } from "@/components";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lazorkit Payment Starter | Passkey Wallet & Gasless USDC",
  description:
    "A starter template demonstrating Lazorkit SDK integration with passkey-based authentication and gasless USDC transfers on Solana.",
  keywords: [
    "Solana",
    "Lazorkit",
    "Passkey",
    "WebAuthn",
    "USDC",
    "Gasless",
    "Smart Wallet",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-950 text-white`}
      >
        <LazorkitWrapper>{children}</LazorkitWrapper>
      </body>
    </html>
  );
}
