import { ArrowDownRight, ArrowRight, ArrowUpRight, Minus, ShieldCheck } from "lucide-react";
import Link from "next/link";
import type { Theme, TrendDirection } from "@/data/sample-insurance-report";

const trendStyles: Record<TrendDirection, string> = {
  Growing: "bg-amber-50 text-amber-800 border-amber-200",
  Stable: "bg-slate-50 text-slate-700 border-slate-200",
  Shrinking: "bg-emerald-50 text-emerald-800 border-emerald-200",
};

function TrendIcon({ direction }: { direction: TrendDirection }) {
  if (direction === "Growing") return <ArrowUpRight className="h-3.5 w-3.5" />;
  if (direction === "Shrinking") return <ArrowDownRight className="h-3.5 w-3.5" />;
  return <Minus className="h-3.5 w-3.5" />;
}

export function DemoLabel() {
  return <span className="inline-flex rounded border border-amber-300 bg-amber-50 px-2 py-1 text-[10px] font-bold uppercase text-amber-800">Demo example</span>;
}

export function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div className="mb-8 max-w-3xl">
      <p className="mb-2 text-xs font-bold uppercase text-primary">{eyebrow}</p>
      <h2 className="text-2xl font-extrabold text-navy sm:text-3xl">{title}</h2>
      {description ? <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p> : null}
    </div>
  );
}

export function TrendBadge({ direction, change }: { direction: TrendDirection; change: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded border px-2 py-1 text-[11px] font-bold ${trendStyles[direction]}`}>
      <TrendIcon direction={direction} /> {direction} · {change}
    </span>
  );
}

export function TrendChart({ data }: { data: Theme[] }) {
  const max = Math.max(...data.map((item) => item.mentions));
  return (
    <div role="img" aria-label="Demo complaint themes by number of mentions" className="space-y-4">
      {data.map((item) => (
        <div key={item.name}>
          <div className="mb-1.5 flex items-center justify-between gap-4 text-xs">
            <span className="font-semibold text-slate-700">{item.name}</span>
            <span className="shrink-0 text-slate-500">{item.mentions} mentions</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-sm bg-slate-100">
            <div className="h-full rounded-sm bg-teal" style={{ width: `${(item.mentions / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Methodology() {
  return (
    <div className="flex gap-4 border-l-4 border-teal bg-white p-5 shadow-sm">
      <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-teal" />
      <div>
        <h3 className="font-bold text-navy">Methodology and limits</h3>
        <p className="mt-2 text-xs leading-5 text-slate-600">
          This sample uses fabricated, anonymized examples to demonstrate report structure. A production report would classify public conversations by topic, intent, product, sentiment, and recency, then retain source links for human verification. Counts are directional signals, not population estimates, financial advice, or guaranteed leads.
        </p>
      </div>
    </div>
  );
}

export function ReportCta() {
  return (
    <section className="bg-navy py-14 text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-7 px-4 sm:px-6 md:flex-row md:items-center lg:px-8">
        <div className="max-w-2xl">
          <p className="mb-2 text-xs font-bold uppercase text-primary-light">Weekly market intelligence</p>
          <h2 className="text-2xl font-extrabold sm:text-3xl">Receive the next Malaysia insurance report.</h2>
          <p className="mt-2 text-sm text-slate-300">Choose Insurance on the free report form. No credit card required.</p>
        </div>
        <Link href="/#free-report" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-primary-dark">
          Get Free Weekly Report <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
