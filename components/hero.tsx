"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Play, Compass, ShieldAlert, Sparkles, MapPin, Clock, ArrowUpRight, MessageSquare, Radio } from "lucide-react";

interface HeroProps {
  onOpenEarlyAccess: () => void;
}

interface LiveCard {
  id: string;
  quote: string;
  industry: string;
  location: string;
  signal: string;
  time: string;
}

const rotatingSignals = [
  { text: "Medical card premium AIA naik lagi 30%. Prudential or Great Eastern okay?", category: "Insurance", location: "Selangor" },
  { text: "Looking for a reliable property agent in Cheras.", category: "Property", location: "Kuala Lumpur" },
  { text: "First time buying medical card in Malaysia. What to check?", category: "Insurance", location: "Kuala Lumpur" },
  { text: "Any recommended chemistry tuition class in Subang Jaya?", category: "Education", location: "Selangor" },
  { text: "Renovation contractor delayed 2 months. Need advice.", category: "Renovation", location: "Johor" },
  { text: "SUV budget RM150k. Mazda CX5 vs Chery Tiggo 8 Pro?", category: "Automotive", location: "Penang" },
  { text: "Landlord refuse to return deposit (RM5000+) in Mont Kiara.", category: "Property", location: "Kuala Lumpur" },
  { text: "Anyone tried treatment for acne scars in KL? Recommendations?", category: "Beauty", location: "Kuala Lumpur" }
];

const initialCards: LiveCard[] = [
  {
    id: "card-init-1",
    quote: "Medical card premium increased again. Any better option?",
    industry: "Insurance",
    location: "Selangor",
    signal: "High Intent",
    time: "18m ago",
  },
  {
    id: "card-init-2",
    quote: "Looking for a reliable property agent in Cheras.",
    industry: "Property",
    location: "Kuala Lumpur",
    signal: "Recommendation",
    time: "42m ago",
  },
  {
    id: "card-init-3",
    quote: "Renovation contractor delayed for three months. Need advice.",
    industry: "Renovation",
    location: "Johor",
    signal: "Service Complaint",
    time: "1h ago",
  },
];

const signalPool = [
  { quote: "Thinking of switching my AIA medical card to Great Eastern. Rates are too high.", industry: "Insurance", location: "Penang", signal: "High Intent" },
  { quote: "Anyone knows a good renovation ID contractor for condo in PJ?", industry: "Renovation", location: "Selangor", signal: "Recommendation" },
  { quote: "Landlord refused to return my RM3500 security deposit. Help!", industry: "Property", location: "Kuala Lumpur", signal: "Service Complaint" },
  { quote: "SPM chemistry private tutor needed in Subang Jaya. 2 sessions/week.", industry: "Education", location: "Selangor", signal: "Recommendation" },
  { quote: "Mazda CX-5 vs Chery Tiggo 7. Which has better fuel efficiency?", industry: "Automotive", location: "Penang", signal: "Comparing options" },
  { quote: "Great Eastern premium naik 25% this year. Downsizing medical card advice?", industry: "Insurance", location: "Selangor", signal: "High Intent" },
  { quote: "Looking to rent a 2BR unit in Mont Kiara. Budget RM3k.", industry: "Property", location: "Kuala Lumpur", signal: "Recommendation" },
  { quote: "Car dealer delayed delivery for 3 months now. Can I cancel booking?", industry: "Automotive", location: "Johor", signal: "Service Complaint" },
];

