"use client";

import { motion } from "framer-motion";
import { ShieldCheck, CheckCircle2, Lock } from "lucide-react";

export default function TrustSection() {
  const trustPoints = [
    {
      title: "Public-source conversations only",
      desc: "We only index publicly accessible discussions. No scraping behind private logins, hidden groups, or password locks.",
    },
    {
      title: "Original source visible",
      desc: "Every single opportunity shows the original link. You see exactly where it came from before choosing to engage.",
    },
    {
      title: "No hidden phone harvesting",
      desc: "We do not harvest phone numbers, emails, or personal contact details. You write helpful responses publicly.",
    },
    {
      title: "No mass automated DMs",
      desc: "CariLead has no automated message tools. We believe spam ruins sales conversion and harms your professional brand.",
    },
    {
      title: "No fake engagement",
      desc: "We do not use bots or synthetic profiles. You reply from your own legitimate business account.",
    },
    {
      title: "No selling private personal data",
      desc: "We never package or resell private information. Our database contains search references and platform routing only.",
    },
    {
      title: "Disclosed reply approach",
      desc: "We encourage users to clearly state who they are and who they work for when posting helpful responses.",
    },
    {
      title: "Customer choice priority",
      desc: "Customers choose whether they wish to continue the conversation with you in public comments or private DMs.",
    },
  ];

  return (
    <section className="py-20 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Trust Container Card */}
        <div className="bg-white border border-slate-200/80 rounded-3xl shadow-xl p-8 md:p-12 max-w-5xl mx-auto overflow-hidden relative">
          {/* Subtle background icons */}
          <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 text-slate-100 opacity-20 pointer-events-none z-0">
            <ShieldCheck className="w-80 h-80" />
          </div>

          <div className="relative z-10 grid md:grid-cols-12 gap-8 md:gap-12 items-center">
            
            {/* Trust Title and Accent */}
            <div className="md:col-span-4 flex flex-col items-center md:items-start text-center md:text-left">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 shadow-inner">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-navy tracking-tight mb-4">
                Built for helpful selling, not spam.
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-6">
                CariLead matches public customer complaints or recommendation requests to help you engage at the right time. We build tools that respects data privacy regulations and platform guidelines.
              </p>
              <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] tracking-wider uppercase bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                <Lock className="w-3.5 h-3.5" />
                <span>100% Privacy Compliant</span>
              </div>
            </div>

            {/* Trust Bullet Grid */}
            <div className="md:col-span-8 grid sm:grid-cols-2 gap-6">
              {trustPoints.map((point) => (
                <div key={point.title} className="flex gap-3 items-start">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-navy mb-1">
                      {point.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                      {point.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
