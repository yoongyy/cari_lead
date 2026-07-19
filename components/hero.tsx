"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Play, Compass, ShieldAlert, Sparkles, MapPin, Clock, ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

interface HeroProps {
  onOpenEarlyAccess: () => void;
}

interface LiveCard {
  id: string;
  quoteEn: string;
  quoteZh: string;
  industryEn: string;
  industryZh: string;
  locationEn: string;
  locationZh: string;
  signalEn: string;
  signalZh: string;
  timeEn: string;
  timeZh: string;
}

const initialCards: LiveCard[] = [
  {
    id: "card-init-1",
    quoteEn: "Medical card premium AIA naik lagi 30%. Prudential or Great Eastern okay?",
    quoteZh: "AIA医药卡保费又涨了30%。Prudential还是Great Eastern比较好？",
    industryEn: "Insurance",
    industryZh: "保险",
    locationEn: "Selangor",
    locationZh: "雪兰莪",
    signalEn: "Premium repricing",
    signalZh: "保费调整",
    timeEn: "18m ago",
    timeZh: "18分钟前",
  },
  {
    id: "card-init-2",
    quoteEn: "Sama lah! My Prudential one also went up by RM50 last month. Thinking of changing but worry about waiting period...",
    quoteZh: "赞同！我的Prudential上个月也涨了RM50。想换但担心等待期...",
    industryEn: "Insurance",
    industryZh: "保险",
    locationEn: "Selangor",
    locationZh: "雪兰莪",
    signalEn: "Switching intent",
    signalZh: "转保意向",
    timeEn: "42m ago",
    timeZh: "42分钟前",
  },
  {
    id: "card-init-3",
    quoteEn: "Condo rental in Mont Kiara - Landlord refuse to return deposit (RM5000+). Excuses about paint scratch.",
    quoteZh: "Mont Kiara公寓出租 - 业主拒绝退还押金（RM5000+）。借口是油漆刮花。",
    industryEn: "Property",
    industryZh: "地产",
    locationEn: "Kuala Lumpur",
    locationZh: "吉隆坡",
    signalEn: "Rental dispute",
    signalZh: "租务纠纷",
    timeEn: "1h ago",
    timeZh: "1小时前",
  },
];

const signalPool = [
  {
    quoteEn: "First time buying medical card in Malaysia. What to check? Agent recommended RM250/month.",
    quoteZh: "第一次在马来西亚买医药卡。需要注意什么？代理推荐RM250/月。",
    industryEn: "Insurance",
    industryZh: "保险",
    locationEn: "Kuala Lumpur",
    locationZh: "吉隆坡",
    signalEn: "New purchase query",
    signalZh: "新购咨询",
  },
  {
    quoteEn: "Check if the annual limit is at least RM1 million or RM2 million. Nowadays RM100k limit is not enough.",
    quoteZh: "检查年限额是否至少有100万或200万令吉。现在的10万额度根本不够用。",
    industryEn: "Insurance",
    industryZh: "保险",
    locationEn: "Penang",
    locationZh: "槟城",
    signalEn: "Underwriting advice",
    signalZh: "核保建议",
  },
  {
    quoteEn: "Better look for takaful alternatives. Rates are usually more stable. Etiqa or Great Eastern Takaful quite popular.",
    quoteZh: "最好考虑下takaful（互助保险）替代方案。费率通常更稳定。Etiqa或Great Eastern Takaful都挺受欢迎。",
    industryEn: "Insurance",
    industryZh: "保险",
    locationEn: "Kuala Lumpur",
    locationZh: "吉隆坡",
    signalEn: "Takaful search",
    signalZh: "寻找 Takaful",
  },
  {
    quoteEn: "You can file a claim at the Tribunal for Consumer Claims (TTPM) or small claims court. Costs RM10 only.",
    quoteZh: "你可以去消费税仲裁庭（TTPM）或小额索赔法庭起诉。只需花费10令吉。",
    industryEn: "Property",
    industryZh: "地产",
    locationEn: "Kuala Lumpur",
    locationZh: "吉隆坡",
    signalEn: "Legal dispute advice",
    signalZh: "法律纠纷建议",
  },
  {
    quoteEn: "AIA medical card renewal price increase again. Thinking of downgrade or check Allianz.",
    quoteZh: "AIA医药卡续费价格又涨了。考虑降级或了解一下Allianz。",
    industryEn: "Insurance",
    industryZh: "保险",
    locationEn: "Perak",
    locationZh: "霹雳",
    signalEn: "Switching intent",
    signalZh: "转保意向",
  },
  {
    quoteEn: "Renting in Mont Kiara. Landlord delay return deposit. How to make claim under small claims court?",
    quoteZh: "在Mont Kiara租房。业主拖延退还押金。如何在小额索赔法庭提出索赔？",
    industryEn: "Property",
    industryZh: "地产",
    locationEn: "Kuala Lumpur",
    locationZh: "吉隆坡",
    signalEn: "Rental dispute",
    signalZh: "租务纠纷",
  },
  {
    quoteEn: "Any good property agent in Cheras to rent out my condo unit? Prefer fast reply.",
    quoteZh: "Cheras有什么好的地产代理推荐出租我的公寓吗？希望回复快一点的。",
    industryEn: "Property",
    industryZh: "地产",
    locationEn: "Selangor",
    locationZh: "雪兰莪",
    signalEn: "Agent recommendation",
    signalZh: "推荐代理人",
  }
];

