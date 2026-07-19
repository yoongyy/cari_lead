"use client";

import { motion } from "framer-motion";
import { MessageSquareQuote, Compass } from "lucide-react";

export default function FounderStory() {
  return (
    <section className="py-20 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 md:p-12 shadow-sm max-w-4xl mx-auto">
          <div className="grid md:grid-cols-12 gap-8 items-center">
            
            {/* Left Graphic Element */}
            <div className="md:col-span-4 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 shadow-inner">
                <Compass className="w-9 h-9" />
              </div>
              <p className="text-xs font-bold text-navy uppercase tracking-wider">
                Behind CariLead
              </p>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">
                Kuala Lumpur, Malaysia
              </p>
            </div>

            {/* Right Story Copy */}
            <div className="md:col-span-8">
              <h3 className="text-2xl font-extrabold text-navy tracking-tight mb-6">
                Why we built CariLead
              </h3>
              
              <div className="space-y-4 text-sm text-slate-600 leading-relaxed font-medium">
                <p>
                  SMEs and sales agents spend thousands of Ringgit chasing cold contact lists and advertising to strangers, while thousands of Malaysian customers are openly asking for recommendations or seeking help online every single day.
                </p>
                <p>
                  We built CariLead to monitor those public conversations, understand the real problem, and help honest professionals respond at the exact right moment.
                </p>
                <p>
                  CariLead began by analysing customer complaints, switching behavior, and buying questions across difficult-to-search forums and groups. We realised the most valuable signal wasn&apos;t just that someone was unhappy with their provider—it was that they were active, ready, and looking for something better.
                </p>
              </div>

              {/* Quote Footer */}
              <div className="mt-6 border-t border-slate-100 pt-4 flex items-center gap-3">
                <MessageSquareQuote className="w-5 h-5 text-slate-400 shrink-0" />
                <span className="text-xs font-bold text-navy italic">
                  &ldquo;Stop chasing strangers. Connect with people already asking for help.&rdquo;
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
