import Link from "next/link";
import { ArrowRight, BarChart3, SearchCheck, TrendingUp } from "lucide-react";
import { opportunities, reportMeta } from "@/data/sample-insurance-report";
import { OpportunityBrowser } from "@/components/reports/opportunity-browser";

export default function InsuranceProof() {
  return (
    <section id="insurance-sample" className="border-y border-slate-200 bg-slate-50 py-20 scroll-mt-20" aria-labelledby="insurance-proof-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="max-w-3xl">
            <p className="mb-2 text-xs font-bold uppercase text-primary">Malaysia insurance sample</p>
            <h2 id="insurance-proof-title" className="text-3xl font-extrabold text-navy sm:text-4xl">See the customer signal behind the summary.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">A realistic demonstration of how CariLead turns public questions, complaints, and switching signals into structured market intelligence.</p>
          </div>
          <Link href="/reports/malaysia-insurance" className="inline-flex min-h-11 items-center gap-2 self-start rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-navy hover:border-primary hover:text-primary md:self-auto">
            Open sample report <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10">
          <OpportunityBrowser opportunities={opportunities.slice(0, 3)} compact />
        </div>

        <div className="mt-10 grid border border-slate-200 bg-white lg:grid-cols-[1.4fr_1fr] rounded-lg">
          <div className="border-b border-slate-200 p-6 lg:border-b-0 lg:border-r">
            <div className="flex items-center gap-2 text-primary"><TrendingUp className="h-5 w-5" /><span className="text-xs font-bold uppercase">Sample insight</span></div>
            <h3 className="mt-3 text-xl font-bold text-navy">Premium pressure creates a policy-review opportunity.</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">In this demo edition, premium increases are the fastest-growing complaint theme. The useful response is not an immediate product pitch: it is a transparent review of benefits, deductibles, replacement risks, and affordable adjustment paths.</p>
          </div>
          <div className="grid grid-cols-2 divide-x divide-slate-200">
            <div className="p-6"><BarChart3 className="h-5 w-5 text-teal" /><p className="mt-4 text-2xl font-extrabold text-navy">{reportMeta.conversations}</p><p className="mt-1 text-xs text-slate-500">Demo conversations</p></div>
            <div className="p-6"><SearchCheck className="h-5 w-5 text-teal" /><p className="mt-4 text-2xl font-extrabold text-navy">{reportMeta.highIntent}</p><p className="mt-1 text-xs text-slate-500">Demo high-intent signals</p></div>
          </div>
        </div>
      </div>
    </section>
  );
}
