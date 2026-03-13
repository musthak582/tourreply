import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export const metadata: Metadata = {
  title: "TourReply — WhatsApp Booking Automation for Hotels",
  description:
    "Automate your hotel's WhatsApp inquiries, manage bookings, and grow revenue with TourReply.",
  keywords: "hotel booking, WhatsApp automation, property management, villa booking",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-white antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
