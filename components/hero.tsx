"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play, Compass, ShieldAlert, Sparkles, MapPin, Clock, ArrowUpRight, MessageSquare } from "lucide-react";

interface HeroProps {
  onOpenEarlyAccess: () => void;
}

export default function Hero({ onOpenEarlyAccess }: HeroProps) {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28 bg-[#F8FAFC]">
      {/* Background patterns */}
      <div className="absolute inset-0 radar-grid opacity-70 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Text Content */}
          <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary-dark text-xs font-semibold mb-6 border border-primary/20"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cari customers who already need your service</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-navy leading-[1.1] mb-6"
            >
              Find customers <br />
              <span className="text-primary">already asking</span> for help.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-slate-600 max-w-xl mb-8 leading-relaxed"
            >
              CariLead scans public online conversations where Malaysians are looking for recommendations, comparing providers, complaining about a service, or considering switching. 
              <span className="block mt-3 font-semibold text-navy">No more blindly chasing cold leads.</span>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
            >
              <a
                href="#free-report"
                className="bg-primary hover:bg-primary-dark text-white text-base font-semibold px-6 py-4 rounded-xl shadow-lg hover:shadow-xl hover:shadow-primary/20 transition-all flex items-center justify-center gap-2 group active:scale-95"
              >
                Get Free Weekly Leads Report
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#how-it-works"
                className="bg-white hover:bg-slate-50 text-slate-700 font-semibold px-6 py-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95"
              >
                <Play className="w-4 h-4 fill-slate-500 text-slate-500" />
                See How It Works
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8 flex items-center gap-2 text-xs font-medium text-slate-500"
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Built for Malaysian agents and service businesses
            </motion.div>
          </div>

          {/* Graphic Mockup Dashboard */}
          <div className="lg:col-span-6 relative">
            {/* Animated Radar Pulse behind Dashboard */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 pointer-events-none z-0">
              <span className="absolute inset-0 rounded-full border border-primary/20 animate-radar-pulse"></span>
              <span className="absolute inset-0 rounded-full border border-primary/10 animate-radar-pulse [animation-delay:1.5s]"></span>
              <span className="absolute inset-0 rounded-full border border-primary/5 animate-radar-pulse [animation-delay:3s]"></span>
            </div>

            {/* Dashboard Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative z-10 bg-white/95 rounded-2xl border border-slate-200/80 shadow-2xl p-4 sm:p-6 max-w-lg mx-auto sm:max-w-none"
            >
              {/* Mockup Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-400" />
                    <span className="w-3 h-3 rounded-full bg-amber-400" />
                    <span className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="h-5 w-px bg-slate-200 mx-1" />
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 text-[10px] font-semibold text-slate-600">
                    <Compass className="w-3 h-3 animate-spin [animation-duration:12s]" />
                    <span>CARILEAD ENGINE v1.2</span>
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 font-medium">
                  Live Stream Signals
                </div>
              </div>

              {/* Feed Content Stack */}
              <div className="space-y-4">
                {/* Opportunity Card 1 */}
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="p-3.5 bg-slate-50 hover:bg-slate-100/70 border border-slate-200/50 rounded-xl transition-all shadow-sm group"
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold uppercase tracking-wider">
                      High Intent
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                      <Clock className="w-3 h-3" />
                      18m ago
                    </span>
                  </div>
                  <p className="text-sm font-medium text-navy mb-3 italic">
                    &ldquo;Medical card premium increased again. Any better option?&rdquo;
                  </p>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs border-t border-slate-200/40 pt-2.5">
                    <div className="flex items-center gap-2 text-slate-500">
                      <span className="bg-primary/10 text-primary-dark font-semibold px-2 py-0.5 rounded text-[10px]">
                        Insurance
                      </span>
                      <span className="flex items-center gap-0.5">
                        <MapPin className="w-3.5 h-3.5" /> Selangor
                      </span>
                    </div>
                    <span className="flex items-center gap-1 font-semibold text-primary hover:underline text-[11px] cursor-pointer">
                      View Public Source
                      <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>
                </motion.div>

                {/* Opportunity Card 2 */}
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="p-3.5 bg-slate-50 hover:bg-slate-100/70 border border-slate-200/50 rounded-xl transition-all shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 text-[10px] font-bold uppercase tracking-wider">
                      Recommendation
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                      <Clock className="w-3 h-3" />
                      42m ago
                    </span>
                  </div>
                  <p className="text-sm font-medium text-navy mb-3 italic">
                    &ldquo;Looking for a reliable property agent in Cheras.&rdquo;
                  </p>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs border-t border-slate-200/40 pt-2.5">
                    <div className="flex items-center gap-2 text-slate-500">
                      <span className="bg-primary/10 text-primary-dark font-semibold px-2 py-0.5 rounded text-[10px]">
                        Property
                      </span>
                      <span className="flex items-center gap-0.5">
                        <MapPin className="w-3.5 h-3.5" /> Kuala Lumpur
                      </span>
                    </div>
                    <span className="flex items-center gap-1 font-semibold text-primary hover:underline text-[11px] cursor-pointer">
                      View Public Source
                      <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>
                </motion.div>

                {/* Opportunity Card 3 */}
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="p-3.5 bg-slate-50 hover:bg-slate-100/70 border border-slate-200/50 rounded-xl transition-all shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wider">
                      Service Complaint
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                      <Clock className="w-3 h-3" />
                      1h ago
                    </span>
                  </div>
                  <p className="text-sm font-medium text-navy mb-3 italic">
                    &ldquo;Renovation contractor delayed for three months. Need advice.&rdquo;
                  </p>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs border-t border-slate-200/40 pt-2.5">
                    <div className="flex items-center gap-2 text-slate-500">
                      <span className="bg-primary/10 text-primary-dark font-semibold px-2 py-0.5 rounded text-[10px]">
                        Renovation
                      </span>
                      <span className="flex items-center gap-0.5">
                        <MapPin className="w-3.5 h-3.5" /> Johor
                      </span>
                    </div>
                    <span className="flex items-center gap-1 font-semibold text-primary hover:underline text-[11px] cursor-pointer">
                      View Public Source
                      <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>
                </motion.div>
              </div>

              {/* Safe Mode banner */}
              <div className="mt-4 flex items-center justify-between gap-2 px-3 py-2 bg-slate-50 rounded-lg text-[10px] font-medium text-slate-500 border border-slate-100">
                <span className="flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
                  Public-source conversations only
                </span>
                <span className="text-slate-400 font-semibold">
                  Zero phone scraping
                </span>
              </div>
            </motion.div>

            {/* Small Floating badge */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -right-4 hidden md:flex items-center gap-2.5 bg-white border border-slate-200 p-3 rounded-xl shadow-lg z-20"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-navy leading-none">New Signal Detected</div>
                <div className="text-[9px] text-slate-400 mt-0.5">Automotive: Kuala Lumpur</div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
