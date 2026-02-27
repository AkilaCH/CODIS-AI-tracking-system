import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import TelemetryProvider from "@/components/TelemetryProvider"; // Adjust path if needed

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SKY-WATCH CMD CENTER", // Updated to match your UI
  description: "Civilian Object Detection and Interception System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TelemetryProvider>
          {children}
        </TelemetryProvider>
      </body>
    </html>
  );
}