export default function Hero({ onOpenEarlyAccess }: HeroProps) {
  const [currentSignal, setCurrentSignal] = useState(rotatingSignals[0]);
  const [activeCards, setActiveCards] = useState<LiveCard[]>(initialCards);
  const signalIndex = useRef(0);
  const cardIndex = useRef(0);

  useEffect(() => {
    // Check if we can fetch live data, fallback to templates
    fetch("/api/live-opportunities")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.opportunities?.length > 0) {
          // Merge with our existing lists
          const formatted = data.opportunities.map((opp: any) => ({
            text: opp.quote,
            category: opp.industry,
            location: opp.location
          }));
          rotatingSignals.push(...formatted);

          const formattedCards = data.opportunities.map((opp: any) => ({
            quote: opp.quote,
            industry: opp.industry,
            location: opp.location,
            signal: opp.signal,
          }));
          signalPool.push(...formattedCards);
        }
      })
      .catch((err) => console.warn("Failed to fetch live opportunities for hero:", err));
  }, []);

  useEffect(() => {
    // 1. Rotate the floating badge signal
    const badgeInterval = setInterval(() => {
      signalIndex.current = (signalIndex.current + 1) % rotatingSignals.length;
      setCurrentSignal(rotatingSignals[signalIndex.current]);
    }, 4500);

    // 2. Rotate/stream the actual 3-card listing inside the dashboard
    const listInterval = setInterval(() => {
      const nextRaw = signalPool[cardIndex.current % signalPool.length];
      cardIndex.current += 1;

      const newCard: LiveCard = {
        id: `card-live-${Date.now()}-${cardIndex.current}`,
        quote: nextRaw.quote,
        industry: nextRaw.industry,
        location: nextRaw.location,
        signal: nextRaw.signal,
        time: "Just now",
      };

      setActiveCards((prev) => {
        const updatedPrev = prev.map((item) => {
          if (item.time === "Just now") return { ...item, time: "2m ago" };
          if (item.time === "2m ago") return { ...item, time: "18m ago" };
          if (item.time === "18m ago") return { ...item, time: "42m ago" };
          if (item.time === "42m ago") return { ...item, time: "1h ago" };
          return { ...item, time: "2h ago" };
        });
        return [newCard, ...updatedPrev].slice(0, 3);
      });
    }, 5000); // Prepend new card every 5 seconds

    return () => {
      clearInterval(badgeInterval);
      clearInterval(listInterval);
    };
  }, []);

  // Map signal names to design classes
  const getBadgeStyle = (sig: string) => {
    const s = sig.toLowerCase();
    if (s.includes("high") || s.includes("switch")) return "bg-red-100 text-red-700";
    if (s.includes("recommend") || s.includes("look")) return "bg-teal-100 text-teal-700";
    if (s.includes("complaint") || s.includes("service")) return "bg-amber-100 text-amber-700";
    return "bg-slate-100 text-slate-700";
  };

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
              <Link
                href="/reports/malaysia-insurance"
                className="bg-primary hover:bg-primary-dark text-white text-base font-semibold px-6 py-4 rounded-xl shadow-lg hover:shadow-xl hover:shadow-primary/20 transition-all flex items-center justify-center gap-2 group active:scale-95 animate-pulse"
              >
                Sample Insurance Leads Report
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
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
                    <span className="w-3 h-3 rounded-full bg-red-400 animate-pulse" />
                    <span className="w-3 h-3 rounded-full bg-amber-400" />
                    <span className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="h-5 w-px bg-slate-200 mx-1" />
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 text-[10px] font-semibold text-slate-600">
                    <Compass className="w-3 h-3 animate-spin [animation-duration:12s]" />
                    <span>CARILEAD ENGINE v1.2</span>
                  </div>
                </div>
                <div className="text-[10px] text-primary font-bold flex items-center gap-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  <span>LIVE CRAWLING</span>
                </div>
              </div>

              {/* Feed Content Stack - Animated with AnimatePresence */}
              <div className="space-y-4 overflow-hidden max-h-[360px] relative">
                <motion.div layout className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {activeCards.map((card) => (
                      <motion.div
                        key={card.id}
                        layout
                        initial={{ opacity: 0, y: -40, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 40, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 140, damping: 18 }}
                        className="p-3.5 bg-slate-50 hover:bg-slate-100/70 border border-slate-200/50 rounded-xl transition-all shadow-sm group"
                      >
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getBadgeStyle(card.signal)}`}>
                            {card.signal}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                            <Clock className="w-3 h-3 animate-pulse" />
                            {card.time}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-navy mb-3 italic">
                          &ldquo;{card.quote}&rdquo;
                        </p>
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs border-t border-slate-200/40 pt-2.5">
                          <div className="flex items-center gap-2 text-slate-500">
                            <span className="bg-primary/10 text-primary-dark font-semibold px-2 py-0.5 rounded text-[10px]">
                              {card.industry}
                            </span>
                            <span className="flex items-center gap-0.5">
                              <MapPin className="w-3.5 h-3.5" /> {card.location}
                            </span>
                          </div>
                          <span className="flex items-center gap-1 font-semibold text-primary hover:underline text-[11px] cursor-pointer">
                            View Public Source
                            <ArrowUpRight className="w-3.5 h-3" />
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
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

            {/* Rotating Live Signal Detected Badge */}
            <div className="absolute -top-10 -right-4 z-20 w-72">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSignal.text}
                  initial={{ y: -30, opacity: 0, scale: 0.95 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: 30, opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 100, damping: 15 }}
                  className="flex flex-col gap-2 bg-white border border-slate-200 p-3.5 rounded-2xl shadow-xl border-t-2 border-t-primary"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5">
                    <div className="flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-primary animate-pulse" />
                      <span className="text-[10px] font-bold text-navy tracking-wider uppercase">Live Crawl Signal</span>
                    </div>
                    <span className="text-[8px] font-semibold text-slate-400 uppercase">Just now</span>
                  </div>
                  
                  <p className="text-[11px] leading-relaxed text-slate-600 font-medium italic">
                    &ldquo;{currentSignal.text}&rdquo;
                  </p>

                  <div className="flex items-center justify-between text-[9px] text-slate-400 font-semibold pt-1">
                    <span className="bg-primary/5 text-primary-dark font-extrabold px-1.5 py-0.5 rounded text-[8px]">
                      {currentSignal.category}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <MapPin className="w-2.5 h-2.5 text-slate-400" /> {currentSignal.location}
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
