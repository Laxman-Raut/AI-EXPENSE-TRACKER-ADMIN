import "./globals.css";
import Providers from "@/context/Providers";

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
      <body className="font-sans antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
