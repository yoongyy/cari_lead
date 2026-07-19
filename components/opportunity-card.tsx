"use client";

import { useState } from "react";
import { MapPin, Clock, ArrowUpRight, Bookmark, BookmarkCheck, ThumbsUp, Radio } from "lucide-react";

export interface Opportunity {
  id: string;
  quote: string;
  industry: string;
  location: string;
  signal: string;
  time: string;
  confidence: number;
  source: string;
}

interface OpportunityCardProps {
  opp: Opportunity;
  onViewSource: (opp: Opportunity) => void;
}

export default function OpportunityCard({ opp, onViewSource }: OpportunityCardProps) {
  const [isSaved, setIsSaved] = useState(false);

  // Intent styles based on signal type
  const getSignalBadgeStyle = (signal: string) => {
    switch (signal.toLowerCase()) {
      case "considering switch":
        return "bg-rose-100 text-rose-800 border-rose-200";
      case "looking for recommendation":
        return "bg-teal-100 text-teal-800 border-teal-200";
      case "asking for help":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "comparing options":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "complaint":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        {/* Card Header metadata */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getSignalBadgeStyle(opp.signal)} uppercase tracking-wider`}>
              {opp.signal}
            </span>
            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold">
              {opp.industry}
            </span>
          </div>
          <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
            <Clock className="w-3 h-3" />
            {opp.time}
          </span>
        </div>

        {/* Quote Content */}
        <p className="text-sm font-medium text-navy mb-4 italic leading-relaxed group-hover:text-primary transition-colors">
          &ldquo;{opp.quote}&rdquo;
        </p>
      </div>

      {/* Card Footer details */}
      <div className="border-t border-slate-100 pt-3 mt-2">
        <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mb-4">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{opp.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Radio className="w-3 h-3 text-primary animate-pulse" />
            <span className="font-semibold text-slate-600">
              Confidence: {opp.confidence}%
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <button
            onClick={() => onViewSource(opp)}
            className="flex-1 flex items-center justify-center gap-1 text-xs font-bold text-primary bg-primary/5 hover:bg-primary/10 border border-primary/20 hover:border-primary/30 py-2.5 rounded-xl transition-all active:scale-[0.98]"
          >
            <span>View Source</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
          
          <button
            onClick={() => setIsSaved(!isSaved)}
            className={`px-3 py-2.5 rounded-xl border transition-all flex items-center justify-center active:scale-[0.98] ${
              isSaved
                ? "bg-slate-100 border-slate-300 text-slate-600 hover:bg-slate-200"
                : "bg-white hover:bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600"
            }`}
            title={isSaved ? "Saved to local storage" : "Save Opportunity"}
          >
            {isSaved ? (
              <BookmarkCheck className="w-4 h-4 text-primary" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
