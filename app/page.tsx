"use client";

import { useState } from "react";
import Navbar from "@/components/navbar";
import Hero from "@/components/hero";
import ProblemSection from "@/components/problem-section";
import HowItWorks from "@/components/how-it-works";
import OpportunityFeed from "@/components/opportunity-feed";
import InsuranceProof from "@/components/insurance-proof";
import FreeReport from "@/components/free-report";
import ComparisonTable from "@/components/comparison-table";
import IndustryCards from "@/components/industry-cards";
import TrustSection from "@/components/trust-section";
// import Pricing from "@/components/pricing";
import FounderStory from "@/components/founder-story";
import FAQ from "@/components/faq";
import EarlyAccessForm from "@/components/early-access-form";
import Footer from "@/components/footer";
import { ArrowRight, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export default function Home() {
  const [isEarlyAccessOpen, setIsEarlyAccessOpen] = useState(false);
  const { language } = useLanguage();

  return (
    <>
      {/* Sticky Header Nav */}
      <Navbar onOpenEarlyAccess={() => setIsEarlyAccessOpen(true)} />

      <main className="min-h-screen">
        {/* Hero Section & Signal Mockup */}
        <Hero onOpenEarlyAccess={() => setIsEarlyAccessOpen(true)} />

        {/* Social Proof Strip & Problem Cards */}
        <ProblemSection />

        {/* 4-Step How it works */}
        <HowItWorks />

        {/* Interactive Opportunity Feed Mockup */}
        <OpportunityFeed />

        {/* Insurance report proof and sample opportunities */}
        <InsuranceProof />

        {/* Free report signup form */}
        <FreeReport />

        {/* Difference Comparison Table */}
        <ComparisonTable />

        {/* Industry niche cards */}
        <IndustryCards />

        {/* Trust, privacy boundaries, shield check */}
        <TrustSection />

        {/* Pricing RM0 / RM99 / RM399 */}
        {/* <Pricing onOpenEarlyAccess={() => setIsEarlyAccessOpen(true)} /> */}

        {/* Founder Story note */}
        <FounderStory />

        {/* Accordion FAQ grid */}
        <FAQ />

        {/* 14. Final CTA Section */}
        <section className="py-24 bg-navy text-white relative overflow-hidden">
          <div className="absolute inset-0 radar-grid opacity-10 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-primary/20 text-primary-light text-xs font-bold mb-6 border border-primary/30 uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === "en" ? "Secure your slot" : "锁定您的席位"}</span>
            </div>

            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
              {language === "en" ? "Your next customer may already be asking for help." : "您的下一位客户可能已经在寻求帮助。"}
            </h3>
            
            <p className="text-slate-400 text-sm max-w-xl mx-auto mb-10 leading-relaxed font-semibold">
              {language === "en" 
                ? "CariLead helps you find the conversation before your competitor does. No more cold lists. Start answering real queries."
                : "CariLead 帮助您在竞争对手之前发现对话。告别冷冰冰的电话名单，开始解答真实的客户查询。"}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="#free-report"
                className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white font-bold py-4 px-8 rounded-xl transition-all shadow-md active:scale-[0.98] text-sm"
              >
                {language === "en" ? "Get Free Weekly Report" : "获取每周免费报告"}
              </a>
              <button
                onClick={() => setIsEarlyAccessOpen(true)}
                className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 px-8 rounded-xl border border-slate-700 hover:border-slate-600 transition-all flex items-center justify-center gap-2 active:scale-[0.98] text-sm"
              >
                <span>{language === "en" ? "Join Early Access" : "加入早期体验"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer legal notices */}
      <Footer />

      {/* Modal Early Access popup Form */}
      <EarlyAccessForm
        isOpen={isEarlyAccessOpen}
        onClose={() => setIsEarlyAccessOpen(false)}
      />
    </>
  );
}
