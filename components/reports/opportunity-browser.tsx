"use client";

import { useEffect, useState } from "react";
import { ExternalLink, MapPin, MessageSquareText, X } from "lucide-react";
import type { DemoOpportunity } from "@/data/sample-insurance-report";
import { DemoLabel } from "@/components/reports/report-ui";

const intentStyles = {
  High: "bg-rose-50 text-rose-700 border-rose-200",
  Medium: "bg-amber-50 text-amber-800 border-amber-200",
  Low: "bg-slate-50 text-slate-700 border-slate-200",
};

export function OpportunityCard({ opportunity, compact = false, onOpen }: { opportunity: DemoOpportunity; compact?: boolean; onOpen?: () => void }) {
  return (
    <article className="flex h-full flex-col border border-slate-200 bg-white p-5 shadow-sm rounded-lg">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <DemoLabel />
        <span className={`rounded border px-2 py-1 text-[10px] font-bold uppercase ${intentStyles[opportunity.intent]}`}>{opportunity.intent} intent</span>
        <span className="text-[11px] font-semibold text-slate-400">{opportunity.confidence}% confidence</span>
      </div>
      <h3 className="text-base font-bold leading-6 text-navy">{opportunity.title}</h3>
      <p className={`mt-2 text-xs leading-5 text-slate-600 ${compact ? "line-clamp-2" : ""}`}>{opportunity.excerpt}</p>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[11px] font-semibold text-slate-500">
        <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{opportunity.location}</span>
        <span>{opportunity.category}</span>
        <span>{opportunity.posted}</span>
      </div>
      <div className="mt-auto pt-5">
        <button type="button" onClick={onOpen} className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-dark">
          <MessageSquareText className="h-4 w-4" /> View response guidance
        </button>
      </div>
    </article>
  );
}

function OpportunityModal({ opportunity, onClose }: { opportunity: DemoOpportunity; onClose: () => void }) {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-navy/60 p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="opportunity-title" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-lg bg-white shadow-2xl sm:rounded-lg">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <DemoLabel />
          <button type="button" onClick={onClose} aria-label="Close opportunity details" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-navy"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-5 sm:p-7">
          <p className="text-xs font-bold uppercase text-primary">{opportunity.signal}</p>
          <h2 id="opportunity-title" className="mt-2 text-xl font-extrabold text-navy sm:text-2xl">{opportunity.title}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">{opportunity.excerpt}</p>
          <div className="mt-7 grid gap-7 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-bold text-navy">Known from the public post</h3>
              <ul className="mt-3 space-y-2 text-xs leading-5 text-slate-600">{opportunity.knownFacts.map((fact) => <li key={fact}>• {fact}</li>)}</ul>
            </div>
            <div>
              <h3 className="text-sm font-bold text-navy">Needs verification</h3>
              <ul className="mt-3 space-y-2 text-xs leading-5 text-slate-600">{opportunity.unknownFacts.map((fact) => <li key={fact}>• {fact}</li>)}</ul>
            </div>
          </div>
          <div className="mt-7 border-l-4 border-primary bg-emerald-50 p-4">
            <h3 className="text-sm font-bold text-navy">Suggested helpful response</h3>
            <p className="mt-2 text-xs leading-5 text-slate-700">{opportunity.suggestedResponse}</p>
          </div>
          <div className="mt-6">
            <h3 className="text-sm font-bold text-navy">Response guardrails</h3>
            <ul className="mt-2 space-y-2 text-xs leading-5 text-slate-600">{opportunity.warnings.map((warning) => <li key={warning}>• {warning}</li>)}</ul>
          </div>
          <a href="#demo-source" onClick={onClose} className="mt-7 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline">Source link placeholder <ExternalLink className="h-3.5 w-3.5" /></a>
        </div>
      </div>
    </div>
  );
}

export function OpportunityBrowser({ opportunities, compact = false }: { opportunities: DemoOpportunity[]; compact?: boolean }) {
  const [selected, setSelected] = useState<DemoOpportunity | null>(null);
  return (
    <>
      <div className={`grid gap-5 ${compact ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
        {opportunities.map((opportunity) => <OpportunityCard key={opportunity.id} opportunity={opportunity} compact={compact} onOpen={() => setSelected(opportunity)} />)}
      </div>
      {selected ? <OpportunityModal opportunity={selected} onClose={() => setSelected(null)} /> : null}
    </>
  );
}
