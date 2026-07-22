import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/context/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "ExpenseAI SaaS Admin Dashboard",
  description: "Premium enterprise administration, subscription management, ledger audit, and AI diagnostics dashboard.",
  keywords: ["SaaS", "Dashboard", "Admin", "Billing", "Stripe", "Next.js", "Expense Tracker"],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
