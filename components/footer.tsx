"use client";

import Link from "next/link";
import { Radio } from "lucide-react";

export default function Footer() {
  const links = [
    { name: "How It Works", href: "#how-it-works" },
    { name: "Industries", href: "#industries" },
    { name: "Pricing", href: "#pricing" },
    { name: "Privacy", href: "#" },
    { name: "Terms", href: "#" },
    { name: "Contact", href: "#" },
  ];

  return (
    <footer className="bg-navy text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
              <Radio className="w-5 h-5 text-primary animate-pulse" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Cari<span className="text-primary">Lead</span>
            </span>
          </Link>

          {/* Nav links */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-8">
            {links.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-xs font-semibold hover:text-white transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>

        </div>

        {/* Footer Details */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[11px] leading-relaxed max-w-md text-center md:text-left">
            CariLead helps businesses discover relevant public customer conversations. Results are signals, not guaranteed leads. We encourage transparent, helpful, and platform-compliant engagement.
          </p>
          <p className="text-[11px] font-semibold text-center md:text-right shrink-0">
            &copy; 2026 CariLead. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}
