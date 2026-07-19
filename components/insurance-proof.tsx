"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BarChart3, SearchCheck, TrendingUp, Radio, Database, ShieldCheck } from "lucide-react";
import { opportunities } from "@/data/sample-insurance-report";
import { OpportunityBrowser } from "@/components/reports/opportunity-browser";

export default function InsuranceProof() {
  const [stats, setStats] = useState({ posts: 1429, comments: 3421, findings: 126 });

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStats({
            posts: data.posts,
            comments: data.comments,
            findings: data.findings,
          });
        }
      })
      .catch((err) => console.warn("Failed to fetch live stats, using fallbacks:", err));
  }, []);

  return (
    <section id="insurance-sample" className="border-y border-slate-200 bg-slate-50 py-20 scroll-mt-20" aria-labelledby="insurance-proof-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end mb-12">
          <div className="max-w-3xl">
            <p className="mb-2 text-xs font-bold uppercase text-primary tracking-wider">
              Malaysia Insurance Insights
            </p>
            <h2 id="insurance-proof-title" className="text-3xl font-extrabold text-navy sm:text-4xl">
              See the customer signal behind the summary.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              A live preview of how CariLead turns public questions, renewal price complaints, and switching discussions in Malaysia into structured sales intelligence.
            </p>
          </div>
          <Link
            href="/reports/malaysia-insurance"
            className="inline-flex min-h-11 items-center gap-2 self-start rounded-lg bg-primary hover:bg-primary-dark text-white px-5 py-3 text-sm font-bold shadow-md hover:shadow-lg transition-all md:self-auto"
          >
            Open Full Malaysia Insurance Report
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Live Crawl Database Metrics & Summary Stats */}
        <div className="grid border border-slate-200 bg-white lg:grid-cols-[1.4fr_1fr] rounded-2xl overflow-hidden shadow-sm mb-12">
          {/* Executive Themes Summary */}
          <div className="border-b border-slate-200 p-6 sm:p-8 lg:border-b-0 lg:border-r">
            <div className="flex items-center gap-2 text-primary">
              <TrendingUp className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Top Insurance Themes</span>
            </div>
            
            <h3 className="mt-3 text-xl font-bold text-navy">
              Premium pressure creates a policy-review opportunity.
            </h3>
            
            <p className="mt-2 text-xs leading-relaxed text-slate-500 mb-6">
              Our latest crawls indicate that premium increases and medical card limits dominate public discussions. Customers seek neutral advice on benefit options, room rate adjustments, and conventional vs. takaful options.
            </p>

            {/* Visual themes mini-chart */}
            <div className="space-y-3.5">
              {[
                { name: "Premium Increases", share: 27, status: "Growing (+9 pts)", color: "bg-red-500" },
                { name: "Medical Card Limits", share: 21, status: "Growing (+5 pts)", color: "bg-amber-500" },
                { name: "Claims Clarity & Rules", share: 16, status: "Stable (+1 pt)", color: "bg-teal-500" },
              ].map((theme) => (
                <div key={theme.name} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 font-bold text-navy w-44">
                    <span className={`w-2.5 h-2.5 rounded-full ${theme.color}`} />
                    <span>{theme.name}</span>
                  </div>
                  <div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className={`${theme.color} h-full`} style={{ width: `${theme.share * 2.5}%` }} />
                  </div>
                  <div className="flex justify-between sm:justify-end items-center gap-3 w-32 font-semibold text-slate-400">
                    <span className="text-navy font-bold">{theme.share}% share</span>
                    <span className="text-[10px] text-slate-500">{theme.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Database Metrics Grid */}
          <div className="grid grid-cols-3 lg:grid-cols-1 divide-x lg:divide-x-0 lg:divide-y divide-slate-100 bg-[#F8FAFC]">
            {/* Scanned Posts */}
            <div className="p-5 sm:p-6 flex flex-col justify-center">
              <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[9px] uppercase tracking-wider mb-2">
                <Database className="w-3.5 h-3.5 text-slate-400" />
                <span>Scanned Posts (XHS)</span>
              </div>
              <p className="text-xl sm:text-2xl font-extrabold text-navy leading-none">
                {stats.posts.toLocaleString()}
              </p>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">Total public posts</p>
            </div>

            {/* Processed Comments */}
            <div className="p-5 sm:p-6 flex flex-col justify-center">
              <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[9px] uppercase tracking-wider mb-2">
                <BarChart3 className="w-3.5 h-3.5 text-slate-400" />
                <span>Comments Analyzed</span>
              </div>
              <p className="text-xl sm:text-2xl font-extrabold text-navy leading-none">
                {stats.comments.toLocaleString()}
              </p>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">Processed comment threads</p>
            </div>

            {/* Extracted Findings */}
            <div className="p-5 sm:p-6 flex flex-col justify-center">
              <div className="flex items-center gap-1.5 text-primary font-bold text-[9px] uppercase tracking-wider mb-2">
                <SearchCheck className="w-3.5 h-3.5 text-primary" />
                <span>Extracted Signals</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <p className="text-xl sm:text-2xl font-extrabold text-primary-dark leading-none">
                  {stats.findings.toLocaleString()}
                </p>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">Classified sales opportunities</p>
            </div>
          </div>
        </div>

        {/* Opportunity Card Previews */}
        <div className="mb-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
            Sample Opportunity Cards from Malaysia Report
          </p>
          <OpportunityBrowser opportunities={opportunities.slice(0, 3)} compact />
        </div>

      </div>
    </section>
  );
}
