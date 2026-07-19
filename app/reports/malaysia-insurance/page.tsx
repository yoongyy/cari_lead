import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, FileText, Search, X } from "lucide-react";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { OpportunityBrowser } from "@/components/reports/opportunity-browser";
import { XhsDatabaseExplorer } from "@/components/reports/xhs-database-explorer";
import { DemoLabel, Methodology, ReportCta, SectionHeading, TrendBadge, TrendChart } from "@/components/reports/report-ui";
import { comparisonRows, insurerMentions, opportunities, productThemes, reportMeta, themes } from "@/data/sample-insurance-report";

export const metadata: Metadata = {
  title: "Malaysia Insurance Customer Voice Report | CariLead",
  description: "A clearly labeled sample of CariLead's Malaysia insurance customer voice and opportunity report.",
};

export default function MalaysiaInsuranceReport() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 pt-20">
        <section className="border-b border-slate-200 bg-white py-12 sm:py-16">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
            <div className="max-w-3xl">
              <div className="mb-5 flex flex-wrap items-center gap-3"><DemoLabel /><span className="text-xs font-semibold text-slate-500">{reportMeta.period}</span></div>
              <p className="mb-2 text-xs font-bold uppercase text-primary">CariLead sample report</p>
              <h1 className="text-4xl font-extrabold leading-tight text-navy sm:text-5xl">Malaysia Insurance Customer Voice Report</h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">What people complain about, praise, compare, and consider switching to, translated into practical product and sales opportunities.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/#free-report" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-primary-dark">Get Free Weekly Report <ArrowRight className="h-4 w-4" /></Link>
                <a href="#sample-opportunities" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-navy hover:border-primary hover:text-primary"><Search className="h-4 w-4" /> View Sample Opportunities</a>
              </div>
            </div>
            <div className="border border-slate-200 bg-slate-50 p-6 rounded-lg">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4"><div className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /><span className="text-sm font-bold text-navy">Edition snapshot</span></div><span className="text-[10px] font-bold uppercase text-amber-700">Demo data</span></div>
              <dl className="mt-5 grid grid-cols-2 gap-5">
                <div><dt className="text-[11px] text-slate-500">Conversations</dt><dd className="mt-1 text-2xl font-extrabold text-navy">{reportMeta.conversations}</dd></div>
                <div><dt className="text-[11px] text-slate-500">High intent</dt><dd className="mt-1 text-2xl font-extrabold text-navy">{reportMeta.highIntent}</dd></div>
                <div><dt className="text-[11px] text-slate-500">Leading product</dt><dd className="mt-1 text-sm font-bold text-navy">{reportMeta.leadingProduct}</dd></div>
                <div><dt className="text-[11px] text-slate-500">Growing pain point</dt><dd className="mt-1 text-sm font-bold text-navy">{reportMeta.fastestGrowing}</dd></div>
              </dl>
              <p className="mt-6 border-t border-slate-200 pt-4 text-[11px] leading-5 text-slate-500">All figures and examples on this page are illustrative. They are not current market measurements.</p>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading eyebrow="Executive themes" title="Where customer attention is concentrating" description="Demo themes ranked by illustrative conversation volume and directional change." />
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {themes.slice(0, 3).map((theme) => <article key={theme.name} className="border border-slate-200 bg-white p-5 rounded-lg"><div className="flex items-start justify-between gap-3"><h3 className="font-bold text-navy">{theme.name}</h3><TrendBadge direction={theme.direction} change={theme.change} /></div><p className="mt-4 text-3xl font-extrabold text-navy">{theme.share}%</p><p className="mt-1 text-[11px] text-slate-500">share of demo conversations</p><p className="mt-4 text-xs leading-5 text-slate-600">{theme.summary}</p></article>)}
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white py-16">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
            <div><SectionHeading eyebrow="Complaint trend" title="Conversation themes by volume" /><TrendChart data={themes} /></div>
            <div><SectionHeading eyebrow="Growing vs shrinking" title="Direction matters as much as volume" />
              <div className="divide-y divide-slate-200 border-y border-slate-200">{themes.map((theme) => <div key={theme.name} className="flex items-center justify-between gap-4 py-3"><div><p className="text-sm font-bold text-navy">{theme.name}</p><p className="mt-1 text-[11px] text-slate-500">{theme.mentions} demo mentions</p></div><TrendBadge direction={theme.direction} change={theme.change} /></div>)}</div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading eyebrow="Insurer and product themes" title="What customers mention while evaluating options" description="Brand mentions measure visibility in this demo set, not market share or service quality." />
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="min-w-0 overflow-x-auto border border-slate-200 bg-white rounded-lg"><table className="w-full min-w-[520px] text-left text-xs"><caption className="border-b border-slate-200 p-4 text-left text-sm font-bold text-navy">Demo insurer mentions</caption><thead className="bg-slate-50 text-slate-500"><tr><th className="p-3">Insurer</th><th className="p-3">Mentions</th><th className="p-3">Positive</th><th className="p-3">Neutral</th><th className="p-3">Negative</th></tr></thead><tbody className="divide-y divide-slate-100">{insurerMentions.map((item) => <tr key={item.name}><th className="p-3 font-bold text-navy">{item.name}</th><td className="p-3">{item.mentions}</td><td className="p-3 text-emerald-700">{item.positive}</td><td className="p-3 text-slate-500">{item.neutral}</td><td className="p-3 text-rose-700">{item.negative}</td></tr>)}</tbody></table></div>
              <div className="border border-slate-200 bg-white p-5 rounded-lg"><h3 className="text-sm font-bold text-navy">Demo product demand themes</h3><div className="mt-4 divide-y divide-slate-100">{productThemes.map((item) => <div key={item.name} className="flex items-center justify-between gap-5 py-3"><div><p className="text-sm font-semibold text-navy">{item.name}</p><p className="mt-1 text-[11px] text-slate-500">{item.signal}</p></div><span className="text-sm font-bold text-teal">{item.mentions}</span></div>)}</div></div>
            </div>
          </div>
        </section>

        <section id="sample-opportunities" className="border-y border-slate-200 bg-white py-16 scroll-mt-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading eyebrow="Opportunity feed" title="Eight public-conversation examples" description="Open any example to see the fact boundary, suggested response, and engagement guardrails." />
            <OpportunityBrowser opportunities={opportunities} />
          </div>
        </section>

        {/* Real captured XHS Database Explorer */}
        <section className="py-16 bg-[#F8FAFC]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading eyebrow="Database Explorer" title="Captured XHS posts and comments details" description="Real-time capture stream showing posts, comments, and location signals retrieved by our XHS crawler." />
            <XhsDatabaseExplorer />
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_0.8fr] lg:px-8">
            <div className="min-w-0"><SectionHeading eyebrow="Free vs paid" title="Start with the report, then monitor the feed" />
              <div className="overflow-x-auto border border-slate-200 bg-white rounded-lg"><table className="w-full min-w-[520px] text-left text-xs"><thead className="bg-slate-50"><tr><th className="p-4 text-navy">Capability</th><th className="p-4 text-navy">Free report</th><th className="p-4 text-navy">Paid monitoring</th></tr></thead><tbody className="divide-y divide-slate-100">{comparisonRows.map((row) => <tr key={row.feature}><th className="p-4 font-semibold text-slate-700">{row.feature}</th>{[row.free, row.paid].map((value, index) => <td key={index} className="p-4">{typeof value === "boolean" ? value ? <Check className="h-4 w-4 text-primary" aria-label="Included" /> : <X className="h-4 w-4 text-slate-300" aria-label="Not included" /> : value}</td>)}</tr>)}</tbody></table></div>
            </div>
            <div className="min-w-0"><SectionHeading eyebrow="Responsible use" title="Signal first, human verification always" /><Methodology /><p id="demo-source" className="mt-5 text-xs leading-5 text-slate-500">Source links are intentionally placeholders in this fabricated sample. A live report would link only to eligible public posts and preserve platform context.</p><Link href="/#free-report" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">Choose Insurance in the free report form <ArrowRight className="h-4 w-4" /></Link></div>
          </div>
        </section>
        <ReportCta />
      </main>
      <Footer />
    </>
  );
}