export default function Hero({ onOpenEarlyAccess }: HeroProps) {
  const { language } = useLanguage();
  const [activeCards, setActiveCards] = useState<LiveCard[]>(initialCards);
  const cardIndex = useRef(0);

  useEffect(() => {
    // Check if we can fetch live data, fallback to templates
    fetch("/api/live-opportunities")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.opportunities?.length > 0) {
          const formattedCards = data.opportunities.map((opp: any) => ({
            quoteEn: opp.quote,
            quoteZh: opp.quote,
            industryEn: opp.industry,
            industryZh: opp.industry,
            locationEn: opp.location,
            locationZh: opp.location,
            signalEn: opp.signal,
            signalZh: opp.signal,
          }));
          signalPool.push(...formattedCards);
        }
      })
      .catch((err) => console.warn("Failed to fetch live opportunities for hero:", err));
  }, []);

  useEffect(() => {
    // Rotate/stream the actual 3-card listing inside the dashboard
    const listInterval = setInterval(() => {
      const nextRaw = signalPool[cardIndex.current % signalPool.length];
      cardIndex.current += 1;

      const newCard: LiveCard = {
        id: `card-live-${Date.now()}-${cardIndex.current}`,
        quoteEn: nextRaw.quoteEn,
        quoteZh: nextRaw.quoteZh,
        industryEn: nextRaw.industryEn,
        industryZh: nextRaw.industryZh,
        locationEn: nextRaw.locationEn,
        locationZh: nextRaw.locationZh,
        signalEn: nextRaw.signalEn,
        signalZh: nextRaw.signalZh,
        timeEn: "Just now",
        timeZh: "刚刚",
      };

      setActiveCards((prev) => {
        const updatedPrev = prev.map((item) => {
          if (item.timeEn === "Just now" || item.timeZh === "刚刚") {
            return { ...item, timeEn: "2m ago", timeZh: "2分钟前" };
          }
          if (item.timeEn === "2m ago" || item.timeZh === "2分钟前") {
            return { ...item, timeEn: "18m ago", timeZh: "18分钟前" };
          }
          if (item.timeEn === "18m ago" || item.timeZh === "18分钟前") {
            return { ...item, timeEn: "42m ago", timeZh: "42分钟前" };
          }
          if (item.timeEn === "42m ago" || item.timeZh === "42分钟前") {
            return { ...item, timeEn: "1h ago", timeZh: "1小时前" };
          }
          return { ...item, timeEn: "2h ago", timeZh: "2小时前" };
        });
        return [newCard, ...updatedPrev].slice(0, 3);
      });
    }, 10000); // Prepend new card every 10 seconds

    return () => {
      clearInterval(listInterval);
    };
  }, []);

  // Map signal names to design classes
  const getBadgeStyle = (sig: string) => {
    const s = sig.toLowerCase();
    if (s.includes("high") || s.includes("switch") || s.includes("repricing") || s.includes("意向") || s.includes("调整")) return "bg-red-100 text-red-700";
    if (s.includes("recommend") || s.includes("look") || s.includes("query") || s.includes("agent") || s.includes("咨询") || s.includes("推荐")) return "bg-teal-100 text-teal-700";
    if (s.includes("complaint") || s.includes("service") || s.includes("dispute") || s.includes("advice") || s.includes("纠纷") || s.includes("建议")) return "bg-amber-100 text-amber-700";
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
              <span>
                {language === "en" ? "Cari customers who already need your service" : "寻找已经需要您服务的客户"}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-navy leading-[1.1] mb-6"
            >
              {language === "en" ? (
                <>
                  Find customers <br />
                  <span className="text-primary">already asking</span> for help.
                </>
              ) : (
                <>
                  寻找 <span className="text-primary">主动寻求帮助</span> <br />
                  的潜在客户
                </>
              )}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-slate-600 max-w-xl mb-8 leading-relaxed"
            >
              {language === "en" ? (
                <>
                  CariLead scans public online conversations where Malaysians are looking for recommendations, comparing providers, complaining about a service, or considering switching. 
                  <span className="block mt-3 font-semibold text-navy">No more blindly chasing cold leads.</span>
                </>
              ) : (
                <>
                  CariLead 实时扫描公开的网络对话，寻找正在寻求服务商推荐、对比方案、投诉现有服务或有转保意向的马来西亚真实用户。
                  <span className="block mt-3 font-semibold text-navy">无需再盲目进行冷拜访或追逐无效线索。</span>
                </>
              )}
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
                {language === "en" ? "Sample Insurance Leads Report" : "保险线索报告样本"}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#how-it-works"
                className="bg-white hover:bg-slate-50 text-slate-700 font-semibold px-6 py-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95"
              >
                <Play className="w-4 h-4 fill-slate-500 text-slate-500" />
                {language === "en" ? "See How It Works" : "查看运作原理"}
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8 flex items-center gap-2 text-xs font-medium text-slate-500"
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              {language === "en" ? "Built for Malaysian agents and service businesses" : "专为马来西亚代理人及服务性企业打造"}
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
                    <span>{language === "en" ? "CARILEAD ENGINE v1.2" : "CARILEAD 引擎 v1.2"}</span>
                  </div>
                </div>
                <div className="text-[10px] text-primary font-bold flex items-center gap-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  <span>{language === "en" ? "LIVE SCANNING" : "实时扫描中"}</span>
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
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getBadgeStyle(language === "en" ? card.signalEn : card.signalZh)}`}>
                            {language === "en" ? card.signalEn : card.signalZh}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                            <Clock className="w-3 h-3 animate-pulse" />
                            {language === "en" ? card.timeEn : card.timeZh}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-navy mb-3 italic">
                          &ldquo;{language === "en" ? card.quoteEn : card.quoteZh}&rdquo;
                        </p>
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs border-t border-slate-200/40 pt-2.5">
                          <div className="flex items-center gap-2 text-slate-500">
                            <span className="bg-primary/10 text-primary-dark font-semibold px-2 py-0.5 rounded text-[10px]">
                              {language === "en" ? card.industryEn : card.industryZh}
                            </span>
                            <span className="flex items-center gap-0.5">
                              <MapPin className="w-3.5 h-3.5" /> {language === "en" ? card.locationEn : card.locationZh}
                            </span>
                          </div>
                          <span className="flex items-center gap-1 font-semibold text-primary hover:underline text-[11px] cursor-pointer">
                            {language === "en" ? "View Public Source" : "查看公开来源"}
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
                  {language === "en" ? "Public-source conversations only" : "仅扫描公开来源的对话内容"}
                </span>
                <span className="text-slate-400 font-semibold">
                  {language === "en" ? "Zero phone scraping" : "不爬取任何个人隐私/电话"}
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
