"use client";

import Link from "next/link";
import { Radio } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export default function Footer() {
  const { language } = useLanguage();

  const links = [
    { name: language === "en" ? "How It Works" : "运作原理", href: "/#how-it-works" },
    { name: language === "en" ? "Industries" : "行业板块", href: "/#industries" },
    { name: language === "en" ? "Sample Report" : "样本报告", href: "/reports/malaysia-insurance" },
    // { name: "Pricing", href: "/#pricing" },
    { name: language === "en" ? "Privacy" : "隐私政策", href: "#" },
    { name: language === "en" ? "Terms" : "服务条款", href: "#" },
    { name: language === "en" ? "Contact" : "联系我们", href: "#" },
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
            {language === "en" 
              ? "CariLead helps businesses discover relevant public customer conversations. Results are signals, not guaranteed leads. We encourage transparent, helpful, and platform-compliant engagement."
              : "CariLead 帮助企业发现相关的公开客户对话。搜索结果为需求信号，非保证线索。我们提倡透明、互助且符合平台规范的沟通方式。"}
          </p>
          <p className="text-[11px] font-semibold text-center md:text-right shrink-0">
            &copy; 2026 CariLead. {language === "en" ? "All rights reserved." : "版权所有。"}
          </p>
        </div>

      </div>
    </footer>
  );
}
