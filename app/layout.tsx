import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { LanguageProvider } from "@/lib/language-context";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "CariLead — Find Customers Already Asking for Help",
  description:
    "CariLead discovers public conversations where Malaysian customers are asking for recommendations, comparing providers, complaining about services, or considering alternatives.",
  keywords: [
    "Malaysia leads",
    "insurance leads Malaysia",
    "property leads Malaysia",
    "sales opportunities Malaysia",
    "customer complaints Malaysia",
    "recommendation requests",
    "public buying signals",
    "CariLead",
  ],
  authors: [{ name: "CariLead Team" }],
  openGraph: {
    title: "CariLead — Find Customers Already Asking for Help",
    description:
      "CariLead discovers public conversations where Malaysian customers are asking for recommendations, comparing providers, complaining about services, or considering alternatives.",
    type: "website",
    locale: "en_MY",
    siteName: "CariLead",
  },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2280%22>📡</text></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} font-sans antialiased bg-[#F8FAFC] text-[#0F172A]`}>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
